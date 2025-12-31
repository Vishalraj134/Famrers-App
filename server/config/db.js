const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine database configuration based on environment
let sequelize;

if (process.env.DATABASE_URL) {
  // Use cloud database (PostgreSQL/MySQL) from DATABASE_URL
  // Supports: PostgreSQL, MySQL, MariaDB
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DATABASE_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DATABASE_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fallback to SQLite for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
    }
  });
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    console.log(`Database: ${sequelize.getDialect()}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // In serverless mode, don't throw - let Vercel handle it
    if (process.env.VERCEL !== '1') {
      throw error;
    }
  }
};

module.exports = { sequelize, testConnection };
