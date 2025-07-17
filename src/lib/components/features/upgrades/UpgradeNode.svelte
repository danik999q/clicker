<script lang="ts">
    import { gameStore } from '$lib/store';
    import type { UpgradeDefinition } from '$lib/types';
    import { formatNumber } from '$lib/utils';

    export let node: UpgradeDefinition;
    export let treeId: string;
    export let gridPosition: string;

    $: nodeState = $gameStore.upgradeTrees[treeId]?.[node.id];
    $: isPurchased = nodeState?.isPurchased ?? false;
    $: canAfford = $gameStore.totalViews >= node.cost;

    $: arePrerequisitesMet = node.prerequisites.every(
        prereqId => $gameStore.upgradeTrees[treeId]?.[prereqId]?.isPurchased
    );

    $: canPurchase = arePrerequisitesMet && canAfford && !isPurchased;

    function handlePurchase() {
        if (canPurchase) {
            gameStore.purchaseUpgrade(treeId, node.id);
        }
    }
</script>

<div class="node-wrapper" style="grid-area: {gridPosition};">
    <div class="node" class:purchased={isPurchased} class:available={canPurchase} class:locked={!arePrerequisitesMet}>
        <button on:click={handlePurchase} disabled={!canPurchase} title={node.description}>
            <div class="icon-placeholder"></div>
            <span class="name">{node.name}</span>
            {#if !isPurchased}
                <span class="cost">{formatNumber(node.cost)}</span>
            {:else}
                <span class="status">MAX</span>
            {/if}
        </button>
    </div>
</div>

<style>
    .node-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .node button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 90px;
        height: 90px;
        padding: 5px;
        border-radius: 12px;
        border: 2px solid var(--border-color);
        background-color: var(--surface-color);
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }
    .icon-placeholder {
        width: 40px;
        height: 40px;
        background-color: #333;
        border-radius: 8px;
        margin-bottom: 5px;
    }
    .name {
        font-size: 0.8em;
        font-weight: bold;
        color: var(--text-primary);
        text-align: center;
    }
    .cost, .status {
        font-size: 0.7em;
        color: var(--text-secondary);
    }
    .status {
        color: #a78bfa;
        font-weight: bold;
    }
    .node.available button {
        border-color: var(--primary-accent);
        box-shadow: 0 0 10px var(--primary-accent);
    }
    .node.purchased button {
        border-color: var(--secondary-accent);
    }
    .node.locked button {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>