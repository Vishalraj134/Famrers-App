const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    next(error);
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

// Helper function to check if user is a farmer
const isFarmer = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only farmers can perform this action.'
      });
    }

    req.user.role = user.role; // Add role to request for easy access
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to check if user owns a product
const isProductOwner = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.farmer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own products.'
      });
    }

    req.product = product; // Add product to request for easy access
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  isFarmer,
  isProductOwner
};
