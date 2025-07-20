require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
};

if (isProduction) {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

async function setupDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                telegram_id TEXT PRIMARY KEY,
                username TEXT,
                referrer_id TEXT,
                game_state JSONB,
                wallet_address TEXT
            )
        `);
        console.log('Connected to the game database (PostgreSQL).');
    } finally {
        client.release();
    }
}

async function main() {
    await setupDatabase();
    const app = express();
    const PORT = 3001;

    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'https://clicker-roan.vercel.app'],
        credentials: true
    }));
    app.use(express.json());

    app.get('/api/leaderboard', async (req, res) => {
        try {
            const result = await pool.query("SELECT username, game_state FROM users");
            const users = result.rows;
            const leaderboardData = users.map(user => {
                try {
                    if (!user.game_state) return null;
                    const state = user.game_state; // game_state уже является JSONB
                    return {
                        username: user.username || 'Anonymous',
                        prestigePoints: state.prestigePoints || 0,
                        totalViews: state.totalViews || 0
                    };
                } catch (e) { return null; }
            }).filter(user => user !== null);
            leaderboardData.sort((a, b) => {
                if (b.prestigePoints !== a.prestigePoints) { return b.prestigePoints - a.prestigePoints; }
                return b.totalViews - a.totalViews;
            });
            res.json(leaderboardData.slice(0, 10));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/register', async (req, res) => {
        const { telegram_id, username, referrer_id } = req.body;
        if (!telegram_id) {
            return res.status(400).json({ error: 'telegram_id is required' });
        }
        try {
            const initialGameState = {};
            await pool.query(
                `INSERT INTO users (telegram_id, username, referrer_id, game_state) VALUES ($1, $2, $3, $4) ON CONFLICT (telegram_id) DO NOTHING`,
                [telegram_id, username, referrer_id, initialGameState]
            );
            console.log(`[LOG] User registered or already exists: ${telegram_id}.`);
            if (referrer_id && referrer_id !== telegram_id) {
                const referrerResult = await pool.query(`SELECT * FROM users WHERE telegram_id = $1`, [referrer_id]);
                const referrerRow = referrerResult.rows[0];
                if (referrerRow?.game_state) {
                    let referrerState = referrerRow.game_state;
                    if (!referrerState.referralSystem) { referrerState.referralSystem = { userId: referrer_id, referredCount: 0, earnings: 0, }; }
                    referrerState.referralSystem.referredCount = (referrerState.referralSystem.referredCount || 0) + 1;
                    const prestigeMultiplier = 1 + ((referrerState.prestigePoints || 0) * 0.02);
                    const passiveMultiplier = 1 + (referrerState.rewardBonuses?.passiveMultiplier || 0);
                    let baseVps = referrerState.memes?.reduce((total, meme) => (meme.isUnlocked ? total + meme.passiveViews * meme.level : total), 0) || 0;
                    const totalVps = baseVps * passiveMultiplier * prestigeMultiplier;
                    const reward = totalVps * 3600;
                    referrerState.referralSystem.earnings = (referrerState.referralSystem.earnings || 0) + reward;
                    referrerState.totalViews = (referrerState.totalViews || 0) + reward;
                    await pool.query(`UPDATE users SET game_state = $1 WHERE telegram_id = $2`, [referrerState, referrer_id]);
                    console.log(`[LOG] Referrer ${referrer_id} was rewarded for inviting ${telegram_id}.`);
                }
            }
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            console.error("Database error on register:", err.message);
            return res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/users/:telegram_id/state', async (req, res) => {
        const { telegram_id } = req.params;
        try {
            const result = await pool.query("SELECT game_state, wallet_address FROM users WHERE telegram_id = $1", [telegram_id]);
            const row = result.rows[0];
            if (row) {
                let gameState = row.game_state || {};
                gameState.walletAddress = row.wallet_address;
                gameState.isWalletConnected = !!row.wallet_address;
                res.json(gameState);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/users/:telegram_id/state', async (req, res) => {
        const { telegram_id } = req.params;
        const { gameState: clientState } = req.body;
        if (!clientState) {
            return res.status(400).json({ error: 'gameState is required' });
        }
        try {
            const existingResult = await pool.query("SELECT game_state FROM users WHERE telegram_id = $1", [telegram_id]);
            const existingRow = existingResult.rows[0];
            let existingState = {};
            if (existingRow && existingRow.game_state) {
                existingState = existingRow.game_state;
            }
            const mergedState = { ...existingState, ...clientState, referralSystem: existingState.referralSystem || clientState.referralSystem, };
            await pool.query(
                `UPDATE users SET game_state = $1, wallet_address = $2 WHERE telegram_id = $3`,
                [mergedState, clientState.walletAddress, telegram_id]
            );
            res.json({ message: 'Game state saved successfully' });
        } catch (err) {
            console.error("Database error on save:", err.message);
            return res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/users/:telegram_id/referrals', async (req, res) => {
        const { telegram_id } = req.params;
        try {
            const result = await pool.query("SELECT telegram_id, username FROM users WHERE referrer_id = $1", [telegram_id]);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

main();