import { Router, Request, Response } from 'express';
import db from '../db';
import { calculatePassiveIncome } from '../gameLogic';
import { GameState } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const { telegram_id, username, referrer_id } = req.body;
    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
    }
    try {
        const initialGameState: Partial<GameState> = {
            totalViews: 0,
            memes: []
        };
        await db.query(
            `INSERT INTO users (telegram_id, username, referrer_id, game_state) VALUES ($1, $2, $3, $4) ON CONFLICT (telegram_id) DO NOTHING`,
            [telegram_id, username, referrer_id, JSON.stringify(initialGameState)]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err: any) {
        console.error("Database error on register:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/:telegram_id/state', async (req: Request, res: Response) => {
    const { telegram_id } = req.params;
    const MAX_OFFLINE_EARNINGS_S = 7 * 24 * 60 * 60;

    try {
        const result = await db.query<{ game_state: GameState, wallet_address: string, last_seen: string }>(
            "SELECT game_state, wallet_address, last_seen FROM users WHERE telegram_id = $1",
            [telegram_id]
        );
        const row = result.rows[0];

        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }

        let gameState = row.game_state || { totalViews: 0, memes: [] };
        const lastSeen = row.last_seen ? new Date(row.last_seen).getTime() : Date.now();
        const timeDiff = Math.floor((Date.now() - lastSeen) / 1000);
        const effectiveOfflineTime = Math.min(timeDiff, MAX_OFFLINE_EARNINGS_S);

        if (effectiveOfflineTime > 10) {
            const offlineVps = calculatePassiveIncome(gameState);
            const viewsEarned = Math.floor(offlineVps * effectiveOfflineTime);
            gameState.totalViews = (gameState.totalViews || 0) + viewsEarned;
            gameState.offlineReport = { timeAway: effectiveOfflineTime, viewsEarned };
        }

        gameState.walletAddress = row.wallet_address;
        gameState.isWalletConnected = !!row.wallet_address;

        await db.query(`UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE telegram_id = $1`, [telegram_id]);

        res.json(gameState);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:telegram_id/state', async (req: Request, res: Response) => {
    const { telegram_id } = req.params;
    const { gameState: clientState }: { gameState: GameState } = req.body;

    if (!clientState) {
        return res.status(400).json({ error: 'gameState is required' });
    }

    delete clientState.offlineReport;

    try {
        await db.query(
            `UPDATE users SET game_state = $1, wallet_address = $2, last_seen = CURRENT_TIMESTAMP WHERE telegram_id = $3`,
            [clientState, clientState.walletAddress, telegram_id]
        );
        res.json({ message: 'Game state saved successfully' });
    } catch (err: any) {
        console.error("Database error on save:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/:telegram_id/referrals', async (req: Request, res: Response) => {
    const { telegram_id } = req.params;
    try {
        const result = await db.query<{ telegram_id: string, username: string }>(
            "SELECT telegram_id, username FROM users WHERE referrer_id = $1",
            [telegram_id]
        );
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:telegram_id/clan', async (req: Request, res: Response) => {
    const { telegram_id } = req.params;
    try {
        const userResult = await db.query<{ clan_id: number }>('SELECT clan_id FROM users WHERE telegram_id = $1', [telegram_id]);
        const user = userResult.rows[0];

        if (!user || !user.clan_id) {
            return res.json(null);
        }

        const clanResult = await db.query('SELECT * FROM clans WHERE id = $1', [user.clan_id]);
        const clan = clanResult.rows[0];
        if (!clan) {
            return res.json(null);
        }

        const membersResult = await db.query(`
            SELECT telegram_id, username, (game_state->>'totalViews')::numeric as "totalViews", clan_role_id
            FROM users WHERE clan_id = $1 ORDER BY "totalViews" DESC
        `, [user.clan_id]);

        clan.members = membersResult.rows.map(m => ({
            telegram_id: m.telegram_id,
            username: m.username,
            totalViews: m.totalViews,
            roleId: m.clan_role_id || 'member'
        }));

        clan.totalViews = clan.members.reduce((sum: number, member: any) => sum + (Number(member.totalViews) || 0), 0);

        res.json(clan);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;