import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🚛</div>
        <h1 className="text-6xl font-extrabold text-primary-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Wrong Route!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Looks like this truck took a wrong turn. The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Back to Home
          </Link>
          <Link to="/dashboard" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
