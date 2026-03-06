const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease create a .env file with the required variables.');
  console.error('See .env.example for reference.');
  process.exit(1);
}

// Import database connection
const { sequelize, testConnection } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import Socket.IO
const { initializeSocket } = require('./config/socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Only initialize HTTP server and Socket.IO in non-serverless environments
// Vercel serverless functions don't support persistent HTTP servers
let server;
let io;

if (process.env.VERCEL !== '1') {
  // Traditional server mode (development/local)
  server = http.createServer(app);
  io = initializeSocket(server);
  global.io = io;
} else {
  // Serverless mode (Vercel)
  // Socket.IO won't work in serverless, so we'll disable it
  // Consider using alternative real-time solutions for production
  global.io = null;
  console.log('Running in serverless mode - Socket.IO disabled');
}

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://your-frontend-domain.com'])
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads with a fallback when the file is missing
// This prevents noisy 404s in the browser when product.image_url points
// to a file that doesn't exist on disk (e.g. for older products or missing uploads).
const uploadsStatic = express.static(path.join(__dirname, 'uploads'));
app.use('/uploads', (req, res, next) => {
  try {
    const requestedPath = path.join(__dirname, 'uploads', req.path);
    if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
      return uploadsStatic(req, res, next);
    }
  } catch (err) {
    // If there's any error checking the file, fall back to sending placeholder
    console.error('Error while checking upload file:', err.message);
  }

  // Send a small SVG placeholder instead of a 404
  const placeholder = path.join(__dirname, 'public', 'no-image.svg');
  return res.sendFile(placeholder, (err) => {
    if (err) {
      // If placeholder can't be sent, fall back to a 204 (no content)
      console.error('Failed to send placeholder image:', err.message);
      return res.status(204).end();
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Test database connection and start server (only in non-serverless mode)
const startServer = async () => {
  try {
    await testConnection();
    
    if (server) {
      server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        if (io) {
          console.log(`WebSocket server initialized`);
        }
      });
    } else {
      // Serverless mode - just test connection
      await testConnection();
      console.log('Serverless function ready');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    // In serverless mode, don't exit - let Vercel handle it
  }
};

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  // Handle unhandled promise rejections (only in traditional server mode)
  process.on('unhandledRejection', (err, promise) => {
    console.log('Unhandled Promise Rejection:', err.message);
    process.exit(1);
  });

  // Handle uncaught exceptions (only in traditional server mode)
  process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err.message);
    process.exit(1);
  });

  startServer();
} else {
  // In serverless mode, test connection on cold start
  // Connection will be reused across invocations
  testConnection().catch(err => {
    console.error('Database connection error (serverless):', err.message);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;
