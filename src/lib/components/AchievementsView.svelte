<script>
    import { gameStore, ACHIEVEMENT_DEFINITIONS } from '$lib/store.js';
</script>

<div id="achievements-list">
    {#each ACHIEVEMENT_DEFINITIONS as achievement (achievement.id)}
        <div class="list-item achievement" class:completed={$gameStore.achievementsProgress[achievement.id]}>
            <div class="icon">
                {#if $gameStore.achievementsProgress[achievement.id]}✓{:else}❓{/if}
            </div>
            <div class="item-info">
                <p class="item-name">{achievement.name}</p>
                <p class="item-stats">{achievement.description}</p>
            </div>
            <div class="reward">{achievement.rewardDescription}</div>
        </div>
    {/each}
</div>

<style>
    #achievements-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }
    .list-item {
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .list-item.achievement.completed {
        opacity: 0.6;
        border-color: var(--primary-accent);
    }
    .icon {
        font-size: 1.5rem;
    }
    .item-info {
        flex-grow: 1;
    }
    .item-name {
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem 0;
    }
    .item-stats {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
    }
    .reward {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-accent);
        text-align: right;
        flex-shrink: 0;
    }
</style>