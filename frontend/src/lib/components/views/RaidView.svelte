<script lang="ts">
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import { formatNumber } from '$lib/utils';

    $: raid = $gameStore.raid;
    $: userId = $gameStore.telegramId ? String($gameStore.telegramId) : null;
    $: currentUserMember = $gameStore.clan?.members.find(m => String(m.telegram_id) === userId);
    $: canManage = currentUserMember?.roleId === 'leader' || currentUserMember?.roleId === 'officer';

    $: bossHealthPercentage = raid ? (raid.boss_health / raid.max_health) * 100 : 0;

    $: userParticipantInfo = raid && userId
        ? raid.participants.find(p => String(p.user_id) === userId)
        : null;

    $: isRaidOver = raid ? raid.boss_health <= 0 || new Date() > new Date(raid.end_date) : false;
</script>

<div class="raid-container">
    {#if raid}
        <div class="boss-area">
            <h2>Мемный Властелин</h2>
            <div class="boss-health-bar">
                <div class="health" style="width: {bossHealthPercentage}%"></div>
            </div>
            <p class="health-text">{formatNumber(raid.boss_health)} / {formatNumber(raid.max_health)}</p>

            {#if isRaidOver}
                <div class="raid-over-card">
                    <h3>Рейд Окончен</h3>
                    {#if userParticipantInfo}
                        <p>Ваш урон: {formatNumber(userParticipantInfo.damage_dealt)}</p>
                        <button class="claim-button" on:click={GameService.claimRaidReward}>
                            Забрать награду
                        </button>
                    {:else}
                        <p>Вы не участвовали в этом рейде.</p>
                    {/if}
                </div>
            {:else}
                <button class="boss-click-area" on:click={GameService.attackRaidBoss}>
                    <div class="boss-placeholder"></div>
                </button>
            {/if}
        </div>

        <div class="damage-ranking">
            <h3>Топ по урону</h3>
            {#if raid.participants.length > 0}
                <ol class="participant-list">
                    {#each raid.participants.sort((a, b) => b.damage_dealt - a.damage_dealt) as participant (participant.user_id)}
                        <li class:is-user={String(participant.user_id) === userId}>
                            <span>{participant.user_id === userId ? 'Вы' : `User ${participant.user_id.slice(-4)}`}</span>
                            <span>{formatNumber(participant.damage_dealt)}</span>
                        </li>
                    {/each}
                </ol>
            {:else}
                <p class="placeholder">Пока никто не нанёс урон.</p>
            {/if}
        </div>
    {:else}
        <div class="placeholder">
            <p>Для вашего клана нет активных рейдов.</p>
            {#if canManage}
                <button class="start-raid-button" on:click={GameService.startRaid}>
                    Начать рейд
                </button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .raid-container { padding: 1rem; text-align: center; }
    .boss-area { margin-bottom: 2rem; }
    .health-text { font-weight: 600; color: var(--text-secondary); }
    .boss-health-bar { height: 20px; background-color: #374151; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color); }
    .health { height: 100%; background-color: var(--primary-accent); transition: width 0.3s; }
    .boss-click-area { width: 200px; height: 200px; margin: 1rem auto; cursor: pointer; border: none; background: none; padding: 0; }
    .boss-click-area:active { transform: scale(0.95); }
    .boss-placeholder { width: 100%; height: 100%; background-color: #4b5563; border-radius: 50%; border: 4px solid var(--surface-color); box-shadow: 0 0 15px rgba(0,0,0,0.5); }
    .damage-ranking h3 { margin-bottom: 0.5rem; }
    .participant-list { list-style: none; padding: 0; margin: 0; }
    .participant-list li { display: flex; justify-content: space-between; padding: 0.5rem; border-radius: 6px; }
    .participant-list li:nth-child(odd) { background-color: var(--surface-color); }
    .participant-list li.is-user { background-color: var(--primary-accent); color: #064e3b; font-weight: 700; }
    .placeholder { color: var(--text-secondary); padding: 2rem 0; }
    .raid-over-card { background-color: var(--surface-color); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; }
    .claim-button, .start-raid-button { background-color: var(--secondary-accent); color: #0d1117; border: none; border-radius: 8px; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; }
</style>