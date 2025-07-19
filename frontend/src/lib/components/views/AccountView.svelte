<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { gameStore } from '$lib/store';
    import { getTonConnectUI } from '$lib/ton-connect';

    let connectedAddress = '';
    let unsubscribe;
    let tonConnectUI: import('@tonconnect/ui').TonConnectUI;

    onMount(() => {
        tonConnectUI = getTonConnectUI();

        if (tonConnectUI) {
            unsubscribe = tonConnectUI.onStatusChange(wallet => {
                if (wallet) {
                    const address = wallet.account.address;
                    connectedAddress = address;
                    gameStore.updateWalletAddress(address);
                } else {
                    connectedAddress = '';
                    gameStore.updateWalletAddress(null);
                }
            });

            if (tonConnectUI.wallet) {
                connectedAddress = tonConnectUI.wallet.account.address;
            }
        }
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    function handleConnectClick() {
        if (!tonConnectUI) return;

        if (tonConnectUI.connected) {
            tonConnectUI.disconnect();
        } else {
            tonConnectUI.openModal();
        }
    }

    function truncateAddress(address: string) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
</script>

<div class="account-card">
    <p class="label">TON Кошелёк</p>

    <button class="connect-button" on:click={handleConnectClick}>
        {#if connectedAddress}
            Отключить {truncateAddress(connectedAddress)}
        {:else}
            Подключить кошелёк
        {/if}
    </button>
</div>

<style>
    .account-card {
        background-color: #111827;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1.5rem;
        text-align: center;
    }
    .label {
        font-size: 0.9rem;
        color: #9ca3af;
        margin: 0 0 0.5rem 0;
    }
    .connect-button {
        background-color: #007aff;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 1rem;
        transition: background-color 0.2s;
    }
    .connect-button:hover {
        background-color: #005ecb;
    }
</style>