# Farmers Marketplace - Frontend

A modern React frontend for the Farmers Marketplace application built with Vite, Tailwind CSS, and React Router.

## Features

- **Modern UI**: Built with Tailwind CSS for responsive design
- **Authentication**: JWT-based authentication with role-based access
- **Product Management**: Farmers can add, edit, and delete products with image upload
- **Order System**: Buyers can place orders, farmers can manage order status
- **Admin Panel**: Admin users can manage users and verify farmers
- **Real-time Notifications**: Polling-based notification system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx      # Navigation bar with notifications
│   │   ├── Footer.jsx      # Footer component
│   │   ├── ProductCard.jsx # Product display card
│   │   ├── ProductForm.jsx # Product creation/editing form
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── hooks/              # Custom hooks
│   │   └── useNotifications.js # Notification management
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Home page with product listing
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # Farmer dashboard
│   │   ├── ProductDetails.jsx # Product details page
│   │   ├── Orders.jsx      # Orders management
│   │   └── Admin.jsx       # Admin panel
│   ├── utils/              # Utility functions
│   │   └── api.js          # API configuration and endpoints
│   ├── App.jsx             # Main app component
│   ├── main.ts             # Entry point
│   └── style.css           # Global styles with Tailwind
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_NODE_ENV=development
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles and Features

### Buyer
- Browse and search products
- View product details
- Place orders
- Track order status
- Receive notifications

### Farmer
- Add, edit, and delete products
- Upload product images
- Manage orders (confirm, mark as delivered)
- View sales dashboard
- Receive order notifications

### Admin
- View all users
- Verify farmer accounts
- Access user statistics
- Manage the marketplace

## API Integration

The frontend integrates with the backend API through:

- **Authentication**: JWT tokens stored in localStorage
- **Product Management**: CRUD operations with image upload
- **Order System**: Order placement and status management
- **User Management**: Registration, login, profile management
- **Notifications**: Real-time polling every 10 seconds

## Key Features

### Authentication System
- JWT-based authentication
- Role-based route protection
- Automatic token refresh
- Secure logout functionality

### Product Management
- Image upload with validation
- Product CRUD operations
- Category filtering
- Search functionality
- Pagination

### Order System
- Order placement with quantity validation
- Status tracking (pending → confirmed → delivered)
- Role-based order views
- Real-time status updates

### Notification System
- Polling-based notifications
- Unread count display
- Toast notifications for actions
- Real-time updates

## Testing the Application

### 1. Register a Farmer Account
1. Go to `/register`
2. Select "Farmer" role
3. Fill in details and register
4. Login with the new account

### 2. Add Products
1. Go to `/dashboard`
2. Click "Add Product"
3. Fill in product details
4. Upload an image
5. Save the product

### 3. Register a Buyer Account
1. Go to `/register`
2. Select "Buyer" role
3. Fill in details and register
4. Login with the new account

### 4. Place an Order
1. Browse products on home page
2. Click on a product
3. Enter quantity
4. Click "Place Order"

### 5. Manage Orders (Farmer)
1. Login as farmer
2. Go to `/orders`
3. Confirm the order
4. Mark as delivered when ready

### 6. Admin Functions
1. Register an admin account (requires backend setup)
2. Go to `/admin`
3. View users and verify farmers

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |
| VITE_NODE_ENV | Environment | development |

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 5000
   - Check VITE_API_URL in .env file

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check if JWT token is expired

3. **Image Upload Issues**
   - Ensure image file is less than 5MB
   - Check file format (JPEG, PNG, GIF)

4. **Build Issues**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
