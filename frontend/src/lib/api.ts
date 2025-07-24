import type { GameState } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SavableGameState = Omit<GameState, 'isLoading' | 'activeView' | 'offlineReport' | 'floatingBonus' | 'daily'>;


async function fetchApi(path: string, options: RequestInit = {}): Promise<any> {
    const defaultHeaders = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`) as any;
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function loadUserState(telegramId: number): Promise<Partial<GameState>> {
    return fetchApi(`/users/${telegramId}/state`);
}

export async function registerUser(telegramId: number, username: string): Promise<any> {
    return fetchApi(`/register`, {
        method: 'POST',
        body: JSON.stringify({ telegram_id: telegramId, username: username || `user_${telegramId}` })
    });
}

export function saveUserState(telegramId: number, gameState: Omit<GameState, "isLoading" | "floatingBonus" | "leaderboard" | "offlineReport" | "activeView">): void {
    if (!telegramId) return;

    const url = `${API_BASE_URL}/users/${telegramId}/state`;
    const data = JSON.stringify({ gameState });

    fetch(url, {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json'
        },
        keepalive: true
    }).catch(error => {
        console.error('Failed to save game state:', error);
    });
}


export async function fetchLeaderboard(): Promise<any> {
    return fetchApi(`/leaderboard`);
}

export async function createClan(name: string, leaderId: number): Promise<any> {
    return fetchApi(`/clans`, {
        method: 'POST',
        body: JSON.stringify({ name, leader_id: leaderId })
    });
}

export async function joinClan(clanId: number, userId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/join`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
    });
}

export async function fetchUserClan(telegramId: number): Promise<any> {
    return fetchApi(`/users/${telegramId}/clan`);
}

export async function fetchClanLeaderboard(): Promise<any> {
    return fetchApi(`/clans/leaderboard`);
}

export async function leaveClan(userId: number): Promise<any> {
    return fetchApi(`/clans/leave`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
    });
}

export async function fetchClanRaid(clanId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/raid`);
}

export async function attackRaidBoss(raidId: number, userId: number, damage: number): Promise<any> {
    return fetchApi(`/raids/attack`, {
        method: 'POST',
        body: JSON.stringify({ raidId, userId, damage })
    });
}

export async function submitClanApplication(clanId: number, userId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
    });
}

export async function approveClanApplication(clanId: number, userId: string, approverId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/applications/${userId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approver_id: approverId })
    });
}

export async function rejectClanApplication(clanId: number, userId: string, approverId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/applications/${userId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ approver_id: approverId })
    });
}

export async function fetchClanApplications(clanId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/applications`);
}

export async function updateClanDescription(clanId: number, description: string, editorId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/description`, {
        method: 'POST',
        body: JSON.stringify({ description, editor_id: editorId })
    });
}

export async function updateClanAvatar(clanId: number, avatarUrl: string, editorId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/avatar`, {
        method: 'POST',
        body: JSON.stringify({ avatar_url: avatarUrl, editor_id: editorId })
    });
}

export async function changeClanRole(clanId: number, userId: string, newRoleId: string, changerId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/roles/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ new_role_id: newRoleId, changer_id: changerId })
    });
}