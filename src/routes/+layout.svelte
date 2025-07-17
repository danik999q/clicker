<script lang="ts">
    import '../app.css';
    import { gameStore } from '$lib/store';
    import { onMount } from 'svelte';

    onMount(() => {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.log("Running in local development mode.");
            let localId = localStorage.getItem('localUserId');
            if (!localId) {
                localId = 'local_' + Date.now();
                localStorage.setItem('localUserId', localId);
            }
            gameStore.loadStateFromServer(parseInt(localId, 10) || Date.now());
            return;
        }

        tg.ready();
        tg.expand();

        const userId = tg.initDataUnsafe?.user?.id;
        if (userId) {
            gameStore.loadStateFromServer(userId);
        } else {
            console.error("Failed to get Telegram User ID.");
        }
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
    <slot />
</div>

<style>
    .app-container {
        width: 100%;
        height: 100%;
        max-width: 480px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-color);
        color: var(--text-primary);
        position: relative;
    }
</style>