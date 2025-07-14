<script>
    import { gameStore } from '$lib/store.js';
</script>

<nav class="control-panel">
    <button class="nav-button" class:active={$gameStore.activeView === 'clicker'} on:click={() => gameStore.setView('clicker')} aria-label="Кликер">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25L9.022 8.227l-5.022 2.14c-.812.342-1.134 1.286-.71 2.05L6.31 16.6l.568-9.472A48.829 48.829 0 0012 2.25z" /></svg>
    </button>
    <button class="nav-button" class:active={$gameStore.activeView === 'upgrades'} on:click={() => gameStore.setView('upgrades')} aria-label="Улучшения">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </button>
    <button class="nav-button" class:active={$gameStore.activeView === 'achievements'} on:click={() => gameStore.setView('achievements')} aria-label="Задания">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 001.056-5.251 9.75 9.75 0 00-1.056-5.251h9.002a9.75 9.75 0 011.056 5.251 9.75 9.75 0 01-1.056 5.251z" /><path stroke-linecap="round" stroke-linejoin="round" d="M18.375 18.75H5.625m12.75 0a4.5 4.5 0 01-1.125 3.125m-11.5 0c-.375-.625-.625-1.25-.625-1.875m12.75 0h.008v.008h-.008v-.008zM12 15a3.75 3.75 0 000-7.5 3.75 3.75 0 000 7.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 21.75v-3.75m0 0a3.75 3.75 0 00-3.75-3.75H6.375m3.75 3.75a3.75 3.75 0 013.75-3.75h1.875m-5.625 3.75a3.75 3.75 0 013.75-3.75" /></svg>
    </button>
    <button class="nav-button" class:active={$gameStore.activeView === 'referrals'} on:click={() => gameStore.setView('referrals')} aria-label="Рефералы">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.964A4.5 4.5 0 1115 5.25v2.25m-3.75 2.25a4.5 4.5 0 10-9 0v2.25" /></svg>
    </button>
    <button class="nav-button" class:active={$gameStore.activeView === 'leaderboard'} on:click={() => gameStore.setView('leaderboard')} aria-label="Лидеры">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.5-1.5m1.5 1.5l1.5-1.5m0 0l.563-.563m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5-1.5" /></svg>
    </button>
</nav>

<style>
    .control-panel {
        width: 100%;
        background-color: #111827;
        border-top: 1px solid var(--border-color);
        display: flex;
        justify-content: space-around;
        padding: 0.5rem 0;
    }
    .nav-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: color 0.2s ease, background-color 0.2s;
        border-radius: 8px;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .nav-button svg {
        width: 1.5rem;
        height: 1.5rem;
    }
    .nav-button:hover {
        color: var(--text-primary);
        background-color: var(--surface-color);
    }
    .nav-button.active {
        color: var(--primary-accent);
    }
</style>