<script lang="ts">
    import { gameStore } from '$lib/store';
    import { onMount, onDestroy } from 'svelte';

    let boosts = {
        clickFrenzy: { icon: '🔥', timer: 0 },
        incomeMultiplier: { icon: '💰', timer: 0 }
    };

    let interval: any;

    onMount(() => {
        const unsubscribe = gameStore.subscribe(state => {
            const now = Date.now();
            boosts.clickFrenzy.timer = Math.max(0, Math.ceil((state.activeBoosts.clickFrenzy.expiry - now) / 1000));
            boosts.incomeMultiplier.timer = Math.max(0, Math.ceil((state.activeBoosts.incomeMultiplier.expiry - now) / 1000));
        });

        return unsubscribe;
    });
</script>

<div class="active-boosts-container">
    {#if boosts.clickFrenzy.timer > 0}
        <div class="boost-card">
            <span class="icon">{boosts.clickFrenzy.icon}</span>
            <span class="timer">{boosts.clickFrenzy.timer}s</span>
        </div>
    {/if}
    {#if boosts.incomeMultiplier.timer > 0}
        <div class="boost-card">
            <span class="icon">{boosts.incomeMultiplier.icon}</span>
            <span class="timer">{boosts.incomeMultiplier.timer}s</span>
        </div>
    {/if}
</div>

<style>
    .active-boosts-container {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 100;
    }
    .boost-card {
        display: flex;
        align-items: center;
        gap: 8px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 5px 10px;
        border-radius: 20px;
        border: 1px solid var(--primary-accent);
        color: white;
        font-weight: bold;
        backdrop-filter: blur(4px);
    }
    .icon {
        font-size: 1.2rem;
    }
    .timer {
        font-size: 0.9rem;
        min-width: 30px;
        text-align: left;
    }
</style>