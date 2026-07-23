import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/slices/authSlice';
import { toggleDarkMode, toggleSidebar } from '../../store/slices/uiSlice';
import { markAllRead } from '../../store/slices/notificationSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard', roles: ['customer', 'truck_owner', 'driver', 'admin'] },
  { to: '/bookings', icon: '📦', label: 'Bookings', roles: ['customer', 'truck_owner', 'driver', 'admin'] },
  { to: '/bookings/new', icon: '➕', label: 'New Booking', roles: ['customer'] },
  { to: '/fleet', icon: '🚛', label: 'Fleet', roles: ['truck_owner', 'admin'] },
  { to: '/drivers', icon: '👤', label: 'Drivers', roles: ['truck_owner', 'admin'] },
  { to: '/tracking', icon: '📍', label: 'Tracking', roles: ['customer', 'truck_owner', 'driver', 'admin'] },
  { to: '/payments', icon: '💳', label: 'Payments', roles: ['customer', 'truck_owner', 'admin'] },
  { to: '/reports', icon: '📊', label: 'Reports', roles: ['truck_owner', 'admin'] },
  { to: '/livestock', icon: '🐄', label: 'Livestock', roles: ['customer', 'truck_owner', 'admin'] },
  { to: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
];

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { darkMode, sidebarOpen } = useSelector((s) => s.ui);
  const { unread, items: notifications } = useSelector((s) => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleMarkRead = async () => {
    await api.put('/notifications/read-all');
    dispatch(markAllRead());
  };

  const roleColors = {
    customer: 'bg-blue-100 text-blue-700',
    truck_owner: 'bg-green-100 text-green-700',
    driver: 'bg-orange-100 text-orange-700',
    admin: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        flex-shrink-0 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border
        transition-all duration-300 flex flex-col overflow-hidden
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-dark-border">
          <span className="text-2xl">🚛</span>
          {sidebarOpen && (
            <span className="font-bold text-xl text-primary-600 dark:text-primary-400">TruckBer</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {filteredNav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                }
              `}
              title={!sidebarOpen ? label : ''}
            >
              <span className="text-lg flex-shrink-0">{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {sidebarOpen && user && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-semibold text-sm flex-shrink-0">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">{user.name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user.role]}`}>
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
          >
            ☰
          </button>

          <div className="flex items-center gap-2">
            {/* Dark mode */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border relative"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-dark-border">
                    <span className="font-semibold text-sm dark:text-dark-text">Notifications</span>
                    {unread > 0 && (
                      <button onClick={handleMarkRead} className="text-xs text-primary-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-6">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n._id} className={`p-3 border-b border-gray-50 dark:border-dark-border last:border-0 ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                          <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-lg z-50 py-1">
                  <button onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border">
                    👤 Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border">
                    ⚙️ Settings
                  </button>
                  <hr className="my-1 border-gray-100 dark:border-dark-border" />
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for dropdowns */}
      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}
    </div>
  );
}
