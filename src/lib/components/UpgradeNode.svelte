<script lang="ts">
    import { gameStore } from '$lib/store';
    import type { UpgradeDefinition } from '$lib/types';
    import { formatNumber } from '$lib/utils';

    export let node: UpgradeDefinition;
    export let treeId: string;
    export let parentPurchased = false;

    $: nodeState = $gameStore.upgradeTrees[treeId]?.[node.id];
    $: isPurchased = nodeState?.isPurchased ?? false;
    $: canAfford = $gameStore.totalViews >= node.cost;

    $: canPurchase = parentPurchased && canAfford && !isPurchased;

    function handlePurchase() {
        if (canPurchase) {
            gameStore.purchaseUpgrade(treeId, node.id);
        }
    }
</script>

<div class="node-container">
    <div class="node" class:purchased={isPurchased} class:available={canPurchase} class:locked={!parentPurchased}>
        <button on:click={handlePurchase} disabled={!canPurchase} title={node.description}>
            <span class="name">{node.name}</span>
            <span class="cost">{formatNumber(node.cost)} просмотров</span>
        </button>
    </div>

    {#if isPurchased && node.children.length > 0}
        <div class="children">
            {#each node.children as childNode}
                <svelte:self node={childNode} treeId={treeId} parentPurchased={isPurchased} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .node-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 10px 0;
    }
    .node button {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        width: 200px;
        text-align: center;
        transition: all 0.2s ease;
    }
    .node.locked button {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .node.available button {
        border-color: var(--primary-accent);
        color: var(--text-primary);
        cursor: pointer;
    }
    .node.available button:hover {
        background-color: var(--primary-accent);
        color: black;
    }
    .node.purchased button {
        background-color: var(--secondary-accent);
        border-color: var(--secondary-accent);
        color: black;
        cursor: default;
    }
    .name {
        font-weight: bold;
        display: block;
    }
    .cost {
        font-size: 0.8em;
        display: block;
        margin-top: 5px;
    }
    .children {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
        padding-left: 20px;
        position: relative;
    }
    .node-container:not(:first-child)::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        width: 2px;
        height: 10px;
        background: var(--border-color);
    }
    .children::before {
        content: '';
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 20px;
        background: var(--border-color);
    }
</style>