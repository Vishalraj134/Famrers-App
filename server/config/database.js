require('dotenv').config();

// Base configuration
const baseConfig = {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  }
};

// Development: Use SQLite
const development = {
  ...baseConfig,
  dialect: 'sqlite',
  storage: './database.sqlite'
};

// Test: Use SQLite
const test = {
  ...baseConfig,
  dialect: 'sqlite',
  storage: './database_test.sqlite',
  logging: false
};

// Production: Use DATABASE_URL if provided, otherwise SQLite (not recommended for production)
const production = process.env.DATABASE_URL ? {
  ...baseConfig,
  url: process.env.DATABASE_URL,
  dialect: process.env.DATABASE_DIALECT || 'postgres',
  dialectOptions: {
    ssl: process.env.DATABASE_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
} : {
  ...baseConfig,
  dialect: 'sqlite',
  storage: './database_production.sqlite',
  logging: false
};

module.exports = {
  development,
  test,
  production
};
