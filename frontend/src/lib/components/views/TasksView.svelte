<script lang="ts">
    import { gameStore } from '$lib/store';
    import { GameService } from '$lib/gameService';
    import { formatNumber } from '$lib/utils';
    import { ACHIEVEMENT_DEFINITIONS, DAILY_QUEST_DEFINITIONS } from '$lib/constants';

    let activeTab: 'daily' | 'achievements' = 'daily';
</script>

<div class="view-container">
    <div class="tabs">
        <button class="tab-button" class:active={activeTab === 'daily'} on:click={() => (activeTab = 'daily')}>Ежедневные</button>
        <button class="tab-button" class:active={activeTab === 'achievements'} on:click={() => (activeTab = 'achievements')}>Достижения</button>
    </div>

    <div class="content-area">
        {#if activeTab === 'daily'}
            <div class="quest-list">
                <h2>Ежедневные задания</h2>
                <p class="description">Выполняйте задания каждый день, чтобы получить ценные награды!</p>
                {#if $gameStore.daily.quests.length === 0}
                    <p class="no-quests">Новые задания появятся завтра.</p>
                {:else}
                    {#each $gameStore.daily.quests as quest (quest.id)}
                        {@const questDef = DAILY_QUEST_DEFINITIONS.find((d) => d.id === quest.id)}
                        {#if questDef}
                            <div class="card" class:completed={quest.isCompleted && quest.isClaimed}>
                                <div class="card-info">
                                    <p class="name">{questDef.name}</p>
                                    <p class="desc">{questDef.description}</p>
                                    <progress value={quest.progress || 0} max={questDef.target} />
                                    <p class="progress-text">{formatNumber(quest.progress || 0)} / {formatNumber(questDef.target)}</p>
                                </div>
                                <button class="claim-button" disabled={!quest.isCompleted || quest.isClaimed} on:click={() => GameService.claimDailyReward(quest.id)}>
                                    {#if quest.isClaimed}
                                        Получено
                                    {:else if quest.isCompleted}
                                        Забрать
                                    {:else}
                                        {questDef.reward.value} 🧠
                                    {/if}
                                </button>
                            </div>
                        {/if}
                    {/each}
                {/if}
            </div>
        {:else if activeTab === 'achievements'}
            <div class="achievement-list">
                 <h2>Достижения</h2>
                <p class="description">Выполняйте долгосрочные цели для получения постоянных бонусов.</p>
                {#each ACHIEVEMENT_DEFINITIONS as achievement (achievement.id)}
                    <div class="card achievement" class:completed={$gameStore.achievementsProgress[achievement.id]}>
                        <div class="achievement-icon">
                            {#if $gameStore.achievementsProgress[achievement.id]}✓{:else}❓{/if}
                        </div>
                        <div class="card-info">
                            <p class="name">{achievement.name}</p>
                            <p class="desc">{achievement.description}</p>
                        </div>
                        <div class="achievement-reward">
                            {achievement.rewardDescription}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .view-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 1.5rem;
    }
    .tabs {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
    .tab-button {
        background: none;
        border: none;
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
    }
    .tab-button.active {
        color: var(--primary-accent);
        border-bottom: 2px solid var(--primary-accent);
    }
    .content-area {
        overflow-y: auto;
        flex-grow: 1;
    }
    h2 {
        margin-top: 0;
        text-align: center;
    }
    .description {
        color: var(--text-secondary);
        max-width: 350px;
        margin: 0 auto 1.5rem auto;
        text-align: center;
    }
    .card {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: opacity 0.3s;
        margin-bottom: 1rem;
    }
    .card.completed {
        opacity: 0.5;
    }
    .card-info {
        flex-grow: 1;
        text-align: left;
    }
    .name {
        font-weight: 700;
        margin: 0 0 0.25rem;
        color: var(--text-primary);
    }
    .desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin: 0 0 0.75rem;
    }
    progress {
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        border: none;
    }
    progress::-webkit-progress-bar {
        background-color: #111827;
    }
    progress::-webkit-progress-value {
        background-color: var(--primary-accent);
        transition: width 0.3s ease;
    }
    .progress-text {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0.25rem 0 0;
    }
    .claim-button {
        color: #0d1117;
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
        background-color: var(--secondary-accent);
    }
    .claim-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .achievement-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
    }
    .achievement-reward {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary-accent);
        text-align: right;
        flex-shrink: 0;
    }
</style>