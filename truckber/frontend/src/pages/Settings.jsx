import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../store/slices/uiSlice';
import { Card } from '../components/common/UI';

export default function Settings() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const SettingRow = ({ icon, title, description, control }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 dark:border-dark-border last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{title}</p>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Customize your TruckBer experience</p>
      </div>

      <Card title="Appearance">
        <div className="px-5">
          <SettingRow
            icon="🌙"
            title="Dark Mode"
            description="Switch between light and dark theme"
            control={<Toggle checked={darkMode} onChange={() => dispatch(toggleDarkMode())} />}
          />
        </div>
      </Card>

      <Card title="Notifications">
        <div className="px-5">
          <SettingRow icon="🔔" title="Booking Updates"
            description="Receive alerts when booking status changes"
            control={<Toggle checked={true} onChange={() => {}} />}
          />
          <SettingRow icon="📧" title="Email Notifications"
            description="Receive email alerts for important events"
            control={<Toggle checked={true} onChange={() => {}} />}
          />
          <SettingRow icon="📱" title="Push Notifications"
            description="Browser push notifications for real-time updates"
            control={<Toggle checked={false} onChange={() => {}} />}
          />
        </div>
      </Card>

      <Card title="Privacy & Security">
        <div className="px-5">
          <SettingRow icon="🔒" title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            control={<span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Coming Soon</span>}
          />
          <SettingRow icon="📍" title="Location Sharing"
            description="Allow TruckBer to access your location for better service"
            control={<Toggle checked={true} onChange={() => {}} />}
          />
        </div>
      </Card>

      <Card title="Account">
        <div className="px-5">
          <SettingRow icon="🌐" title="Language"
            description="Choose your preferred language"
            control={
              <select className="text-sm border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option>English</option>
                <option>தமிழ் (Tamil)</option>
                <option>हिंदी (Hindi)</option>
              </select>
            }
          />
          <SettingRow icon="💰" title="Currency"
            description="Display currency for costs and payments"
            control={
              <select className="text-sm border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text">
                <option>₹ INR</option>
                <option>$ USD</option>
              </select>
            }
          />
        </div>
      </Card>

      <Card title="About">
        <div className="p-5 text-sm text-gray-500 dark:text-dark-muted space-y-1">
          <p>🚛 <strong className="text-gray-700 dark:text-dark-text">TruckBer</strong> — Logistics & Fleet Management Platform</p>
          <p>Version 1.0.0 · Built with MERN Stack</p>
          <p>Role: <strong className="text-gray-700 dark:text-dark-text capitalize">{user?.role?.replace('_', ' ')}</strong></p>
          <p className="text-xs text-gray-400 mt-2">Final Year BCA Project · Open Source · 2024</p>
        </div>
      </Card>
    </div>
  );
}
