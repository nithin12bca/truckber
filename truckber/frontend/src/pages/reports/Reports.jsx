import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../utils/api';
import { Card, Button, Input, Select } from '../../components/common/UI';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { period: '30' },
  });

  const fetchAnalytics = async (data) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics', { params: data });
      setAnalytics(res.data.data);
    } catch (e) {
      toast.error('Failed to load analytics');
    }
    setLoading(false);
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate business insights</p>
      </div>

      <Card title="Generate Report">
        <form onSubmit={handleSubmit(fetchAnalytics)} className="p-4 flex flex-wrap gap-3 items-end">
          <Select label="Period" className="w-40" {...register('period')}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </Select>
          <Button type="submit" loading={loading}>Generate</Button>
          <Button type="button" variant="secondary"
            onClick={() => toast('Excel export coming soon — install xlsx library')}>
            📥 Export Excel
          </Button>
          <Button type="button" variant="secondary"
            onClick={() => toast('PDF export coming soon')}>
            📄 Export PDF
          </Button>
        </form>
      </Card>

      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Revenue by Day">
              <div className="p-4">
                <Line data={{
                  labels: analytics.revenueByPeriod?.map(r => r._id) || [],
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: analytics.revenueByPeriod?.map(r => r.revenue) || [],
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249,115,22,0.1)',
                    fill: true, tension: 0.4,
                  }],
                }} options={chartOpts} />
              </div>
            </Card>
            <Card title="Bookings by Status">
              <div className="p-4">
                <Bar data={{
                  labels: analytics.bookingsByStatus?.map(b => b._id?.replace(/_/g, ' ')) || [],
                  datasets: [{
                    label: 'Bookings',
                    data: analytics.bookingsByStatus?.map(b => b.count) || [],
                    backgroundColor: ['#fbbf24','#3b82f6','#6366f1','#f97316','#22c55e','#ef4444'],
                    borderRadius: 6,
                  }],
                }} options={chartOpts} />
              </div>
            </Card>
          </div>

          {/* Driver Performance */}
          {analytics.driverPerformance?.length > 0 && (
            <Card title="Top Driver Performance">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-border/30">
                    <tr>
                      {['Driver', 'Total Trips', 'Distance (km)', 'Rating', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                    {analytics.driverPerformance.map((d, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-dark-text">{d.name}</td>
                        <td className="px-4 py-3">{d.totalTrips}</td>
                        <td className="px-4 py-3">{d.totalDistance}</td>
                        <td className="px-4 py-3">⭐ {d.rating?.toFixed(1) || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            d.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{d.verificationStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Fleet Utilization */}
          {analytics.fleetUtilization?.length > 0 && (
            <Card title="Fleet Utilization">
              <div className="p-4 flex flex-wrap gap-4">
                {analytics.fleetUtilization.map(f => (
                  <div key={f._id} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                    <span className="text-lg">{f._id === 'available' ? '🟢' : f._id === 'on_trip' ? '🔄' : '🔧'}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-dark-text capitalize">{f._id?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{f.count} trucks</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!analytics && !loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-medium">Select a period and click Generate to view reports</p>
        </div>
      )}
    </div>
  );
}
