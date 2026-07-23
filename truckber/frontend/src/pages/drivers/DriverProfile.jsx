// DriverProfile.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Card, Loader, StatusBadge } from '../../components/common/UI';

export default function DriverProfile() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    api.get('/drivers').then(r => {
      setDriver(r.data.data.find(d => d._id === id));
    });
  }, [id]);

  if (!driver) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to="/drivers" className="text-gray-400 hover:text-gray-600 text-sm">← Drivers</Link>
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700">
              {driver.user?.name?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">{driver.user?.name}</h1>
              <p className="text-gray-500">{driver.user?.phone} · {driver.user?.email}</p>
              <div className="flex gap-2 mt-1">
                <StatusBadge status={driver.verificationStatus} />
                <StatusBadge status={driver.isAvailable ? 'available' : 'on_trip'} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['License #', driver.licenseNumber], ['License Expiry', new Date(driver.licenseExpiry).toLocaleDateString('en-IN')],
              ['Aadhaar #', driver.aadhaarNumber?.replace(/\d(?=\d{4})/g, '*')],
              ['Experience', `${driver.experience} years`],
              ['Total Trips', driver.totalTrips || 0], ['Total Distance', `${driver.totalDistance || 0} km`],
              ['Rating', driver.rating?.toFixed(1) || '—'], ['Total Ratings', driver.totalRatings || 0],
            ].map(([label, val]) => (
              <div key={label} className="p-3 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 dark:text-dark-text">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
