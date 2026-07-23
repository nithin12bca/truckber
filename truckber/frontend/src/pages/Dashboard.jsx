import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { StatCard, Loader, Card, StatusBadge } from '../components/common/UI';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user?.role === 'admin') {
          const res = await api.get('/admin/dashboard');
          setData(res.data.data);
        } else {
          // Role-specific dashboards
          const [bookingsRes] = await Promise.all([api.get('/bookings?limit=5')]);
          setData({ bookings: bookingsRes.data.data, pagination: bookingsRes.data.pagination });
        }
      } catch {}
      setLoading(false);
    };
    fetchDashboard();
  }, [user]);

  if (loading) return <Loader size="lg" />;

  if (user?.role === 'admin') return <AdminDashboard data={data} />;
  if (user?.role === 'truck_owner') return <OwnerDashboard data={data} user={user} />;
  if (user?.role === 'driver') return <DriverDashboard data={data} user={user} />;
  return <CustomerDashboard data={data} user={user} />;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ data }) {
  const { stats, charts } = data || {};

  const revenueChartData = {
    labels: charts?.monthlyRevenue?.map(r => MONTH_NAMES[(r._id.month || 1) - 1]) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: charts?.monthlyRevenue?.map(r => r.revenue) || [],
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
      borderColor: '#f97316',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };

  const bookingTrendData = {
    labels: charts?.bookingTrends?.map(b => b._id) || [],
    datasets: [{
      label: 'Bookings',
      data: charts?.bookingTrends?.map(b => b.count) || [],
      backgroundColor: '#6366f1',
      borderRadius: 6,
    }],
  };

  const statusData = {
    labels: charts?.statusBreakdown?.map(s => s._id?.replace(/_/g, ' ')) || [],
    datasets: [{
      data: charts?.statusBreakdown?.map(s => s.count) || [],
      backgroundColor: ['#fbbf24', '#3b82f6', '#6366f1', '#f97316', '#22c55e', '#ef4444'],
    }],
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">Platform overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString()} color="blue" />
        <StatCard icon="🚛" label="Total Trucks" value={stats?.totalTrucks?.toLocaleString()} color="primary" />
        <StatCard icon="👤" label="Drivers" value={stats?.totalDrivers?.toLocaleString()} color="orange" />
        <StatCard icon="📦" label="Total Bookings" value={stats?.totalBookings?.toLocaleString()} color="purple" />
        <StatCard icon="💰" label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="green" />
        <StatCard icon="🔄" label="Active Trips" value={stats?.activeTrips || 0} color="orange" />
        <StatCard icon="✅" label="Completed" value={stats?.completedTrips?.toLocaleString()} color="green" />
        <StatCard icon="📊" label="Platform Fee (10%)" value={`₹${Math.round((stats?.totalRevenue || 0) * 0.1).toLocaleString('en-IN')}`} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Revenue">
          <div className="p-4">
            <Line data={revenueChartData} options={chartOpts} />
          </div>
        </Card>
        <Card title="Booking Trends (7 days)">
          <div className="p-4">
            <Bar data={bookingTrendData} options={chartOpts} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Booking Status">
          <div className="p-4 flex items-center justify-center" style={{ height: 220 }}>
            <Doughnut data={statusData} options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }} />
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card title="Quick Actions">
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { to: '/admin', label: '⚙️ Manage Users', desc: 'View & manage all users' },
                { to: '/drivers', label: '👤 Verify Drivers', desc: 'Pending verifications' },
                { to: '/bookings', label: '📦 All Bookings', desc: 'Monitor bookings' },
                { to: '/reports', label: '📊 Reports', desc: 'Generate reports' },
              ].map(({ to, label, desc }) => (
                <Link key={to} to={to} className="p-3 rounded-lg border border-gray-100 dark:border-dark-border hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                  <p className="font-medium text-sm text-gray-800 dark:text-dark-text">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{desc}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Dashboard ────────────────────────────────────────────────────────
function CustomerDashboard({ data, user }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Ready to ship something today?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="📦" label="My Bookings" value={data?.pagination?.total || 0} color="blue" />
        <StatCard icon="🔄" label="Active Trips" value={data?.bookings?.filter(b => b.status === 'in_transit').length || 0} color="orange" />
        <StatCard icon="✅" label="Completed" value={data?.bookings?.filter(b => b.status === 'delivered').length || 0} color="green" />
      </div>
      <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Book a Truck Now</h2>
        <p className="text-primary-100 text-sm mb-4">Get an instant quote and track your shipment live.</p>
        <Link to="/bookings/new" className="inline-block bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary-50 transition-colors">
          Create Booking →
        </Link>
      </div>
      <RecentBookingsTable bookings={data?.bookings} />
    </div>
  );
}

// ─── Owner Dashboard ──────────────────────────────────────────────────────────
function OwnerDashboard({ data, user }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Fleet Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="🚛" label="My Trucks" value="—" color="primary" />
        <StatCard icon="📦" label="Bookings" value={data?.pagination?.total || 0} color="blue" />
        <StatCard icon="🔄" label="Active" value={data?.bookings?.filter(b => b.status === 'in_transit').length || 0} color="orange" />
        <StatCard icon="💰" label="Revenue" value="₹—" color="green" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { to: '/fleet', icon: '🚛', label: 'Manage Fleet' },
          { to: '/drivers', icon: '👤', label: 'Manage Drivers' },
          { to: '/bookings', icon: '📦', label: 'View Bookings' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} className="flex items-center gap-3 p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border hover:border-primary-200 shadow-card transition-colors">
            <span className="text-2xl">{icon}</span>
            <span className="font-medium text-gray-800 dark:text-dark-text">{label}</span>
          </Link>
        ))}
      </div>
      <RecentBookingsTable bookings={data?.bookings} />
    </div>
  );
}

// ─── Driver Dashboard ─────────────────────────────────────────────────────────
function DriverDashboard({ data, user }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Driver Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="🗺️" label="Total Trips" value="—" color="blue" />
        <StatCard icon="⭐" label="Rating" value="—" color="orange" />
      </div>
      <RecentBookingsTable bookings={data?.bookings} role="driver" />
    </div>
  );
}

// ─── Recent Bookings Table ────────────────────────────────────────────────────
function RecentBookingsTable({ bookings, role }) {
  if (!bookings?.length) return null;
  return (
    <Card title="Recent Bookings" action={<Link to="/bookings" className="text-sm text-primary-600 hover:underline">View all →</Link>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-dark-border/30">
            <tr>
              {['Booking #', 'Route', 'Date', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {bookings.slice(0, 5).map(b => (
              <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-dark-text">{b.bookingNumber}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-dark-muted">{b.pickup?.city} → {b.drop?.city}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-dark-muted">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
