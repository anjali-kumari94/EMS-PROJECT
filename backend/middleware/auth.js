const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Verifies the JWT (from httpOnly cookie or Authorization header) and
// attaches the logged-in employee to req.user
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
