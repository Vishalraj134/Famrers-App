const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Product = require('../models/Product');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Get all products with filtering and pagination
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      farmer_id
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (category) {
      whereClause.category = { [Op.like]: `%${category}%` };
    }
    
    if (farmer_id) {
      whereClause.farmer_id = farmer_id;
    }
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products with farmer information
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'farmer',
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
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
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

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
const createProduct = async (req, res, next) => {
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

    const { name, category, price, quantity, description } = req.body;
    const farmer_id = req.user.userId;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      farmer_id,
      name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      description,
      image_url
    });

    // Fetch the created product with farmer info
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: createdProduct }
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
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

    const { name, category, price, quantity, description } = req.body;
    const product = req.product; // From isProductOwner middleware

    // Handle image upload
    let image_url = product.image_url; // Keep existing image by default
    if (req.file) {
      // Delete old image if it exists
      if (product.image_url) {
        // product.image_url is "/uploads/<file>", ensure proper resolution on all OSes
        const normalizedOld = product.image_url.startsWith('/uploads/')
          ? path.join(__dirname, '..', 'uploads', path.basename(product.image_url))
          : path.join(__dirname, '..', product.image_url);
        if (fs.existsSync(normalizedOld)) {
          fs.unlinkSync(normalizedOld);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    // Update product
    await product.update({
      name: name || product.name,
      category: category || product.category,
      price: price ? parseFloat(price) : product.price,
      quantity: quantity ? parseInt(quantity) : product.quantity,
      description: description !== undefined ? description : product.description,
      image_url
    });

    // Fetch updated product with farmer info
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    // If there's an error and a new file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = req.product; // From isProductOwner middleware

    // Delete associated image file if it exists
    if (product.image_url) {
      const normalized = product.image_url.startsWith('/uploads/')
        ? path.join(__dirname, '..', 'uploads', path.basename(product.image_url))
        : path.join(__dirname, '..', product.image_url);
      if (fs.existsSync(normalized)) {
        fs.unlinkSync(normalized);
      }
    }

    // Delete product from database
    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get products by current farmer
const getMyProducts = async (req, res, next) => {
  try {
    const farmer_id = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where: { farmer_id },
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
};
