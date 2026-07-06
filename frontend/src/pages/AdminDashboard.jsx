import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiError } from '../api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
            {/* Clicking a stat jumps to its listing. */}
            <button className="stat stat-btn" onClick={() => navigate('/admin/users')}>
              <div className="value">{stats.totalUsers}</div>
              <div className="label">Total Users</div>
            </button>
            <button className="stat stat-btn" onClick={() => navigate('/admin/stores')}>
              <div className="value">{stats.totalStores}</div>
              <div className="label">Total Stores</div>
            </button>
            <div className="stat">
              <div className="value">{stats.totalRatings}</div>
              <div className="label">Total Ratings</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Manage the platform</h3>
        <p className="muted">Browse full listings with filters and sorting, or add new records.</p>
        <div className="button-row">
          <button onClick={() => navigate('/admin/users')}>View all users</button>
          <button onClick={() => navigate('/admin/stores')}>View all stores</button>
          <button className="secondary" onClick={() => navigate('/admin/users')}>+ Add user</button>
          <button className="secondary" onClick={() => navigate('/admin/stores')}>+ Add store</button>
        </div>
      </div>
    </div>
  );
}
