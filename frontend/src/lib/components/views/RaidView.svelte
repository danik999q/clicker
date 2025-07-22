<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';

    $: raid = $gameStore.raid;
    $: bossHealthPercentage = raid ? (raid.boss_health / raid.max_health) * 100 : 0;
</script>

<div class="raid-container">
    {#if raid}
        <div class="boss-area">
            <h2>Мемный Властелин</h2>
            <div class="boss-health-bar">
                <div class="health" style="width: {bossHealthPercentage}%"></div>
            </div>
            <p>{formatNumber(raid.boss_health)} / {formatNumber(raid.max_health)}</p>

            <button class="boss-click-area" on:click={() => gameStore.attackRaidBoss()}>
                <div class="boss-placeholder"></div>
            </button>
        </div>

        <div class="damage-ranking">
            <h3>Топ по урону</h3>
            {#if raid.participants.length > 0}
                <ol>
                    {#each raid.participants as participant (participant.user_id)}
                        <li>
                            <span>{participant.user_id}</span>
                            <span>{formatNumber(participant.damage_dealt)}</span>
                        </li>
                    {/each}
                </ol>
            {:else}
                <p>Пока никто не нанёс урон.</p>
            {/if}
        </div>
    {:else}
        <p>Для вашего клана нет активных рейдов.</p>
    {/if}
</div>

<style>
    .raid-container { padding: 1rem; }
    .boss-health-bar { height: 20px; background-color: #7f1d1d; border-radius: 10px; overflow: hidden; }
    .health { height: 100%; background-color: var(--primary-accent); transition: width 0.3s; }
    .boss-click-area { width: 200px; height: 200px; margin: 1rem auto; cursor: pointer; border: none; background: none; }
    .boss-placeholder { width: 100%; height: 100%; background-color: #333; border-radius: 50%; }
</style>