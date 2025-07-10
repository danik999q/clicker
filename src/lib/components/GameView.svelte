<script>
    import { gameStore } from '$lib/store.js';
    import FloatingNumber from './FloatingNumber.svelte';
    import FloatingBonus from './FloatingBonus.svelte';

    $: activeMeme = $gameStore.memes[$gameStore.activeMemeIndex];

    let floatingNumbers = [];

    function handleClick(event) {
        const clickMultiplier = 1 +
            $gameStore.globalUpgrades.filter(u => u.isPurchased && u.type === 'CLICK_MULTIPLIER').reduce((sum, u) => sum + u.value, 0) +
            $gameStore.rewardBonuses.clickMultiplier;

        const viewsEarned = Math.ceil((activeMeme.baseViews * activeMeme.level) * clickMultiplier);

        gameStore.addViews();

        const newNumber = {
            id: Date.now() + Math.random(),
            amount: viewsEarned,
            x: event.clientX,
            y: event.clientY
        };

        floatingNumbers = [...floatingNumbers, newNumber];
    }
</script>

<div class="view-container">
    <div id="active-meme-container">
        <h2>{activeMeme.name}</h2>
        <div id="meme-clicker-area" on:mousedown={handleClick}>
            <img src={activeMeme.imageUrl} alt={activeMeme.name} />
        </div>
    </div>

    {#each floatingNumbers as number (number.id)}
        <FloatingNumber
                amount={number.amount}
                x={number.x}
                y={number.y}
                on:destroy={() => (floatingNumbers = floatingNumbers.filter((n) => n.id !== number.id))}
        />
    {/each}

    {#if $gameStore.floatingBonus.isActive}
        <div style="position: absolute; left: {$gameStore.floatingBonus.x}%; top: {$gameStore.floatingBonus.y}%; transform: translate(-50%, -50%);">
            <FloatingBonus />
        </div>
    {/if}
</div>

<style>
    .view-container {
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 2rem;
        width: 100%;
        position: relative;
        justify-content: center; /* Центрируем контент по вертикали */
        flex-grow: 1;
    }

    h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }

    #meme-clicker-area {
        width: 250px;
        height: 250px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.2s ease;
        overflow: hidden;
        margin: 0 auto;
        user-select: none;
    }

    #meme-clicker-area:hover {
        border-color: var(--primary-accent);
        box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);
    }

    #meme-clicker-area:active {
        transform: scale(0.97);
    }

    #meme-clicker-area img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
    }
</style>