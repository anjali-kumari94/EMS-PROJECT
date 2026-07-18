const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation } = require('../utils/validators');

router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
