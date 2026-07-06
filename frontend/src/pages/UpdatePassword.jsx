import { useState } from 'react';
import api, { apiError } from '../api.js';
import { passwordError } from '../validation.js';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [fieldError, setFieldError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const pwErr = passwordError(form.newPassword);
    setFieldError(pwErr);
    if (pwErr) return;
    setBusy(true);
    try {
      const res = await api.put('/auth/password', form);
      setMessage(res.data.message);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap card" style={{ margin: '1rem auto' }}>
        <h1>Change password</h1>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label>Current password</label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={update}
              required
            />
          </div>
          <div className="form-group">
            <label>New password (8–16 chars, 1 uppercase, 1 special)</label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={update}
              required
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>
          <button type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
}
