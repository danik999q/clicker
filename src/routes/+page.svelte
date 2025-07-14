<script>
    import { onMount, onDestroy } from 'svelte';
    import { gameStore, GLOBAL_UPGRADE_DEFINITIONS } from '$lib/store.js';
    import GameView from '$lib/components/GameView.svelte';
    import UpgradesView from '$lib/components/UpgradesView.svelte';
    import AchievementsView from '$lib/components/AchievementsView.svelte';
    import ReferralView from '$lib/components/ReferralView.svelte';
    import LeaderboardView from '$lib/components/LeaderboardView.svelte';
    import ControlPanel from '$lib/components/ControlPanel.svelte';
    import WelcomeBack from '$lib/components/WelcomeBack.svelte';
    import { formatNumber } from '$lib/utils.js';

    let now = Date.now();
    let timerInterval;

    onMount(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            // @ts-expect-error
            tg.onEvent('close', () => {
                gameStore.saveState();
            });
            let attempts = 0;
            const maxAttempts = 10;
            function tryToGetId() {
                const user = tg.initDataUnsafe?.user;
                const userId = user?.id.toString();
                if (userId) {
                    gameStore.loadStateFromServer(userId);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(tryToGetId, 200);
                } else {
                    console.error("Failed to get Telegram User ID.");
                }
            }
            tryToGetId();
        } else {
            let localId = localStorage.getItem('myLocalUserId');
            if (!localId) {
                localId = 'local_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
                localStorage.setItem('myLocalUserId', localId);
            }
            gameStore.loadStateFromServer(localId);
        }

        timerInterval = setInterval(() => {
            now = Date.now();
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(timerInterval);
    });

    function formatBoostTime(expiry) {
        const secondsLeft = Math.max(0, Math.floor((expiry - now) / 1000));
        return `${secondsLeft}с`;
    }

    $: viewsPerSecond = (() => {
        if ($gameStore.isLoading || !$gameStore.memes) return 0;

        // --- ИЗМЕНЕНИЕ 3: Применяем множитель от усиления к расчёту ВПС ---
        const incomeBoostMultiplier = $gameStore.activeBoosts.incomeMultiplier.isActive ? 7 : 1;
        const prestigeMultiplier = 1 + ($gameStore.prestigePoints * 0.02);
        const globalPassiveMultiplier = 1 + (GLOBAL_UPGRADE_DEFINITIONS || []).filter((u) => $gameStore.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'PASSIVE_MULTIPLIER').reduce((sum, u) => sum + u.value, 0) + ($gameStore.rewardBonuses?.passiveMultiplier || 0);

        const baseVps = ($gameStore.memes || []).reduce((total, meme) => {
            if (meme.isUnlocked) {
                return total + meme.passiveViews * meme.level;
            }
            return total;
        }, 0);

        return baseVps * globalPassiveMultiplier * prestigeMultiplier * incomeBoostMultiplier;
    })();
</script>

{#if !$gameStore.isLoading && $gameStore.offlineReport}
    <WelcomeBack report={$gameStore.offlineReport} />
{/if}

<div class="game-wrapper">
    {#if $gameStore.isLoading}
        <div class="loading-overlay">
            <p>Загрузка...</p>
        </div>
    {:else}
        <header class="stats-container">
            <h1>Brainrot Manager</h1>
            <p class="views-total">Всего просмотров: <span>{formatNumber($gameStore.totalViews)}</span></p>
            <p class="vps-counter">+{formatNumber(viewsPerSecond)} в секунду</p>

            <div class="boost-timers">
                {#if $gameStore.activeBoosts.clickFrenzy.isActive}
                    <div class="boost-timer frenzy">
                        Клик-безумие! (x500) | {formatBoostTime($gameStore.activeBoosts.clickFrenzy.expiry)}
                    </div>
                {/if}
                {#if $gameStore.activeBoosts.incomeMultiplier.isActive}
                    <div class="boost-timer income">
                        Доход x7 | {formatBoostTime($gameStore.activeBoosts.incomeMultiplier.expiry)}
                    </div>
                {/if}
            </div>
        </header>

        <main class="content-area">
            {#if $gameStore.activeView === 'clicker'}
                <GameView />
            {:else if $gameStore.activeView === 'upgrades'}
                <UpgradesView />
            {:else if $gameStore.activeView === 'achievements'}
                <AchievementsView />
            {:else if $gameStore.activeView === 'referrals'}
                <ReferralView />
            {:else if $gameStore.activeView === 'leaderboard'}
                <LeaderboardView />
            {/if}
        </main>

        <ControlPanel />
    {/if}
</div>

<style>
    .game-wrapper {
        background-color: var(--surface-color);
        border-radius: 16px;
        border: 1px solid var(--border-color);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 450px;
        height: 80vh;
        max-height: 800px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    @media (max-width: 600px) {
        .game-wrapper {
            height: 100vh;
            max-height: none;
            border-radius: 0;
            border: none;
        }
    }
    .stats-container {
        text-align: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    .stats-container h1 {
        font-size: 2rem;
        margin: 0 0 1rem 0;
    }
    .stats-container p {
        margin: 0.25rem 0;
    }
    .views-total {
        font-size: 1.125rem;
        color: var(--text-secondary);
        font-weight: 500;
    }
    .views-total span {
        color: var(--text-primary);
        font-weight: 700;
    }
    .vps-counter {
        color: var(--primary-accent);
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.9;
    }
    .content-area {
        flex-grow: 1;
        overflow-y: auto;
        padding: 0;
        display: flex;
        flex-direction: column;
    }
    .loading-overlay {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 1.5rem;
        color: var(--text-secondary);
    }

    /* --- ИЗМЕНЕНИЕ 5: Новые стили для таймеров --- */
    .boost-timers {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 58px;
    }
    .boost-timer {
        padding: 0.5rem;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.9rem;
        animation: pulse-light 1.5s infinite ease-in-out;
    }
    .boost-timer.frenzy {
        background-color: rgba(167, 139, 250, 0.2);
        color: #d8b4fe;
        border: 1px solid var(--secondary-accent);
    }
    .boost-timer.income {
        background-color: rgba(52, 211, 153, 0.2);
        color: #6ee7b7;
        border: 1px solid var(--primary-accent);
    }
    @keyframes pulse-light {
        0% { opacity: 1; }
        50% { opacity: 0.8; }
        100% { opacity: 1; }
    }
</style>