import { Router, Request, Response, NextFunction } from 'express';
import db from '../db';
import { calculateClickValue } from '../gameLogic';
import { GameState } from '../types';

const router = Router();

const canManageClan = async (req: Request, res: Response, next: NextFunction) => {
    const clanId = req.params.id;
    const userId = (req as any).userId;

    if (!userId) return res.status(401).json({ error: "Не авторизован" });
    if (!clanId) return res.status(400).json({ error: "ID клана не указан" });

    try {
        const { rows } = await db.query<{ clan_role_id: string }>(
            'SELECT clan_role_id FROM users WHERE telegram_id = $1 AND clan_id = $2',
            [userId, clanId]
        );
        const role = rows[0]?.clan_role_id;

        if (role === 'leader' || role === 'officer') {
            return next();
        }
        return res.status(403).json({ error: 'Недостаточно прав для этого действия' });
    } catch (err: any) {
        return res.status(500).json({ error: 'Ошибка сервера при проверке прав' });
    }
};

router.post('/', async (req: Request, res: Response) => {
    const { name } = req.body;
    const leader_id = (req as any).userId;
    if (!name || !leader_id) {
        return res.status(400).json({ error: 'Имя клана и ID лидера обязательны' });
    }
    if (name.trim().length < 3 || name.trim().length > 15) {
        return res.status(400).json({ error: 'Название клана должно быть от 3 до 15 символов' });
    }
    
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const userResult = await client.query<{ clan_id: number }>('SELECT clan_id FROM users WHERE telegram_id = $1', [leader_id]);
        if (userResult.rows[0]?.clan_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Вы уже состоите в клане' });
        }

        const clanResult = await client.query<{ id: number }>('INSERT INTO clans (name, leader_id) VALUES ($1, $2) RETURNING id', [name, leader_id]);
        const clanId = clanResult.rows[0].id;
        await client.query('UPDATE users SET clan_id = $1, clan_role_id = $2 WHERE telegram_id = $3', [clanId, 'leader', leader_id]);
        await client.query('COMMIT');
        res.status(201).json({ id: clanId, name, leader_id });
    } catch (err: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Клан с таким именем уже существует или произошла ошибка' });
    } finally {
        client.release();
    }
});

router.post('/:id/leave', async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id: clanId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Не авторизован' });

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { rows } = await db.query<{ clan_id: number, clan_role_id: string }>(
            'SELECT clan_id, clan_role_id FROM users WHERE telegram_id = $1', [userId]
        );
        const user = rows[0];

        if (!user || user.clan_id !== parseInt(clanId, 10)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Вы не состоите в этом клане' });
        }

        const membersResult = await client.query<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE clan_id = $1', [clanId]);
        const memberCount = parseInt(membersResult.rows[0].count, 10);

        if (memberCount === 1) {
            await client.query('UPDATE users SET clan_id = NULL, clan_role_id = \'member\' WHERE telegram_id = $1', [userId]);
            await client.query('DELETE FROM clans WHERE id = $1', [clanId]);
        } else {
            if (user.clan_role_id === 'leader') {
                await client.query('ROLLBACK');
                return res.status(403).json({ error: 'Лидер не может покинуть клан, пока в нем есть другие участники. Сначала передайте лидерство.' });
            }
            await client.query('UPDATE users SET clan_id = NULL, clan_role_id = \'member\' WHERE telegram_id = $1', [userId]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Вы покинули клан' });
    } catch (err: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

router.post('/raid/:id/attack', async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { id: raidId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Не авторизован' });

    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const userStateResult = await client.query<{ game_state: GameState }>('SELECT game_state FROM users WHERE telegram_id = $1', [userId]);
        if (userStateResult.rows.length === 0) {
             await client.query('ROLLBACK');
             return res.status(404).json({ error: 'User not found' });
        }
        const damage = calculateClickValue(userStateResult.rows[0].game_state);

        const raidUpdateResult = await client.query<{ boss_health: number }>(
            'UPDATE raids SET boss_health = CASE WHEN boss_health - $1 < 0 THEN 0 ELSE boss_health - $1 END WHERE id = $2 AND is_active = TRUE RETURNING boss_health', 
            [damage, raidId]
        );
        
        if (raidUpdateResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Рейд неактивен или не существует' });
        }

        await client.query(`
            INSERT INTO raid_participants (raid_id, user_id, damage_dealt) VALUES ($1, $2, $3)
            ON CONFLICT (raid_id, user_id) DO UPDATE SET damage_dealt = raid_participants.damage_dealt + $3;`,
            [raidId, userId, damage]
        );
        
        await client.query('COMMIT');
        res.status(200).json({ newBossHealth: raidUpdateResult.rows[0].boss_health });
    } catch (err: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

router.post('/:id/description', canManageClan, async (req: Request, res: Response) => {
    const { id: clanId } = req.params;
    const { description } = req.body;

    if (typeof description !== 'string' || description.length > 100) {
        return res.status(400).json({ error: 'Описание не должно превышать 100 символов' });
    }

    try {
        await db.query('UPDATE clans SET description = $1 WHERE id = $2', [description, clanId]);
        res.status(200).json({ message: 'Описание клана обновлено' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/avatar', canManageClan, async (req: Request, res: Response) => {
    const { id: clanId } = req.params;
    const { avatar_url } = req.body;

    if (typeof avatar_url !== 'string' || avatar_url.length > 255) {
        return res.status(400).json({ error: 'URL аватара слишком длинный' });
    }

    try {
        await db.query('UPDATE clans SET avatar_url = $1 WHERE id = $2', [avatar_url, clanId]);
        res.status(200).json({ message: 'Аватар клана обновлен' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;