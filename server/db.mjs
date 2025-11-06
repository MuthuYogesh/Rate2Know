// server/db.mjs
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL === 'true';

const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.PG_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000
});

pool.on('error', (err) => {
    console.error('Unexpected pg pool error', err);
});

async function runMigrationsIfAny() {
    try {
        const migrationsPath = new URL('./migrations/001_create_extensions_and_tables.sql', import.meta.url);
        const sql = await fs.readFile(migrationsPath, { encoding: 'utf8' });
        if (!sql || !sql.trim()) {
            console.log('No migration SQL found at', migrationsPath.href);
            return;
        }
        console.log('Running migrations from', migrationsPath.href);
        await pool.query(sql);
        console.log('Migrations applied (if any).');
    } catch (err) {
        console.error('Error while running migrations:', err && err.stack ? err.stack : err);
    }
}

export async function query(text, params) {
    try {
        return await pool.query(text, params);
    } catch (err) {
        console.error('DB query error:', err && err.stack ? err.stack : err);
        throw err;
    }
}

await runMigrationsIfAny();

export default { query, pool };
