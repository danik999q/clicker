<script>
    import { onMount } from 'svelte';
    import { gameStore } from '$lib/store.js';
    import { TonConnectUI } from '@tonconnect/ui';

    let connectedAddress = '';

    onMount(() => {
        const tonConnectUI = new TonConnectUI({
            manifestUrl: 'https://clicker-roan.vercel.app/tonconnect-manifest.json',
            buttonRootId: 'ton-connect-button-root'
        });

        tonConnectUI.onStatusChange(wallet => {
            if (wallet) {
                const address = wallet.account.address;
                connectedAddress = address;
                gameStore.updateWalletAddress(address);
            } else {
                connectedAddress = '';
                gameStore.updateWalletAddress(null);
            }
        });
    });

    function truncateAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
</script>

<div class="view-container">
    <h2>Личный кабинет</h2>

    <div class="account-card">
        <p class="label">Ваш игровой ID</p>
        <p class="value">{$gameStore.telegramId}</p>
    </div>

    <div class="account-card">
        <p class="label">TON Кошелёк</p>

        <div id="ton-connect-button-root"></div>

        {#if connectedAddress}
            <div class="wallet-info">
                <p class="label" style="margin-top: 1rem;">Привязанный адрес:</p>
                <p class="value connected">{truncateAddress(connectedAddress)}</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .view-container {
        width: 100%;
        padding: 1.5rem;
        box-sizing: border-box;
    }
    h2 { margin-top: 0; text-align: center; }
    .account-card {
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1.5rem;
        text-align: center;
    }
    .label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin: 0 0 0.5rem 0;
    }
    .value {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        word-break: break-all;
    }
    .value.connected {
        color: var(--primary-accent);
    }

    #ton-connect-button-root {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .wallet-info {
        border-top: 1px solid var(--border-color);
        margin-top: 1.5rem;
        padding-top: 1.5rem;
    }
</style>
