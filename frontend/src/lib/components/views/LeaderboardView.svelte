<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';

    onMount(() => {
        if ($gameStore.leaderboard.data.length === 0) {
            gameStore.fetchLeaderboard();
        }
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
                    <div class="user-info">
                        <div class="rank">#{index + 1}</div>
                        <div class="username">{player.username}</div>
                    </div>
                    <div class="user-score">
                        <div class="score-text">SCORE: </div>
                        <div class="score">
                            {player.prestigePoints} 🧠 / {formatNumber(player.totalViews)}
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .view-container {
        width: 100%;
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
    .user-info {
        padding-bottom: 5px;
        display: flex;
        flex-direction: row;
        column-gap: 10px;
        border-bottom: 1px solid rgba(140, 140, 140, 0.493);
        font-size: 1.2rem;
    }
    .player-card {
        max-width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        background-color: rgba(17, 24, 39, 0.6);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
    }
    .rank {
        font-weight: 600;
        color: var(--text-secondary);
        text-align: left;
    }
    .username {
        font-weight: 500;
        color: var(--text-primary);
        flex-grow: 1;
        text-align: left;
    }
    .user-score {
        font-size: 1.1rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .score {
        padding: 3px;
        font-weight: 700;
        color: var(--primary-accent);
        white-space: nowrap;
    }
</style>