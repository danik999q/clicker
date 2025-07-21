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
        <button class="tab-button" class:active={activeTree === 'passive'} on:click={() => (activeTree = 'passive')}>
            Пассивный доход
        </button>
        <button class="tab-button" class:active={activeTree === 'click'} on:click={() => (activeTree = 'click')}>
            Сила клика
        </button>
    </div>

    <div class="tree-content">
        {#if activeTree === 'passive'}
            <div class="container">
                <div class="mid_map">
                    <UpgradeNode
                            on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree, treeId: passiveIncomeTree.id })}
                            node={passiveIncomeTree}
                            treeId={passiveIncomeTree.id}
                            gridPosition="1 / 2"
                    />
                    <div class="palka"></div>
                    <div class="brevno"></div>
                </div>
                <div class="two_map">
                    <div class="block_palka">
                        <div class="palka"></div>
                        <UpgradeNode
                                on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree, treeId: passiveIncomeTree.id })}
                                node={passiveIncomeTree}
                                treeId={passiveIncomeTree.id}
                                gridPosition="1 / 2"
                        />
                        <div class="palka"></div>
                    </div>
                    <div class="block_palka">
                        <div class="palka"></div>
                        <UpgradeNode
                                on:openModal={() => (selectedNode = { nodeDef: passiveIncomeTree, treeId: passiveIncomeTree.id })}
                                node={passiveIncomeTree}
                                treeId={passiveIncomeTree.id}
                                gridPosition="1 / 2"
                        />
                        <div class="palka"></div>
                    </div>
                </div>
                <div class="brevno"></div>
                <div class="mid_map">
                    <div class="palka"></div>
                    <div class="block"></div>
                    <div class="palka"></div>
                    <div class="brevno"></div>
                </div>
                <div class="two_map">
                    <div class="block_palka">
                        <div class="palka"></div>
                        <div class="block"></div>
                        <div class="palka"></div>
                    </div>
                    <div class="block_palka">
                        <div class="palka"></div>
                        <div class="block"></div>
                        <div class="palka"></div>
                    </div>
                </div>
                <div class="brevno"></div>
                <div class="mid_map">
                    <div class="palka"></div>
                    <div class="block"></div>
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
        padding: 40px 20px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: rgba(0, 0, 0, 0.2);
        min-height: 400px;
    }
    .grid-layout {
        display: grid;
        align-items: center;
        justify-items: center;
    }

    .grid-layout > div {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .passive-tree {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: repeat(3, 140px);
        gap: 20px 0;
    }

    .click-tree {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 140px);
        gap: 20px 0;
    }

    .grid-layout > div::before,
    .grid-layout > div::after {
        content: '';
        position: absolute;
        background-color: var(--secondary-accent);
        opacity: 0.5;
        z-index: -1;
    }

    .passive-tree > div[style='grid-area: 1 / 2;']::after {
        width: 2px;
        height: 70px;
        top: 100%;
        left: 50%;
        transform: translate(-50%, -20px);
    }

    .passive-tree::before {
        content: '';
        position: absolute;
        grid-row: 2;
        grid-column: 1 / span 3;
        height: 2px;
        background-color: var(--secondary-accent);
        opacity: 0.5;
        z-index: -1;
        align-self: start;
        transform: translateY(-10px);
    }

    .passive-tree > div[style='grid-area: 2 / 1;']::before,
    .passive-tree > div[style='grid-area: 2 / 3;']::before {
        width: 2px;
        height: 70px;
        bottom: 100%;
        left: 50%;
        transform: translate(-50%, 20px);
    }

    .click-tree > div:not(:last-child)::after {
        width: 2px;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translateX(-50%);
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        margin-top: 10px;
        max-width: 100%;
        padding: 10px;
    }
    .palka {
        width: 5px;
        height: 30px;
        background-color: blueviolet;
    }
    .brevno {
        height: 5px;
        width: 210px;
        background-color: blueviolet;
    }
    .mid_map {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .block {
        width: 90px;
        height: 100px;
        background-color: palevioletred;
        border-radius: 15px;
    }

    .block_palka {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .two_map {
        display: flex;
        flex-direction: row;
        justify-content:center;
        column-gap: 115px;
    }

    @media(max-width: 389px) {
        .brevno {
            width: 190px;
        }
        .two_map {
            column-gap: 95px;
        }
    }
    @media(max-width: 359px) {
        .brevno {
            width: 170px;
        }
        .two_map {
            column-gap: 75px;
        }
    }
</style>