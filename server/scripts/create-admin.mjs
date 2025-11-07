// scripts/create-admin.mjs
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

// usage:
// ADMIN_NAME="System Administrator" ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD="randompass" node scripts/create-admin.mjs
const {
    ADMIN_NAME = 'System Administrator',
    ADMIN_EMAIL,
    ADMIN_PASSWORD
} = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    console.error('Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD="S3cure!Pass" node scripts/create-admin.mjs');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
    try {
        // Check for email already exists
        const exists = await pool.query('SELECT id, role FROM users WHERE lower(email) = lower($1)', [ADMIN_EMAIL]);
        if (exists.rows.length) {
            const row = exists.rows[0];
            if (row.role === 'system_admin') {
                console.log('An admin with that email already exists (id:', row.id, '). Exiting.');
                process.exit(0);
            } else {
                console.log('User exists with that email but not an admin. Promoting to system_admin...');
                await pool.query('UPDATE users SET role=$1, updated_at = now() WHERE id=$2', ['system_admin', row.id]);
                console.log('Promoted user id', row.id, 'to system_admin.');
                process.exit(0);
            }
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        const password_hash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

        // Insert admin
        const insert = `
      INSERT INTO users (id, name, email, address, password_hash, role)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'system_admin')
      RETURNING id, name, email, role, created_at;
    `;
        const nameForInsert = ADMIN_NAME.length >= 3 ? ADMIN_NAME : `${ADMIN_NAME} Admin`; // satisfy name constraint
        const res = await pool.query(insert, [nameForInsert, ADMIN_EMAIL, '', password_hash]);
        console.log('Created admin:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err && err.stack ? err.stack : err);
        process.exit(1);
    } finally {
        await pool.end();
    }
})();
