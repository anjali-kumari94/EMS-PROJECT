const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { getReportees, assignManager } = require('../controllers/organizationController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  employeeCreateValidation,
  employeeUpdateValidation,
  managerAssignValidation,
  listQueryValidation,
} = require('../utils/validators');

router.use(protect); // every route below requires a valid logged-in user

router
  .route('/')
  .get(authorize('Super Admin', 'HR Manager'), listQueryValidation, getEmployees)
  .post(authorize('Super Admin', 'HR Manager'), employeeCreateValidation, createEmployee);

router
  .route('/:id')
  .get(getEmployeeById) // controller itself enforces "self only" for the Employee role
  .put(employeeUpdateValidation, updateEmployee) // controller enforces per-role field restrictions
  .delete(authorize('Super Admin'), deleteEmployee);

router.get('/:id/reportees', getReportees);
router.patch('/:id/manager', authorize('Super Admin', 'HR Manager'), managerAssignValidation, assignManager);

module.exports = router;
