<script lang="ts">
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import Header from '$lib/components/ui/Header.svelte';

    $: activeMeme = $gameStore.memes[$gameStore.activeMemeIndex];
</script>

<div class="clicker-view">
    <Header />
    <div class="meme-container">
        <button class="meme-button" on:click={GameService.addViews}>
            <img src={activeMeme.imageUrl} alt={activeMeme.name} class="meme-image" />
        </button>
        <h2 class="meme-name">{activeMeme.name}</h2>
    </div>
</div>

<style>
    .clicker-view {
        display: flex;
        flex-direction: column;
        height: 100%;
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
    }
    .meme-button:active {
        transform: scale(0.95);
    }
    .meme-image {
        width: 250px;
        height: 250px;
        border-radius: 24px;
        object-fit: cover;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .meme-name {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }
</style>