const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getUsers,
  verifyFarmer,
  getUserStats,
  getUser
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Validation rules
const verifyFarmerValidation = [
  body('verified')
    .isBoolean()
    .withMessage('Verified must be a boolean value')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['farmer', 'buyer', 'admin'])
    .withMessage('Role must be farmer, buyer, or admin'),
  query('verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Verified must be true or false'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
];

const paramValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

// Routes

// GET /api/admin/users - List all users
router.get(
  '/users',
  queryValidation,
  getUsers
);

// GET /api/admin/users/stats - Get user statistics
router.get(
  '/users/stats',
  getUserStats
);

// GET /api/admin/users/:id - Get single user details
router.get(
  '/users/:id',
  paramValidation,
  getUser
);

// PUT /api/admin/users/:id/verify - Verify farmer account
router.put(
  '/users/:id/verify',
  paramValidation,
  verifyFarmerValidation,
  verifyFarmer
);

module.exports = router;
