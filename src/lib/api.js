const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchApi(path, options = {}) {
    const defaultHeaders = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    if (!response.ok) {
        const error = new Error(`API Error: ${response.status} ${response.statusText}`);
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


export async function loadUserState(telegramId) {
    return fetchApi(`/users/${telegramId}/state`);
}

export async function registerUser(telegramId, username) {
    return fetchApi(`/register`, {
        method: 'POST',
        body: JSON.stringify({ telegram_id: telegramId, username: username || `user_${telegramId}` })
    });
}

export function saveUserState(telegramId, gameState) {
    if (!telegramId) return;
    const savableState = { /* your logic to create savableState */ };
    const blob = new Blob([JSON.stringify({ gameState: savableState })], { type: 'application/json; charset=UTF-8' });
    navigator.sendBeacon(`${API_BASE_URL}/users/${telegramId}/state`, blob);
}