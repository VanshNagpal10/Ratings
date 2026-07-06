import { useEffect, useState } from 'react';
import api, { apiError } from '../api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(apiError(err)));
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Admin Dashboard</h1>
      {error && <div className="alert error">{error}</div>}
      {stats && (
        <div className="card">
          <div className="stat-grid">
            <div className="stat">
              <div className="value">{stats.totalUsers}</div>
              <div className="label">Total Users</div>
            </div>
            <div className="stat">
              <div className="value">{stats.totalStores}</div>
              <div className="label">Total Stores</div>
            </div>
            <div className="stat">
              <div className="value">{stats.totalRatings}</div>
              <div className="label">Total Ratings</div>
            </div>
          </div>
        </div>
      )}
      <p className="muted">
        Use the <strong>Users</strong> and <strong>Stores</strong> tabs to add records and browse
        listings with filters and sorting.
      </p>
    </div>
  );
}
