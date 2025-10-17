const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Notification = require('../models/Notification');
const User = require('../models/User');

// In-memory notification events (for real-time updates)
const notificationEvents = new Map();

// Get notifications for logged-in user
const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { page = 1, limit = 20, read, type } = req.query;

    // Build where clause
    const whereClause = { user_id };
    
    if (read !== undefined) {
      whereClause.read = read === 'true';
    }
    
    if (type) {
      whereClause.type = type;
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalNotifications: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const notification = await Notification.findOne({
      where: { id, user_id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ read: true });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const user_id = req.user.userId;

    await Notification.update(
      { read: true },
      { where: { user_id, read: false } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
const getUnreadCount = async (req, res, next) => {
  try {
    const user_id = req.user.userId;

    const count = await Notification.count({
      where: { user_id, read: false }
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const notification = await Notification.findOne({
      where: { id, user_id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create notification (utility function)
const createNotification = async (user_id, title, message, type = 'system', metadata = null) => {
  try {
    const notification = await Notification.create({
      user_id,
      title,
      message,
      type,
      metadata
    });

    // Emit in-memory event for real-time updates
    emitNotificationEvent(user_id, notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Emit notification event (for real-time updates)
const emitNotificationEvent = (user_id, notification) => {
  const userEvents = notificationEvents.get(user_id) || [];
  userEvents.push({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt
  });
  notificationEvents.set(user_id, userEvents);
};

// Get notification events for user (for polling)
const getNotificationEvents = (user_id) => {
  const events = notificationEvents.get(user_id) || [];
  notificationEvents.set(user_id, []); // Clear events after reading
  return events;
};

// Clear notification events for user
const clearNotificationEvents = (user_id) => {
  notificationEvents.delete(user_id);
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  createNotification,
  emitNotificationEvent,
  getNotificationEvents,
  clearNotificationEvents
};
