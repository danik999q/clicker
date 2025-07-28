<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { fetchReferrals } from '$lib/referralStore';
    import ReferralList from './ReferralList.svelte';
    import LeaderboardView from './LeaderboardView.svelte';
    import ClanView from './ClanView.svelte';

    let activeTab = 'referrals';
    let buttonText = 'Копировать';

    $: referralLink = $gameStore.telegramId ?
        `https://t.me/viralmanagerbot?start=${$gameStore.telegramId}` : 'Загрузка ссылки...';
    $: shareText = 'Залетай в Brainrot Manager и помоги мне захватить интернет! 🧠\n\n';
    $: shareUrl = $gameStore.telegramId ?
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` : '#';

    function copyLink() {
        if (!$gameStore.telegramId) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            buttonText = 'Скопировано!';
            setTimeout(() => {
                buttonText = 'Копировать';
            }, 2000);
        });
    }

    $: if ($gameStore.telegramId) {
        fetchReferrals($gameStore.telegramId);
    }
</script>

<div class="view-container">
    <div class="sub-tabs">
        <button class:active={activeTab === 'referrals'} on:click={() => activeTab = 'referrals'}>Приглашения</button>
        <button class:active={activeTab === 'leaderboard'} on:click={() => activeTab = 'leaderboard'}>Лидеры</button>
        <button class:active={activeTab === 'clans'} on:click={() => activeTab = 'clans'}>Кланы</button>
    </div>

    {#if activeTab === 'referrals'}
        <div class="referral-content">
            <h2>Реферальная система</h2>
            <p class="description">Приглашайте друзей и получайте бонусы, когда они играют!</p>

            <div class="link-container">
                <input type="text" readonly value={referralLink} />
                <button on:click={copyLink} class="copy-button" disabled={!$gameStore.telegramId}>{buttonText}</button>
            </div>

            <a href={shareUrl} target="_blank" rel="noopener noreferrer" class="share-button" class:disabled={!$gameStore.telegramId}>
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

            {#if $gameStore.telegramId}
                {#key $gameStore.telegramId}
                    <ReferralList />
                {/key}
            {/if}
        </div>
    {:else if activeTab === 'leaderboard'}
        <LeaderboardView />
    {:else if activeTab === 'clans'}
        <ClanView />
    {/if}
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
    .sub-tabs {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        background-color: var(--surface-color);
        padding: 0.25rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    .sub-tabs button {
        width: 33%;
        flex-grow: 1;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.5rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .sub-tabs button.active {
        background-color: var(--primary-accent);
        color: #0d1117;
    }
    .referral-content {
        display: contents;
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
        background-color: #ccdcff;
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
        text-align: center;
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
    .share-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        max-width: 100%;
        background-color: #229ED9;
        color: white;
        text-decoration: none;
        padding: 0.75rem;
        font-weight: 700;
        border-radius: 8px;
        margin-bottom: 2rem;
        transition: background-color 0.2s ease, opacity 0.2s ease;
    }
    .share-button.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .stat-card {
        background-color: rgba(162, 237, 251, 0.6);
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
</style>