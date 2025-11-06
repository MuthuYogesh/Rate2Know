// routes/users.mjs
import { Router } from 'express';
const router = Router();
import { query } from '../db.mjs';
import { body } from 'express-validator';
import handleValidation from '../middleware/validate.mjs';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.mjs';
import { verifyPassword, hashPassword } from '../auth.mjs';

// change password - self or admin
router.put('/:id/password',
    authenticateJWT,
    body('oldPassword').optional().isString(),
    body('newPassword').isString().matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/),
    handleValidation,
    async (req, res) => {
        const targetUserId = req.params.id;
        const requester = req.user;
        const { oldPassword, newPassword } = req.body;

        try {
            if (requester.id !== targetUserId && requester.role !== 'system_admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const r = await query('SELECT id, password_hash FROM users WHERE id=$1', [targetUserId]);
            if (!r.rows.length) return res.status(404).json({ error: 'User not found' });

            const user = r.rows[0];

            if (requester.role !== 'system_admin') {
                if (!oldPassword) return res.status(400).json({ error: 'Old password required' });
                const match = await verifyPassword(oldPassword, user.password_hash);
                if (!match) return res.status(400).json({ error: 'Old password incorrect' });
            }

            const newHash = await hashPassword(newPassword);
            await query('UPDATE users SET password_hash=$1 WHERE id=$2', [newHash, targetUserId]);
            res.json({ message: 'Password updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// get user detail
router.get('/:id', authenticateJWT, async (req, res) => {
    const target = req.params.id;
    const requester = req.user;
    try {
        if (requester.id !== target && requester.role !== 'system_admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const r = await query('SELECT id, name, email, address, role, created_at FROM users WHERE id=$1', [target]);
        if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
        const user = r.rows[0];

        if (user.role === 'store_owner') {
            const stores = await query(`
        SELECT s.id, s.name, s.address,
               COALESCE(avg_r.avg_rating,0)::numeric(10,2) AS avg_rating
        FROM stores s
        LEFT JOIN (SELECT store_id, AVG(rating) as avg_rating FROM ratings GROUP BY store_id) avg_r ON avg_r.store_id = s.id
        WHERE s.owner_id = $1
      `, [user.id]);
            user.stores = stores.rows;
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
