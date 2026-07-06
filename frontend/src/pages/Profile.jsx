import { useEffect, useState } from 'react';
import api, { apiError } from '../api.js';
import { useAuth } from '../auth.jsx';
import { nameError, emailError, addressError } from '../validation.js';

// Lets any logged-in user view and edit their own account details.
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load the full, current profile (the JWT only carries a subset).
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        const u = res.data.user;
        setForm({ name: u.name, email: u.email, address: u.address });
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoaded(true));
  }, []);

  function update(e) {
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

  async function onSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.put('/auth/profile', form);
      // Keep the navbar / session in sync with the new name & email.
      updateUser({ ...user, name: res.data.user.name, email: res.data.user.email });
      setMessage(res.data.message);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap card" style={{ margin: '1rem auto' }}>
        <h1>My Profile</h1>
        <p className="muted" style={{ marginTop: '-0.5rem' }}>
          Role: <span className="tag">{user?.role}</span>
        </p>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        {loaded && (
          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label>Name (20–60 characters)</label>
              <input name="name" value={form.name} onChange={update} />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={update} />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Address (max 400 characters)</label>
              <textarea name="address" value={form.address} onChange={update} />
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </div>
            <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
