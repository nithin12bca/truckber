const { LocationHistory } = require('../models/index');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  global.io = io;

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join personal room for notifications
    socket.join(`user_${socket.user._id}`);

    // Driver: join driver room
    if (socket.user.role === 'driver') {
      socket.join(`driver_${socket.user._id}`);
    }

    // Track booking room
    socket.on('join_booking', async ({ bookingId }) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.user._id} joined booking room: ${bookingId}`);
    });

    socket.on('leave_booking', ({ bookingId }) => {
      socket.leave(`booking_${bookingId}`);
    });

    // Driver location update
    socket.on('driver_location', async ({ bookingId, lat, lng, speed = 0 }) => {
      try {
        if (socket.user.role !== 'driver') return;

        // Update driver's current location
        await Driver.findOneAndUpdate(
          { user: socket.user._id },
          { currentLocation: { lat, lng, updatedAt: new Date() } }
        );

        // Save to location history
        await LocationHistory.findOneAndUpdate(
          { booking: bookingId },
          {
            $push: { coordinates: { lat, lng, speed, timestamp: new Date() } },
            $setOnInsert: { driver: socket.user._id },
          },
          { upsert: true }
        );

        // Broadcast to all tracking this booking
        io.to(`booking_${bookingId}`).emit('location_update', {
          bookingId, lat, lng, speed,
          timestamp: new Date(),
          driverName: socket.user.name,
        });
      } catch (error) {
        console.error('Location update error:', error.message);
      }
    });

    // Booking status change
    socket.on('booking_status_change', ({ bookingId, status }) => {
      io.to(`booking_${bookingId}`).emit('booking_updated', { bookingId, status });
    });

    // Notification read
    socket.on('mark_notifications_read', async () => {
      const { Notification } = require('../models/index');
      await Notification.updateMany(
        { recipient: socket.user._id, isRead: false },
        { isRead: true }
      );
    });

    // Chat / support message (simplified)
    socket.on('send_message', ({ to, message, bookingId }) => {
      io.to(`user_${to}`).emit('receive_message', {
        from: socket.user._id,
        fromName: socket.user.name,
        message,
        bookingId,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocket;
