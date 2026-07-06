import { useEffect, useState, useCallback } from 'react';
import api, { apiError } from '../api.js';
import { useSort, Th } from '../components/SortableTable.jsx';
import { nameError, emailError, addressError, passwordError } from '../validation.js';

const BLANK = { name: '', email: '', address: '', password: '', role: 'user' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);

  const sort = useSort(users, 'name');

  const load = useCallback(async () => {
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users);
    } catch (err) {
      setError(apiError(err));
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const next = {
      name: nameError(form.name),
      email: emailError(form.email),
      address: addressError(form.address),
      password: passwordError(form.password),
    };
    setFieldErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function submitUser(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!validate()) return;
    try {
      await api.post('/admin/users', form);
      setMessage(`User "${form.name.trim()}" created.`);
      setForm(BLANK);
      setShowForm(false);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function viewDetail(id) {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setDetail(res.data.user);
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <div className="container">
      <div className="row-between">
        <h1 className="page-title">Users</h1>
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add User'}</button>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Add a new user</h3>
          <form onSubmit={submitUser} noValidate>
            <div className="form-group">
              <label>Name (20–60 characters)</label>
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
              <label>Password (8–16 chars, 1 uppercase, 1 special)</label>
              <input name="password" type="password" value={form.password} onChange={updateForm} />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={updateForm}>
                <option value="user">Normal User</option>
                <option value="admin">System Administrator</option>
                <option value="owner">Store Owner</option>
              </select>
            </div>
            <button type="submit">Create user</button>
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
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="user">Normal User</option>
            <option value="admin">System Administrator</option>
            <option value="owner">Store Owner</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <Th label="Name" sortKey="name" state={sort} />
              <Th label="Email" sortKey="email" state={sort} />
              <Th label="Address" sortKey="address" state={sort} />
              <Th label="Role" sortKey="role" state={sort} />
              <Th label="Rating" sortKey="rating" state={sort} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td><span className="tag">{u.role}</span></td>
                <td>{u.role === 'owner' ? (u.rating ?? '—') : '—'}</td>
                <td><button className="link" onClick={() => viewDetail(u.id)}>View</button></td>
              </tr>
            ))}
            {sort.sorted.length === 0 && (
              <tr><td colSpan="6" className="muted">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="card">
          <div className="row-between">
            <h3>User details</h3>
            <button className="secondary" onClick={() => setDetail(null)}>Close</button>
          </div>
          <p><strong>Name:</strong> {detail.name}</p>
          <p><strong>Email:</strong> {detail.email}</p>
          <p><strong>Address:</strong> {detail.address}</p>
          <p><strong>Role:</strong> {detail.role}</p>
          {detail.role === 'owner' && (
            <p><strong>Rating:</strong> {detail.rating ?? 'No ratings yet'}</p>
          )}
        </div>
      )}
    </div>
  );
}
