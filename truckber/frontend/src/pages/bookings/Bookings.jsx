import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { StatusBadge, Button, Loader, EmptyState, Card } from '../../components/common/UI';

const STATUSES = ['', 'pending', 'accepted', 'driver_assigned', 'in_transit', 'delivered', 'cancelled'];

export default function Bookings() {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((s) => s.bookings);
  const { user } = useSelector((s) => s.auth);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBookings({ status: status || undefined, page }));
  }, [status, page, dispatch]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination?.total || 0} total bookings</p>
        </div>
        {user?.role === 'customer' && (
          <Link to="/bookings/new">
            <Button>+ New Booking</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border/80'
            }`}
          >
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : list.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No bookings found"
          description={status ? `No ${status.replace(/_/g, ' ')} bookings` : 'You have no bookings yet'}
          action={user?.role === 'customer' && <Link to="/bookings/new"><Button>Create First Booking</Button></Link>}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-border/30">
                <tr>
                  {['Booking #', 'Route', 'Truck Type', 'Weight', 'Date', 'Cost', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-dark-muted uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {list.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-600">{b.bookingNumber}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-dark-text whitespace-nowrap">
                      <span className="font-medium">{b.pickup?.city}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span className="font-medium">{b.drop?.city}</span>
                      {b.distance && <span className="text-xs text-gray-400 ml-1">({b.distance}km)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-dark-muted capitalize">{b.truckType?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-dark-muted">{b.loadWeight}T</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-dark-muted whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text font-medium">
                      {b.finalCost || b.estimatedCost ? `₹${(b.finalCost || b.estimatedCost).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/bookings/${b._id}`} className="text-xs text-primary-600 hover:underline whitespace-nowrap">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500">Page {page} of {pagination.pages}</p>
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
