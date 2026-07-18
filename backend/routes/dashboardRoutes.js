const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', authorize('Super Admin', 'HR Manager'), getDashboardStats);

module.exports = router;
