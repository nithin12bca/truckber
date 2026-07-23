import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './store/slices/authSlice';
import { useSocket } from './hooks/useSocket';

// Layouts
import DashboardLayout from './components/common/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Eager pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';

// Lazy pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/bookings/Bookings'));
const BookingDetail = lazy(() => import('./pages/bookings/BookingDetail'));
const CreateBooking = lazy(() => import('./pages/bookings/CreateBooking'));
const Fleet = lazy(() => import('./pages/fleet/Fleet'));
const TruckDetail = lazy(() => import('./pages/fleet/TruckDetail'));
const Drivers = lazy(() => import('./pages/drivers/Drivers'));
const DriverProfile = lazy(() => import('./pages/drivers/DriverProfile'));
const Tracking = lazy(() => import('./pages/tracking/Tracking'));
const Payments = lazy(() => import('./pages/payments/Payments'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const LivestockModule = lazy(() => import('./pages/livestock/LivestockModule'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 dark:text-dark-muted text-sm">Loading TruckBer...</p>
    </div>
  </div>
);

function AppContent() {
  useSocket();
  const dispatch = useDispatch();
  const { initialized } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(getMe());
    else dispatch({ type: 'auth/getMe/rejected' });
  }, [dispatch]);

  if (!initialized) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected - Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/new" element={<CreateBooking />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/fleet/:id" element={<TruckDetail />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/drivers/:id" element={<DriverProfile />} />
            <Route path="/tracking/:bookingId?" element={<Tracking />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/livestock" element={<LivestockModule />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  );
}
