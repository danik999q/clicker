<script lang="ts">
    import { passiveIncomeTree, clickPowerTree } from '$lib/constants';
    import { gameStore } from '$lib/store';
    import UpgradeNode from './UpgradeNode.svelte';
    import UpgradeModal from './UpgradeModal.svelte';
    import type { UpgradeDefinition } from '$lib/types';

    let activeTree: 'passive' | 'click' = 'passive';
    let selectedNode: { nodeDef: UpgradeDefinition; treeId: string } | null = null;
</script>

{#if selectedNode}
    <UpgradeModal
            node={selectedNode.nodeDef}
            treeId={selectedNode.treeId}
            currentLevel={$gameStore.upgradeTrees[selectedNode.treeId]?.[selectedNode.nodeDef.id]?.level ?? 0}
            on:close={() => (selectedNode = null)}
    />
{/if}

<div class="trees-container">
    <div class="tabs">
        <button
                class="tab-button"
                class:active={activeTree === 'passive'}
                on:click={() => (activeTree = 'passive')}
        >
            Пассивный доход
        </button>
        <button
                class="tab-button"
                class:active={activeTree === 'click'}
                on:click={() => (activeTree = 'click')}
        >
            Сила клика
        </button>
    </div>

    <div class="tree-content">
        {#if activeTree === 'passive'}
            <div class="grid-layout passive-tree">
                <UpgradeNode
                        on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree, treeId: passiveIncomeTree.id })}
                        node={passiveIncomeTree}
                        treeId={passiveIncomeTree.id}
                        gridPosition="1 / 2"
                />
                <UpgradeNode
                        on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree.children[0], treeId: passiveIncomeTree.id })}
                        node={passiveIncomeTree.children[0]}
                        treeId={passiveIncomeTree.id}
                        gridPosition="2 / 1"
                />
                <UpgradeNode
                        on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree.children[1], treeId: passiveIncomeTree.id })}
                        node={passiveIncomeTree.children[1]}
                        treeId={passiveIncomeTree.id}
                        gridPosition="2 / 3"
                />
            </div>
        {:else if activeTree === 'click'}
            <div class="grid-layout click-tree">
                <UpgradeNode
                        on:openModal={() => (selectedNode = { nodeDef: clickPowerTree, treeId: clickPowerTree.id })}
                        node={clickPowerTree}
                        treeId={clickPowerTree.id}
                        gridPosition="1 / 1"
                />
            </div>
        {/if}
    </div>
</div>

<style>
    .trees-container {
        width: 100%;
        max-width: 900px;
        padding: 20px 0;
    }
    .tabs {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    .tab-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        position: relative;
        top: 1px;
        transition: color 0.2s ease;
    }
    .tab-button.active {
        color: var(--primary-accent);
        border-bottom: 2px solid var(--primary-accent);
    }
    .tree-content {
        padding: 40px 20px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: rgba(0, 0, 0, 0.2);
        min-height: 400px;
    }
    .grid-layout {
        display: grid;
        position: relative;
        align-items: center;
        justify-items: center;
    }
    .passive-tree {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: repeat(3, 140px);
    }
    .click-tree {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 140px);
    }
    .grid-layout :global(.node-wrapper)::before,
    .grid-layout :global(.node-wrapper)::after {
        content: '';
        position: absolute;
        background-color: var(--secondary-accent);
        opacity: 0.5;
        z-index: -1;
    }
    .passive-tree :global(.node-wrapper[style="grid-area: 1 / 2;"])::after {
        width: 2px;
        height: 70px;
        top: 100%;
        left: 50%;
        transform: translate(-50%, -20px);
    }
    .passive-tree :global(.node-wrapper[style="grid-area: 2 / 1;"])::before,
    .passive-tree :global(.node-wrapper[style="grid-area: 2 / 3;"])::before {
        width: 2px;
        height: 70px;
        bottom: 100%;
        left: 50%;
        transform: translate(-50%, 20px);
    }
    .passive-tree :global(.node-wrapper[style="grid-area: 2 / 1;"])::after {
        width: 100%;
        height: 2px;
        top: -20%;
        left: 50%;
    }
    .click-tree :global(.node-wrapper:not(:last-child))::after {
        width: 2px;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translateX(-50%);
    }
</style>
