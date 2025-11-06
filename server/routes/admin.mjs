// routes/admin.mjs
import { Router } from 'express';
import { body } from 'express-validator';
import handleValidation from '../middleware/validate.mjs';
import { hashPassword } from '../auth.mjs';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.mjs';
import { query } from '../db.mjs';

const router = Router();

/**
 * Admin endpoints (protected)
 */

// create user (admin)
router.post('/users',
    authenticateJWT, authorizeRoles('system_admin'),
    body('name').isString().isLength({ min: 20, max: 60 }),
    body('email').isEmail(),
    body('address').isString().isLength({ max: 400 }).optional({ nullable: true }),
    body('password').isString().matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/),
    body('role').isIn(['system_admin', 'normal_user', 'store_owner']),
    handleValidation,
    async (req, res) => {
        const { name, email, address, password, role } = req.body;
        try {
            const exists = await query('SELECT id FROM users WHERE lower(email)=lower($1)', [email]);
            if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });
            const password_hash = await hashPassword(password);
            const r = await query(
                `INSERT INTO users (name,email,address,password_hash,role)
         VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role,address`,
                [name, email, address || '', password_hash, role]
            );
            res.status(201).json({ user: r.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// create store
router.post('/stores',
    authenticateJWT, authorizeRoles('system_admin'),
    body('name').isString().notEmpty(),
    body('email').optional().isEmail(),
    body('address').optional().isString().isLength({ max: 400 }),
    body('owner_id').optional().isUUID(),
    handleValidation,
    async (req, res) => {
        const { name, email, address, owner_id } = req.body;
        try {
            if (owner_id) {
                const owner = await query('SELECT id, role FROM users WHERE id=$1', [owner_id]);
                if (!owner.rows.length) return res.status(400).json({ error: 'Owner not found' });
            }
            const r = await query(
                `INSERT INTO stores (name, email, address, owner_id) VALUES ($1,$2,$3,$4) RETURNING *`,
                [name, email || null, address || '', owner_id || null]
            );
            res.status(201).json({ store: r.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.get('/dashboard', authenticateJWT, authorizeRoles('system_admin'), async (req, res) => {
    try {
        const usersCount = await query('SELECT COUNT(*) FROM users');
        const storesCount = await query('SELECT COUNT(*) FROM stores');
        const ratingsCount = await query('SELECT COUNT(*) FROM ratings');
        res.json({
            users: parseInt(usersCount.rows[0].count, 10),
            stores: parseInt(storesCount.rows[0].count, 10),
            ratings: parseInt(ratingsCount.rows[0].count, 10)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// list users
const ALLOWED_USER_SORT = { name: 'name', email: 'email', address: 'address', role: 'role', created_at: 'created_at' };

router.get('/users', authenticateJWT, authorizeRoles('system_admin'), async (req, res) => {
    try {
        const { name, email, address, role, sort = 'name', order = 'asc', page = 1, size = 50 } = req.query;
        const sortCol = ALLOWED_USER_SORT[sort] || 'name';
        const sortOrd = (order && order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
        const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(size, 10);
        const params = [];
        let where = 'WHERE 1=1';
        if (name) { params.push(`%${name.toLowerCase()}%`); where += ` AND lower(name) LIKE $${params.length}`; }
        if (email) { params.push(`%${email.toLowerCase()}%`); where += ` AND lower(email) LIKE $${params.length}`; }
        if (address) { params.push(`%${address.toLowerCase()}%`); where += ` AND lower(address) LIKE $${params.length}`; }
        if (role) { params.push(role); where += ` AND role = $${params.length}`; }

        const q = `SELECT id, name, email, address, role, created_at FROM users ${where} ORDER BY ${sortCol} ${sortOrd} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(size, 10) || 50, offset);
        const r = await query(q, params);
        res.json({ users: r.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
