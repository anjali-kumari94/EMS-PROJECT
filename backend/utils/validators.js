const { body, query, validationResult } = require('express-validator');
const { ROLES, STATUSES } = require('../models/Employee');

// Run at the end of every validation chain to collect errors
const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// Fields a Super Admin / HR Manager may set when creating an employee
const employeeCreateValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').isISO8601().toDate().withMessage('Joining date must be a valid date'),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('role').optional().isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid reporting manager id'),
  handleValidation,
];

const employeeUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().withMessage('Enter a valid email address'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().toDate().withMessage('Joining date must be a valid date'),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('role').optional().isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid reporting manager id'),
  handleValidation,
];

// Restricted set of fields an Employee may edit on their own profile
const selfUpdateValidation = [
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('profileImage').optional().isString(),
  handleValidation,
];

const managerAssignValidation = [
  body('reportingManager').optional({ nullable: true }).isMongoId().withMessage('Invalid reporting manager id'),
  handleValidation,
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidation,
];

module.exports = {
  handleValidation,
  loginValidation,
  employeeCreateValidation,
  employeeUpdateValidation,
  selfUpdateValidation,
  managerAssignValidation,
  listQueryValidation,
};
