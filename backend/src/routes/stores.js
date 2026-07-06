import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { buildOrderBy } from '../utils/sort.js';
import { validateRating } from '../utils/validation.js';

const router = Router();

// GET /api/stores  — Normal user: list all stores with overall rating and the
// current user's own submitted rating. Supports search (name, address) + sort.
router.get('/', authenticate, authorize('user'), async (req, res) => {
  const { name, address, sortBy = 'name', order = 'asc' } = req.query;

  const where = [];
  const params = [req.user.id];
  if (name)    { where.push('s.name LIKE ?');    params.push(`%${name}%`); }
  if (address) { where.push('s.address LIKE ?'); params.push(`%${address}%`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = buildOrderBy(
    sortBy,
    order,
    { name: 's.name', address: 's.address', rating: 'overallRating' },
    'name'
  );

  const rows = await query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 2) AS overallRating,
            COUNT(r.id) AS ratingCount,
            ur.rating AS userRating
       FROM stores s
       LEFT JOIN ratings r  ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
       ${whereSql}
       GROUP BY s.id, s.name, s.address, ur.rating
       ${orderSql}`,
    params
  );
  res.json({ stores: rows });
});

// POST /api/stores/:id/rating  — Submit or modify the user's rating for a store.
router.post('/:id/rating', authenticate, authorize('user'), async (req, res) => {
  const storeId = Number(req.params.id);
  const { rating } = req.body || {};

  const ratingError = validateRating(rating);
  if (ratingError) return res.status(400).json({ error: ratingError });

  try {
    const store = await query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!store.length) return res.status(404).json({ error: 'Store not found.' });

    // Insert, or update the existing rating (one per user per store).
    await query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, storeId, Number(rating)]
    );
    res.json({ message: 'Rating saved.', rating: Number(rating) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save rating.' });
  }
});

export default router;
