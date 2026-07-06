import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../api.js';
import { useSort, Th } from '../components/SortableTable.jsx';
import StarRating from '../components/StarRating.jsx';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sort = useSort(stores, 'name');

  const load = useCallback(async () => {
    setError('');
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await api.get('/stores', { params });
      setStores(res.data.stores);
    } catch (err) {
      setError(apiError(err));
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function submitRating(storeId, rating) {
    setMessage('');
    setError('');
    try {
      await api.post(`/stores/${storeId}/rating`, { rating });
      setMessage('Your rating was saved.');
      load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Stores</h1>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="filters">
          <input placeholder="Search by name" value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })} />
          <input placeholder="Search by address" value={search.address}
            onChange={(e) => setSearch({ ...search, address: e.target.value })} />
        </div>

        <table>
          <thead>
            <tr>
              <Th label="Store Name" sortKey="name" state={sort} />
              <Th label="Address" sortKey="address" state={sort} />
              <Th label="Overall Rating" sortKey="overallRating" state={sort} />
              <Th label="Your Rating" sortKey="userRating" state={sort} />
              <th>Submit / Modify</th>
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>
                  {s.overallRating ?? '—'}{' '}
                  <span className="muted">({s.ratingCount})</span>
                </td>
                <td>
                  {s.userRating
                    ? <span className="tag">{s.userRating} ★</span>
                    : <span className="muted">Not rated</span>}
                </td>
                <td>
                  <StarRating
                    value={s.userRating || 0}
                    onRate={(n) => submitRating(s.id, n)}
                  />
                </td>
              </tr>
            ))}
            {sort.sorted.length === 0 && (
              <tr><td colSpan="5" className="muted">No stores found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
