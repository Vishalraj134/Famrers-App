const express = require('express');
const { body, query, param } = require('express-validator');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrder
} = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'delivered'])
    .withMessage('Status must be pending, confirmed, or delivered')
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
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'delivered'])
    .withMessage('Status must be pending, confirmed, or delivered')
];

const paramValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer')
];

// Routes

// POST /api/orders - Create new order (buyers only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('buyer'),
  createOrderValidation,
  createOrder
);

// GET /api/orders - Get orders for logged-in user
router.get(
  '/',
  authenticateToken,
  queryValidation,
  getOrders
);

// GET /api/orders/:id - Get single order details
router.get(
  '/:id',
  authenticateToken,
  paramValidation,
  getOrder
);

// PUT /api/orders/:id/status - Update order status (farmers only)
router.put(
  '/:id/status',
  authenticateToken,
  authorizeRoles('farmer'),
  paramValidation,
  updateStatusValidation,
  updateOrderStatus
);

module.exports = router;
