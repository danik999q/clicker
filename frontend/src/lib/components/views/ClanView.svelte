<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import * as api from '$lib/api';
    import { formatNumber } from '$lib/utils';
    import type { ClanLeaderboardEntry } from '$lib/types';
    import RaidView from './RaidView.svelte';

    let activeTab: 'myClan' | 'raid' | 'leaderboard' = 'myClan';
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
            GameService.createClan(newClanName.trim());
            newClanName = '';
        }
    }
</script>

<div class="view-container">
    <div class="sub-tabs">
        {#if $gameStore.clan}
            <button class:active={activeTab === 'myClan'} on:click={() => activeTab = 'myClan'}>Мой клан</button>
            <button class:active={activeTab === 'raid'} on:click={() => activeTab = 'raid'}>Рейды</button>
        {/if}
        <button class:active={activeTab === 'leaderboard'} on:click={() => activeTab = 'leaderboard'}>Рейтинг</button>
    </div>

    <div class="tab-content">
        {#if activeTab === 'myClan' && $gameStore.clan}
            <div class="my-clan-view">
                <div class="clan-header">
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
                <button class="leave-button" on:click={GameService.leaveClan}>Покинуть клан</button>
            </div>
        {:else if activeTab === 'raid' && $gameStore.clan}
            <RaidView />
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
                                <button class="join-button">Подать заявку</button>
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
    .clan-header { background: linear-gradient(45deg, var(--surface-color), #1f2937); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid var(--border-color); position: relative; }
    .clan-title { font-size: 2rem; margin: 0.5rem 0 0 0; }
    .clan-stats-grid { display: flex; gap: 1rem; margin: 1rem 0; }
    .stat-card { background: var(--surface-color); border-radius: 8px; padding: 0.75rem 1.25rem; flex: 1; text-align: center; border: 1px solid var(--border-color); }
    .stat-card .label { color: var(--text-secondary); font-size: 0.9rem; }
    .stat-card .value { font-size: 1.2rem; font-weight: 700; }
    .list-header { font-weight: 700; margin: 1rem 0 0.5rem 0; font-size: 1.1rem; }
    .member-list { list-style: none; padding: 0; margin: 0; }
    .member-item { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
    .member-item:last-child { border-bottom: none; }
    .member-name { font-weight: 500; }
    .member-score { margin-left: auto; font-size: 1rem; font-weight: 600; }
    .leave-button { margin-top: 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.5rem 1.5rem; font-weight: 700; cursor: pointer; }
    .leave-button:hover { background: #dc2626; }
    .placeholder { padding: 2rem; color: var(--text-secondary); text-align: center; }
    .clan-list { background-color: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
    .clan-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
    .clan-list-item:last-child { border-bottom: none; }
    .rank-info { display: flex; align-items: center; gap: 1rem; text-align: left; }
    .rank { font-weight: 700; color: var(--text-secondary); font-size: 1.1rem; width: 2rem; }
    .clan-details { display: flex; flex-direction: column; }
    .clan-name { font-weight: 500; }
    .clan-members { font-size: 0.8rem; color: var(--text-secondary); }
    .join-button { background-color: var(--secondary-accent); color: #0d1117; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; transition: filter 0.2s; white-space: nowrap; }
    .create-clan-card { padding: 1rem; background-color: var(--surface-color); border-radius: 12px; margin-bottom: 1rem; }
    .create-clan { display: flex; gap: 0.5rem; }
    .create-clan input { flex-grow: 1; border-radius: 6px; border: 1px solid var(--border-color); padding: 0.5rem; }
</style>