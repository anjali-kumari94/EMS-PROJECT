const Employee = require('../models/Employee');
const { wouldCreateCycle, buildTree } = require('../utils/orgHelpers');

// @route GET /api/organization/tree
// @access Super Admin, HR Manager
const getOrgTree = async (req, res, next) => {
  try {
    const employees = await Employee.find({})
      .select('name employeeId designation department status reportingManager profileImage role')
      .lean();

    const tree = buildTree(employees);
    res.status(200).json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/employees/:id/reportees
// @access Super Admin, HR Manager, or the manager themself
const getReportees = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'Employee' && req.user.id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'You can only view your own direct reports' });
    }

    const reportees = await Employee.find({ reportingManager: id }).select(
      'name employeeId designation department status email'
    );

    res.status(200).json({ success: true, count: reportees.length, data: reportees });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/employees/:id/manager
// @access Super Admin, HR Manager
const assignManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reportingManager } = req.body; // may be null to clear it

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (reportingManager) {
      if (reportingManager === id) {
        return res.status(400).json({ success: false, message: 'An employee cannot report to themself' });
      }

      const manager = await Employee.findById(reportingManager);
      if (!manager) {
        return res.status(400).json({ success: false, message: 'Reporting manager does not exist' });
      }

      const cycle = await wouldCreateCycle(id, reportingManager);
      if (cycle) {
        return res.status(400).json({
          success: false,
          message: 'This assignment would create a circular reporting chain',
        });
      }
    }

    employee.reportingManager = reportingManager || null;
    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrgTree, getReportees, assignManager };
