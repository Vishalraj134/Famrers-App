const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Product = require('./Product');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      isInt: true
    }
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivered'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Define associations
Order.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Order.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer'
});

Product.hasMany(Order, {
  foreignKey: 'product_id',
  as: 'orders'
});

User.hasMany(Order, {
  foreignKey: 'buyer_id',
  as: 'orders'
});

module.exports = Order;
