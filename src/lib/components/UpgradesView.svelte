<script lang="ts">
    import { META_UPGRADE_DEFINITIONS, ACHIEVEMENT_DEFINITIONS, PRESTIGE_THRESHOLD } from '$lib/constants';
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { calculateUpgradeCost } from '$lib/gameLogic';
    import UpgradeTree from './UpgradeTree.svelte';

    let activeTab = 'memes';

    function handlePrestige() {
        if (
            window.confirm(
                'Вы уверены, что хотите сбросить прогресс? Вы получите очки престижа, но все улучшения мемов и глобальные улучшения будут сброшены.'
            )
        ) {
            gameStore.prestigeReset();
            activeTab = 'memes';
        }
    }
</script>

<div class="view-container">
    <div class="tabs">
        <button class="tab-button" class:active={activeTab === 'memes'} on:click={() => (activeTab = 'memes')}>Мемы</button>
        <button class="tab-button" class:active={activeTab === 'global'} on:click={() => (activeTab = 'global')}>Улучшения</button>
        <button class="tab-button" class:active={activeTab === 'achievements'} on:click={() => (activeTab = 'achievements')}>
            Задания
        </button>
        {#if $gameStore.totalViews >= PRESTIGE_THRESHOLD / 10}
            <button class="tab-button prestige" class:active={activeTab === 'prestige'} on:click={() => (activeTab = 'prestige')}>
                Престиж 🧠
            </button>
        {/if}
    </div>

    <div class="buy-multiplier-toggle" class:hidden={activeTab !== 'memes'}>
        <span>x</span>
        <button class:active={$gameStore.buyMultiplier === 1} on:click={() => gameStore.setBuyMultiplier(1)}>1</button>
        <button class:active={$gameStore.buyMultiplier === 10} on:click={() => gameStore.setBuyMultiplier(10)}>10</button>
        <button class:active={$gameStore.buyMultiplier === 100} on:click={() => gameStore.setBuyMultiplier(100)}>100</button>
        <button class:active={$gameStore.buyMultiplier === -1} on:click={() => gameStore.setBuyMultiplier(-1)}>MAX</button>
    </div>

    <div id="upgrades-list">
        {#if activeTab === 'memes'}
            {#each $gameStore.memes as meme, index (meme.id)}
                {@const { totalCost, levelsToBuy } = calculateUpgradeCost($gameStore, meme.id, $gameStore.buyMultiplier)}
                {@const clickPower = (meme.baseViews * meme.level) * (1 + ($gameStore.rewardBonuses?.clickMultiplier || 0))}
                {@const passivePower = (meme.passiveViews * meme.level) * (1 + ($gameStore.rewardBonuses?.passiveMultiplier || 0))}

                {#if meme.isUnlocked}
                    <div class="upgrade-item" class:active={index === $gameStore.activeMemeIndex} on:click={() => gameStore.setActiveMeme(index)}>
                        <div class="upgrade-item-info">
                            <p class="item-name">{meme.name}</p>
                            <p class="item-stats">
                                Ур: {meme.level} | Клик: {formatNumber(clickPower)} | Пассивно: {formatNumber(passivePower)}/сек
                            </p>
                        </div>
                        <button
                                class="upgrade-button"
                                disabled={$gameStore.totalViews < totalCost || levelsToBuy === 0}
                                on:click|stopPropagation={() => gameStore.upgradeMeme(meme.id)}
                        >
                            LVL UP +{levelsToBuy}<span>({formatNumber(totalCost)})</span>
                        </button>
                    </div>
                {:else}
                    <div class="upgrade-item locked">
                        <div class="upgrade-item-info">
                            <p class="item-name">???</p>
                            <p class="item-stats">Мем заблокирован</p>
                        </div>
                        <button
                                class="unlock-button"
                                disabled={$gameStore.totalViews < meme.unlockCost}
                                on:click={() => gameStore.unlockMeme(meme.id)}
                        >
                            Открыть <span>({formatNumber(meme.unlockCost)})</span>
                        </button>
                    </div>
                {/if}
            {/each}
        {:else if activeTab === 'global'}
            <UpgradeTree />
        {:else if activeTab === 'achievements'}
            {#each ACHIEVEMENT_DEFINITIONS as achievement (achievement.id)}
                <div class="upgrade-item achievement" class:completed={$gameStore.achievementsProgress[achievement.id]}>
                    <div class="achievement-icon">
                        {#if $gameStore.achievementsProgress[achievement.id]}✓{:else}❓{/if}
                    </div>
                    <div class="upgrade-item-info">
                        <p class="item-name">{achievement.name}</p>
                        <p class="item-stats">{achievement.description}</p>
                    </div>
                    <div class="achievement-reward">
                        {achievement.rewardDescription}
                    </div>
                </div>
            {/each}
        {:else if activeTab === 'prestige'}
            <div class="prestige-info">
                <p>Текущая Эссенция Мемов: <strong>{$gameStore.prestigePoints}</strong> 🧠</p>
                <p>Даёт <strong>+{$gameStore.prestigePoints * 2}%</strong> ко всему доходу.</p>
                <hr />
                {#if $gameStore.totalViews >= PRESTIGE_THRESHOLD}
                    <p>При сбросе вы получите: <strong>{gameStore.calculatePrestigeGain($gameStore.totalViews)}</strong> 🧠</p>
                    <button class="prestige-button" on:click={handlePrestige}>Сбросить Прогресс</button>
                {:else}
                    <p>Для сброса необходимо: <strong>{formatNumber(PRESTIGE_THRESHOLD)}</strong> просмотров.</p>
                {/if}
            </div>
            {#each META_UPGRADE_DEFINITIONS as metaDef (metaDef.id)}
                {@const metaState = $gameStore.metaUpgrades.find((m) => m.id === metaDef.id)}
                {#if metaState}
                    <div class="upgrade-item" class:purchased={metaState.isPurchased}>
                        <div class="upgrade-item-info">
                            <p class="item-name">{metaDef.name}</p>
                            <p class="item-stats">{metaDef.description}</p>
                        </div>
                        <button
                                class="purchase-button"
                                disabled={metaState.isPurchased || $gameStore.prestigePoints < metaDef.cost}
                                on:click={() => gameStore.purchaseMetaUpgrade(metaDef.id)}
                        >
                            {#if metaState.isPurchased}
                                Куплено
                            {:else}
                                {metaDef.cost} 🧠
                            {/if}
                        </button>
                    </div>
                {/if}
            {/each}
        {/if}
    </div>
</div>

<style>
    .view-container {
        width: 100%;
        padding: 1.5rem;
        box-sizing: border-box;
    }
    .tabs {
        display: flex;
        gap: 0.5rem;
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
    .tab-button:not(.active):hover {
        color: var(--text-primary);
    }
    .buy-multiplier-toggle {
        display: flex;
        justify-content: center;
        background-color: #111827;
        border-radius: 8px;
        padding: 0.25rem;
        margin-bottom: 1.5rem;
        border: 1px solid var(--border-color);
        transition: opacity 0.2s ease, visibility 0.2s;
    }
    .buy-multiplier-toggle.hidden {
        opacity: 0;
        visibility: hidden;
        height: 0;
        margin-bottom: 0;
        overflow: hidden;
    }
    .buy-multiplier-toggle span {
        padding: 0.5rem;
        font-weight: 700;
        color: var(--text-secondary);
        align-self: center;
    }
    .buy-multiplier-toggle button {
        flex-grow: 1;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-weight: 700;
        padding: 0.5rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s;
    }
    .buy-multiplier-toggle button:hover {
        background-color: var(--surface-color);
    }
    .buy-multiplier-toggle button.active {
        background-color: var(--primary-accent);
        color: #064e3b;
    }
    #upgrades-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .upgrade-item {
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s;
    }
    .upgrade-item:hover {
        border-color: var(--primary-accent);
    }
    .upgrade-item.active {
        border-color: var(--primary-accent);
        background-color: #1f2b3a;
    }
    .upgrade-item.locked,
    .upgrade-item.purchased {
        background-color: transparent;
        opacity: 0.6;
    }
    .upgrade-item.locked:hover,
    .upgrade-item.purchased:hover {
        border-color: var(--border-color);
    }
    .upgrade-item-info {
        text-align: left;
        flex-grow: 1;
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
        flex-wrap: wrap;
    }
    .item-name {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text-primary);
        margin: 0;
    }
    .item-stats {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
    }
    .upgrade-button,
    .unlock-button,
    .purchase-button {
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease, opacity 0.2s ease;
        white-space: nowrap;
        flex-shrink: 0;
        margin-left: 1rem;
    }
    .upgrade-button {
        background-color: var(--primary-accent);
        color: #064e3b;
    }
    .upgrade-button:hover {
        background-color: #6ee7b7;
    }
    .unlock-button,
    .purchase-button {
        background-color: var(--secondary-accent);
    }
    .unlock-button:hover,
    .purchase-button:hover {
        background-color: #a78bfa;
    }
    .upgrade-button:disabled,
    .unlock-button:disabled,
    .purchase-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .upgrade-button span,
    .unlock-button span,
    .purchase-button span {
        font-weight: 400;
        opacity: 0.8;
    }
    .purchase-button[disabled] {
        background-color: var(--primary-accent);
        color: #064e3b;
        opacity: 0.6;
    }
    .tab-button.prestige {
        color: #f0abfc;
    }
    .tab-button.prestige.active {
        color: #f0abfc;
        border-bottom-color: #f0abfc;
    }
    .prestige-info {
        text-align: center;
        padding: 1rem;
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    .prestige-info p {
        margin: 0.5rem 0;
    }
    hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 1rem 0;
    }
    .prestige-button {
        background-color: #be185d;
        color: white;
        width: 100%;
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: 700;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .prestige-button:hover {
        background-color: #db2777;
    }
    .upgrade-item.achievement {
        cursor: default;
        gap: 1rem;
    }
    .upgrade-item.achievement:hover {
        border-color: var(--border-color);
        background-color: #111827;
    }
    .upgrade-item.achievement.completed {
        opacity: 0.6;
        border-color: var(--primary-accent);
    }
    .achievement-icon {
        font-size: 1.5rem;
    }
    .achievement-reward {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-accent);
        text-align: right;
        flex-shrink: 0;
    }
</style>