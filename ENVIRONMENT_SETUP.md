# Environment Setup Guide

This guide will help you set up the required environment variables for the Farmers Marketplace application.

## Required Environment Variables

### Server (.env file in server/ directory)

Create a `.env` file in the `server/` directory with the following variables:

```env
# JWT Secret (REQUIRED) - Generate a strong random string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789

# Database Configuration (for MySQL - if using SQLite, these are optional)
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=farmer_marketplace

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (for production)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

### Client (.env file in client/ directory)

Create a `.env` file in the `client/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## Quick Setup

### 1. Server Setup
```bash
cd server
cp .env.example .env  # If .env.example exists
# Edit .env with your values
```

### 2. Client Setup
```bash
cd client
cp .env.example .env  # If .env.example exists
# Edit .env with your values
```

## Important Notes

1. **JWT_SECRET**: This is critical for authentication. Use a long, random string (at least 32 characters).
2. **Database**: The app uses SQLite by default, but you can configure MySQL by setting the database environment variables.
3. **CORS**: In production, set `ALLOWED_ORIGINS` to your actual frontend domain(s).
4. **Security**: Never commit `.env` files to version control.

## Troubleshooting

### Server won't start
- Check if JWT_SECRET is set
- Verify all required environment variables are present
- Check if the port is available

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check if backend server is running
- Ensure CORS is properly configured

### Images not loading
- Check if VITE_API_URL is set correctly
- Verify the backend is serving static files properly
