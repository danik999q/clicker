<script>
    import { gameStore } from '$lib/store.js';
    import GameView from '$lib/components/GameView.svelte';
    import UpgradesView from '$lib/components/UpgradesView.svelte';
    import AchievementsView from '$lib/components/AchievementsView.svelte';
    import ControlPanel from '$lib/components/ControlPanel.svelte';
    import WelcomeBack from '$lib/components/WelcomeBack.svelte';
    import { formatNumber } from '$lib/utils.js';

    $: viewsPerSecond = (() => {
        if (!$gameStore.memes) return 0;

        const prestigeMultiplier = 1 + $gameStore.prestigePoints * 0.02;

        const globalPassiveMultiplier =
            1 +
            $gameStore.globalUpgrades
                .filter((u) => u.isPurchased && u.type === 'PASSIVE_MULTIPLIER')
                .reduce((sum, u) => sum + u.value, 0) +
            $gameStore.rewardBonuses.passiveMultiplier;

        const baseVps = $gameStore.memes.reduce((total, meme) => {
            if (meme.isUnlocked) {
                return total + meme.passiveViews * meme.level;
            }
            return total;
        }, 0);

        return baseVps * globalPassiveMultiplier * prestigeMultiplier;
    })();
</script>

{#if $gameStore.offlineReport}
    <WelcomeBack report={$gameStore.offlineReport} />
{/if}

<div class="game-wrapper">
    <header class="stats-container">
        <h1>Brainrot Manager</h1>
        <p class="views-total">Всего просмотров: <span>{formatNumber($gameStore.totalViews)}</span></p>
        <p class="vps-counter">+{formatNumber(viewsPerSecond)} в секунду</p>
    </header>

    <main class="content-area">
        {#if $gameStore.activeView === 'clicker'}
            <GameView />
        {:else if $gameStore.activeView === 'upgrades'}
            <UpgradesView />
        {:else if $gameStore.activeView === 'achievements'}
            <AchievementsView />
        {/if}
    </main>

    <ControlPanel />
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

    .stats-container {
        text-align: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }

    .stats-container h1 {
        font-size: 2rem;
        margin: 0 0 1.5rem 0;
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
</style>