<script>
    import { gameStore } from '$lib/store.ts';
    import { formatNumber } from '$lib/utils.ts';
    import { fetchReferrals } from '../../referralStore.ts';
    import ReferralList from './ReferralList.svelte';

    let buttonText = 'Копировать';

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
    $: if ($gameStore.telegramId) {
        fetchReferrals($gameStore.telegramId);
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
        <svg width="24px" height="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 511.999 511.999" style="enable-background:new 0 0 511.999 511.999;" xml:space="preserve">
        <path style="fill:#C3C3C7;" d="M165.323,267.452L395.89,125.446c4.144-2.545,8.407,3.058,4.849,6.359L210.454,308.684
            c-6.688,6.226-11.003,14.558-12.225,23.602l-6.482,48.036c-0.858,6.414-9.868,7.05-11.638,0.843l-24.929-87.595
            C152.325,283.578,156.486,272.907,165.323,267.452z"/>
        <path style="fill:#DEDEE0;" d="M9.043,246.86l117.975,44.032l45.664,146.854c2.922,9.405,14.423,12.882,22.057,6.641l65.761-53.61
            c6.893-5.617,16.712-5.897,23.916-0.667l118.61,86.113c8.166,5.936,19.736,1.461,21.784-8.407l86.888-417.947
            c2.236-10.779-8.356-19.772-18.62-15.802L8.905,220.845C-3.043,225.453-2.939,242.369,9.043,246.86z M165.323,267.452
            L395.89,125.446c4.144-2.545,8.407,3.058,4.849,6.359L210.454,308.684c-6.688,6.226-11.003,14.558-12.225,23.602l-6.482,48.036
            c-0.858,6.414-9.868,7.05-11.638,0.843l-24.929-87.595C152.325,283.578,156.486,272.907,165.323,267.452z"/>
        </svg>
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
            <ReferralList id={$gameStore.telegramId} />
        {/key}
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
    .copy-button:hover:not(:disabled) {
        background-color: #6ee7b7;
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
        background-color: rgba(17, 24, 39, 0.6);
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
