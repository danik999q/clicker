<script lang="ts">
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store';
    import * as api from '$lib/api';

    let clans: any[] = [];
    let isLoading = true;
    let newClanName = '';

    onMount(async () => {
        try {
            clans = await api.fetchAllClans();
        } catch (e) {
            console.error("Failed to fetch clans", e);
        } finally {
            isLoading = false;
        }
    });

    function handleCreateClan() {
        if (newClanName.trim().length > 2 && newClanName.trim().length <= 15) {
            gameStore.createClan(newClanName.trim());
            newClanName = '';
        }
    }
</script>

<div class="view-container">
    {#if $gameStore.clan}
        <div class="clan-card my-clan">
            <span class="my-clan-badge">Ваш клан</span>
            <h2>{$gameStore.clan.name}</h2>
            <div class="list-header">Участники ({$gameStore.clan.members.length}):</div>
            <div class="member-list">
                {#each $gameStore.clan.members as member (member.telegram_id)}
                    <div class="member-item">{member.username || `User ${member.telegram_id}`}</div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="clan-card">
            <h2>Создать или вступить в клан</h2>
            <p class="description">Объединяйтесь с другими менеджерами, чтобы доминировать в интернете!</p>
            <div class="create-clan">
                <input type="text" bind:value={newClanName} placeholder="Название клана (3-15 симв.)" maxlength="15" />
                <button on:click={handleCreateClan} disabled={newClanName.trim().length < 3 || newClanName.trim().length > 15}>
                    Создать
                </button>
            </div>
        </div>

        <div class="list-header">Доступные кланы</div>
        <div class="clan-list">
            {#if isLoading}
                <div class="placeholder">Загрузка...</div>
            {:else if clans.length === 0}
                <div class="placeholder">Кланов пока нет. Создайте первый!</div>
            {:else}
                {#each clans as clan (clan.id)}
                    <div class="clan-list-item">
                        <div class="clan-info">
                            <span class="clan-name">{clan.name}</span>
                            <span class="clan-members">{clan.memberCount} уч.</span>
                        </div>
                        <button class="join-button" on:click={() => gameStore.joinClan(clan.id)}>Вступить</button>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    .view-container {
        padding: 0 1.5rem 1.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        flex-grow: 1;
        overflow-y: auto;
    }
    .clan-card {
        background-color: var(--surface-color);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
    }
    .my-clan {
        border-color: var(--primary-accent);
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
    }
    .my-clan-badge {
        background-color: var(--primary-accent);
        color: #064e3b;
        padding: 0.25rem 0.75rem;
        border-radius: 99px;
        font-size: 0.8rem;
        font-weight: 700;
    }
    h2 {
        margin: 1rem 0;
    }
    .description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0 auto 1.5rem auto;
        max-width: 40ch;
    }
    .create-clan {
        display: flex;
        gap: 0.5rem;
    }
    .create-clan input {
        flex-grow: 1;
        background-color: #111827;
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.75rem;
        border-radius: 8px;
        font-family: var(--font-sans);
        font-size: 1rem;
    }
    .create-clan button {
        background-color: var(--primary-accent);
        color: #064e3b;
        border: none;
        padding: 0 1.5rem;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .create-clan button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .list-header {
        font-weight: 700;
        text-align: left;
        margin-bottom: 0.5rem;
        padding-left: 0.5rem;
    }
    .clan-list {
        background-color: var(--surface-color);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        overflow: hidden;
    }
    .clan-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    .clan-list-item:last-child {
        border-bottom: none;
    }
    .clan-name {
        font-weight: 500;
    }
    .clan-members {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-left: 0.5rem;
    }
    .join-button {
        background-color: var(--secondary-accent);
        color: #0d1117;
        border: none;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: filter 0.2s;
    }
    .join-button:hover {
        filter: brightness(1.1);
    }
    .member-list {
        max-height: 200px;
        overflow-y: auto;
        text-align: left;
        background-color: rgba(0,0,0,0.2);
        padding: 0.5rem 1rem;
        border-radius: 8px;
    }
    .member-item {
        padding: 0.25rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .member-item:last-child {
        border-bottom: none;
    }
    .placeholder {
        padding: 2rem;
        color: var(--text-secondary);
    }
</style>