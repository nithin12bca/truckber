// Common UI components

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  };
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl p-5 shadow-card border border-gray-100 dark:border-dark-border">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colorMap[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{value}</p>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    driver_assigned: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    available: 'bg-green-100 text-green-700',
    on_trip: 'bg-orange-100 text-orange-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-600',
    approved: 'bg-green-100 text-green-700',
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  const labels = {
    driver_assigned: 'Driver Assigned',
    in_transit: 'In Transit',
    on_trip: 'On Trip',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status?.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm',
    secondary: 'bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text border border-gray-300 dark:border-dark-border',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">{label}</label>}
      <input
        className={`w-full px-3 py-2 rounded-lg border text-sm
          bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text
          border-gray-300 dark:border-dark-border
          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
          placeholder-gray-400 dark:placeholder-gray-500
          ${error ? 'border-red-400 focus:ring-red-400' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-lg border text-sm
          bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text
          border-gray-300 dark:border-dark-border
          focus:outline-none focus:ring-2 focus:ring-primary-400
          ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border shadow-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border">
          {title && <h3 className="font-semibold text-gray-800 dark:text-dark-text">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-dark-muted mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export function Loader({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex justify-center py-8">
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}
