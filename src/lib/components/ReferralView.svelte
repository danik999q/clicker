<script>
    import { gameStore } from '$lib/store.js';
    import { formatNumber } from '$lib/utils.js';
    import { browser } from "$app/environment";

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    let buttonText = 'Копировать';
    let referrals = [];
    let isLoading = true;

    $: if ($gameStore.telegramId && browser) {
        isLoading = true;
        fetch(`${API_BASE_URL}/users/${$gameStore.telegramId}/referrals`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        })
            .then(response => {
                if (response.ok) return response.json();
                // Улучшенная обработка ошибок для отладки
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            })
            .then(data => {
                referrals = data.referrals || [];
            })
            .catch(error => {
                console.error("Failed to fetch referrals:", error);
                referrals = [];
            })
            .finally(() => {
                isLoading = false;
            });
    }

    $: referralLink = $gameStore.telegramId ? `https://t.me/viralmanagerbot?start=${$gameStore.telegramId}` : 'Загрузка ссылки...';
    $: shareText = 'Залетай в Brainrot Manager и помоги мне захватить интернет! 🧠\n\n';
    $: shareUrl = $gameStore.telegramId ? `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` : '#';

    function copyLink() {
        if (!$gameStore.telegramId) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            buttonText = 'Скопировано!';
            setTimeout(() => {
                buttonText = 'Копировать';
            }, 2000);
        });
    }
</script>

<div class="view-container">
    <h2>Реферальная система</h2>
    <p class="description">Приглашайте друзей и получайте бонусы, когда они играют!</p>

    <div class="link-container">
        <input type="text" readonly value={referralLink} />
        <button on:click={copyLink} class="copy-button" disabled={!$gameStore.telegramId}>{buttonText}</button>
    </div>

    <a href={shareUrl} target="_blank" rel="noopener noreferrer" class="share-button" class:disabled={!$gameStore.telegramId}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.17.9-.502 1.2-1.003 1.23a1.536 1.536 0 0 1-1.213-.534c-.42-.426-1.002-.98-1.57-1.488c-.993-.86-1.42-1.23-1.01-1.892c.18-.29.35-.558.53-.792c.18-.23.37-.47.58-.72c.49-.57.98-.98 1.52-1.512c.07-.07.13-.13.2-.2l.89-1.02c.13-.15.06-.34-.13-.22c-.17.1-.34.2-.5.31c-.24.16-.48.32-.72.48c-.72.47-1.45.94-2.17 1.4c-.45.28-.83.42-1.15.4a.78.78 0 0 1-.6-.24a1.394 1.394 0 0 1-.4-1.002c-.03-1.04.2-1.9.46-2.58c.27-.68.75-1.23 1.4-1.68c2.1-1.38 3.56-2.2 4.98-2.91c.2-.1.39-.18.59-.26c.09-.04.18-.08.27-.12c.02-.01.03-.01.04-.02z"/></svg>
        <span>Пригласить друга</span>
    </a>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="value">{$gameStore.referralSystem.referredCount}</span>
            <span class="label">Приглашено друзей</span>
        </div>
        <div class="stat-card">
            <span class="value">{formatNumber($gameStore.referralSystem.earnings)}</span>
            <span class="label">Заработано просмотров</span>
        </div>
    </div>

    <div class="referral-list-container">
        {#if isLoading}
            <div class="list-placeholder">Загрузка списка...</div>
        {:else if referrals.length === 0}
            <div class="list-placeholder empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                <span>Вы пока никого не пригласили</span>
            </div>
        {:else}
            <div class="list-header">Ваши рефералы:</div>
            {#each referrals as ref (ref.telegram_id)}
                <div class="referral-card">
                    <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div class="info">
                        <span class="username">{ref.username || 'Аноним'}</span>
                        <span class="user-id">ID: {ref.telegram_id}</span>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .view-container {
        width: 100%;
        padding: 1.5rem;
        box-sizing: border-box;
        text-align: center;
        display: flex;
        flex-direction: column;
    }
    h2 {
        margin-top: 0;
    }
    .description {
        color: var(--text-secondary);
        max-width: 350px;
        margin: 0 auto 1.5rem auto;
    }
    .link-container {
        display: flex;
        margin-bottom: 1rem;
    }
    .link-container input {
        flex-grow: 1;
        background-color: #111827;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 0.75rem;
        border-radius: 8px 0 0 8px;
        font-family: var(--font-sans);
        font-size: 0.9rem;
        min-width: 0;
    }
    .copy-button {
        background-color: var(--primary-accent);
        color: #064e3b;
        border: none;
        padding: 0 1.5rem;
        font-weight: 700;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
        white-space: nowrap;
        transition: background-color 0.2s ease;
    }
    .copy-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .copy-button:hover:not(:disabled) {
        background-color: #6ee7b7;
    }

    .share-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        background-color: #229ED9;
        color: white;
        text-decoration: none;
        padding: 0.75rem;
        font-weight: 700;
        border-radius: 8px;
        margin-bottom: 2rem;
        transition: background-color 0.2s ease, opacity 0.2s ease;
    }
    .share-button:hover {
        background-color: #1da8e0;
    }
    .share-button.disabled {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .stat-card {
        background-color: rgba(17, 24, 39, 0.6); /* Полупрозрачный фон */
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
    }
    .stat-card .value {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--primary-accent);
    }
    .stat-card .label {
        display: block;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    /* --- НОВЫЕ СТИЛИ ДЛЯ СПИСКА --- */
    .referral-list-container {
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        flex-grow: 1; /* Занимает оставшееся место */
        overflow-y: auto; /* Добавляет скролл, если нужно */
    }
    .list-header {
        text-align: left;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    .referral-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background-color: rgba(17, 24, 39, 0.6);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }
    .user-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: var(--text-secondary);
        flex-shrink: 0;
    }
    .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }
    .username {
        font-weight: 500;
        color: var(--text-primary);
    }
    .user-id {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    .list-placeholder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--text-secondary);
        opacity: 0.6;
    }
    .empty-state svg {
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
    }
</style>