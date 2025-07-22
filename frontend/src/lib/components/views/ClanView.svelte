<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import * as api from '$lib/api';
    import { formatNumber } from '$lib/utils';
    import type { ClanLeaderboardEntry } from '$lib/types';

    let activeTab: 'myClan' | 'leaderboard' = 'myClan';
    let newClanName = '';

    let leaderboard: ClanLeaderboardEntry[] = [];
    let isLoadingLeaderboard = true;

    async function loadLeaderboard() {
        isLoadingLeaderboard = true;
        try {
            leaderboard = await api.fetchClanLeaderboard();
        } catch (e) {
            console.error("Failed to fetch clan leaderboard", e);
        } finally {
            isLoadingLeaderboard = false;
        }
    }

    onMount(() => {
        if (!$gameStore.clan) {
            activeTab = 'leaderboard';
        }
        loadLeaderboard();
    });

    function handleCreateClan() {
        if (newClanName.trim().length > 2 && newClanName.trim().length <= 15) {
            gameStore.createClan(newClanName.trim());
            newClanName = '';
        }
    }

    $: clanBonus = $gameStore.clan ? $gameStore.clan.members.length * 0.5 : 0;
</script>

<div class="view-container">
    <div class="sub-tabs">
        <button class:active={activeTab === 'myClan'} on:click={() => activeTab = 'myClan'} disabled={!$gameStore.clan}>
            Мой клан
        </button>
        <button class:active={activeTab === 'leaderboard'} on:click={() => activeTab = 'leaderboard'}>
            Рейтинг кланов
        </button>
    </div>

    <div class="tab-content">
        {#if activeTab === 'myClan'}
            {#if $gameStore.clan}
                <div class="my-clan-view">
                    <div class="clan-header">
                        <span class="clan-badge">Ваш клан</span>
                        <h2 class="clan-title">{$gameStore.clan.name}</h2>
                    </div>

                    <div class="clan-stats-grid">
                        <div class="stat-card">
                            <span class="label">Всего просмотров</span>
                            <span class="value">{formatNumber($gameStore.clan.totalViews)}</span>
                        </div>
                        <div class="stat-card">
                            <span class="label">Участников</span>
                            <span class="value">{$gameStore.clan.members.length}</span>
                        </div>
                        <div class="stat-card">
                            <span class="label">Бонус дохода</span>
                            <span class="value bonus">+{clanBonus.toFixed(1)}%</span>
                        </div>
                    </div>

                    <div class="list-header">Состав клана</div>
                    <ol class="member-list">
                        {#each $gameStore.clan.members as member (member.telegram_id)}
                            <li class="member-item">
                                <span class="member-name">{member.username || `User ${member.telegram_id}`}</span>
                                <span class="member-score">{formatNumber(member.totalViews)}</span>
                            </li>
                        {/each}
                    </ol>

                    <button class="leave-button" on:click={() => gameStore.leaveClan()}>Покинуть клан</button>
                </div>
            {/if}
        {:else if activeTab === 'leaderboard'}
            {#if !$gameStore.clan}
                <div class="create-clan-card">
                    <h3>Создать свой клан</h3>
                    <div class="create-clan">
                        <input type="text" bind:value={newClanName} placeholder="Название (3-15 симв.)" maxlength="15" />
                        <button on:click={handleCreateClan} disabled={!newClanName || newClanName.trim().length < 3 || newClanName.trim().length > 15}>
                            Создать
                        </button>
                    </div>
                </div>
            {/if}

            <div class="list-header">Топ кланов</div>
            <div class="clan-list">
                {#if isLoadingLeaderboard}
                    <div class="placeholder">Загрузка рейтинга...</div>
                {:else if leaderboard.length === 0}
                    <div class="placeholder">Кланов пока нет. Создайте первый!</div>
                {:else}
                    {#each leaderboard as clan, i (clan.id)}
                        <div class="clan-list-item">
                            <div class="rank-info">
                                <span class="rank">#{i + 1}</span>
                                <div class="clan-details">
                                    <span class="clan-name">{clan.name}</span>
                                    <span class="clan-members">{clan.memberCount} уч. / {formatNumber(clan.totalViews)}</span>
                                </div>
                            </div>
                            {#if !$gameStore.clan}
                                <button class="join-button" on:click={() => gameStore.joinClan(clan.id)}>Вступить</button>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .view-container { padding: 1rem; display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .sub-tabs { display: flex; gap: 0.5rem; background-color: var(--surface-color); padding: 0.25rem; border-radius: 8px; margin-bottom: 1rem; flex-shrink: 0; }
    .sub-tabs button { flex-grow: 1; background: none; border: none; color: var(--text-secondary); font-weight: 600; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
    .sub-tabs button:disabled { opacity: 0.4; cursor: not-allowed; }
    .sub-tabs button.active { background-color: var(--primary-accent); color: #064e3b; }
    .tab-content { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }

    .clan-header {
        background: linear-gradient(45deg, var(--surface-color), #1f2937);
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        border: 1px solid var(--border-color);
        margin-bottom: 1rem;
    }
    .clan-badge { background-color: var(--primary-accent); color: #064e3b; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
    .clan-title { font-size: 2rem; margin: 0.5rem 0 0 0; }

    .clan-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .stat-card { background-color: var(--surface-color); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid var(--border-color); }
    .stat-card .label { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
    .stat-card .value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .stat-card .value.bonus { color: var(--primary-accent); }

    .list-header { font-weight: 700; text-align: left; margin-bottom: 0.5rem; padding-left: 0.5rem; }
    .member-list { list-style: none; padding: 0; max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
    .member-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: 6px; }
    .member-name { font-weight: 500; }
    .member-score { font-weight: 600; color: var(--primary-accent); }

    .leave-button { background-color: #4b0000; color: #ff8a8a; border: 1px solid #7f1d1d; width: 100%; padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 1.5rem; transition: background-color 0.2s; }
    .leave-button:hover { background-color: #7f1d1d; }

    .create-clan-card { background-color: var(--surface-color); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); text-align: center; }
    .create-clan-card h3 { margin: 0 0 0.5rem 0; }
    .create-clan { display: flex; gap: 0.5rem; }
    .create-clan input { flex-grow: 1; background-color: #111827; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.75rem; border-radius: 8px; font-family: var(--font-sans); font-size: 1rem; }
    .create-clan button { background-color: var(--primary-accent); color: #064e3b; border: none; padding: 0 1.5rem; font-weight: 700; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
    .create-clan button:disabled { opacity: 0.5; cursor: not-allowed; }

    .clan-list { background-color: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
    .clan-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
    .clan-list-item:last-child { border-bottom: none; }
    .rank-info { display: flex; align-items: center; gap: 1rem; text-align: left; }
    .rank { font-weight: 700; color: var(--text-secondary); font-size: 1.1rem; width: 2rem; }
    .clan-details { display: flex; flex-direction: column; }
    .clan-name { font-weight: 500; }
    .clan-members { font-size: 0.8rem; color: var(--text-secondary); }
    .join-button { background-color: var(--secondary-accent); color: #0d1117; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; transition: filter 0.2s; white-space: nowrap; }
    .join-button:hover { filter: brightness(1.1); }
    .placeholder { padding: 2rem; color: var(--text-secondary); }
</style>