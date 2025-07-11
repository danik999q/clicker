<script>
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store.js';
    import { formatNumber } from '$lib/utils.js';
    import {browser} from "$app/environment";

    const API_BASE_URL = 'https://b6357454418d.ngrok-free.app/api'; // или ваш ngrok URL

    let buttonText = 'Копировать';
    let referrals = [];
    let isLoading = true; // По умолчанию загрузка

    $: userId = $gameStore.referralSystem.userId;

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Заменяем onMount на реактивный блок $: ---
    // Этот код будет автоматически запускаться каждый раз, когда userId меняется
    $: if (userId && browser) {
        isLoading = true;
        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавляем заголовок в fetch ---
        fetch(`${API_BASE_URL}/users/${userId}/referrals`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                referrals = data;
            })
            .catch(error => {
                console.error("Failed to fetch referrals:", error);
            })
            .finally(() => {
                isLoading = false;
            });
    }

    $: referralLink = userId ? `https://t.me/viralmanagerbot?start=${userId}` : 'Загрузка ссылки...';
    $: shareText = 'Залетай в Brainrot Manager и помоги мне захватить интернет! 🧠\n\n';
    $: shareUrl = userId ? `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` : '#';

    function copyLink() {
        if (!userId) return;
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
        <button on:click={copyLink} class="copy-button" disabled={!userId}>{buttonText}</button>
    </div>

    <a href={shareUrl} target="_blank" rel="noopener noreferrer" class="share-button" class:disabled={!userId}>
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

    <div class="referral-list">
        {#if isLoading}
            <p>Загрузка списка...</p>
        {:else if referrals.length === 0}
            <p>Вы пока никого не пригласили.</p>
        {:else}
            <div class="list-header">Ваши рефералы:</div>
            {#each referrals as ref (ref.telegram_id)}
                <div class="referral-item">{ref.username || `User ${ref.telegram_id}`}</div>
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
        margin-bottom: 2rem;
    }
    .stat-card {
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 8px;
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
    .referral-list {
        border: 2px dashed var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        color: var(--text-secondary);
        min-height: 150px;
        text-align: left;
    }
    .referral-item {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    .referral-item:last-child {
        border-bottom: none;
    }
</style>