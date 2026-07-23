import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StatusBadge, Button, Loader, Card } from '../../components/common/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'accepted', 'driver_assigned', 'in_transit', 'delivered'];

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => {
      setBooking(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const doAction = async (endpoint, data = {}) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/bookings/${id}/${endpoint}`, data);
      setBooking(res.data.data);
      toast.success('Updated!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
    setActionLoading(false);
  };

  if (loading) return <Loader size="lg" />;
  if (!booking) return <div className="text-center py-20 text-gray-400">Booking not found</div>;

  const currentStep = STATUS_STEPS.indexOf(booking.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/bookings" className="text-gray-400 hover:text-gray-600 text-sm">← Bookings</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">#{booking.bookingNumber}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Progress */}
      <Card title="Trip Progress">
        <div className="p-5">
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i <= currentStep ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${i < currentStep ? 'bg-primary-400' : 'bg-gray-200 dark:bg-dark-border'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_STEPS.map(s => (
              <span key={s} className="text-xs text-gray-400 capitalize" style={{ flex: 1, textAlign: 'center' }}>
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Route */}
        <Card title="Route Details">
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                <div className="w-0.5 h-12 bg-gray-200 dark:bg-dark-border my-1" />
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Pickup</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{booking.pickup?.address}</p>
                  <p className="text-xs text-gray-500">{booking.pickup?.city}, {booking.pickup?.state}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Drop</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{booking.drop?.address}</p>
                  <p className="text-xs text-gray-500">{booking.drop?.city}, {booking.drop?.state}</p>
                </div>
              </div>
            </div>
            {booking.distance && (
              <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-dark-border text-sm">
                <span className="text-gray-500">Distance: <strong className="text-gray-800 dark:text-dark-text">{booking.distance} km</strong></span>
              </div>
            )}
          </div>
        </Card>

        {/* Cargo */}
        <Card title="Cargo & Cost">
          <div className="p-4 space-y-2 text-sm">
            {[
              ['Truck Type', booking.truckType?.replace(/_/g, ' ')],
              ['Load Weight', `${booking.loadWeight} Tonnes`],
              ['Description', booking.loadDescription || '—'],
              ['Scheduled', new Date(booking.scheduledPickup).toLocaleString('en-IN')],
              ['Est. Cost', booking.estimatedCost ? `₹${booking.estimatedCost.toLocaleString('en-IN')}` : '—'],
              ['Final Cost', booking.finalCost ? `₹${booking.finalCost.toLocaleString('en-IN')}` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-dark-border last:border-0">
                <span className="text-gray-500 dark:text-dark-muted">{label}</span>
                <span className="font-medium text-gray-800 dark:text-dark-text capitalize">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Driver & Truck */}
      {(booking.driver || booking.truck) && (
        <Card title="Driver & Truck">
          <div className="p-4 grid grid-cols-2 gap-4 text-sm">
            {booking.driver && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Driver</p>
                <p className="font-medium text-gray-800 dark:text-dark-text">{booking.driver?.user?.name || '—'}</p>
                <p className="text-gray-500">{booking.driver?.user?.phone}</p>
              </div>
            )}
            {booking.truck && (
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Truck</p>
                <p className="font-medium text-gray-800 dark:text-dark-text">{booking.truck?.truckNumber}</p>
                <p className="text-gray-500 capitalize">{booking.truck?.truckType?.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Livestock */}
      {booking.isLivestockTransport && (
        <Card title="🐄 Livestock Details">
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Animal Type', booking.livestockDetails?.animalType],
              ['Quantity', booking.livestockDetails?.quantity],
              ['Breed', booking.livestockDetails?.breed || '—'],
              ['Health Cert', booking.livestockDetails?.healthCertificate || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-800 dark:text-dark-text">{val}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Driver: start trip */}
        {user?.role === 'driver' && booking.status === 'driver_assigned' && (
          <Button onClick={() => doAction('start-trip')} loading={actionLoading}>
            🚀 Start Trip
          </Button>
        )}

        {/* Driver: complete */}
        {user?.role === 'driver' && booking.status === 'in_transit' && (
          <Button onClick={() => doAction('complete', { notes: 'Delivered successfully' })} loading={actionLoading}>
            ✅ Mark Delivered
          </Button>
        )}

        {/* Track */}
        {['in_transit', 'driver_assigned'].includes(booking.status) && (
          <Link to={`/tracking/${booking._id}`}>
            <Button variant="secondary">📍 Track Live</Button>
          </Link>
        )}

        {/* Download invoice */}
        {booking.status === 'delivered' && (
          <Button variant="secondary" onClick={() => toast('Invoice download coming soon')}>
            📄 Download Invoice
          </Button>
        )}

        {/* Cancel */}
        {!['delivered', 'in_transit', 'cancelled'].includes(booking.status) && (
          <Button variant="danger" onClick={() => doAction('cancel', { reason: 'Customer cancelled' })} loading={actionLoading}>
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
