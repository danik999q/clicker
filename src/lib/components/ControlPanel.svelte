<script>
    import { gameStore } from '$lib/store.js';
</script>

<nav class="control-panel">
    <button
            class="nav-button"
            class:active={$gameStore.activeView === 'clicker'}
            on:click={() => gameStore.setView('clicker')}
    >
        Кликер
    </button>
    <button
            class="nav-button"
            class:active={$gameStore.activeView === 'upgrades'}
            on:click={() => gameStore.setView('upgrades')}
    >
        Улучшения
    </button>
    <button
            class="nav-button"
            class:active={$gameStore.activeView === 'achievements'}
            on:click={() => gameStore.setView('achievements')}
    >
        Задания
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
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: color 0.2s ease, background-color 0.2s;
        border-radius: 8px;
        flex-grow: 1;
    }
    .nav-button:hover {
        color: var(--text-primary);
        background-color: var(--surface-color);
    }
    .nav-button.active {
        color: var(--primary-accent);
    }
</style>