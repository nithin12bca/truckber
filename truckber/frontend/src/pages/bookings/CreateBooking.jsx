import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createBooking } from '../../store/slices/bookingSlice';
import { Input, Button, Select, Card } from '../../components/common/UI';
import toast from 'react-hot-toast';

const TRUCK_TYPES = [
  { value: 'mini_truck', label: 'Mini Truck (up to 1T)' },
  { value: 'pickup', label: 'Pickup Truck (up to 2T)' },
  { value: 'lorry', label: 'Lorry (up to 10T)' },
  { value: 'trailer', label: 'Trailer (up to 25T)' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'container', label: 'Container Truck' },
  { value: 'refrigerator', label: 'Refrigerator Truck' },
];

const STEPS = ['Cargo Details', 'Locations', 'Schedule', 'Review'];

export default function CreateBooking() {
  const [step, setStep] = useState(0);
  const [isLivestock, setIsLivestock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, trigger, getValues } = useForm({
    defaultValues: { truckType: 'mini_truck', loadWeight: 1 },
  });

  const nextStep = async () => {
    const fields = [
      ['truckType', 'loadWeight', 'loadDescription'],
      ['pickup.address', 'pickup.city', 'pickup.state', 'drop.address', 'drop.city', 'drop.state'],
      ['scheduledPickup'],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await dispatch(createBooking(data)).unwrap();
      setResult(res);
      toast.success(`Booking #${res.booking.bookingNumber} created!`);
      setStep(4); // success
    } catch (err) {
      toast.error(err || 'Booking failed');
    }
    setLoading(false);
  };

  // Success screen
  if (step === 4 && result) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">Booking Created!</h2>
        <p className="text-gray-500 mb-2">Booking # <strong>{result.booking.bookingNumber}</strong></p>
        <p className="text-gray-500 mb-1">Estimated Cost: <strong className="text-primary-600">₹{result.estimatedCost?.toLocaleString('en-IN')}</strong></p>
        <p className="text-gray-500 mb-6">Distance: <strong>{result.distance} km</strong></p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(`/bookings/${result.booking._id}`)}>View Booking</Button>
          <Button variant="secondary" onClick={() => navigate('/bookings')}>All Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Create Booking</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to book a truck</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
              i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-400' : 'bg-gray-100 dark:bg-dark-border text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-400' : 'bg-gray-200 dark:bg-dark-border'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {/* Step 0: Cargo */}
            {step === 0 && (
              <>
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Cargo Details</h2>
                <Select label="Truck Type" error={errors.truckType?.message}
                  {...register('truckType', { required: 'Required' })}>
                  {TRUCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
                <Input label="Load Weight (Tonnes)" type="number" step="0.1" min="0.1"
                  error={errors.loadWeight?.message}
                  {...register('loadWeight', { required: 'Required', min: { value: 0.1, message: 'Min 0.1T' } })}
                />
                <Input label="Load Description" placeholder="e.g., Electronics, Furniture, Grains..."
                  {...register('loadDescription')}
                />
                <Input label="Special Instructions (optional)" placeholder="Fragile, handle with care..."
                  {...register('specialInstructions')}
                />
                {/* Livestock toggle */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <input type="checkbox" id="livestock" className="w-4 h-4 accent-primary-500"
                    checked={isLivestock} onChange={e => setIsLivestock(e.target.checked)}
                  />
                  <label htmlFor="livestock" className="text-sm font-medium text-amber-800 dark:text-amber-300 cursor-pointer">
                    🐄 This is a Livestock / Animal Transport
                  </label>
                </div>
                {isLivestock && (
                  <div className="grid grid-cols-2 gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Input label="Animal Type" placeholder="Cattle, Goat, Poultry..."
                      {...register('livestockDetails.animalType')}
                    />
                    <Input label="Quantity" type="number"
                      {...register('livestockDetails.quantity')}
                    />
                    <Input label="Breed (optional)"
                      {...register('livestockDetails.breed')}
                    />
                    <Input label="Health Certificate #" placeholder="Cert number"
                      {...register('livestockDetails.healthCertificate')}
                    />
                    <div className="col-span-2">
                      <Input label="Special Care Instructions"
                        {...register('livestockDetails.specialCare')}
                      />
                    </div>
                    <input type="hidden" {...register('isLivestockTransport')} value="true" />
                  </div>
                )}
              </>
            )}

            {/* Step 1: Locations */}
            {step === 1 && (
              <>
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Pickup & Drop Locations</h2>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 space-y-3">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">📍 Pickup Location</p>
                  <Input label="Street Address" placeholder="Building, Street, Area"
                    error={errors.pickup?.address?.message}
                    {...register('pickup.address', { required: 'Required' })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" error={errors.pickup?.city?.message}
                      {...register('pickup.city', { required: 'Required' })}
                    />
                    <Input label="State" error={errors.pickup?.state?.message}
                      {...register('pickup.state', { required: 'Required' })}
                    />
                  </div>
                  <Input label="Pincode" {...register('pickup.pincode')} />
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 space-y-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">🏁 Drop Location</p>
                  <Input label="Street Address" placeholder="Building, Street, Area"
                    error={errors.drop?.address?.message}
                    {...register('drop.address', { required: 'Required' })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" error={errors.drop?.city?.message}
                      {...register('drop.city', { required: 'Required' })}
                    />
                    <Input label="State" error={errors.drop?.state?.message}
                      {...register('drop.state', { required: 'Required' })}
                    />
                  </div>
                  <Input label="Pincode" {...register('drop.pincode')} />
                </div>
              </>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Schedule Pickup</h2>
                <Input label="Pickup Date & Time" type="datetime-local"
                  error={errors.scheduledPickup?.message}
                  min={new Date().toISOString().slice(0, 16)}
                  {...register('scheduledPickup', { required: 'Required' })}
                />
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 Your booking will be visible to nearby truck owners after submission. You'll be notified once accepted.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <>
                <h2 className="font-semibold text-gray-800 dark:text-dark-text mb-4">Review Booking</h2>
                {(() => {
                  const v = getValues();
                  return (
                    <div className="space-y-3 text-sm">
                      {[
                        ['Truck Type', TRUCK_TYPES.find(t => t.value === v.truckType)?.label],
                        ['Load Weight', `${v.loadWeight} Tonnes`],
                        ['Load', v.loadDescription || '—'],
                        ['From', `${v.pickup?.address}, ${v.pickup?.city}, ${v.pickup?.state}`],
                        ['To', `${v.drop?.address}, ${v.drop?.city}, ${v.drop?.state}`],
                        ['Pickup Time', v.scheduledPickup ? new Date(v.scheduledPickup).toLocaleString('en-IN') : '—'],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-border">
                          <span className="text-gray-500 dark:text-dark-muted">{label}</span>
                          <span className="font-medium text-gray-900 dark:text-dark-text text-right max-w-xs">{val}</span>
                        </div>
                      ))}
                      {v.isLivestockTransport === 'true' && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-300 text-xs">
                          🐄 Livestock transport: {v.livestockDetails?.animalType} × {v.livestockDetails?.quantity}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex justify-between gap-3">
            {step > 0 && (
              <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)}>
                ← Back
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button type="button" onClick={nextStep}>Next →</Button>
              ) : (
                <Button type="submit" loading={loading}>
                  🚛 Confirm Booking
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
