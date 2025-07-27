<script lang="ts">
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import Header from '$lib/components/ui/Header.svelte';
    import ActiveBoosts from '../features/game/ActiveBoosts.svelte';
    import FloatingBonus from '../features/game/FloatingBonus.svelte';
    import FloatingNumber from '../features/game/FloatingNumber.svelte';
    import { calculateClickValue } from '$lib/gameLogic';

    $: activeMeme = $gameStore.memes[$gameStore.activeMemeIndex];

    let isClicked = false;
    let floatingNumbers: { id: number; amount: number; x: number; y: number }[] = [];

    function handleClick(event: MouseEvent) {
        const viewsEarned = calculateClickValue($gameStore);
        GameService.addViews();

        const newNumber = {
            id: Date.now() + Math.random(),
            amount: viewsEarned,
            x: event.clientX,
            y: event.clientY
        };
        floatingNumbers = [...floatingNumbers, newNumber];

        isClicked = true;
        setTimeout(() => {
            isClicked = false;
        }, 100);
    }
</script>

<div class="clicker-view">
    <Header />
    <ActiveBoosts />

    <div class="meme-container">
        <button class="meme-button" on:mousedown={handleClick}>
            <img
                    src={activeMeme.imageUrl}
                    alt={activeMeme.name}
                    class="meme-image"
                    class:clicked={isClicked}
            />
        </button>
        <h2 class="meme-name">{activeMeme.name}</h2>
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
            <FloatingBonus type={$gameStore.floatingBonus.type} />
        </div>
    {/if}
</div>

<style>
    .clicker-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
    }
    .meme-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
    }
    .meme-button {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        border-radius: 24px;
        transition: transform 0.1s ease;
    }
    .meme-button:active {
        transform: scale(0.97);
    }
    .meme-image {
        width: 250px;
        height: 250px;
        border-radius: 24px;
        object-fit: cover;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transition: transform 0.1s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .meme-image.clicked {
        transform: scale(0.95);
    }
    .meme-name {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }
</style>