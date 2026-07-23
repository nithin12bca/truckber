import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Card, Button, StatusBadge, Loader, EmptyState } from '../../components/common/UI';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function Drivers() {
  const { user } = useSelector((s) => s.auth);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drivers').then(r => {
      setDrivers(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const verifyDriver = async (driverId, status) => {
    try {
      await api.put(`/admin/drivers/${driverId}/verify`, { status });
      setDrivers(ds => ds.map(d => d._id === driverId ? { ...d, verificationStatus: status } : d));
      toast.success(`Driver ${status}`);
    } catch (e) {
      toast.error('Failed');
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Drivers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{drivers.length} drivers</p>
        </div>
      </div>

      {drivers.length === 0 ? (
        <EmptyState icon="👤" title="No drivers found"
          description="Drivers registered with your fleet will appear here"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(driver => (
            <Card key={driver._id} className="hover:shadow-card-hover transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-orange-100 dark:from-primary-900/30 dark:to-orange-900/30 flex items-center justify-center text-xl font-bold text-primary-700 flex-shrink-0">
                    {driver.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-dark-text truncate">{driver.user?.name}</p>
                    <p className="text-xs text-gray-500">{driver.user?.phone}</p>
                  </div>
                  <StatusBadge status={driver.verificationStatus} />
                </div>

                <div className="text-xs text-gray-500 dark:text-dark-muted space-y-1 mb-3">
                  <p>📋 License: {driver.licenseNumber}</p>
                  <p>📅 Exp: {new Date(driver.licenseExpiry).toLocaleDateString('en-IN')}</p>
                  <p>⏳ Experience: {driver.experience} years</p>
                  <p>🚛 Trips: {driver.totalTrips || 0} · ⭐ {driver.rating?.toFixed(1) || '—'}</p>
                  {driver.assignedTruck && (
                    <p>🔗 Truck: {driver.assignedTruck?.truckNumber}</p>
                  )}
                  <p className={`font-medium ${driver.isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                    {driver.isAvailable ? '🟢 Available' : '🔴 On Trip'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link to={`/drivers/${driver._id}`} className="flex-1 text-center text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                    View Profile
                  </Link>
                  {user?.role === 'admin' && driver.verificationStatus === 'pending' && (
                    <>
                      <button onClick={() => verifyDriver(driver._id, 'approved')}
                        className="flex-1 text-xs bg-green-50 text-green-700 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                        ✓ Approve
                      </button>
                      <button onClick={() => verifyDriver(driver._id, 'rejected')}
                        className="flex-1 text-xs bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
