const Employee = require('../models/Employee');
const { wouldCreateCycle } = require('../utils/orgHelpers');

// Fields an 'Employee' role is allowed to change on their OWN profile.
// Anything else in the request body is silently dropped for that role.
const SELF_EDITABLE_FIELDS = ['phone', 'profileImage'];

// @route GET /api/employees
// @access Super Admin, HR Manager
const getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      role,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;

    const allowedSortFields = ['name', 'joiningDate', 'createdAt', 'salary'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('reportingManager', 'name employeeId designation')
        .sort({ [sortField]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Employee.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/employees/:id
// @access Super Admin, HR Manager, or the employee themself
const getEmployeeById = async (req, res, next) => {
  try {
    if (req.user.role === 'Employee' && req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only view your own profile' });
    }

    const employee = await Employee.findById(req.params.id).populate(
      'reportingManager',
      'name employeeId designation email'
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/employees
// @access Super Admin, HR Manager (HR cannot create a Super Admin)
const createEmployee = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (req.user.role === 'HR Manager' && payload.role === 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'HR Manager cannot assign the Super Admin role',
      });
    }

    if (payload.reportingManager) {
      const managerExists = await Employee.findById(payload.reportingManager);
      if (!managerExists) {
        return res.status(400).json({ success: false, message: 'Reporting manager does not exist' });
      }
    }

    const employee = await Employee.create(payload);
    const safe = employee.toObject();
    delete safe.password;

    res.status(201).json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/employees/:id
// @access Super Admin (full), HR Manager (no Super Admin assignment), Employee (own profile, limited fields)
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSelf = req.user.id.toString() === id;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let updates = { ...req.body };

    if (req.user.role === 'Employee') {
      if (!isSelf) {
        return res.status(403).json({ success: false, message: 'You can only edit your own profile' });
      }
      // Strip down to only the fields an Employee is allowed to touch
      updates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => SELF_EDITABLE_FIELDS.includes(key))
      );
    }

    if (req.user.role === 'HR Manager') {
      if (updates.role === 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'HR Manager cannot assign the Super Admin role',
        });
      }
      // HR cannot demote/modify an existing Super Admin's role or delete-equivalent status changes on one
      if (employee.role === 'Super Admin' && updates.role && updates.role !== 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'HR Manager cannot modify a Super Admin account',
        });
      }
    }

    if (updates.reportingManager) {
      if (updates.reportingManager === id) {
        return res.status(400).json({ success: false, message: 'An employee cannot report to themself' });
      }
      const managerExists = await Employee.findById(updates.reportingManager);
      if (!managerExists) {
        return res.status(400).json({ success: false, message: 'Reporting manager does not exist' });
      }
      const cycle = await wouldCreateCycle(id, updates.reportingManager);
      if (cycle) {
        return res.status(400).json({
          success: false,
          message: 'This assignment would create a circular reporting chain',
        });
      }
    }

    Object.assign(employee, updates);
    await employee.save();

    const safe = employee.toObject();
    delete safe.password;

    res.status(200).json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/employees/:id
// @access Super Admin only
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Reassign direct reports of the deleted employee up to their manager,
    // so the org tree never has a dangling reference.
    await Employee.updateMany(
      { reportingManager: id },
      { reportingManager: employee.reportingManager || null }
    );

    await employee.deleteOne();

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/stats
// @access Super Admin, HR Manager
const getDashboardStats = async (req, res, next) => {
  try {
    const [total, active, inactive, departments] = await Promise.all([
      Employee.countDocuments({}),
      Employee.countDocuments({ status: 'Active' }),
      Employee.countDocuments({ status: 'Inactive' }),
      Employee.distinct('department'),
    ]);

    const byDepartment = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: total,
        activeEmployees: active,
        inactiveEmployees: inactive,
        departmentCount: departments.length,
        byDepartment: byDepartment.map((d) => ({ department: d._id, count: d.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
};
