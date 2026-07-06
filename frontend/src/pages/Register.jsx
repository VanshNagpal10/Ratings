import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiError } from '../api.js';
import { useAuth } from '../auth.jsx';
import { nameError, emailError, addressError, passwordError } from '../validation.js';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const next = {
      name: nameError(form.name),
      email: emailError(form.email),
      address: addressError(form.address),
      password: passwordError(form.password),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.post('/auth/register', form);
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
      <h1>Create your account</h1>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label>Name (20–60 characters)</label>
          <input name="name" value={form.name} onChange={update} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={update} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Address (max 400 characters)</label>
          <textarea name="address" value={form.address} onChange={update} />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </div>
        <div className="form-group">
          <label>Password (8–16 chars, 1 uppercase, 1 special)</label>
          <input name="password" type="password" value={form.password} onChange={update} />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
