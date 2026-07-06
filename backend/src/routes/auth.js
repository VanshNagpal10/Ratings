import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authenticate, signToken } from '../middleware/auth.js';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  firstError,
} from '../utils/validation.js';

const router = Router();

// POST /api/auth/register  — Normal user self sign-up.
router.post('/register', async (req, res) => {
  const { name, email, address, password } = req.body || {};

  const error = firstError([
    validateName(name),
    validateEmail(email),
    validateAddress(address),
    validatePassword(password),
  ]);
  if (error) return res.status(400).json({ error });

  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email is already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email, hash, address.trim(), 'user']
    );
    const user = { id: result.insertId, name: name.trim(), email, role: 'user' };
    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /api/auth/login  — Single login for all roles.
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    const found = rows[0];
    if (!found) return res.status(401).json({ error: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, found.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });

    const user = { id: found.id, name: found.name, email: found.email, role: found.role };
    return res.json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me  — Current user profile.
router.get('/me', authenticate, async (req, res) => {
  const rows = await query(
    'SELECT id, name, email, address, role FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: rows[0] });
});

// PUT /api/auth/password  — Any logged-in user updates their password.
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword) return res.status(400).json({ error: 'Current password is required.' });

  const pwError = validatePassword(newPassword);
  if (pwError) return res.status(400).json({ error: pwError });

  try {
    const rows = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });

    const ok = await bcrypt.compare(currentPassword, rows[0].password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not update password.' });
  }
});

export default router;
