import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const features = [
  { icon: '🚛', title: 'Instant Truck Booking', desc: 'Book any truck type in minutes. Mini trucks to heavy trailers — all available on demand.' },
  { icon: '📍', title: 'Live GPS Tracking', desc: 'Track your shipment in real time on an interactive map. Know exactly where your cargo is.' },
  { icon: '📄', title: 'Auto Invoice Generation', desc: 'Professional PDF invoices generated automatically on delivery. Download anytime.' },
  { icon: '🐄', title: 'Livestock Transport', desc: 'Specialized transport for animals with health records, feed tracking, and farm-to-market delivery.' },
  { icon: '📊', title: 'Fleet Analytics', desc: 'Powerful dashboards for truck owners to monitor revenue, utilization, and driver performance.' },
  { icon: '🔒', title: 'Secure & Verified', desc: 'All drivers are verified with license and Aadhaar. Your cargo is in safe hands.' },
];

const steps = [
  { step: '01', title: 'Create Booking', desc: 'Enter pickup, drop, truck type, and cargo details.' },
  { step: '02', title: 'Get Matched', desc: 'Available truck owners see your request and accept instantly.' },
  { step: '03', title: 'Track Live', desc: 'Follow your shipment on the map from start to finish.' },
  { step: '04', title: 'Pay & Rate', desc: 'Pay on delivery and rate your experience.' },
];

export default function Landing() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <span className="font-bold text-xl text-primary-600">TruckBer</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2">Login</Link>
                <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <span className="inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            India's Logistics Platform
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Book a Truck.<br />
            <span className="text-primary-500">Track it Live.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
            TruckBer connects customers, truck owners, and drivers on one platform. From city deliveries to farm-to-market livestock transport.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:scale-105">
              Start Booking Free →
            </Link>
            <Link to="/register?role=truck_owner" className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Register Your Fleet
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[['500+', 'Trucks'], ['2000+', 'Deliveries'], ['98%', 'On Time']].map(([val, lab]) => (
              <div key={lab}>
                <p className="text-3xl font-extrabold text-primary-600">{val}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{lab}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Everything you need</h2>
            <p className="text-gray-500 dark:text-gray-400">One platform for customers, fleet owners, and drivers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all group">
                <span className="text-3xl mb-4 block">{icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How TruckBer works</h2>
            <p className="text-gray-500 dark:text-gray-400">Simple, fast, and transparent logistics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, i) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] right-[-50%] h-0.5 bg-primary-200 dark:bg-primary-800" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles CTA */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Join as</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'customer', icon: '🛒', title: 'Customer', points: ['Book trucks instantly', 'Live shipment tracking', 'Auto invoices & history', 'Rate your driver'], cta: 'Book a Truck' },
              { role: 'truck_owner', icon: '🚛', title: 'Truck Owner', points: ['Register your fleet', 'Accept bookings', 'Manage drivers', 'Track earnings & analytics'], cta: 'Add Your Fleet' },
              { role: 'driver', icon: '👤', title: 'Driver', points: ['View assigned trips', 'Share live location', 'Upload proof of delivery', 'Get ratings'], cta: 'Join as Driver' },
            ].map(({ role, icon, title, points, cta }) => (
              <div key={role} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all">
                <span className="text-4xl mb-4 block">{icon}</span>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{title}</h3>
                <ul className="space-y-1.5 mb-6">
                  {points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-primary-500 font-bold">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <Link to={`/register?role=${role}`} className="block text-center bg-primary-50 hover:bg-primary-500 text-primary-700 hover:text-white border border-primary-200 hover:border-transparent px-4 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  {cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🚛</span>
          <span className="font-bold text-white text-lg">TruckBer</span>
        </div>
        <p>© {new Date().getFullYear()} TruckBer. Built for India's logistics future.</p>
        <p className="mt-1 text-xs text-gray-600">Final Year BCA Project · MERN Stack · Open for Startup</p>
      </footer>
    </div>
  );
}
