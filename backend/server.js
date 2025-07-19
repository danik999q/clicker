const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { open } = require('sqlite');

async function setupDatabase() {
    const db = await open({
        filename: './gamedata.db',
        driver: sqlite3.Database
    });
    await db.run(`CREATE TABLE IF NOT EXISTS users (
                                                       telegram_id TEXT PRIMARY KEY,
                                                       username TEXT,
                                                       referrer_id TEXT,
                                                       game_state TEXT,
                                                       wallet_address TEXT
                  )`);
    console.log('Connected to the game database.');
    return db;
}

async function main() {
    const db = await setupDatabase();
    const app = express();
    const PORT = 3001;

    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'https://clicker-roan.vercel.app'],
        credentials: true
    }));
    app.use(express.json());

    app.get('/api/leaderboard', async (req, res) => {
        try {
            const users = await db.all("SELECT username, game_state FROM users");
            const leaderboardData = users.map(user => {
                try {
                    if (!user.game_state) return null;
                    const state = JSON.parse(user.game_state);
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
            await db.run( `INSERT OR IGNORE INTO users (telegram_id, username, referrer_id, game_state) VALUES (?, ?, ?, ?)`, [telegram_id, username, referrer_id, JSON.stringify(initialGameState)] );
            console.log(`[LOG] User registered or already exists: ${telegram_id}.`);
            if (referrer_id && referrer_id !== telegram_id) {
                const referrerRow = await db.get(`SELECT * FROM users WHERE telegram_id = ?`, [referrer_id]);
                if (referrerRow?.game_state) {
                    let referrerState;
                    try { referrerState = JSON.parse(referrerRow.game_state); } catch (e) { referrerState = {}; }
                    if (!referrerState.referralSystem) { referrerState.referralSystem = { userId: referrer_id, referredCount: 0, earnings: 0, }; }
                    referrerState.referralSystem.referredCount = (referrerState.referralSystem.referredCount || 0) + 1;
                    const prestigeMultiplier = 1 + ((referrerState.prestigePoints || 0) * 0.02);
                    const passiveMultiplier = 1 + (referrerState.rewardBonuses?.passiveMultiplier || 0);
                    let baseVps = referrerState.memes?.reduce((total, meme) => (meme.isUnlocked ? total + meme.passiveViews * meme.level : total), 0) || 0;
                    const totalVps = baseVps * passiveMultiplier * prestigeMultiplier;
                    const reward = totalVps * 3600;
                    referrerState.referralSystem.earnings = (referrerState.referralSystem.earnings || 0) + reward;
                    referrerState.totalViews = (referrerState.totalViews || 0) + reward;
                    await db.run(`UPDATE users SET game_state = ? WHERE telegram_id = ?`, [JSON.stringify(referrerState), referrer_id]);
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
            const row = await db.get("SELECT game_state, wallet_address FROM users WHERE telegram_id = ?", [telegram_id]);
            if (row) {
                let gameState = {};
                if (row.game_state) {
                    try { gameState = JSON.parse(row.game_state); } catch (e) {}
                }
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
            const existingRow = await db.get("SELECT game_state FROM users WHERE telegram_id = ?", [telegram_id]);
            let existingState = {};
            if (existingRow && existingRow.game_state) {
                try { existingState = JSON.parse(existingRow.game_state); } catch (e) {}
            }
            const mergedState = { ...existingState, ...clientState, referralSystem: existingState.referralSystem || clientState.referralSystem, };
            const result = await db.run(
                `UPDATE users SET game_state = ?, wallet_address = ? WHERE telegram_id = ?`,
                [JSON.stringify(mergedState), clientState.walletAddress, telegram_id]
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
            const rows = await db.all("SELECT telegram_id, username FROM users WHERE referrer_id = ?", [telegram_id]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

main();
