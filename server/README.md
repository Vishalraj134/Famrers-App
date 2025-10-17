# Farmer Marketplace Backend

A Node.js + Express backend API for a farmer marketplace application with MySQL database and JWT authentication.

## Features

- **Authentication System**: User registration, login with JWT tokens
- **User Roles**: Support for farmer, buyer, and admin roles
- **Product Management**: CRUD operations for products with image upload
- **Image Upload**: Multer-based file upload with validation and storage
- **Database**: MySQL with Sequelize ORM
- **Security**: Password hashing, JWT tokens, rate limiting, CORS protection
- **Validation**: Input validation using express-validator
- **Error Handling**: Comprehensive error handling middleware

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)
- express-validator (input validation)
- multer (file upload handling)

## Project Structure

`
server/
â"œâ"€â"€ config/
â"‚   â"œâ"€â"€ db.js                 # Database configuration
â"‚   â""â"€â"€ multer.js             # File upload configuration
â"œâ"€â"€ controllers/
â"‚   â"œâ"€â"€ authController.js      # Authentication controller
â"‚   â""â"€â"€ productController.js   # Product controller
â"œâ"€â"€ middleware/
â"‚   â"œâ"€â"€ authMiddleware.js      # JWT authentication middleware
â"‚   â""â"€â"€ errorMiddleware.js     # Error handling middleware
â"œâ"€â"€ models/
â"‚   â"œâ"€â"€ User.js               # User model
â"‚   â""â"€â"€ Product.js            # Product model
â"œâ"€â"€ routes/
â"‚   â"œâ"€â"€ authRoutes.js         # Authentication routes
â"‚   â""â"€â"€ productRoutes.js      # Product routes
â"œâ"€â"€ migrations/
â"‚   â"œâ"€â"€ 20241210000001-create-users.js  # Users table migration
â"‚   â""â"€â"€ 20241210000002-create-products.js  # Products table migration
â"œâ"€â"€ uploads/                   # Image upload directory
â”œâ”€â”€ .env.example              # Environment variables template
â”œâ”€â”€ .sequelizerc              # Sequelize configuration
â”œâ”€â”€ package.json              # Dependencies and scripts
â”œâ”€â”€ server.js                 # Main server file
â””â”€â”€ README.md                 # This file
`

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository and navigate to server directory**
   `ash
   cd server
   `

2. **Install dependencies**
   `ash
   npm install
   `

3. **Set up environment variables**
   `ash
   cp .env.example .env
   `
   
   Edit .env file with your database credentials:
   `env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=farmer_marketplace
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   `

4. **Create MySQL database**
   `sql
   CREATE DATABASE farmer_marketplace;
   `

5. **Run database migrations**
   `ash
   npm run migrate
   `

6. **Start the server**
   `ash
   npm start
   `
   
   For development with auto-restart:
   `ash
   npm run dev
   `

The server will start on http://localhost:5000 (or the port specified in your .env file).

## API Endpoints

### Authentication

- **POST** /api/auth/register - Register a new user
- **POST** /api/auth/login - Login user
- **GET** /api/auth/profile - Get current user profile (requires authentication)

### Products

- **GET** /api/products - List all products (supports query params: search, category, page, limit, minPrice, maxPrice, farmer_id)
- **GET** /api/products/:id - Get single product details
- **GET** /api/products/my - Get current farmer's products (requires authentication, farmers only)
- **POST** /api/products - Create new product (requires authentication, farmers only, accepts multipart/form-data for image)
- **PUT** /api/products/:id - Update product (requires authentication, product owner only)
- **DELETE** /api/products/:id - Delete product (requires authentication, product owner only)

### Orders

- **POST** /api/orders - Create new order (requires authentication, buyers only)
- **GET** /api/orders - Get orders for logged-in user (role-based: buyers see their orders, farmers see orders for their products)
- **GET** /api/orders/:id - Get single order details
- **PUT** /api/orders/:id/status - Update order status (requires authentication, farmers only)

### Admin

- **GET** /api/admin/users - List all users (requires authentication, admin only)
- **GET** /api/admin/users/stats - Get user statistics (requires authentication, admin only)
- **GET** /api/admin/users/:id - Get single user details (requires authentication, admin only)
- **PUT** /api/admin/users/:id/verify - Verify farmer account (requires authentication, admin only)

### Notifications

- **GET** /api/notifications - Get notifications for logged-in user
- **GET** /api/notifications/unread-count - Get unread notification count
- **GET** /api/notifications/events - Get notification events (for polling)
- **PUT** /api/notifications/:id/read - Mark notification as read
- **PUT** /api/notifications/read-all - Mark all notifications as read
- **DELETE** /api/notifications/:id - Delete notification

### Health Check

- **GET** /health - Server health check

## API Usage Examples

### Register User

`ash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "buyer"
  }'
`

### Login User

`ash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
`

### Get User Profile (with JWT token)

`ash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

### Create Product (with image upload)

`ash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Organic Tomatoes" \
  -F "category=Vegetables" \
  -F "price=5.99" \
  -F "quantity=50" \
  -F "description=Fresh organic tomatoes from local farm" \
  -F "image=@/path/to/your/image.jpg"
`

### Get All Products

`ash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=Vegetables&search=tomatoes"
`

### Get Single Product

`ash
curl -X GET http://localhost:5000/api/products/1
`

### Update Product

`ash
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Updated Product Name" \
  -F "price=6.99" \
  -F "image=@/path/to/new/image.jpg"
`

### Delete Product

`ash
curl -X DELETE http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

### Place Order

`ash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 5
  }'
`

### Get Orders (for buyer)

