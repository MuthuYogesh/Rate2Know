// auth.js
import { hash as _hash, compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { verify, sign } = pkg;

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(plain) {
    return _hash(plain, SALT_ROUNDS);
}
export async function verifyPassword(plain, hash) {
    return compare(plain, hash);
}
export function signToken(user) {
    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    return verify(token, JWT_SECRET);
}

export default { hashPassword, verifyPassword, signToken, verifyToken };
