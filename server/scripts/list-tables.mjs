// scripts/list-tables.mjs
import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
(async () => {
    const r = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log(r.rows);
    await pool.end();
})();
