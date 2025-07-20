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

export function saveUserState(telegramId: number, gameState: SavableGameState): void {
    if (!telegramId) return;

    const url = `${API_BASE_URL}/users/${telegramId}/state`;
    const data = JSON.stringify({ gameState });
    const blob = new Blob([data], { type: 'application/json; charset=UTF-8' });

    navigator.sendBeacon(url, blob);
}

export async function fetchLeaderboard(): Promise<any> {
    return fetchApi(`/leaderboard`);
}