import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile } from '../store/slices/authSlice';
import { Card, Button, Input } from '../components/common/UI';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [updating, setUpdating] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      'address.street': user?.address?.street || '',
      'address.city': user?.address?.city || '',
      'address.state': user?.address?.state || '',
      'address.pincode': user?.address?.pincode || '',
    },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();

  const onUpdateProfile = async (data) => {
    setUpdating(true);
    try {
      await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e || 'Update failed');
    }
    setUpdating(false);
  };

  const onChangePassword = async (data) => {
    setChangingPwd(true);
    try {
      await api.put('/auth/change-password', data);
      toast.success('Password changed!');
      resetPwd();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setChangingPwd(false);
  };

  const roleColors = {
    customer: 'from-blue-400 to-blue-600',
    truck_owner: 'from-green-400 to-green-600',
    driver: 'from-orange-400 to-orange-600',
    admin: 'from-purple-400 to-purple-600',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <Card>
        <div className="p-6 flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColors[user?.role] || 'from-primary-400 to-primary-600'} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${roleColors[user?.role]} text-white`}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit profile */}
      <Card title="Personal Information">
        <form onSubmit={handleSubmit(onUpdateProfile)} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Phone"
              type="tel"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone is required' })}
            />
          </div>
          <div className="pt-1">
            <p className="text-sm font-medium text-gray-700 dark:text-dark-text mb-3">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input label="Street" placeholder="House No, Street, Area"
                  {...register('address.street')}
                />
              </div>
              <Input label="City" {...register('address.city')} />
              <Input label="State" {...register('address.state')} />
              <Input label="Pincode" {...register('address.pincode')} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={updating}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card title="Change Password">
        <form onSubmit={handlePwd(onChangePassword)} className="p-5 space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={pwdErrors.currentPassword?.message}
            {...regPwd('currentPassword', { required: 'Required' })}
          />
          <Input
            label="New Password"
            type="password"
            error={pwdErrors.newPassword?.message}
            {...regPwd('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={changingPwd} variant="secondary">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Account info */}
      <Card title="Account Details">
        <div className="p-5 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Member Since', new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
            ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : 'N/A'],
            ['Email Verified', user?.isEmailVerified ? '✅ Yes' : '❌ No'],
            ['Account Status', user?.isActive ? '🟢 Active' : '🔴 Inactive'],
          ].map(([label, val]) => (
            <div key={label} className="p-3 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="font-medium text-gray-800 dark:text-dark-text">{val}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
