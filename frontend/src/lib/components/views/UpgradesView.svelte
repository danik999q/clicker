<script lang="ts">
    import { META_UPGRADE_DEFINITIONS, ACHIEVEMENT_DEFINITIONS, PRESTIGE_THRESHOLD } from '$lib/constants';
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { calculateUpgradeCost } from '$lib/gameLogic';
    import UpgradeTree from '../features/upgrades/UpgradeTree.svelte';
    import Header from '../ui/Header.svelte';
    import PrestigeView from './PrestigeView.svelte';
    import { calculatePassiveIncome } from '$lib/gameLogic';
    $: passiveIncome = calculatePassiveIncome($gameStore);
    

    let activeTab = 'memes';

    function handleKeyboardClick(event: KeyboardEvent, action: () => void) {
        if (event.key === 'Enter' || event.key === ' ') {
            action();
        }
    }
</script>

<div class="view-container">
    <!-- <Header /> -->
    <div class="total-views">🎥 {formatNumber($gameStore.totalViews)}</div>
    <div class="content-area">
        <div class="tabs">
            <button class="tab-button" class:active={activeTab === 'memes'} on:click={() => (activeTab = 'memes')}>Мемы</button>
            <button class="tab-button" class:active={activeTab === 'global'} on:click={() => (activeTab = 'global')}>Улучшения</button>
            <button class="tab-button" class:active={activeTab === 'achievements'} on:click={() => (activeTab = 'achievements')}>Задания</button>
            {#if $gameStore.totalViews >= PRESTIGE_THRESHOLD / 10 || $gameStore.prestigePoints > 0}
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

        <div id="tab-content">
            {#if activeTab === 'memes'}
                {#each $gameStore.memes as meme, index (meme.id)}
                    {@const { totalCost, levelsToBuy } = calculateUpgradeCost($gameStore, meme.id, $gameStore.buyMultiplier)}
                    {@const clickPower = (meme.baseViews * meme.level) * (1 + ($gameStore.rewardBonuses?.clickMultiplier || 0))}
                    {@const passivePower = (meme.passiveViews * meme.level) * (1 + ($gameStore.rewardBonuses?.passiveMultiplier || 0))}

                    {#if meme.isUnlocked}
                        <div
                                class="upgrade-item"
                                class:active={index === $gameStore.activeMemeIndex}
                                on:click={() => gameStore.setActiveMeme(index)}
                                on:keydown={(e) => handleKeyboardClick(e, () => gameStore.setActiveMeme(index))}
                                role="button"
                                tabindex="0"
                        >
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
                                <span class="button-text">LVL UP +{levelsToBuy}</span>
                                <span class="button-cost">({formatNumber(totalCost)})</span>
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
                                <span class="button-text">Открыть</span>
                                <span class="button-cost">({formatNumber(meme.unlockCost)})</span>
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
                <PrestigeView />
            {/if}
        </div>
    </div>
</div>

<style>
    .view-container, .content-area, #tab-content {
        display: flex;
        overflow-x: hidden;
        flex-direction: column;
        flex-grow: 1;
    }
    .content-area {
        padding: 0 1.5rem 1.5rem;
        overflow-y: auto;
    }
    .tabs {
        display: flex;
        max-width: 100%;
        overflow: hidden;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    .tab-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.5rem 0.6rem;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
    }
    .tab-button.active {
        color: var(--primary-accent);
        border-bottom: 2px solid var(--primary-accent);
    }
    .buy-multiplier-toggle {
        display: flex;
        justify-content: center;
        background-color: var(--surface-color);
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
    }
    .buy-multiplier-toggle button:hover {
        background-color: #30363d;
    }
    .buy-multiplier-toggle button.active {
        background-color: var(--primary-accent);
        color: #0d1117;
    }
    #tab-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .upgrade-item {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }
    .upgrade-item.active {
        border-color: var(--primary-accent);
        background-color: #f189ff;
    }
    .upgrade-item.locked,
    .upgrade-item.purchased {
        opacity: 0.6;
    }
    .upgrade-item-info {
        text-align: left;
        flex-grow: 1;
        margin-right: 1rem;
    }
    .item-name {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text-third);
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
        color: #0d1117;
        width: 140px;
        border: none;
        padding: 0.5rem 0.8rem;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.2;
    }
    .button-text {
        font-size: 0.9rem;
    }
    .button-cost {
        font-size: 0.75rem;
        opacity: 0.8;
    }
    .upgrade-button {
        background-color: var(--primary-accent);
    }
    .unlock-button,
    .purchase-button {
        background-color: var(--secondary-accent);
    }
    .upgrade-button:disabled,
    .unlock-button:disabled,
    .purchase-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .tab-button.prestige {
        color: #f0abfc;
    }
    .tab-button.prestige.active {
        border-bottom-color: #f0abfc;
    }
    .achievement {
        cursor: default;
    }
    .achievement-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
    }
    .achievement-reward {
        padding-left: 5px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary-accent);
        text-align: right;
        flex-shrink: 0;
    }
    @media(max-width: 410px) {
        .achievement-icon {
            font-size: 1.3rem;
            margin-right: 0.8rem;
        }
        .achievement-reward {
            max-width: 120px;
            text-align: center;
        }
        .tab-button {
            padding: 0.5rem 0.45rem;
        }
        @media(max-width: 360px) {
            .item-stats {
                font-size: 0.7rem;
            }
            .achievement-icon {
                font-size: 1.2rem;
                margin-right: 0.6rem;
            }
            .achievement-reward {
                max-width: 110px;
                text-align: center;
            }
            .tab-button {
                padding: 0.5rem 0.45rem;
            }
            .tab-button {
                font-size: 0.8rem;
                padding: 0.5rem, 0.35rem;
            }
        }
    }
    
    .total-views {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        width: fit-content;
        font-size: 0.9rem;
        color: #090c12;
        font-weight: 600;
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 15px;
        padding: 0.5rem 0.5rem;
        margin: 1.5rem;
    }
    
</style>
