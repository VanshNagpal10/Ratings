import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../api.js';
import { useSort, Th } from '../components/SortableTable.jsx';
import { nameError, emailError, addressError } from '../validation.js';

const BLANK = { name: '', email: '', address: '', ownerId: '' };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sort = useSort(stores, 'name');

  const load = useCallback(async () => {
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/admin/stores', { params });
      setStores(res.data.stores);
    } catch (err) {
      setError(apiError(err));
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  // Load owners once for the "attach owner" dropdown.
  useEffect(() => {
    api.get('/admin/owners').then((res) => setOwners(res.data.owners)).catch(() => {});
  }, []);

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const next = {
      name: nameError(form.name),
      email: emailError(form.email),
      address: addressError(form.address),
    };
    setFieldErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function submitStore(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!validate()) return;
    try {
      const payload = { ...form, ownerId: form.ownerId || null };
      await api.post('/admin/stores', payload);
      setMessage(`Store "${form.name.trim()}" created.`);
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="container">
      <div className="row-between">
        <h1 className="page-title">Stores</h1>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add Store'}</button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Add a new store</h3>
          <form onSubmit={submitStore} noValidate>
            <div className="form-group">
              <label>Store name (20–60 characters)</label>
              <input name="name" value={form.name} onChange={updateForm} />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={updateForm} />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Address (max 400 characters)</label>
              <textarea name="address" value={form.address} onChange={updateForm} />
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>
            <div className="form-group">
              <label>Owner (optional — store owner account)</label>
              <select name="ownerId" value={form.ownerId} onChange={updateForm}>
                <option value="">No owner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>
            <button type="submit">Create store</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="filters">
          <input placeholder="Filter by name" value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder="Filter by email" value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          <input placeholder="Filter by address" value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        </div>

        <table>
          <thead>
            <tr>
              <Th label="Name" sortKey="name" state={sort} />
              <Th label="Email" sortKey="email" state={sort} />
              <Th label="Address" sortKey="address" state={sort} />
              <Th label="Owner" sortKey="ownerName" state={sort} />
              <Th label="Rating" sortKey="rating" state={sort} />
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>{s.ownerName || '—'}</td>
                <td>{s.rating ?? '—'} <span className="muted">({s.ratingCount})</span></td>
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
