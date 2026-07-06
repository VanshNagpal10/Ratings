import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Every route here requires an authenticated store owner.
router.use(authenticate, authorize('owner'));

router.get('/dashboard', async (req, res) => {
  const stores = await query(
    `SELECT s.id, s.name, s.address, s.email,
            ROUND(AVG(r.rating), 2) AS averageRating,
            COUNT(r.id) AS ratingCount
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id, s.name, s.address, s.email
      ORDER BY s.name ASC`,
    [req.user.id]
  );


  for (const store of stores) {
    store.raters = await query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at AS ratedAt
         FROM ratings r
         JOIN users u ON u.id = r.user_id
        WHERE r.store_id = ?
        ORDER BY r.updated_at DESC`,
      [store.id]
    );
  }

  const [overall] = await query(
    `SELECT ROUND(AVG(r.rating), 2) AS averageRating, COUNT(r.id) AS ratingCount
       FROM ratings r
       JOIN stores s ON s.id = r.store_id
      WHERE s.owner_id = ?`,
    [req.user.id]
  );

  res.json({
    stores,
    overallAverageRating: overall.averageRating,
    overallRatingCount: overall.ratingCount,
  });
});

export default router;
