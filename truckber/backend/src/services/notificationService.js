// notificationService.js
const { Notification } = require('../models/index');

exports.createNotification = async ({ recipient, type, title, message, data, booking }) => {
  try {
    const notification = await Notification.create({
      recipient, type, title, message, data, booking,
    });

    // Emit via socket if available
    if (global.io) {
      global.io.to(`user_${recipient.toString()}`).emit('notification', {
        id: notification._id,
        type, title, message,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

exports.getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};
