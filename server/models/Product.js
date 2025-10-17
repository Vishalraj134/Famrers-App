const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      notEmpty: true
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      isInt: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      // Accept either absolute URLs (http/https) or app-relative uploads paths
      isValidImageUrl(value) {
        if (value == null) return; // allow null
        const stringValue = String(value);
        const isAbsolute = /^https?:\/\//i.test(stringValue);
        const isUploadsPath = stringValue.startsWith('/uploads/');
        if (!isAbsolute && !isUploadsPath) {
          throw new Error('image_url must be an absolute URL or start with /uploads/');
        }
      }
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Define associations
Product.belongsTo(User, {
  foreignKey: 'farmer_id',
  as: 'farmer'
});

User.hasMany(Product, {
  foreignKey: 'farmer_id',
  as: 'products'
});

module.exports = Product;
