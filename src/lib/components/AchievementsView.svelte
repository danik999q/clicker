<script>
    import { DAILY_QUEST_DEFINITIONS } from '$lib/constants.js';
    import { gameStore } from '$lib/store.js';
    import { formatNumber } from '$lib/utils.js';
</script>

<div class="view-container">
    <h2>Ежедневные задания</h2>
    <p class="description">Выполняйте задания каждый день, чтобы получить ценные награды!</p>

    <div class="quest-list">
        {#if $gameStore.daily.quests.length === 0}
            <p>Новые задания появятся завтра.</p>
        {:else}
            {#each $gameStore.daily.quests as quest (quest.id)}
                {@const questDef = DAILY_QUEST_DEFINITIONS.find(d => d.id === quest.id)}
                {#if questDef}
                    <div class="quest-card" class:completed={quest.isCompleted && quest.isClaimed}>
                        <div class="quest-info">
                            <p class="name">{questDef.name}</p>
                            <p class="desc">{questDef.description}</p>
                            <progress value={quest.progress || 0} max={questDef.target}></progress>
                            <p class="progress-text">{formatNumber(quest.progress || 0)} / {formatNumber(questDef.target)}</p>
                        </div>
                        <button
                                class="claim-button"
                                disabled={!quest.isCompleted || quest.isClaimed}
                                on:click={() => gameStore.claimDailyReward(quest.id)}
                        >
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
</div>

<style>
    .view-container {
        width: 100%;
        padding: 1.5rem;
        box-sizing: border-box;
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
    .quest-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .quest-card {
        background-color: #111827;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: opacity 0.3s;
    }
    .quest-card.completed {
        opacity: 0.5;
    }
    .quest-info {
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
        background-color: var(--secondary-accent);
    }
    .claim-button:hover:not(:disabled) {
        background-color: #a78bfa;
    }
    .claim-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
</style>