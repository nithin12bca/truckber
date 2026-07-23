import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/bookings', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchBooking = createAsyncThunk('bookings/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/bookings/${id}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Not found'); }
});

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bookings', bookingData);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Booking failed'); }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Cancel failed'); }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: { list: [], current: null, pagination: null, loading: false, error: null },
  reducers: {
    updateBookingStatus: (state, { payload }) => {
      const idx = state.list.findIndex(b => b._id === payload.bookingId);
      if (idx !== -1) state.list[idx].status = payload.status;
      if (state.current?._id === payload.bookingId) state.current.status = payload.status;
    },
    clearCurrent: (state) => { state.current = null; },
    clearError:   (state) => { state.error   = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false; state.list = payload.data; state.pagination = payload.pagination;
      })
      .addCase(fetchBookings.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchBooking.pending,    (state) => { state.loading = true; })
      .addCase(fetchBooking.fulfilled,  (state, { payload }) => { state.loading = false; state.current = payload; })
      .addCase(fetchBooking.rejected,   (state) => { state.loading = false; })
      .addCase(createBooking.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload?.booking) state.list.unshift(payload.booking);
      })
      .addCase(createBooking.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(cancelBooking.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(b => b._id === payload._id);
        if (idx !== -1) state.list[idx] = payload;
        if (state.current?._id === payload._id) state.current = payload;
      });
  },
});

export const { updateBookingStatus, clearCurrent, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
