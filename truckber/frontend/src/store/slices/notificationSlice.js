import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    setNotifications: (state, { payload }) => {
      state.items = payload.notifications;
      state.unread = payload.unread;
    },
    addNotification: (state, { payload }) => {
      state.items.unshift(payload);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.items = state.items.map(n => ({ ...n, isRead: true }));
      state.unread = 0;
    },
  },
});

export const { setNotifications, addNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
