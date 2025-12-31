// Vercel serverless function entry point
// This file exports the Express app as a serverless function handler

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Require the Express app (server.js exports it)
// Node.js will automatically resolve dependencies from ../server/node_modules
const app = require('../server/server');

// Export as Vercel serverless function handler
// Vercel automatically converts Express app to serverless function
module.exports = app;

