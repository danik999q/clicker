<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import * as api from '$lib/api';
    import { formatNumber } from '$lib/utils';
    import type { ClanLeaderboardEntry, ClanRole } from '$lib/types';
    import RaidView from './RaidView.svelte';

    let activeTab: 'myClan' | 'applications' | 'raid' | 'leaderboard' = 'myClan';
    let newClanName = '';
    let leaderboard: ClanLeaderboardEntry[] = [];
    let isLoadingLeaderboard = true;

    const DEFAULT_CLAN_ROLES: ClanRole[] = [
        { id: 'leader', name: 'Лидер', permissions: [] },
        { id: 'officer', name: 'Офицер', permissions: [] },
        { id: 'member', name: 'Участник', permissions: [] }
    ];

    $: clanRoles = $gameStore.clan?.roles?.length ? $gameStore.clan.roles : DEFAULT_CLAN_ROLES;

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
    
    function handleRoleChange(event: Event, memberId: string) {
        const target = event.currentTarget as HTMLSelectElement;
        GameService.changeClanRole(memberId, target.value);
    }

    $: currentUserTelegramId = $gameStore.telegramId ? String($gameStore.telegramId) : null;
    $: currentUserMember = $gameStore.clan?.members.find(m => String(m.telegram_id) === currentUserTelegramId);
    $: isLeader = currentUserMember?.roleId === 'leader';
    $: isOfficer = currentUserMember?.roleId === 'officer';
    $: canManage = isLeader || isOfficer;

</script>

<div class="view-container">
    <div class="sub-tabs">
        {#if $gameStore.clan}
            <button class:active={activeTab === 'myClan'} on:click={() => activeTab = 'myClan'}>Мой клан</button>
            {#if canManage}
                <button class:active={activeTab === 'applications'} on:click={() => activeTab = 'applications'}>
                    Заявки {#if $gameStore.clan.applications?.length > 0}<span class="app-counter">{$gameStore.clan.applications.length}</span>{/if}
                </button>
            {/if}
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
                <ul class="member-list">
                    {#each $gameStore.clan.members as member (member.telegram_id)}
                        <li class="member-item">
                            <span class="member-name">{member.username || `User ${member.telegram_id}`}</span>
                             {#if canManage && currentUserTelegramId !== String(member.telegram_id)}
                                <select class="role-select" on:change={(e) => handleRoleChange(e, member.telegram_id)}>
                                    {#each clanRoles as role}
                                        <option value={role.id} selected={member.roleId === role.id}>{role.name}</option>
                                    {/each}
                                </select>
                            {:else}
                                <span class="member-role">{(clanRoles.find(r => r.id === member.roleId)?.name) || 'Участник'}</span>
                            {/if}
                            <span class="member-score">{formatNumber(member.totalViews)}</span>
                        </li>
                    {/each}
                </ul>
                <button class="leave-button" on:click={GameService.leaveClan}>Покинуть клан</button>
            </div>
        {:else if activeTab === 'applications' && $gameStore.clan && canManage}
             <div class="applications-view">
                <div class="list-header">Заявки на вступление</div>
                {#if $gameStore.clan.applications && $gameStore.clan.applications.length > 0}
                    <ul class="application-list">
                        {#each $gameStore.clan.applications as app (app.user.telegram_id)}
                            {#if app.status === 'pending'}
                                <li class="application-item">
                                    <span class="applicant-name">{app.user.username || `User ${app.user.telegram_id}`}</span>
                                    <div class="application-actions">
                                        <button class="action-btn approve" on:click={() => GameService.approveClanApplication(app.user.telegram_id)}>Принять</button>
                                        <button class="action-btn reject" on:click={() => GameService.rejectClanApplication(app.user.telegram_id)}>Отклонить</button>
                                    </div>
                                </li>
                            {/if}
                        {/each}
                    </ul>
                {:else}
                    <div class="placeholder">Нет новых заявок</div>
                {/if}
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
                                <button class="join-button" on:click={() => GameService.submitClanApplication(clan.id)}>Подать заявку</button>
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
    .sub-tabs button { flex-grow: 1; background: none; border: none; color: var(--text-secondary); font-weight: 600; padding: 0.5rem; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; position: relative; }
    .sub-tabs button:disabled { opacity: 0.4; cursor: not-allowed; }
    .sub-tabs button.active { background-color: var(--primary-accent); color: #064e3b; }
    .app-counter { position: absolute; top: -5px; right: -5px; background-color: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .tab-content { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
    .clan-header { background: linear-gradient(45deg, var(--surface-color), #1f2937); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid var(--border-color); }
    .clan-title { font-size: 2rem; margin: 0; }
    .clan-stats-grid { display: flex; gap: 1rem; margin: 1rem 0; }
    .stat-card { background: var(--surface-color); border-radius: 8px; padding: 0.75rem 1.25rem; flex: 1; text-align: center; border: 1px solid var(--border-color); }
    .stat-card .label { color: var(--text-secondary); font-size: 0.9rem; }
    .stat-card .value { font-size: 1.2rem; font-weight: 700; }
    .list-header { font-weight: 700; margin: 1rem 0 0.5rem 0; font-size: 1.1rem; }
    .member-list, .application-list { list-style: none; padding: 0; margin: 0; }
    .member-item, .application-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); }
    .member-item:last-child, .application-item:last-child { border-bottom: none; }
    .member-name, .applicant-name { font-weight: 500; flex-grow: 1; }
    .member-role { font-size: 0.9rem; color: var(--text-secondary); margin-left: auto; }
    .member-score { font-size: 1rem; font-weight: 600; min-width: 80px; text-align: right; }
    .role-select { margin-left: auto; background-color: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; padding: 0.25rem; }
    .application-actions { display: flex; gap: 0.5rem; margin-left: auto; }
    .action-btn { border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; color: white; }
    .action-btn.approve { background-color: #22c55e; }
    .action-btn.reject { background-color: #ef4444; }
    .leave-button { margin-top: 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; padding: 0.75rem 1.5rem; font-weight: 700; cursor: pointer; width: 100%; }
    .placeholder { padding: 2rem; color: var(--text-secondary); text-align: center; }
    .clan-list { background-color: var(--surface-color); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
    .clan-list-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
    .clan-list-item:last-child { border-bottom: none; }
    .rank-info { display: flex; align-items: center; gap: 1rem; text-align: left; }
    .rank { font-weight: 700; color: var(--text-secondary); font-size: 1.1rem; width: 2rem; }
    .clan-details { display: flex; flex-direction: column; }
    .clan-name { font-weight: 500; }
    .clan-members { font-size: 0.8rem; color: var(--text-secondary); }
    .join-button { background-color: var(--secondary-accent); color: #0d1117; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .create-clan-card { padding: 1rem; background-color: var(--surface-color); border-radius: 12px; margin-bottom: 1rem; }
    .create-clan { display: flex; gap: 0.5rem; }
    .create-clan input { flex-grow: 1; border-radius: 6px; border: 1px solid var(--border-color); padding: 0.5rem; }
</style>