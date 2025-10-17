const jwt = require('jsonwebtoken');
const User = require('../models/User');

// WebSocket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Add user info to socket
    socket.userId = decoded.userId;
    socket.user = user.toJSON();
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize Socket.IO
const initializeSocket = (server) => {
  const { Server } = require('socket.io');
  
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://your-frontend-domain.com'])
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} (${socket.userId}) connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining specific rooms (e.g., for farmer orders)
    socket.on('join_farmer_room', () => {
      if (socket.user.role === 'farmer') {
        socket.join(`farmer_${socket.userId}`);
        console.log(`Farmer ${socket.user.name} joined farmer room`);
      }
    });

    // Handle joining admin room
    socket.on('join_admin_room', () => {
      if (socket.user.role === 'admin') {
        socket.join('admin_room');
        console.log(`Admin ${socket.user.name} joined admin room`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} (${socket.userId}) disconnected`);
    });
  });

  return io;
};

// Emit notification to specific user
const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt
  });
};

// Emit notification to farmer about new order
const emitFarmerNotification = (io, farmerId, orderData) => {
  io.to(`farmer_${farmerId}`).emit('new_order', orderData);
};

// Emit notification to admin about new farmer registration
const emitAdminNotification = (io, farmerData) => {
  io.to('admin_room').emit('new_farmer_registration', farmerData);
};

module.exports = {
  initializeSocket,
  emitNotification,
  emitFarmerNotification,
  emitAdminNotification
};
