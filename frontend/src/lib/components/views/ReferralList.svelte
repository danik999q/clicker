<script>
    import { referrals, isLoadingReferrals } from '../../referralStore.ts';
</script>

<div class="referral-list-container">
    {#if $isLoadingReferrals}
        <div class="list-placeholder">Загрузка списка...</div>
    {:else if $referrals.length === 0}
        <div class="list-placeholder empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            <span>Вы пока никого не пригласили</span>
        </div>
    {:else}
        <div class="list-header">Ваши рефералы:</div>
        {#each $referrals as ref (ref.telegram_id)}
            <div class="referral-card">
                <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <div class="info">
                    <span class="username">{ref.username || 'Аноним'}</span>
                    <span class="user-id">ID: {ref.telegram_id}</span>
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    .referral-list-container {
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        flex-grow: 1;
        overflow-y: auto;
    }
    .list-header {
        text-align: left;
        font-weight: 700;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    .referral-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background-color: rgba(17, 24, 39, 0.6);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }
    .user-icon {
        width: 1.5rem;
        height: 1.5rem;
        color: var(--text-secondary);
        flex-shrink: 0;
    }
    .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }
    .username {
        font-weight: 500;
        color: var(--text-primary);
    }
    .user-id {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    .list-placeholder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--text-secondary);
        opacity: 0.6;
    }
    .empty-state svg {
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
    }
</style>