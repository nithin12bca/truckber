import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Card, StatusBadge, Button, Loader } from '../../components/common/UI';
import toast from 'react-hot-toast';

const ROLES = ['', 'customer', 'truck_owner', 'driver', 'admin'];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = { page, limit: 15 };
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    api.get('/admin/users', { params }).then(r => {
      setUsers(r.data.data);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, roleFilter, search]);

  const toggleStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(us => us.map(u => u._id === userId ? res.data.data : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const roleColor = {
    customer: 'bg-blue-100 text-blue-700', truck_owner: 'bg-green-100 text-green-700',
    driver: 'bg-orange-100 text-orange-700', admin: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage all platform users</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Search by name, email, phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <div className="flex gap-2">
            {ROLES.map(r => (
              <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  roleFilter === r ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-200'
                }`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? <Loader /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-border/30">
                <tr>
                  {['User', 'Role', 'Phone', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-dark-text">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-dark-muted">{u.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(u._id)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination?.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500">{pagination.total} users · Page {page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</Button>
                <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages}>Next →</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
