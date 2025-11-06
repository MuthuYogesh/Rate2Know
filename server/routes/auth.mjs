// routes/auth.mjs
import { Router } from 'express';
import { query } from '../db.mjs';
import { body } from 'express-validator';
import handleValidation from '../middleware/validate.mjs';
import { hashPassword, verifyPassword, signToken } from '../auth.mjs';

const router = Router();

// Password regex: 8-16 chars, at least one uppercase and one special char
const PWD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

// DB schema requires name length BETWEEN 20 AND 60
router.post('/signup',
    body('name').isString().isLength({ min: 10, max: 60 }),
    body('email').isEmail(),
    body('address').isString().isLength({ max: 400 }).optional({ nullable: true }),
    body('password').matches(PWD_REGEX),
    handleValidation,
    async (req, res) => {
        const { name, email, address, password } = req.body;
        try {
            // Check existing
            const exists = await query('SELECT id FROM users WHERE lower(email)=lower($1)', [email]);
            if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });

            const password_hash = await hashPassword(password);
            const r = await query(
                `INSERT INTO users (name, email, address, password_hash, role)
         VALUES ($1,$2,$3,$4,'normal_user') RETURNING id, name, email, role`,
                [name, email, address || '', password_hash]
            );
            return res.status(201).json({ user: r.rows[0] });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
);

router.post('/login',
    body('email').isEmail(),
    body('password').isString().notEmpty(),
    handleValidation,
    async (req, res) => {
        const { email, password } = req.body;
        try {
            const r = await query('SELECT id, name, email, password_hash, role FROM users WHERE lower(email)=lower($1)', [email]);
            if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
            const user = r.rows[0];
            const ok = await verifyPassword(password, user.password_hash);
            if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

            const token = signToken(user);
            return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
        }
    }
);

export default router;
