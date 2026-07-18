require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path'); // Added to resolve file paths

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'EMS API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- ADDED FOR PRODUCTION FRONTEND SERVING ---
if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the React frontend build
  // Note: If you used Create React App instead of Vite, change 'dist' to 'build'
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // For any route not matched by the API above, hand off routing to React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Only use the API 404 handler when in local development mode
  app.use(notFound);
}
// ---------------------------------------------

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EMS API listening on port ${PORT}`));

module.exports = app;
