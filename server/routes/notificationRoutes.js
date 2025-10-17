const express = require('express');
const { query, param } = require('express-validator');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  getNotificationEvents
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Validation rules
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('read')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Read must be true or false'),
  query('type')
    .optional()
    .isIn(['order', 'system', 'admin'])
    .withMessage('Type must be order, system, or admin')
];

const paramValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer')
];

// Routes

// GET /api/notifications - Get notifications for logged-in user
router.get(
  '/',
  queryValidation,
  getNotifications
);

// GET /api/notifications/unread-count - Get unread notification count
router.get(
  '/unread-count',
  getUnreadCount
);

// GET /api/notifications/events - Get notification events (for polling)
router.get(
  '/events',
  (req, res, next) => {
    try {
      const user_id = req.user.userId;
      const events = getNotificationEvents(user_id);
      
      res.json({
        success: true,
        data: { events }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/notifications/:id/read - Mark notification as read
router.put(
  '/:id/read',
  paramValidation,
  markAsRead
);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put(
  '/read-all',
  markAllAsRead
);

// DELETE /api/notifications/:id - Delete notification
router.delete(
  '/:id',
  paramValidation,
  deleteNotification
);

module.exports = router;
