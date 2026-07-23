import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { Input, Button } from '../../components/common/UI';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      // Always show success for security
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🚛</span>
            <span className="font-bold text-2xl text-primary-600">TruckBer</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your email to reset your password</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Check your email!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              We've sent a password reset link if that email is registered with TruckBer.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-primary-600 hover:underline text-sm font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the email address associated with your account.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            <Button type="submit" className="w-full" loading={loading} size="lg">
              Send Reset Link
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
