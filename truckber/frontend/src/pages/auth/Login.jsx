import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Input, Button } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear stale errors on unmount
  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name?.split(' ')[0]}! 🚛`);
    }
  };

  // One-click demo fill
  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  const demos = [
    { role: 'Admin',       email: 'admin@truckber.com',    password: 'admin123', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
    { role: 'Customer',    email: 'customer@truckber.com', password: 'pass123',  bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         text: 'text-blue-700 dark:text-blue-300' },
    { role: 'Truck Owner', email: 'owner@truckber.com',    password: 'pass123',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',     text: 'text-green-700 dark:text-green-300' },
    { role: 'Driver',      email: 'driver@truckber.com',   password: 'pass123',  bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl">🚛</span>
              <span className="font-bold text-2xl text-primary-600">TruckBer</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Create one →
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Demo accounts — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demos.map(({ role, email, password, bg, text }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all hover:shadow-sm ${bg}`}
                >
                  <p className={`font-bold ${text}`}>{role}</p>
                  <p className="text-gray-500 dark:text-gray-400 truncate mt-0.5">{email}</p>
                  <p className="text-gray-400 dark:text-gray-500">{password}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
