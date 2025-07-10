<script>
    import { gameStore } from '$lib/store.js';
</script>

<button class="floating-bonus" on:click={() => gameStore.clickFloatingBonus()}>
    ✨
</button>

<style>
    .floating-bonus {
        position: absolute;
        width: 60px;
        height: 60px;
        background-color: var(--secondary-accent);
        border-radius: 50%;
        border: 2px solid #fff;
        font-size: 2rem;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
        box-shadow: 0 0 20px 5px var(--secondary-accent);
        animation: pulse 2s infinite ease-in-out;
        transition: transform 0.2s ease;
    }

    .floating-bonus:hover {
        transform: scale(1.1);
    }

    @keyframes pulse {
        0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
        }
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
        }
        100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
        }
    }
</style>