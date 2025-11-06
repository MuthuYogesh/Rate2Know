// server.js
import dotenv from 'dotenv'
import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.mjs';
import adminRoutes from './routes/admin.mjs';
import storesRoutes from './routes/stores.mjs';
import usersRoutes from './routes/users.mjs';

dotenv.config();

const app = express();
app.use(helmet());
app.use(json());
app.use(cookieParser());
app.use(cors({
    origin: '*', //process.env.CORS_ORIGIN || 'http://localhost:3000'
    // credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
