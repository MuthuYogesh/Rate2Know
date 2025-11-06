// middleware/authMiddleware.mjs
import pkg from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { verify } = pkg;

export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization token' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        const payload = verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function authorizeRoles(...allowed) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}
