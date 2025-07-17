<script lang="ts">
    import { passiveIncomeTree, clickPowerTree } from '$lib/constants';
    import UpgradeNode from './UpgradeNode.svelte';
</script>

<div class="trees-container">
    <h2>Дерево улучшений</h2>
    <div class="tree">
        <h3>Пассивный доход</h3>
        <UpgradeNode node={passiveIncomeTree} treeId={passiveIncomeTree.id} parentPurchased={true} />
    </div>
    <div class="tree">
        <h3>Сила клика</h3>
        <UpgradeNode node={clickPowerTree} treeId={clickPowerTree.id} parentPurchased={true} />
    </div>
</div>

<style>
    .trees-container {
        width: 100%;
        max-width: 900px;
        overflow-x: auto;
        padding: 20px;
    }
    h2, h3 {
        text-align: center;
    }
    .tree {
        margin-bottom: 40px;
        padding: 20px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: rgba(0, 0, 0, 0.2);
    }
</style>