// routes/stores.mjs
import { Router } from 'express';
const router = Router();
import { query } from '../db.mjs';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.mjs';
import { body } from 'express-validator';
import handleValidation from '../middleware/validate.mjs';

// list stores for any authenticated user
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const { qName = '', qAddress = '', sort = 'name', order = 'asc', page = 1, size = 50 } = req.query;
        const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(size, 10);
        const ALLOWED = { name: 's.name', address: 's.address', rating: 'avg_r.avg_rating' };
        const sortCol = ALLOWED[sort] || 's.name';
        const sortOrd = (order && order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';

        const q = `
      SELECT s.id, s.name, s.address, s.email,
             COALESCE(avg_r.avg_rating,0)::numeric(10,2) AS overall_rating,
             ur.user_rating
      FROM stores s
      LEFT JOIN (
        SELECT store_id, AVG(rating) as avg_rating FROM ratings GROUP BY store_id
      ) avg_r ON avg_r.store_id = s.id
      LEFT JOIN (
        SELECT store_id, rating as user_rating, user_id FROM ratings WHERE user_id = $1
      ) ur ON ur.store_id = s.id
      WHERE lower(s.name) LIKE $2 AND lower(s.address) LIKE $3
      ORDER BY ${sortCol} ${sortOrd}
      LIMIT $4 OFFSET $5
    `;
        const nameLike = `%${qName.toLowerCase()}%`;
        const addressLike = `%${qAddress.toLowerCase()}%`;
        const r = await query(q, [userId, nameLike, addressLike, parseInt(size, 10) || 50, offset]);
        res.json({ stores: r.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', authenticateJWT, async (req, res) => {
    const storeId = req.params.id;
    try {
        const storeQ = `SELECT s.*, COALESCE(avg_r.avg_rating,0)::numeric(10,2) AS overall_rating
      FROM stores s
      LEFT JOIN (SELECT store_id, AVG(rating) as avg_rating FROM ratings GROUP BY store_id) avg_r ON avg_r.store_id = s.id
      WHERE s.id = $1`;
        const storeRes = await query(storeQ, [storeId]);
        if (!storeRes.rows.length) return res.status(404).json({ error: 'Store not found' });
        const store = storeRes.rows[0];
        res.json({ store });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// rating upsert
router.post('/:id/rating',
    authenticateJWT,
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString(),
    handleValidation,
    async (req, res) => {
        const storeId = req.params.id;
        const userId = req.user.id;
        const { rating, comment } = req.body;
        try {
            const s = await query('SELECT id FROM stores WHERE id=$1', [storeId]);
            if (!s.rows.length) return res.status(404).json({ error: 'Store not found' });

            const upsert = `
        INSERT INTO ratings (user_id, store_id, rating, comment)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (user_id, store_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = now()
        RETURNING *;
      `;
            const r = await query(upsert, [userId, storeId, rating, comment || null]);

            const avgRes = await query('SELECT AVG(rating)::numeric(10,2) as avg_rating FROM ratings WHERE store_id=$1', [storeId]);
            const avg = avgRes.rows[0].avg_rating;
            res.json({ rating: r.rows[0], avgRating: avg });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.delete('/:id/rating', authenticateJWT, async (req, res) => {
    const storeId = req.params.id;
    const userId = req.user.id;
    try {
        await query('DELETE FROM ratings WHERE user_id=$1 AND store_id=$2', [userId, storeId]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
