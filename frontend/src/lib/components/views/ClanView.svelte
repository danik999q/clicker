<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import * as api from '$lib/api';
    import { formatNumber } from '$lib/utils';
    import type { ClanLeaderboardEntry, ClanMember, ClanRole, ClanApplication, ClanEvent } from '$lib/types';
    import RaidView from './RaidView.svelte';

    let activeTab: 'myClan' | 'applications' | 'history' | 'raid' | 'leaderboard' = 'myClan';
    let editMode = false;
    let newDescription = '';
    let newAvatarUrl = '';
    let newClanName = '';
    let leaderboard: ClanLeaderboardEntry[] = [];
    let isLoadingLeaderboard = true;

    const DEFAULT_CLAN_ROLES = [
        { id: 'leader', name: 'Лидер', permissions: [] },
        { id: 'officer', name: 'Офицер', permissions: [] },
        { id: 'member', name: 'Участник', permissions: [] }
    ];

    $: clanRoles = $gameStore.clan?.roles?.length
        ? $gameStore.clan.roles
        : DEFAULT_CLAN_ROLES;

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

    function handleEditClan() {
        if (newDescription !== $gameStore.clan?.description) {
            gameStore.updateClanDescription(newDescription);
        }
        if (newAvatarUrl !== $gameStore.clan?.avatarUrl) {
            gameStore.updateClanAvatar(newAvatarUrl);
        }
        editMode = false;
    }

    function handleSubmitApplication(clanId: number) {
        gameStore.submitClanApplication(clanId);
    }

    function handleApproveApplication(userId: string) {
        gameStore.approveClanApplication(userId);
    }

    function handleRejectApplication(userId: string) {
        gameStore.rejectClanApplication(userId);
    }

    function handleChangeRole(userId: string, newRoleId: string) {
        gameStore.changeClanRole(userId, newRoleId);
    }

    $: clanBonus = $gameStore.clan ? $gameStore.clan.members.length * 0.5 : 0;
    $: isLeader = $gameStore.clan && $gameStore.clan.members.find(m => String(m.telegram_id) === String($gameStore.telegramId) && m.roleId === 'leader');
    $: isOfficer = $gameStore.clan && $gameStore.clan.members.find(m => String(m.telegram_id) === String($gameStore.telegramId) && m.roleId === 'officer');
</script>

