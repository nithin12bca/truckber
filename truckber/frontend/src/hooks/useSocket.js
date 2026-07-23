import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';
import { updateBookingStatus } from '../store/slices/bookingSlice';
import toast from 'react-hot-toast';

let socketInstance = null;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    socketInstance = io(import.meta.env.VITE_SOCKET_URL || '', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socketInstance.on('notification', (notification) => {
      dispatch(addNotification(notification));
      toast(notification.title, { icon: '🔔', duration: 4000 });
    });

    socketInstance.on('booking_updated', ({ bookingId, status }) => {
      dispatch(updateBookingStatus({ bookingId, status }));
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    initialized.current = true;

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, dispatch]);

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const joinBookingRoom = (bookingId) => {
  if (socketInstance?.connected) {
    socketInstance.emit('join_booking', { bookingId });
  }
};

export const leaveBookingRoom = (bookingId) => {
  if (socketInstance?.connected) {
    socketInstance.emit('leave_booking', { bookingId });
  }
};

export const emitLocation = (bookingId, lat, lng, speed = 0) => {
  if (socketInstance?.connected) {
    socketInstance.emit('driver_location', { bookingId, lat, lng, speed });
  }
};
