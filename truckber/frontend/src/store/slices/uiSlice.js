import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: true,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, { payload }) => { state.sidebarOpen = payload; },
  },
});

export const { toggleDarkMode, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
