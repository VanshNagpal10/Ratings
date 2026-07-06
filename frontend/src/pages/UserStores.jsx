import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../api.js';
import { useSort, Th } from '../components/SortableTable.jsx';
import StarRating from '../components/StarRating.jsx';
import Toast from '../components/Toast.jsx';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  // Pending (not-yet-submitted) star selection per store id.
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const sort = useSort(stores, 'name');

  const load = useCallback(async () => {
    setError('');
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;
      const res = await api.get('/stores', { params });
      setStores(res.data.stores);
      // Seed drafts from each store's current submitted rating.
      const seeded = {};
      res.data.stores.forEach((s) => { seeded[s.id] = s.userRating || 0; });
      setDrafts(seeded);
    } catch (err) {
      setError(apiError(err));
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  function setDraft(storeId, value) {
    setDrafts((d) => ({ ...d, [storeId]: value }));
  }

  async function submitRating(store) {
    const rating = drafts[store.id];
    if (!rating) return;
    setError('');
    setSavingId(store.id);
    try {
      await api.post(`/stores/${store.id}/rating`, { rating });
      const wasRated = Boolean(store.userRating);
      setToast(
        `${wasRated ? 'Rating updated' : 'Rating submitted'} for "${store.name}" — ${rating} ★`
      );
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Stores</h1>
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
            {sort.sorted.map((s) => {
              const draft = drafts[s.id] || 0;
              // Enable submit only when a star is picked and it differs from what's saved.
              const changed = draft > 0 && draft !== (s.userRating || 0);
              return (
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
                    <div className="rate-cell">
                      <StarRating value={draft} onRate={(n) => setDraft(s.id, n)} />
                      <button
                        onClick={() => submitRating(s)}
                        disabled={!changed || savingId === s.id}
                      >
                        {savingId === s.id
                          ? 'Saving…'
                          : s.userRating ? 'Update' : 'Submit'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sort.sorted.length === 0 && (
              <tr><td colSpan="5" className="muted">No stores found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
