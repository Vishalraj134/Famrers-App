const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create new order
const createOrder = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { product_id, quantity } = req.body;
    const buyer_id = req.user.userId;

    // Check if user is a buyer
    const buyer = await User.findByPk(buyer_id);
    if (buyer.role !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can place orders'
      });
    }

    // Find the product
    const product = await Product.findByPk(product_id, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer is verified
    if (!product.farmer.verified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order from unverified farmer'
      });
    }

    // Check if quantity is available
    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available. Requested: ${quantity}`
      });
    }

    // Calculate total price
    const total_price = parseFloat(product.price) * parseInt(quantity);

    // Start transaction
    const transaction = await Order.sequelize.transaction();

    try {
      // Create the order
      const order = await Order.create({
        product_id,
        buyer_id,
        quantity: parseInt(quantity),
        total_price,
        status: 'pending'
      }, { transaction });

      // Reduce product quantity
      await product.update({
        quantity: product.quantity - parseInt(quantity)
      }, { transaction });

      // Commit transaction
      await transaction.commit();

      // Fetch the created order with all associations
      const createdOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: User,
                as: 'farmer',
                attributes: ['id', 'name', 'email']
              }
            ]
          },
          {
            model: User,
            as: 'buyer',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Create notification for farmer
      await Notification.create({
        user_id: product.farmer_id,
        title: 'New Order Received',
        message: `You have received a new order for ${quantity} ${product.name} from ${buyer.name}`,
        type: 'order',
        metadata: {
          order_id: order.id,
          product_id: product.id,
          buyer_id: buyer_id,
          quantity: quantity
        }
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order: createdOrder }
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get orders for logged-in user
const getOrders = async (req, res, next) => {
  try {
    const user_id = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    // Get user to check role
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build where clause based on user role
    let whereClause = {};
    
    if (user.role === 'buyer') {
      whereClause.buyer_id = user_id;
    } else if (user.role === 'farmer') {
      // Get orders for farmer's products
      whereClause['$product.farmer_id$'] = user_id;
    } else if (user.role === 'admin') {
      // Admin can see all orders
      whereClause = {};
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with associations
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'farmer',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (farmer only)
const updateOrderStatus = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.userId;

    // Find the order
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'farmer',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the farmer who owns the product
    if (order.product.farmer_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders for your own products'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed'],
      'confirmed': ['delivered'],
      'delivered': [] // No further transitions
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update order status
    await order.update({ status });

    // Create notification for buyer
    await Notification.create({
      user_id: order.buyer_id,
      title: 'Order Status Updated',
      message: `Your order for ${order.product.name} has been ${status}`,
      type: 'order',
      metadata: {
        order_id: order.id,
        product_id: order.product_id,
        status: status
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Get single order details
const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    // Find the order
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'farmer',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    const user = await User.findByPk(user_id);
    const hasAccess = user.role === 'admin' || 
                     order.buyer_id === user_id || 
                     order.product.farmer_id === user_id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrder
};
