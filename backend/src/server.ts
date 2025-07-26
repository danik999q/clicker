import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import db from './db';
import userRoutes from './routes/users';
import clanRoutes from './routes/clans';
import { GameState } from './types';

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://clicker-roan.vercel.app'],
    credentials: true
}));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'];
    if (userId && typeof userId === 'string') {
        (req as any).userId = userId;
    }
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/clans', clanRoutes);

app.get('/api/leaderboard', async (req: Request, res: Response) => {
    try {
        const result = await db.query<{ username: string, game_state: GameState }>("SELECT username, game_state FROM users");
        const users = result.rows;
        const leaderboardData = users
            .map(user => {
                if (!user.game_state) return null;
                return {
                    username: user.username || 'Anonymous',
                    prestigePoints: user.game_state.prestigePoints || 0,
                    totalViews: user.game_state.totalViews || 0
                };
            })
            .filter((user): user is { username: string; prestigePoints: number; totalViews: number } => user !== null);

        leaderboardData.sort((a, b) => {
            if (b.prestigePoints !== a.prestigePoints) {
                return b.prestigePoints - a.prestigePoints;
            }
            return b.totalViews - a.totalViews;
        });

        res.json(leaderboardData.slice(0, 10));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

const setupDatabase = async () => {
    const client = await db.getClient();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS clans (
                                                 id SERIAL PRIMARY KEY,
                                                 name VARCHAR(255) UNIQUE NOT NULL,
                leader_id TEXT NOT NULL,
                description TEXT DEFAULT '',
                avatar_url TEXT DEFAULT '',
                total_views NUMERIC DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                                                 telegram_id TEXT PRIMARY KEY,
                                                 username TEXT,
                                                 referrer_id TEXT,
                                                 game_state JSONB,
                                                 wallet_address TEXT,
                                                 last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                                 clan_id INTEGER REFERENCES clans(id) ON DELETE SET NULL,
                clan_role_id TEXT DEFAULT 'member'
                )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS raids (
                                                 id SERIAL PRIMARY KEY,
                                                 clan_id INTEGER NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
                boss_health NUMERIC NOT NULL,
                max_health NUMERIC NOT NULL,
                start_date TIMESTAMPTZ NOT NULL,
                end_date TIMESTAMPTZ NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
                )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS raid_participants (
                                                             raid_id INTEGER NOT NULL REFERENCES raids(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                damage_dealt NUMERIC DEFAULT 0,
                reward_claimed BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (raid_id, user_id)
                )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS clan_applications (
                                                             id SERIAL PRIMARY KEY,
                                                             clan_id INTEGER NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(clan_id, user_id)
                )
        `);
    } finally {
        client.release();
    }
};

const startServer = async () => {
    try {
        const client = await db.getClient();
        console.log('Successfully connected to the database.');
        client.release();

        await setupDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to the database or setup schema. Exiting.', err);
        process.exit(1);
    }
};

startServer();