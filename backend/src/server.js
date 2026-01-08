require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ensureAgencyScope } = require('./middleware/auth');
const { scheduleAlertJobs } = require('./jobs/alertJobs');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const suppliesRoutes = require('./routes/supplies');
const inventoryRoutes = require('./routes/inventory');
const ordersRoutes = require('./routes/orders');
const alertsRoutes = require('./routes/alerts');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', ensureAgencyScope, usersRoutes);
app.use('/api/v1/supplies', ensureAgencyScope, suppliesRoutes);
app.use('/api/v1/inventory', ensureAgencyScope, inventoryRoutes);
app.use('/api/v1/orders', ensureAgencyScope, ordersRoutes);
app.use('/api/v1/alerts', ensureAgencyScope, alertsRoutes);
app.use('/api/v1/admin', ensureAgencyScope, adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Schedule background jobs
  scheduleAlertJobs();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