`ash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

### Get Orders (for farmer)

`ash
curl -X GET "http://localhost:5000/api/orders?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

### Update Order Status (farmer)

`ash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
`

### Admin: List Users

`ash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=10&role=farmer" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
`

### Admin: Verify Farmer

`ash
curl -X PUT http://localhost:5000/api/admin/users/2/verify \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verified": true
  }'
`

### Get Notifications

`ash
curl -X GET "http://localhost:5000/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

### Mark Notification as Read

`ash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`

## Database Schema

### Users Table

| Field     | Type         | Constraints           |
|-----------|--------------|-----------------------|
| id        | INTEGER      | Primary Key, Auto Increment |
| name      | VARCHAR(100) | Not Null, Length: 2-100 |
| email     | VARCHAR(255) | Not Null, Unique, Email Format |
| password  | VARCHAR(255) | Not Null, Length: 6-255 |
| role      | ENUM         | Not Null, Default: 'buyer' |
| createdAt | DATETIME     | Not Null, Auto Generated |
| updatedAt | DATETIME     | Not Null, Auto Updated |

### Products Table

| Field      | Type         | Constraints           |
|------------|--------------|-----------------------|
| id         | INTEGER      | Primary Key, Auto Increment |
| farmer_id  | INTEGER      | Foreign Key to users.id, Not Null |
| name       | VARCHAR(255) | Not Null, Length: 2-255 |
| category   | VARCHAR(100) | Not Null, Length: 2-100 |
| price      | DECIMAL(10,2)| Not Null, Min: 0 |
| quantity   | INTEGER      | Not Null, Min: 0 |
| description| TEXT         | Nullable |
| image_url  | VARCHAR(500) | Nullable, URL Format |
| createdAt  | DATETIME     | Not Null, Auto Generated |
| updatedAt  | DATETIME     | Not Null, Auto Updated |

### Orders Table

| Field      | Type         | Constraints           |
|------------|--------------|-----------------------|
| id         | INTEGER      | Primary Key, Auto Increment |
| product_id | INTEGER      | Foreign Key to products.id, Not Null |
| buyer_id   | INTEGER      | Foreign Key to users.id, Not Null |
| quantity   | INTEGER      | Not Null, Min: 1 |
| total_price| DECIMAL(10,2)| Not Null, Min: 0 |
| status     | ENUM         | Not Null, Default: 'pending' |
| createdAt  | DATETIME     | Not Null, Auto Generated |
| updatedAt  | DATETIME     | Not Null, Auto Updated |

### Notifications Table

| Field      | Type         | Constraints           |
|------------|--------------|-----------------------|
| id         | INTEGER      | Primary Key, Auto Increment |
| user_id    | INTEGER      | Foreign Key to users.id, Not Null |
| title      | VARCHAR(255) | Not Null, Length: 1-255 |
| message    | TEXT         | Not Null |
| type       | ENUM         | Not Null, Default: 'system' |
| read       | BOOLEAN      | Not Null, Default: false |
| metadata   | JSON         | Nullable |
| createdAt  | DATETIME     | Not Null, Auto Generated |
| updatedAt  | DATETIME     | Not Null, Auto Updated |

## User Roles

- **buyer**: Default role for marketplace buyers
- **farmer**: Role for farmers selling products
- **admin**: Administrative role with full access

## Real-time Features (WebSocket)

The API includes WebSocket support for real-time notifications:

### WebSocket Connection

```javascript
// Client-side connection example
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Join farmer room for order notifications
socket.emit('join_farmer_room');

// Join admin room for system notifications
socket.emit('join_admin_room');
```

### WebSocket Events

- **notification**: Real-time notification for user
- **new_order**: New order notification for farmers
- **new_farmer_registration**: New farmer registration for admins

### Order Flow Example

1. **Buyer places order** → Creates order with status 'pending'
2. **Farmer receives notification** → Via WebSocket and database notification
3. **Farmer confirms order** → Updates status to 'confirmed'
4. **Buyer receives notification** → Order status update
5. **Farmer marks as delivered** → Updates status to 'delivered'
6. **Buyer receives final notification** → Order completed

## Image Upload

The API supports image upload for products using multipart/form-data. Key features:

- **File Types**: Only image files are allowed (JPEG, PNG, GIF, etc.)
- **File Size**: Maximum 5MB per image
- **Storage**: Images are stored in the `/uploads` directory
- **URLs**: Images are accessible via `/uploads/filename` endpoint
- **Validation**: Automatic file type and size validation
- **Cleanup**: Old images are automatically deleted when products are updated/deleted

### Testing Image Upload

To test image upload functionality:

1. **Create a farmer account first:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Farmer",
       "email": "farmer@example.com",
       "password": "password123",
       "role": "farmer"
     }'
   ```

2. **Login to get JWT token:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "farmer@example.com",
       "password": "password123"
     }'
   ```

3. **Create product with image (replace YOUR_JWT_TOKEN and image path):**
   ```bash
   curl -X POST http://localhost:5000/api/products \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "name=Organic Tomatoes" \
     -F "category=Vegetables" \
     -F "price=5.99" \
     -F "quantity=50" \
     -F "description=Fresh organic tomatoes" \
     -F "image=@./test-image.jpg"
   ```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection protection via Sequelize ORM

## Error Handling

The API returns consistent error responses:

`json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
`

## Development

### Available Scripts

- 
pm start - Start production server
- 
pm run dev - Start development server with nodemon
- 
pm run migrate - Run database migrations
- 
pm run migrate:undo - Undo last migration
- 
pm run seed - Run database seeders

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASS | MySQL password | - |
| DB_NAME | MySQL database name | farmer_marketplace |
| JWT_SECRET | JWT signing secret | - |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
