// Vercel serverless function entry point
// This file exports the Express app as a serverless function handler

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

// Require the Express app (server.js exports it)
const app = require('../server/server');

// Export as Vercel serverless function handler
// Vercel automatically converts Express app to serverless function
module.exports = app;

