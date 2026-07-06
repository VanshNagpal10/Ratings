import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { buildOrderBy } from '../utils/sort.js';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  firstError,
} from '../utils/validation.js';

const router = Router();

// Every route here requires an authenticated admin.
router.use(authenticate, authorize('admin'));

// GET /api/admin/dashboard  — Totals for the admin dashboard.
router.get('/dashboard', async (_req, res) => {
  const [[users], [stores], [ratings]] = await Promise.all([
    query('SELECT COUNT(*) AS count FROM users'),
    query('SELECT COUNT(*) AS count FROM stores'),
    query('SELECT COUNT(*) AS count FROM ratings'),
  ]);
  res.json({
    totalUsers: users.count,
    totalStores: stores.count,
    totalRatings: ratings.count,
  });
});

// POST /api/admin/users  — Add a normal user, admin, or store owner.
router.post('/users', async (req, res) => {
  const { name, email, address, password, role } = req.body || {};
  const validRole = ['admin', 'user', 'owner'].includes(role) ? role : 'user';

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
      [name.trim(), email, hash, address.trim(), validRole]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), email, address, role: validRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create user.' });
  }
});

// GET /api/admin/users  — List users with filters + sorting.
// Filters: name, email, address, role. Sort: name|email|address|role.
router.get('/users', async (req, res) => {
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;

  const where = [];
  const params = [];
  if (name)    { where.push('u.name LIKE ?');    params.push(`%${name}%`); }
  if (email)   { where.push('u.email LIKE ?');   params.push(`%${email}%`); }
  if (address) { where.push('u.address LIKE ?'); params.push(`%${address}%`); }
  if (role)    { where.push('u.role = ?');       params.push(role); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = buildOrderBy(
    sortBy,
    order,
    { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' },
    'name'
  );

  // For owners we also expose the average rating of the store(s) they own.
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            CASE WHEN u.role = 'owner'
                 THEN ROUND(AVG(r.rating), 2) ELSE NULL END AS rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereSql}
       GROUP BY u.id, u.name, u.email, u.address, u.role
       ${orderSql}`,
    params
  );
  res.json({ users: rows });
});

// GET /api/admin/users/:id  — Full detail for one user (incl. owner rating).
router.get('/users/:id', async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            CASE WHEN u.role = 'owner'
                 THEN ROUND(AVG(r.rating), 2) ELSE NULL END AS rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id, u.name, u.email, u.address, u.role`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: rows[0] });
});

// POST /api/admin/stores  — Add a new store, optionally linked to an owner.
router.post('/stores', async (req, res) => {
  const { name, email, address, ownerId } = req.body || {};

  const error = firstError([
    validateName(name),
    validateEmail(email),
    validateAddress(address),
  ]);
  if (error) return res.status(400).json({ error });

  try {
    let owner = null;
    if (ownerId) {
      const found = await query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (!found.length) return res.status(400).json({ error: 'Selected owner does not exist.' });
      if (found[0].role !== 'owner')
        return res.status(400).json({ error: 'Selected user is not a store owner.' });
      owner = found[0].id;
    }

    const result = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email, address.trim(), owner]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), email, address, ownerId: owner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create store.' });
  }
});

// GET /api/admin/stores  — List stores with filters + sorting + avg rating.
router.get('/stores', async (req, res) => {
  const { name, email, address, sortBy = 'name', order = 'asc' } = req.query;

  const where = [];
  const params = [];
  if (name)    { where.push('s.name LIKE ?');    params.push(`%${name}%`); }
  if (email)   { where.push('s.email LIKE ?');   params.push(`%${email}%`); }
  if (address) { where.push('s.address LIKE ?'); params.push(`%${address}%`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = buildOrderBy(
    sortBy,
    order,
    { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' },
    'name'
  );

  const rows = await query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 2) AS rating,
            COUNT(r.id) AS ratingCount,
            o.name AS ownerName
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       LEFT JOIN users o ON o.id = s.owner_id
       ${whereSql}
       GROUP BY s.id, s.name, s.email, s.address, o.name
       ${orderSql}`,
    params
  );
  res.json({ stores: rows });
});

// GET /api/admin/owners  — Owners available to attach to a store (for the form).
router.get('/owners', async (_req, res) => {
  const rows = await query(
    "SELECT id, name, email FROM users WHERE role = 'owner' ORDER BY name ASC"
  );
  res.json({ owners: rows });
});

export default router;
