<script>
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store.js';
    import { formatNumber } from '$lib/utils.js';

    onMount(() => {
        gameStore.fetchLeaderboard();
    });
</script>

<div class="view-container">
    <h2>Таблица Лидеров</h2>
    <p class="description">Топ-10 менеджеров по очкам престижа и просмотрам.</p>

    <div class="leaderboard-list">
        {#if $gameStore.leaderboard.isLoading}
            <p>Загрузка...</p>
        {:else if $gameStore.leaderboard.data.length === 0}
            <p>Здесь пока пусто.</p>
        {:else}
            {#each $gameStore.leaderboard.data as player, index (player.username)}
                <div class="player-card">
                    <span class="rank">#{index + 1}</span>
                    <span class="username">{player.username}</span>
                    <span class="score">
                        {player.prestigePoints} 🧠 / {formatNumber(player.totalViews)}
                    </span>
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
    }
    h2 { margin-top: 0; }
    .description {
        color: var(--text-secondary);
        max-width: 350px;
        margin: 0 auto 1.5rem auto;
    }
    .leaderboard-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .player-card {
        display: flex;
        align-items: center;
        background-color: rgba(17, 24, 39, 0.6);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        gap: 1rem;
    }
    .rank {
        font-weight: 700;
        font-size: 1.1rem;
        color: var(--text-secondary);
        width: 2.5rem;
        text-align: left;
    }
    .username {
        font-weight: 500;
        color: var(--text-primary);
        flex-grow: 1;
        text-align: left;
    }
    .score {
        font-weight: 700;
        color: var(--primary-accent);
        white-space: nowrap;
    }
</style>