<div class="view-container">
    <div class="sub-tabs">
        {#if $gameStore.clan}
            <button class:active={activeTab === 'myClan'} on:click={() => activeTab = 'myClan'}>Мой клан</button>
            <button class:active={activeTab === 'applications'} on:click={() => activeTab = 'applications'}>Заявки</button>
            <button class:active={activeTab === 'history'} on:click={() => activeTab = 'history'}>История</button>
            <button class:active={activeTab === 'raid'} on:click={() => activeTab = 'raid'}>Рейды</button>
        {/if}
        <button class:active={activeTab === 'leaderboard'} on:click={() => activeTab = 'leaderboard'}>Рейтинг</button>
    </div>

    <div class="tab-content">
        {#if activeTab === 'myClan' && $gameStore.clan}
            <div class="my-clan-view">
                <div class="clan-header">
                    <img class="clan-avatar" src={$gameStore.clan.avatarUrl || '/default-clan-avatar.png'} alt="Аватар клана" />
                    <span class="clan-badge">Ваш клан</span>
                    <h2 class="clan-title">{$gameStore.clan.name}</h2>
                    <div class="clan-level">Уровень: {$gameStore.clan.level || 1}</div>
                    {#if editMode}
                        <input type="text" bind:value={newDescription} placeholder="Описание клана" maxlength="100" />
                        <input type="text" bind:value={newAvatarUrl} placeholder="URL аватара" />
                        <button on:click={handleEditClan}>Сохранить</button>
                        <button on:click={() => editMode = false}>Отмена</button>
                    {:else}
                        <div class="clan-description">{$gameStore.clan.description}</div>
                        {#if isLeader || isOfficer}
                            <button class="edit-button" on:click={() => { editMode = true; newDescription = $gameStore.clan.description; newAvatarUrl = $gameStore.clan.avatarUrl; }}>Редактировать</button>
                        {/if}
                    {/if}
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
                            <span class="member-role">
                                {(clanRoles.find(r => r.id === member.roleId)?.name) || 'Участник'}
                            </span>
                            <span class="member-score">{formatNumber(member.totalViews)}</span>
                            {#if (isLeader || isOfficer) && String(member.telegram_id) !== String($gameStore.telegramId)}
                                <select on:change={e => handleChangeRole(member.telegram_id, (e.target as HTMLSelectElement).value)}>
                                    {#each clanRoles as role}
                                        <option value={role.id} selected={member.roleId === role.id}>{role.name}</option>
                                    {/each}
                                </select>
                            {/if}
                        </li>
                    {/each}
                </ol>
                <button class="leave-button" on:click={() => gameStore.leaveClan()}>Покинуть клан</button>
            </div>
        {:else if activeTab === 'applications' && $gameStore.clan}
            <div class="applications-view">
                <div class="list-header">Заявки на вступление</div>
                {#if $gameStore.clan.applications && $gameStore.clan.applications.length > 0}
                    <ol class="application-list">
                        {#each $gameStore.clan.applications as app (app.user.telegram_id)}
                            <li class="application-item">
                                <span class="applicant-name">{app.user.username || `User ${app.user.telegram_id}`}</span>
                                <span class="application-date">{app.date}</span>
                                <span class="application-status">{app.status === 'pending' ? 'Ожидает' : app.status === 'approved' ? 'Принята' : 'Отклонена'}</span>
                                {#if (isLeader || isOfficer) && app.status === 'pending'}
                                    <button on:click={() => handleApproveApplication(app.user.telegram_id)}>Принять</button>
                                    <button on:click={() => handleRejectApplication(app.user.telegram_id)}>Отклонить</button>
                                {/if}
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <div class="placeholder">Нет новых заявок</div>
                {/if}
            </div>
        {:else if activeTab === 'history' && $gameStore.clan}
            <div class="history-view">
                <div class="list-header">История событий</div>
                {#if $gameStore.clan.history && $gameStore.clan.history.length > 0}
                    <ol class="history-list">
                        {#each $gameStore.clan.history as event (event.date + event.user.telegram_id)}
                            <li class="history-item">
                                <span class="event-type">{event.type}</span>
                                <span class="event-user">{event.user.username || `User ${event.user.telegram_id}`}</span>
                                <span class="event-date">{event.date}</span>
                                {#if event.details}<span class="event-details">{event.details}</span>{/if}
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <div class="placeholder">История пуста</div>
                {/if}
            </div>
        {:else if activeTab === 'raid' && $gameStore.clan}
            <RaidView on:back={() => activeTab = 'myClan'} />
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
                                <button class="join-button" on:click={() => handleSubmitApplication(clan.id)}>Подать заявку</button>
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
    .clan-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 0.5rem; border: 2px solid var(--primary-accent); }
    .clan-badge { background-color: var(--primary-accent); color: #064e3b; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
    .clan-title { font-size: 2rem; margin: 0.5rem 0 0 0; }
    .clan-level { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .edit-button { margin-top: 0.5rem; background: var(--secondary-accent); color: #0d1117; border: none; border-radius: 6px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; }
    .clan-description { margin: 0.5rem 0 0.5rem 0; color: var(--text-secondary); }
    .clan-stats-grid { display: flex; gap: 1rem; margin: 1rem 0; }
    .stat-card { background: var(--surface-color); border-radius: 8px; padding: 0.75rem 1.25rem; flex: 1; text-align: center; border: 1px solid var(--border-color); }
    .stat-card .label { color: var(--text-secondary); font-size: 0.9rem; }
    .stat-card .value { font-size: 1.2rem; font-weight: 700; }
    .stat-card .bonus { color: var(--primary-accent); }
    .list-header { font-weight: 700; margin: 1rem 0 0.5rem 0; font-size: 1.1rem; }
    .member-list, .application-list, .history-list { list-style: none; padding: 0; margin: 0; }
    .member-list { list-style: none; padding: 0; margin: 0; }
    .member-item { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
    .member-item:last-child { border-bottom: none; }
    .member-name, .applicant-name, .event-user { font-weight: 500; }
    .member-role { font-size: 0.9rem; color: var(--text-secondary); margin-left: 0.5rem; }
    .member-score { margin-left: auto; font-size: 1rem; font-weight: 600; }
    .application-date, .event-date { font-size: 0.85rem; color: var(--text-secondary); margin-left: 0.5rem; }
    .event-type { font-size: 0.9rem; color: var(--primary-accent); margin-right: 0.5rem; }
    .event-details { font-size: 0.9rem; color: var(--secondary-accent); margin-left: 0.5rem; }
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
    .join-button:hover { filter: brightness(1.1); }
    @media(max-width: 360px) {
        .view-container {
            padding: 0;
        }
    }
</style>