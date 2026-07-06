import { useEffect, useState } from 'react';
import api, { apiError } from '../api.js';
import { useSort, Th } from '../components/SortableTable.jsx';

// Renders one store's rating summary and the users who rated it.
function StoreBlock({ store }) {
  const sort = useSort(store.raters, 'name');
  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ margin: 0 }}>{store.name}</h3>
        <div className="muted">{store.address}</div>
      </div>
      <p>
        <strong>Average rating: </strong>
        {store.averageRating ?? '—'}{' '}
        <span className="muted">({store.ratingCount} rating{store.ratingCount === 1 ? '' : 's'})</span>
      </p>
      <table>
        <thead>
          <tr>
            <Th label="User" sortKey="name" state={sort} />
            <Th label="Email" sortKey="email" state={sort} />
            <Th label="Rating" sortKey="rating" state={sort} />
          </tr>
        </thead>
        <tbody>
          {sort.sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.rating} ★</td>
            </tr>
          ))}
          {sort.sorted.length === 0 && (
            <tr><td colSpan="3" className="muted">No ratings submitted yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(apiError(err)));
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Store Owner Dashboard</h1>
      {error && <div className="alert error">{error}</div>}

      {data && (
        <>
          <div className="card">
            <div className="stat-grid">
              <div className="stat">
                <div className="value">{data.overallAverageRating ?? '—'}</div>
                <div className="label">Overall Average Rating</div>
              </div>
              <div className="stat">
                <div className="value">{data.overallRatingCount}</div>
                <div className="label">Total Ratings</div>
              </div>
              <div className="stat">
                <div className="value">{data.stores.length}</div>
                <div className="label">Your Stores</div>
              </div>
            </div>
          </div>

          {data.stores.length === 0 && (
            <p className="muted">No stores are linked to your account yet. Ask an administrator to attach one.</p>
          )}
          {data.stores.map((store) => (
            <StoreBlock key={store.id} store={store} />
          ))}
        </>
      )}
    </div>
  );
}
