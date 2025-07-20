<script lang="ts">
    import { afterUpdate, onMount } from 'svelte';
    import { passiveIncomeTree, clickPowerTree } from '$lib/constants';
    import { gameStore } from '$lib/store';
    import UpgradeNode from './UpgradeNode.svelte';
    import UpgradeModal from './UpgradeModal.svelte';
    import type { UpgradeDefinition } from '$lib/types';

    let activeTree: 'passive' | 'click' = 'passive';
    let selectedNode: { nodeDef: UpgradeDefinition; treeId: string } | null = null;

    let nodeElements: { [key: string]: HTMLElement } = {};
    let lines: { id: string; d: string }[] = [];
    let containerElement: HTMLElement;

    const passiveTreeConnections = [
        { from: passiveIncomeTree.id, to: passiveIncomeTree.children[0].id },
        { from: passiveIncomeTree.id, to: passiveIncomeTree.children[1].id }
    ];

    function updateLines() {
        if (activeTree !== 'passive' || !containerElement) return;

        const newLines = [];
        const containerRect = containerElement.getBoundingClientRect();

        for (const connection of passiveTreeConnections) {
            const fromEl = nodeElements[connection.from];
            const toEl = nodeElements[connection.to];

            if (fromEl && toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                const from = {
                    x: fromRect.left - containerRect.left + fromRect.width / 2,
                    y: fromRect.top - containerRect.top + fromRect.height / 2
                };

                const to = {
                    x: toRect.left - containerRect.left + toRect.width / 2,
                    y: toRect.top - containerRect.top + toRect.height / 2
                };

                const controlPoint1 = { x: from.x, y: from.y + 60 };
                const controlPoint2 = { x: to.x, y: to.y - 60 };

                const pathD = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`;

                newLines.push({ id: `${connection.from}-${connection.to}`, d: pathD });
            }
        }
        lines = newLines;
    }

    onMount(() => {
        setTimeout(updateLines, 50);
    });

    afterUpdate(() => {
        setTimeout(updateLines, 50);
    });

    $: if (activeTree) {
        lines = [];
        setTimeout(updateLines, 50);
    }
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
        <button class="tab-button" class:active={activeTree === 'passive'} on:click={() => (activeTree = 'passive')}>
            Пассивный доход
        </button>
        <button class="tab-button" class:active={activeTree === 'click'} on:click={() => (activeTree = 'click')}>
            Сила клика
        </button>
    </div>

    <div class="tree-content" bind:this={containerElement}>
        {#if activeTree === 'passive'}
            <div class="grid-layout passive-tree">
                <svg class="lines-svg">
                    {#each lines as line (line.id)}
                        <path class="line" d={line.d} />
                    {/each}
                </svg>

                <div class="node-positioner" style="grid-area: 1 / 2;" bind:this={nodeElements[passiveIncomeTree.id]}>
                    <UpgradeNode
                            on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree, treeId: passiveIncomeTree.id })}
                            node={passiveIncomeTree}
                            treeId={passiveIncomeTree.id}
                    />
                </div>
                <div class="node-positioner" style="grid-area: 2 / 1;" bind:this={nodeElements[passiveIncomeTree.children[0].id]}>
                    <UpgradeNode
                            on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree.children[0], treeId: passiveIncomeTree.id })}
                            node={passiveIncomeTree.children[0]}
                            treeId={passiveIncomeTree.id}
                    />
                </div>
                <div class="node-positioner" style="grid-area: 2 / 3;" bind:this={nodeElements[passiveIncomeTree.children[1].id]}>
                    <UpgradeNode
                            on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree.children[1], treeId: passiveIncomeTree.id })}
                            node={passiveIncomeTree.children[1]}
                            treeId={passiveIncomeTree.id}
                    />
                </div>
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
        position: relative;
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
        gap: 20px 0;
    }
    .passive-tree {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: repeat(2, 140px);
    }
    .click-tree {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 140px);
    }
    .lines-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
    }
    .line {
        fill: none;
        stroke: var(--secondary-accent);
        stroke-width: 2.5px;
        opacity: 0.4;
        stroke-linecap: round;
    }
    .node-positioner {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>