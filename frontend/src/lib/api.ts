import type { GameState } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        const error = new Error(`API Error: ${response.status}`) as any;
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
    return fetchApi(`/users/register`, {
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
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
    }).catch(console.error);
}

export async function fetchLeaderboard(): Promise<any> {
    return fetchApi(`/leaderboard`);
}

export async function fetchUserClan(telegramId: number): Promise<any> {
    return fetchApi(`/users/${telegramId}/clan`);
}

export async function fetchClanLeaderboard(): Promise<any> {
    return fetchApi(`/clans/leaderboard`);
}

export async function createClan(name: string, leaderId: number): Promise<any> {
    return fetchApi(`/clans`, {
        method: 'POST',
        headers: { 'x-user-id': String(leaderId) },
        body: JSON.stringify({ name })
    });
}

export async function leaveClan(userId: number, clanId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/leave`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) }
    });
}

export async function attackRaidBoss(raidId: number, userId: number): Promise<any> {
    return fetchApi(`/clans/raid/${raidId}/attack`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) }
    });
}

export async function submitClanApplication(clanId: number, userId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/apply`, {
        method: 'POST',
        headers: { 'x-user-id': String(userId) }
    });
}

export async function approveClanApplication(clanId: number, userIdToApprove: string, approverId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/applications/${userIdToApprove}/approve`, {
        method: 'POST',
        headers: { 'x-user-id': String(approverId) }
    });
}

export async function rejectClanApplication(clanId: number, userIdToReject: string, rejectorId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/applications/${userIdToReject}/reject`, {
        method: 'POST',
        headers: { 'x-user-id': String(rejectorId) }
    });
}

export async function changeClanRole(clanId: number, userIdToChange: string, newRoleId: string, changerId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/roles/${userIdToChange}`, {
        method: 'POST',
        headers: { 'x-user-id': String(changerId) },
        body: JSON.stringify({ new_role_id: newRoleId })
    });
}

export async function updateClanDescription(clanId: number, description: string, editorId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/description`, {
        method: 'POST',
        headers: { 'x-user-id': String(editorId) },
        body: JSON.stringify({ description })
    });
}

export async function updateClanAvatar(clanId: number, avatarUrl: string, editorId: number): Promise<any> {
    return fetchApi(`/clans/${clanId}/avatar`, {
        method: 'POST',
        headers: { 'x-user-id': String(editorId) },
        body: JSON.stringify({ avatar_url: avatarUrl })
    });
}