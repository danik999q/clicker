<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { calculatePassiveIncome } from '$lib/gameLogic';

    $: passiveIncome = calculatePassiveIncome($gameStore);
</script>

<header class="main-header">
    <h1>Brainrot Manager</h1>
    <div class="stats-display">
        <span class="total-views">{formatNumber($gameStore.totalViews)}</span>
        <span class="passive-income">+ {formatNumber(passiveIncome)} / сек</span>
    </div>
</header>

<style>
    .main-header {
        text-align: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    h1 {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
    }
    .stats-display {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .total-views {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    .passive-income {
        font-size: 1rem;
        font-weight: 500;
        color: var(--primary-accent);
    }
</style>