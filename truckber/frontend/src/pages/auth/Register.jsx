import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser, clearError } from '../../store/slices/authSlice';
import { Input, Button, Select } from '../../components/common/UI';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { role: searchParams.get('role') || 'customer' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🚛</span>
              <span className="font-bold text-2xl text-primary-600">TruckBer</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join TruckBer today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian mobile number' },
              })}
            />
            <Select
              label="Register as"
              error={errors.role?.message}
              {...register('role', { required: 'Role is required' })}
            >
              <option value="customer">Customer — Book Trucks</option>
              <option value="truck_owner">Truck Owner — Register Fleet</option>
              <option value="driver">Driver — Take Trips</option>
            </Select>
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              error={errors.password?.message}
              {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
