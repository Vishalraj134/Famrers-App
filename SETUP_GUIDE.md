# Farmers Marketplace - Complete Setup Guide

This guide will help you set up and run both the backend and frontend of the Farmers Marketplace application.

## Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## Project Structure

```
Farmers-App/
├── server/          # Backend (Node.js + Express + MySQL)
├── client/          # Frontend (React + Vite + Tailwind)
└── SETUP_GUIDE.md   # This file
```

## Backend Setup

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:
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
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**⚠️ Important**: The JWT_SECRET is required for the server to start. Generate a strong random string (at least 32 characters).

### 4. Set Up Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE farmer_marketplace;
exit

# Run migrations
npm run migrate
```

### 5. Start Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Client Directory
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

**Note**: If you don't create a `.env` file, the app will use default values and show warnings in the console.

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Application

### 1. Register a Farmer Account
1. Open `http://localhost:5173`
2. Click "Register"
3. Select "Farmer" role
4. Fill in details:
   - Name: John Farmer
   - Email: farmer@example.com
   - Password: password123
5. Click "Create Account"

### 2. Add Products (Farmer)
1. Login with farmer account
2. Go to Dashboard
3. Click "Add Product"
4. Fill in product details:
   - Name: Fresh Tomatoes
   - Category: Vegetables
   - Price: 5.99
   - Quantity: 50
   - Description: Fresh organic tomatoes from local farm
5. Upload an image
6. Click "Add Product"

### 3. Register a Buyer Account
1. Logout and click "Register"
2. Select "Buyer" role
3. Fill in details:
   - Name: Jane Buyer
   - Email: buyer@example.com
   - Password: password123
4. Click "Create Account"

### 4. Place an Order (Buyer)
1. Login with buyer account
2. Browse products on home page
3. Click on "Fresh Tomatoes"
4. Enter quantity: 5
5. Click "Place Order"

### 5. Manage Orders (Farmer)
1. Logout and login as farmer
2. Go to Orders page
3. Find the order from Jane Buyer
4. Click "Confirm Order"
5. Later, click "Mark as Delivered"

### 6. Admin Functions (Optional)
To test admin functions, you'll need to manually update a user's role in the database:

```sql
USE farmer_marketplace;
UPDATE Users SET role = 'admin' WHERE email = 'admin@example.com';
```

Then register/login with admin@example.com to access admin features.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/my` - Get farmer's products
- `POST /api/products` - Create product (farmer only)
- `PUT /api/products/:id` - Update product (owner only)
- `DELETE /api/products/:id` - Delete product (owner only)

### Orders
- `POST /api/orders` - Create order (buyer only)
- `GET /api/orders` - Get orders (role-based)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (farmer only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/stats` - Get user statistics (admin only)
- `PUT /api/admin/users/:id/verify` - Verify farmer (admin only)

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Features Implemented

### Frontend Features
- ✅ Modern React UI with Tailwind CSS
- ✅ JWT authentication with role-based access
- ✅ Product listing with search, filters, and pagination
- ✅ Product details page with order placement
- ✅ Farmer dashboard for product management
- ✅ Image upload for products
- ✅ Order management for buyers and farmers
- ✅ Admin panel for user management
- ✅ Real-time notifications (polling)
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Toast notifications for user feedback
- ✅ Form validation and error handling

### Backend Features
- ✅ RESTful API with Express.js
- ✅ MySQL database with Sequelize ORM
- ✅ JWT authentication middleware
- ✅ Role-based authorization (buyer, farmer, admin)
- ✅ Product CRUD operations
- ✅ Image upload with multer
- ✅ Order management system
- ✅ User management and verification
- ✅ Input validation and error handling
- ✅ Database migrations
- ✅ Security middleware (CORS, Helmet, Rate Limiting)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Frontend Can't Connect to Backend**
   - Ensure backend is running on port 5000
   - Check `VITE_API_URL` in frontend `.env`
   - Check browser console for CORS errors

3. **Image Upload Issues**
   - Check file size (max 5MB)
   - Verify file format (JPEG, PNG, GIF)
   - Ensure `uploads` directory exists in server

4. **Authentication Issues**
   - Clear localStorage in browser
   - Check JWT token expiration
   - Verify user role in database

## Development Commands

### Backend (server/)
```bash
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm run migrate:undo # Undo last migration
npm start           # Start production server
```

### Frontend (client/)
```bash
npm run dev         # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use production database
3. Set secure JWT secret
4. Run `npm start`

### Frontend
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Update `VITE_API_URL` to production backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
