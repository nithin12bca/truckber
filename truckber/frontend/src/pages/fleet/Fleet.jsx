import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { Card, Button, Input, Select, StatusBadge, Loader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TRUCK_TYPES = ['mini_truck', 'pickup', 'lorry', 'trailer', 'tanker', 'container', 'refrigerator'];

export default function Fleet() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTruck, setEditTruck] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadTrucks(); }, []);

  const loadTrucks = async () => {
    try {
      const res = await api.get('/fleet');
      setTrucks(res.data.data);
    } catch {}
    setLoading(false);
  };

  const openAdd = () => { setEditTruck(null); reset({}); setShowForm(true); };
  const openEdit = (truck) => {
    setEditTruck(truck);
    reset({
      truckNumber: truck.truckNumber, truckType: truck.truckType, capacity: truck.capacity,
      make: truck.make, model: truck.model, year: truck.year, pricePerKm: truck.pricePerKm,
      registrationNumber: truck.registrationNumber, insuranceNumber: truck.insuranceNumber,
      registrationExpiry: truck.registrationExpiry?.slice(0, 10),
      insuranceExpiry: truck.insuranceExpiry?.slice(0, 10),
    });
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editTruck) {
        const res = await api.put(`/fleet/${editTruck._id}`, data);
        setTrucks(ts => ts.map(t => t._id === editTruck._id ? res.data.data : t));
        toast.success('Truck updated!');
      } else {
        const res = await api.post('/fleet', data);
        setTrucks(ts => [res.data.data, ...ts]);
        toast.success('Truck added!');
      }
      setShowForm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  const deleteTruck = async (id) => {
    if (!confirm('Remove this truck?')) return;
    try {
      await api.delete(`/fleet/${id}`);
      setTrucks(ts => ts.filter(t => t._id !== id));
      toast.success('Truck removed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const statusColor = { available: 'green', on_trip: 'orange', maintenance: 'yellow', inactive: 'gray' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Fleet Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{trucks.length} trucks registered</p>
        </div>
        <Button onClick={openAdd}>+ Add Truck</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: trucks.length, icon: '🚛' },
          { label: 'Available', value: trucks.filter(t => t.status === 'available').length, icon: '✅' },
          { label: 'On Trip', value: trucks.filter(t => t.status === 'on_trip').length, icon: '🔄' },
          { label: 'Maintenance', value: trucks.filter(t => t.status === 'maintenance').length, icon: '🔧' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-card text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {loading ? <Loader /> : trucks.length === 0 ? (
        <EmptyState icon="🚛" title="No trucks registered"
          description="Add your first truck to start accepting bookings"
          action={<Button onClick={openAdd}>Add First Truck</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trucks.map(truck => (
            <Card key={truck._id} className="hover:shadow-card-hover transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-dark-text">{truck.truckNumber}</h3>
                    <p className="text-sm text-gray-500 capitalize">{truck.truckType?.replace(/_/g, ' ')} · {truck.capacity}T</p>
                  </div>
                  <StatusBadge status={truck.status} />
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-muted space-y-1 mb-4">
                  <p>🚗 {truck.make} {truck.model} ({truck.year})</p>
                  <p>💰 ₹{truck.pricePerKm}/km</p>
                  <p>📋 Reg: {truck.registrationNumber}</p>
                  {truck.assignedDriver && (
                    <p>👤 Driver: {truck.assignedDriver?.user?.name || 'Assigned'}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(truck)}
                    className="flex-1 text-xs bg-gray-100 dark:bg-dark-border hover:bg-gray-200 text-gray-700 dark:text-dark-text py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <Link to={`/fleet/${truck._id}`} className="flex-1 text-xs bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 text-primary-700 dark:text-primary-400 py-1.5 rounded-lg text-center transition-colors">
                    Details
                  </Link>
                  <button onClick={() => deleteTruck(truck._id)}
                    className="px-3 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">
                  {editTruck ? 'Edit Truck' : 'Add New Truck'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Truck Number" placeholder="TN01AB1234" error={errors.truckNumber?.message}
                    {...register('truckNumber', { required: 'Required' })}
                  />
                  <Select label="Truck Type" error={errors.truckType?.message}
                    {...register('truckType', { required: 'Required' })}>
                    <option value="">Select type</option>
                    {TRUCK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </Select>
                  <Input label="Capacity (Tonnes)" type="number" step="0.1"
                    {...register('capacity', { required: 'Required' })}
                  />
                  <Input label="Price per km (₹)" type="number"
                    {...register('pricePerKm', { required: 'Required' })}
                  />
                  <Input label="Make" placeholder="Tata, Ashok Leyland..."
                    {...register('make', { required: 'Required' })}
                  />
                  <Input label="Model" placeholder="407, LPT..."
                    {...register('model', { required: 'Required' })}
                  />
                  <Input label="Year" type="number" min="1990" max={new Date().getFullYear()}
                    {...register('year', { required: 'Required' })}
                  />
                  <Input label="Registration #"
                    {...register('registrationNumber', { required: 'Required' })}
                  />
                  <Input label="Registration Expiry" type="date"
                    {...register('registrationExpiry', { required: 'Required' })}
                  />
                  <Input label="Insurance #"
                    {...register('insuranceNumber', { required: 'Required' })}
                  />
                  <Input label="Insurance Expiry" type="date"
                    {...register('insuranceExpiry', { required: 'Required' })}
                  />
                  <Input label="Minimum Charge (₹)" type="number" defaultValue="500"
                    {...register('minimumCharge')}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={submitting} className="flex-1">
                    {editTruck ? 'Update Truck' : 'Add Truck'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
