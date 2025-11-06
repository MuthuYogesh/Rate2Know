// server/scripts/test-connection.mjs
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

(async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 15000
    });

    try {
        const res = await pool.query('SELECT now() as now');
        console.log('Connected. Server time:', res.rows[0].now);
    } catch (err) {
        console.error('Connection test failed:', err && err.stack ? err.stack : err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
