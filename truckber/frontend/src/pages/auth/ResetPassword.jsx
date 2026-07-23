import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { Input, Button } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, data);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset link expired or invalid');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password" type="password" placeholder="Min 6 characters"
            error={errors.password?.message}
            {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          <Button type="submit" className="w-full" loading={loading} size="lg">
            Reset Password
          </Button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
