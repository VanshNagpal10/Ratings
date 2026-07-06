import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiError } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already logged in? Bounce to home.
  if (user) navigate('/', { replace: true });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap card">
      <h1>Sign in</h1>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={update} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={update} required />
        </div>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
