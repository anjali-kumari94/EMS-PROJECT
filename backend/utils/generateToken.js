const jwt = require('jsonwebtoken');

const generateToken = (employee) => {
  return jwt.sign(
    { id: employee._id, role: employee.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

module.exports = generateToken;
