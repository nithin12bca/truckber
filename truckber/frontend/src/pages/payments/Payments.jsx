import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Card, StatusBadge, Loader, EmptyState } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/payments').then(r => {
      setPayments(r.data.data);
      setTotal(r.data.data.reduce((s, p) => s + (p.status === 'success' ? p.amount : 0), 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markPaid = async (paymentId) => {
    const txId = prompt('Enter Transaction ID:');
    if (!txId) return;
    try {
      const res = await api.put(`/payments/${paymentId}/pay`, { transactionId: txId, paymentMethod: 'upi' });
      setPayments(ps => ps.map(p => p._id === paymentId ? res.data.data : p));
      toast.success('Payment marked as received!');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Payments</h1>
        <p className="text-gray-500 text-sm mt-0.5">Total received: <strong className="text-green-600">₹{total.toLocaleString('en-IN')}</strong></p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: payments.length, icon: '📋' },
          { label: 'Received', value: payments.filter(p => p.status === 'success').length, icon: '✅' },
          { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, icon: '⏳' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-gray-100 dark:border-dark-border text-center shadow-card">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" description="Payments appear here after bookings are completed" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-border/30">
                <tr>
                  {['Booking', 'Amount', 'Method', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-dark-border/20">
                    <td className="px-4 py-3 font-medium text-primary-600">
                      {p.booking?.bookingNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-dark-text">
                      ₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{p.paymentMethod || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <button onClick={() => markPaid(p._id)}
                          className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors">
                          Mark Paid
                        </button>
                      )}
                      {p.status === 'success' && (
                        <button onClick={() => toast('Invoice download — coming soon')}
                          className="text-xs text-primary-600 hover:underline">
                          Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
