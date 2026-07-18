const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { login, logout, getMe };
