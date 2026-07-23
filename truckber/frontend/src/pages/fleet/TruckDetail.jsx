import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { Card, Button, Input, Select, StatusBadge, Loader } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function TruckDetail() {
  const { id } = useParams();
  const [truck, setTruck] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    Promise.all([api.get(`/fleet`), api.get(`/fleet/${id}/maintenance`)])
      .then(([fleet, maint]) => {
        const t = fleet.data.data.find(tr => tr._id === id);
        setTruck(t);
        setMaintenance(maint.data.data);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [id]);

  const addMaintenance = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/fleet/${id}/maintenance`, data);
      setMaintenance(m => [res.data.data, ...m]);
      toast.success('Maintenance record added');
      setShowMaintForm(false);
      reset();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  if (loading) return <Loader size="lg" />;
  if (!truck) return <div className="text-center py-20 text-gray-400">Truck not found</div>;

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const days = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
    return days < 30;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/fleet" className="text-gray-400 hover:text-gray-600 text-sm">← Fleet</Link>
      </div>

      {/* Header card */}
      <Card>
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">🚛</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{truck.truckNumber}</h1>
              <StatusBadge status={truck.status} />
            </div>
            <p className="text-gray-500">{truck.make} {truck.model} ({truck.year}) · {truck.capacity}T · {truck.truckType?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 pb-5">
          {[
            { label: 'Total Trips', value: truck.totalTrips || 0, icon: '🗺️' },
            { label: 'Total Distance', value: `${truck.totalDistance || 0} km`, icon: '📏' },
            { label: 'Price/km', value: `₹${truck.pricePerKm}`, icon: '💰' },
            { label: 'Driver', value: truck.assignedDriver?.user?.name || 'Unassigned', icon: '👤' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center p-3 bg-gray-50 dark:bg-dark-border/30 rounded-xl">
              <span className="text-xl">{icon}</span>
              <p className="font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Documents */}
      <Card title="Documents & Compliance">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Registration', num: truck.registrationNumber, expiry: truck.registrationExpiry },
            { label: 'Insurance', num: truck.insuranceNumber, expiry: truck.insuranceExpiry },
            { label: 'Fitness Certificate', num: truck.fitnessCertNumber || 'N/A', expiry: truck.fitnessCertExpiry },
            { label: 'Permit', num: truck.permitNumber || 'N/A', expiry: truck.permitExpiry },
          ].map(({ label, num, expiry }) => (
            <div key={label} className={`p-3 rounded-lg border ${expiry && isExpiringSoon(expiry) ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-dark-border'}`}>
              <p className="font-semibold text-gray-700 dark:text-dark-text">{label}</p>
              <p className="text-gray-600 dark:text-dark-muted">{num}</p>
              {expiry && (
                <p className={`text-xs mt-0.5 ${isExpiringSoon(expiry) ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                  Expiry: {new Date(expiry).toLocaleDateString('en-IN')}
                  {isExpiringSoon(expiry) && ' ⚠️ Expiring soon!'}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance */}
      <Card
        title="Maintenance History"
        action={<Button size="sm" onClick={() => setShowMaintForm(true)}>+ Add Record</Button>}
      >
        {maintenance.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No maintenance records yet</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-dark-border">
            {maintenance.map(m => (
              <div key={m._id} className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800 dark:text-dark-text capitalize">{m.serviceType?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.serviceCenter || 'Service center'} · {m.mechanicName || ''}</p>
                  {m.notes && <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>}
                  {m.nextServiceDate && (
                    <p className="text-xs text-blue-500 mt-1">Next due: {new Date(m.nextServiceDate).toLocaleDateString('en-IN')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-dark-text">₹{m.serviceCost?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">{new Date(m.serviceDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Maintenance form modal */}
      {showMaintForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-dark-text">Add Maintenance Record</h2>
                <button onClick={() => setShowMaintForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit(addMaintenance)} className="space-y-3">
                <Select label="Service Type" {...register('serviceType', { required: true })}>
                  <option value="">Select type</option>
                  {['oil_change', 'tire_replacement', 'engine', 'brake', 'electrical', 'body', 'general', 'other'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Service Date" type="date" {...register('serviceDate', { required: true })} />
                  <Input label="Cost (₹)" type="number" {...register('serviceCost', { required: true })} />
                </div>
                <Input label="Service Center" {...register('serviceCenter')} />
                <Input label="Mechanic Name" {...register('mechanicName')} />
                <Input label="Odometer Reading" type="number" {...register('odometer')} />
                <Input label="Next Service Date" type="date" {...register('nextServiceDate')} />
                <Input label="Notes" {...register('notes')} />
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={submitting} className="flex-1">Save Record</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowMaintForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
