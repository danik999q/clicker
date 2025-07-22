<script lang="ts">
    import { META_UPGRADE_DEFINITIONS, ACHIEVEMENT_DEFINITIONS, PRESTIGE_THRESHOLD } from '$lib/constants';
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { calculateUpgradeCost } from '$lib/gameLogic';
    import UpgradeTree from '../features/upgrades/UpgradeTree.svelte';
    import PrestigeView from './PrestigeView.svelte';

    let activeTab = 'memes';
</script>

<div class="flex flex-col h-full p-4 gap-4">
    <div class="flex-shrink-0 w-full bg-surface rounded-xl p-1 flex justify-around">
        <button class="tab-button" class:active={activeTab === 'memes'} on:click={() => (activeTab = 'memes')}>
            Мемы
        </button>
        <button class="tab-button" class:active={activeTab === 'global'} on:click={() => (activeTab = 'global')}>
            Улучшения
        </button>
        <button class="tab-button" class:active={activeTab === 'achievements'} on:click={() => (activeTab = 'achievements')}>
            Задания
        </button>
        {#if $gameStore.totalViews >= PRESTIGE_THRESHOLD / 10 || $gameStore.prestigePoints > 0}
            <button class="tab-button prestige" class:active={activeTab === 'prestige'} on:click={() => (activeTab = 'prestige')}>
                🧠 Престиж
            </button>
        {/if}
    </div>

    <div class="flex-grow flex flex-col gap-3 overflow-y-auto pr-2">
        {#if activeTab === 'memes'}
            <div class="flex-shrink-0 flex items-center justify-center bg-surface rounded-lg p-1 mb-2 border border-border">
                <span class="px-3 font-bold text-text-secondary text-sm">x</span>
                <div class="multiplier-toggle">
                    <button class:active={$gameStore.buyMultiplier === 1} on:click={() => gameStore.setBuyMultiplier(1)}>1</button>
                    <button class:active={$gameStore.buyMultiplier === 10} on:click={() => gameStore.setBuyMultiplier(10)}>10</button>
                    <button class:active={$gameStore.buyMultiplier === 100} on:click={() => gameStore.setBuyMultiplier(100)}>100</button>
                    <button class:active={$gameStore.buyMultiplier === -1} on:click={() => gameStore.setBuyMultiplier(-1)}>MAX</button>
                </div>
            </div>

            {#each $gameStore.memes as meme, index (meme.id)}
                {@const { totalCost, levelsToBuy } = calculateUpgradeCost($gameStore, meme.id, $gameStore.buyMultiplier)}
                {@const passivePower = meme.passiveViews * meme.level}

                {#if meme.isUnlocked}
                    <div
                            class="item-card"
                            class:active={$gameStore.activeMemeIndex === index}
                            on:click={() => gameStore.setActiveMeme(index)}
                            role="button"
                            tabindex="0"
                    >
                        <img src={meme.imageUrl} alt={meme.name} class="w-14 h-14 rounded-lg object-cover mr-4" />
                        <div class="flex-grow">
                            <p class="font-bold text-base text-text-primary">{meme.name}</p>
                            <p class="text-xs text-text-secondary">
                                Уровень: {meme.level} | Пассивно: {formatNumber(passivePower)}/сек
                            </p>
                        </div>
                        <button
                                class="upgrade-button"
                                disabled={$gameStore.totalViews < totalCost || levelsToBuy === 0}
                                on:click|stopPropagation={() => gameStore.upgradeMeme(meme.id)}
                        >
                            <span class="text-sm font-bold">LVL +{levelsToBuy}</span>
                            <span class="text-xs opacity-80">{formatNumber(totalCost)}</span>
                        </button>
                    </div>
                {:else}
                    <div class="item-card locked">
                        <div class="w-14 h-14 rounded-lg bg-black/30 flex items-center justify-center mr-4 text-2xl">?</div>
                        <div class="flex-grow">
                            <p class="font-bold text-base text-text-primary">Неизвестный мем</p>
                            <p class="text-xs text-text-secondary">Заблокировано</p>
                        </div>
                        <button
                                class="upgrade-button unlock"
                                disabled={$gameStore.totalViews < meme.unlockCost}
                                on:click={() => gameStore.unlockMeme(meme.id)}
                        >
                            <span class="text-sm font-bold">Открыть</span>
                            <span class="text-xs opacity-80">{formatNumber(meme.unlockCost)}</span>
                        </button>
                    </div>
                {/if}
            {/each}
        {:else if activeTab === 'global'}
            <UpgradeTree />
        {:else if activeTab === 'achievements'}
            {#each ACHIEVEMENT_DEFINITIONS as achievement (achievement.id)}
                <div class="item-card" class:unlocked={$gameStore.achievementsProgress[achievement.id]}>
                    <div class="text-3xl mr-4">
                        {#if $gameStore.achievementsProgress[achievement.id]}🏆{:else}❓{/if}
                    </div>
                    <div class="flex-grow">
                        <p class="font-bold text-base text-text-primary">{achievement.name}</p>
                        <p class="text-xs text-text-secondary">{achievement.description}</p>
                    </div>
                    <div class="text-xs font-bold text-primary text-right pl-2">
                        {achievement.rewardDescription}
                    </div>
                </div>
            {/each}
        {:else if activeTab === 'prestige'}
            <PrestigeView />
        {/if}
    </div>
</div>

<style>
    .tab-button {
        @apply flex-1 px-3 py-2 text-sm font-semibold text-text-secondary rounded-lg transition-colors;
    }
    .tab-button.active {
        @apply bg-primary/20 text-primary;
    }
    .tab-button.prestige.active {
        @apply bg-secondary/20 text-secondary;
    }
    .multiplier-toggle {
        @apply flex-grow grid grid-cols-4 gap-1;
    }
    .multiplier-toggle button {
        @apply px-4 py-1.5 text-sm font-bold text-text-secondary rounded-md transition-colors hover:bg-white/10;
    }
    .multiplier-toggle button.active {
        @apply bg-primary text-emerald-950;
    }
    .item-card {
        @apply bg-surface border border-transparent rounded-xl p-3 flex items-center transition-all duration-200 cursor-pointer;
    }
    .item-card.active {
        @apply border-primary bg-primary/10;
        transform: scale(1.02);
    }
    .item-card.locked {
        @apply opacity-60;
    }
    .item-card.unlocked {
        @apply border-primary/30;
    }
    .upgrade-button {
        @apply w-28 flex-shrink-0 bg-primary text-emerald-950 border-none p-2 rounded-lg flex flex-col items-center justify-center leading-tight transition-all;
    }
    .upgrade-button.unlock {
        @apply bg-secondary text-violet-950;
    }
    .upgrade-button:disabled {
        @apply opacity-40 cursor-not-allowed bg-gray-600 text-gray-400;
    }
    .upgrade-button:hover:not(:disabled) {
        @apply brightness-110;
    }
</style>