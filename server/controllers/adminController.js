const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all users (admin only)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, verified, search } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (verified !== undefined) {
      whereClause.verified = verified === 'true';
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'verified', 'createdAt', 'updatedAt'],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify farmer account (admin only)
const verifyFarmer = async (req, res, next) => {
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
    const { verified } = req.body;

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a farmer
    if (user.role !== 'farmer') {
      return res.status(400).json({
        success: false,
        message: 'Can only verify farmer accounts'
      });
    }

    // Update verification status
    await user.update({ verified });

    // Create notification for farmer
    await Notification.create({
      user_id: user.id,
      title: verified ? 'Account Verified' : 'Account Verification Revoked',
      message: verified 
        ? 'Congratulations! Your farmer account has been verified. You can now receive orders.'
        : 'Your farmer account verification has been revoked. Please contact support.',
      type: 'admin',
      metadata: {
        verified: verified,
        verified_by: req.user.userId
      }
    });

    res.json({
      success: true,
      message: `Farmer account ${verified ? 'verified' : 'unverified'} successfully`,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalFarmers = await User.count({ where: { role: 'farmer' } });
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const verifiedFarmers = await User.count({ 
      where: { role: 'farmer', verified: true } 
    });
    const unverifiedFarmers = await User.count({ 
      where: { role: 'farmer', verified: false } 
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalAdmins,
        verifiedFarmers,
        unverifiedFarmers,
        recentRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user details (admin only)
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'verified', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  verifyFarmer,
  getUserStats,
  getUser
};
