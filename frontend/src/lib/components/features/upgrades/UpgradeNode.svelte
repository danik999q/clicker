<script lang="ts">
    import { gameStore } from '$lib/store';
    import type { UpgradeDefinition } from '$lib/types';
    import { formatNumber } from '$lib/utils';
    import { UPGRADE_NODE_COST_RATIO } from '$lib/constants';

    export let node: UpgradeDefinition;
    export let treeId: string;
    export let gridPosition: string;

    $: nodeState = $gameStore.upgradeTrees[treeId]?.[node.id];
    $: level = nodeState?.level ?? 0;
    $: isMaxLevel = level >= node.maxLevel;

    $: costForNextLevel = Math.floor(node.cost * Math.pow(UPGRADE_NODE_COST_RATIO, level));
    $: canAfford = $gameStore.totalViews >= costForNextLevel;

    $: arePrerequisitesMet = node.prerequisites.every(
        prereqId => ($gameStore.upgradeTrees[treeId]?.[prereqId]?.level || 0) > 0
    );
    $: canPurchase = arePrerequisitesMet && canAfford && !isMaxLevel;
</script>

<div class="node-wrapper" style="grid-area: {gridPosition};">
    <div class="node" class:maxed={isMaxLevel} class:available={canPurchase} class:locked={!arePrerequisitesMet}>
        <button on:click title={node.description}>
            <div class="icon-placeholder">
            </div>
            <span class="name">{node.name}</span>
            <span class="level-display">{level} / {node.maxLevel}</span>
        </button>
    </div>
</div>

<style>
    .level-display {
        font-size: 0.8em;
        font-weight: bold;
        color: var(--primary-accent);
        background-color: rgba(0,0,0,0.3);
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
    }
    .node.maxed button {
        border-color: var(--secondary-accent);
    }
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
        min-height: 90px;
        padding: 5px;
        border-radius: 12px;
        border: 2px solid var(--border-color);
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }
    .icon-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
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
