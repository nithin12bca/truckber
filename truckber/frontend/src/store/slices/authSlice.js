import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Thunks ────────────────────────────────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed. Check your credentials.');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed.');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired.');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch { /* ignore */ }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (updates, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/me', updates);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed.');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    isAuthenticated: false,
    loading:         false,
    error:           null,
    initialized:     false,   // true once we know if user is logged in or not
  },
  reducers: {
    clearError:  (state) => { state.error = null; },
    setUser:     (state, { payload }) => {
      state.user            = payload;
      state.isAuthenticated = !!payload;
      state.initialized     = true;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // login
      .addCase(login.pending,   pending)
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload.user;
        state.isAuthenticated = true;
        state.initialized     = true;
        state.error           = null;
      })
      .addCase(login.rejected,  rejected)

      // register
      .addCase(register.pending,   pending)
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload.user;
        state.isAuthenticated = true;
        state.initialized     = true;
        state.error           = null;
      })
      .addCase(register.rejected,  rejected)

      // getMe (auto-login on app load)
      .addCase(getMe.pending,   (state) => { state.loading = true; })
      .addCase(getMe.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload;
        state.isAuthenticated = true;
        state.initialized     = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading         = false;
        state.user            = null;
        state.isAuthenticated = false;
        state.initialized     = true;
        // Clear stale tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user            = null;
        state.isAuthenticated = false;
        state.loading         = false;
        state.error           = null;
      })

      // updateProfile
      .addCase(updateProfile.pending,   pending)
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload;
      })
      .addCase(updateProfile.rejected,  rejected);
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
