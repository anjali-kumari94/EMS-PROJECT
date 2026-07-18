const express = require('express');
const router = express.Router();

const { getOrgTree } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// GET /api/organization/tree
router.get('/tree', authorize('Super Admin', 'HR Manager'), getOrgTree);

module.exports = router;
