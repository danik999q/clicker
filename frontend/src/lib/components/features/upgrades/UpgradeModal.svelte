<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { UPGRADE_NODE_COST_RATIO } from '$lib/constants';
    import type { UpgradeDefinition } from '$lib/types';

    export let node: UpgradeDefinition;
    export let treeId: string;
    export let currentLevel: number;

    const dispatch = createEventDispatcher();

    const costForNextLevel = Math.floor(node.cost * Math.pow(UPGRADE_NODE_COST_RATIO, currentLevel));
    const isMaxLevel = currentLevel >= node.maxLevel;
    const canAfford = $gameStore.totalViews >= costForNextLevel;

    function handlePurchase() {
        gameStore.purchaseUpgrade(treeId, node.id);
    }
</script>

<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-content" on:click|stopPropagation>
        <button class="close-button" on:click={() => dispatch('close')}>&times;</button>
        <h2>{node.name}</h2>
        <p class="description">{node.description}</p>

        <div class="level-info">
            Уровень: <strong>{currentLevel} / {node.maxLevel}</strong>
        </div>

        <div class="effects-grid">
            <div class="effect-item">
                <span class="label">Текущий бонус</span>
                <span class="value">+{Math.round(node.effect.value * currentLevel * 100)}%</span>
            </div>
            {#if !isMaxLevel}
                <div class="effect-item next-level">
                    <span class="label">Бонус след. уровня</span>
                    <span class="value">+{Math.round(node.effect.value * (currentLevel + 1) * 100)}%</span>
                </div>
            {/if}
        </div>

        {#if !isMaxLevel}
            <button class="purchase-button" disabled={!canAfford} on:click={handlePurchase}>
                Улучшить за {formatNumber(costForNextLevel)}
            </button>
        {:else}
            <p class="max-level-text">Максимальный уровень достигнут</p>
        {/if}
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        -webkit-backdrop-filter: blur(4px);
        backdrop-filter: blur(4px);
    }
    .modal-content {
        margin: 0 10px;
        position: relative;
        background-color: var(--surface-color);
        color: var(--text-primary);
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid var(--border-color);
        text-align: center;
        width: 90%;
        max-width: 400px;
        animation: fade-in 0.3s ease-out;
    }
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    .close-button {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--text-secondary);
        cursor: pointer;
    }
    h2 {
        margin-top: 0;
        font-size: 1.5rem;
    }
    .description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0.5rem 0 1.5rem 0;
    }
    .level-info {
        background-color: rgba(0,0,0,0.2);
        padding: 0.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }
    .effects-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    .effect-item .label {
        display: block;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    .effect-item .value {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    .effect-item.next-level .value {
        color: var(--primary-accent);
    }
    .purchase-button {
        background-color: var(--primary-accent);
        color: #064e3b;
        font-weight: 700;
        border: none;
        padding: 1rem;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        font-size: 1.1rem;
        transition: background-color 0.2s ease;
    }
    .purchase-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .purchase-button:hover:not(:disabled) {
        background-color: #6ee7b7;
    }
    .max-level-text {
        color: var(--secondary-accent);
        font-weight: 700;
        padding: 1rem;
        border: 1px dashed var(--secondary-accent);
        border-radius: 8px;
    }
</style>