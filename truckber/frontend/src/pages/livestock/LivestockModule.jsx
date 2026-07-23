import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Card, Button, Input, Select, StatusBadge, Loader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function LivestockModule() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regRecord, handleSubmit: handleRecord, reset: resetRecord } = useForm();

  useEffect(() => {
    Promise.all([
      api.get('/livestock'),
      api.get('/bookings?status=delivered&limit=50'),
    ]).then(([lb, bk]) => {
      setBatches(lb.data.data);
      setBookings(bk.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.post('/livestock', data);
      setBatches(b => [res.data.data, ...b]);
      toast.success('Livestock batch created!');
      setShowForm(false);
      reset();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setSubmitting(false);
  };

  const addVaccination = async (data) => {
    try {
      const res = await api.put(`/livestock/${selected._id}`, {
        $push: { vaccinationRecords: data },
      });
      setSelected(res.data.data);
      toast.success('Vaccination record added!');
      resetRecord();
    } catch {
      toast.error('Failed');
    }
  };

  const addFeed = async (data) => {
    try {
      const res = await api.put(`/livestock/${selected._id}`, {
        $push: { feedRecords: { ...data, time: new Date() } },
      });
      setSelected(res.data.data);
      toast.success('Feed record added!');
      resetRecord();
    } catch {
      toast.error('Failed');
    }
  };

  const updateStatus = async (batchId, status) => {
    try {
      const res = await api.put(`/livestock/${batchId}`, { status });
      setBatches(bs => bs.map(b => b._id === batchId ? { ...b, status } : b));
      toast.success('Status updated!');
    } catch { toast.error('Failed'); }
  };

  const statusIcons = {
    preparing: '🏚️', in_transit: '🚛', delivered: '✅', at_market: '🏪'
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">🐄 Livestock Transport</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage animal batches, health records & farm-to-market delivery</p>
        </div>
        <Button onClick={() => { setShowForm(true); setSelected(null); }}>+ New Batch</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Batches', value: batches.length, icon: '🐄' },
          { label: 'In Transit', value: batches.filter(b => b.status === 'in_transit').length, icon: '🚛' },
          { label: 'Delivered', value: batches.filter(b => b.status === 'delivered').length, icon: '✅' },
          { label: 'At Market', value: batches.filter(b => b.status === 'at_market').length, icon: '🏪' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-card text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Batch list */}
        <div className="lg:col-span-1 space-y-3">
          {batches.length === 0 ? (
            <EmptyState icon="🐄" title="No batches yet"
              description="Create your first livestock transport batch"
              action={<Button onClick={() => setShowForm(true)}>Add Batch</Button>}
            />
          ) : batches.map(batch => (
            <div
              key={batch._id}
              onClick={() => setSelected(batch)}
              className={`bg-white dark:bg-dark-surface rounded-xl p-4 border cursor-pointer transition-all hover:shadow-card-hover ${
                selected?._id === batch._id
                  ? 'border-primary-400 ring-1 ring-primary-300'
                  : 'border-gray-100 dark:border-dark-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-dark-text">
                    {statusIcons[batch.status]} {batch.animalType}
                  </p>
                  <p className="text-xs text-gray-500">{batch.breed || 'Mixed'} · {batch.quantity} animals</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  batch.status === 'in_transit' ? 'bg-orange-100 text-orange-700' :
                  batch.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  batch.status === 'at_market' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {batch.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400">📍 {batch.origin} → {batch.destination}</p>
              <p className="text-xs text-gray-400 mt-0.5">📅 {new Date(batch.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>

        {/* Batch detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Header */}
              <Card>
                <div className="p-5">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">
                      {selected.animalType} Batch
                    </h2>
                    <select
                      value={selected.status}
                      onChange={e => updateStatus(selected._id, e.target.value)}
                      className="text-sm border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
                    >
                      <option value="preparing">Preparing</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="at_market">At Market</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      ['Animal', selected.animalType],
                      ['Quantity', selected.quantity],
                      ['Breed', selected.breed || 'Mixed'],
                      ['Weight', selected.totalWeight ? `${selected.totalWeight} kg` : '—'],
                      ['From', selected.origin],
                      ['To', selected.destination],
                      ['Health Cert', selected.healthCertificateNumber || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="p-2 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="font-medium text-gray-800 dark:text-dark-text text-xs mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Vaccination Records */}
              <Card title="💉 Vaccination Records"
                action={
                  <form onSubmit={handleRecord(addVaccination)} className="flex gap-2">
                    <input {...regRecord('vaccine', { required: true })} placeholder="Vaccine name" className="text-xs border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-surface" />
                    <input {...regRecord('date')} type="date" className="text-xs border border-gray-200 dark:border-dark-border rounded px-2 py-1 bg-white dark:bg-dark-surface" />
                    <button type="submit" className="text-xs bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600">Add</button>
                  </form>
                }
              >
                {selected.vaccinationRecords?.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-dark-border">
                    {selected.vaccinationRecords.map((v, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between text-sm">
                        <span className="font-medium text-gray-800 dark:text-dark-text">{v.vaccine}</span>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">{v.date ? new Date(v.date).toLocaleDateString('en-IN') : '—'}</p>
                          {v.nextDue && <p className="text-blue-500 text-xs">Next: {new Date(v.nextDue).toLocaleDateString('en-IN')}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-xs py-3">No vaccination records</p>
                )}
              </Card>

              {/* Feed Records */}
              <Card title="🌾 Feed Records">
                {selected.feedRecords?.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-dark-border">
                    {selected.feedRecords.map((f, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between text-sm">
                        <span className="font-medium text-gray-800 dark:text-dark-text">{f.feedType}</span>
                        <span className="text-gray-500 text-xs">{f.quantity} {f.unit} · {f.time ? new Date(f.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-xs py-3">No feed records</p>
                )}
              </Card>

              {/* Mortality */}
              {selected.mortalityRecords?.length > 0 && (
                <Card title="⚠️ Mortality Records">
                  {selected.mortalityRecords.map((m, i) => (
                    <div key={i} className="px-4 py-2.5 flex justify-between text-sm border-b last:border-0">
                      <span className="text-red-600 font-medium">{m.count} animals · {m.cause}</span>
                      <span className="text-gray-400 text-xs">{new Date(m.recordedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Transport expenses */}
              {selected.transportExpenses?.length > 0 && (
                <Card title="💰 Transport Expenses">
                  <div className="p-4">
                    {selected.transportExpenses.map((e, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5 border-b last:border-0 border-gray-50 dark:border-dark-border">
                        <span className="text-gray-700 dark:text-dark-text">{e.description}</span>
                        <span className="font-semibold text-gray-800 dark:text-dark-text">₹{e.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 dark:border-dark-border mt-1">
                      <span>Total</span>
                      <span className="text-primary-600">₹{selected.transportExpenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border">
              <div className="text-center">
                <div className="text-5xl mb-3">🐄</div>
                <p className="font-medium">Select a batch to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Batch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">New Livestock Batch</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Animal Type *" placeholder="Cattle, Goat, Poultry..."
                    error={errors.animalType?.message}
                    {...register('animalType', { required: 'Required' })}
                  />
                  <Input label="Quantity *" type="number"
                    error={errors.quantity?.message}
                    {...register('quantity', { required: 'Required', min: 1 })}
                  />
                  <Input label="Breed" placeholder="HF, Murrah, Broiler..."
                    {...register('breed')}
                  />
                  <Input label="Total Weight (kg)" type="number"
                    {...register('totalWeight')}
                  />
                  <Input label="Origin *" placeholder="Farm name / village"
                    error={errors.origin?.message}
                    {...register('origin', { required: 'Required' })}
                  />
                  <Input label="Destination *" placeholder="Market / buyer location"
                    error={errors.destination?.message}
                    {...register('destination', { required: 'Required' })}
                  />
                  <Input label="Health Certificate #"
                    {...register('healthCertificateNumber')}
                  />
                  <Select label="Link Booking (optional)" {...register('booking')}>
                    <option value="">— No booking —</option>
                    {bookings.map(b => (
                      <option key={b._id} value={b._id}>#{b.bookingNumber} · {b.pickup?.city}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={submitting} className="flex-1">Create Batch</Button>
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
