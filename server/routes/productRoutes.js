const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { authenticateToken, isFarmer, isProductOwner } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../config/multer');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
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
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('farmer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Farmer ID must be a positive integer')
];

const paramValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer')
];

// Routes

// GET /api/products - Get all products (public, with optional filtering)
router.get('/', queryValidation, getProducts);

// GET /api/products/my - Get current farmer's products (protected)
router.get('/my', authenticateToken, isFarmer, queryValidation, getMyProducts);

// GET /api/products/:id - Get single product (public)
router.get('/:id', paramValidation, getProduct);

// POST /api/products - Create new product (protected, farmers only)
router.post(
  '/',
  authenticateToken,
  isFarmer,
  upload.single('image'),
  handleMulterError,
  createProductValidation,
  createProduct
);

// PUT /api/products/:id - Update product (protected, product owner only)
router.put(
  '/:id',
  authenticateToken,
  isFarmer,
  isProductOwner,
  upload.single('image'),
  handleMulterError,
  paramValidation,
  updateProductValidation,
  updateProduct
);

// DELETE /api/products/:id - Delete product (protected, product owner only)
router.delete(
  '/:id',
  authenticateToken,
  isFarmer,
  isProductOwner,
  paramValidation,
  deleteProduct
);

module.exports = router;
