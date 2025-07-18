<script lang="ts">
    import { gameStore } from '$lib/store';

    $: activeView = $gameStore.activeView;

    const setView = (view) => {
        gameStore.setView(view);
    };
</script>

<nav class="bottom-nav">
    <button on:click={() => setView('clicker')} class:active={activeView === 'clicker'}>
        <span>Кликер</span>
    </button>
    <button on:click={() => setView('upgrades')} class:active={activeView === 'upgrades'}>
        <span>Улучшения</span>
    </button>
    <button on:click={() => setView('daily')} class:active={activeView === 'daily'}>
        <span>Задания</span>
    </button>
    <button on:click={() => setView('referrals')} class:active={activeView === 'referrals'}>
        <span>Друзья</span>
    </button>
    <button on:click={() => setView('account')} class:active={activeView === 'account'}>
        <span>Кабинет</span>
    </button>
</nav>

<style>
    .bottom-nav {
        display: flex;
        justify-content: space-between;
        background-color: var(--surface-color);
        border-top: 1px solid var(--border-color);
        padding: 0.5rem 0;
        flex-shrink: 0;
    }
    
    button {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.45rem;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        flex-grow: 1;
    }
    button.active {
        color: var(--primary-accent);
        font-weight: 600;
    }
    @media(max-width: 360px) {
        button {
            padding: 0.4rem;
            font-size: 0.9rem;
        }
    }
</style>