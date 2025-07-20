<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { gameStore } from '$lib/store';
    import type { UpgradeDefinition } from '$lib/types';
    import { UPGRADE_NODE_COST_RATIO } from '$lib/constants';

    export let node: UpgradeDefinition;
    export let treeId: string;
    export let gridPosition: string;

    const dispatch = createEventDispatcher();

    $: nodeState = $gameStore.upgradeTrees[treeId]?.[node.id];
    $: level = nodeState?.level ?? 0;
    $: isMaxLevel = level >= node.maxLevel;

    $: costForNextLevel = Math.floor(node.cost * Math.pow(UPGRADE_NODE_COST_RATIO, level));
    $: canAfford = $gameStore.totalViews >= costForNextLevel;

    $: arePrerequisitesMet = node.prerequisites.every(
        (prereqId) => ($gameStore.upgradeTrees[treeId]?.[prereqId]?.level || 0) > 0
    );
    $: canPurchase = arePrerequisitesMet && canAfford && !isMaxLevel;
</script>

<div class="node-wrapper" style="grid-area: {gridPosition};">
    <div class="node" class:maxed={isMaxLevel} class:available={canPurchase} class:locked={!arePrerequisitesMet}>
        <button on:click={() => dispatch('openModal')} title={node.description}>
            <div class="icon-placeholder">
            </div>
            <span class="name">{node.name}</span>
            <span class="level-display">{level} / {node.maxLevel}</span>
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
        justify-content: space-between;
        width: 90px;
        min-height: 90px;
        padding: 8px 5px;
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
        font-size: 0.75em;
        font-weight: bold;
        color: var(--text-primary);
        text-align: center;
        line-height: 1.1;
    }
    .level-display {
        font-size: 0.8em;
        font-weight: bold;
        color: var(--primary-accent);
        margin-top: 4px;
    }
    .node.available button {
        border-color: var(--primary-accent);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    .node.maxed button {
        border-color: var(--secondary-accent);
    }
    .node.locked button {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>