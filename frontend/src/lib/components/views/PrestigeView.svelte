<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { META_UPGRADE_DEFINITIONS, PRESTIGE_THRESHOLD } from '$lib/constants';

    let showConfirmation = false;

    function handlePrestige() {
        gameStore.prestigeReset();
        showConfirmation = false;
    }
</script>

<div class="prestige-container">
    <div class="prestige-info-card">
        <span class="icon">🧠</span>
        <h2>Эссенция Мемов</h2>
        <p class="description">
            Сбросьте свой прогресс, чтобы получить Эссенцию Мемов. Каждый балл навсегда увеличивает
            весь ваш доход на 2%!
        </p>

        <div class="stats">
            <div class="stat-item">
                <span class="value">{$gameStore.prestigePoints}</span>
                <span class="label">Текущий бонус</span>
            </div>
            <div class="stat-item">
                <span class="value">+{$gameStore.prestigePoints * 2}%</span>
                <span class="label">К доходу</span>
            </div>
        </div>

        {#if $gameStore.totalViews >= PRESTIGE_THRESHOLD}
            <div class="prestige-gain">
                При сбросе вы получите:
                <strong>{gameStore.calculatePrestigeGain($gameStore.totalViews)} 🧠</strong>
            </div>
            <button class="prestige-button" on:click={() => (showConfirmation = true)}>
                Совершить Престиж
            </button>
        {:else}
            <div class="prestige-requirement">
                Для сброса необходимо: {formatNumber(PRESTIGE_THRESHOLD)} просмотров
            </div>
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
</div>

{#if showConfirmation}
    <div class="modal-backdrop" on:click={() => (showConfirmation = false)}>
        <div class="modal-content" on:click|stopPropagation>
            <h3>Подтверждение</h3>
            <p>
                Вы уверены? Весь текущий прогресс (мемы, улучшения) будет сброшен в обмен на очки
                престижа.
            </p>
            <div class="modal-actions">
                <button class="cancel-button" on:click={() => (showConfirmation = false)}>Отмена</button>
                <button class="confirm-button" on:click={handlePrestige}>Сбросить</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .prestige-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .prestige-info-card {
        background-color: var(--surface-color);
        border: 1px solid #f0abfc;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 0 20px rgba(240, 171, 252, 0.1);
    }
    .icon {
        font-size: 2.5rem;
    }
    h2 {
        margin: 0.5rem 0;
    }
    .description {
        font-size: 0.9rem;
        color: var(--text-secondary);
        max-width: 40ch;
        margin: 0 auto 1.5rem auto;
    }
    .stats {
        display: flex;
        justify-content: space-around;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .stat-item .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        display: block;
    }
    .stat-item .label {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
    .prestige-gain {
        margin-bottom: 1rem;
    }
    .prestige-requirement {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 0.75rem;
        border-radius: 8px;
    }
    .prestige-button {
        background-color: #be185d;
        color: white;
        width: 100%;
        padding: 1rem;
        font-size: 1.1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    }
    .upgrade-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }
    .upgrade-item.purchased {
        opacity: 0.6;
    }
    .upgrade-item-info {
        text-align: left;
    }
    .item-name {
        font-weight: 700;
        margin: 0;
    }
    .item-stats {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
    }
    .purchase-button {
        background-color: var(--secondary-accent);
        color: #0d1117;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.25rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        margin-left: 10px;
    }
    .purchase-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .modal-content {
        background-color: var(--surface-color);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        width: 90%;
        max-width: 350px;
    }
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .modal-actions button {
        flex-grow: 1;
        padding: 0.75rem;
        border-radius: 8px;
        border: none;
        font-weight: 700;
        cursor: pointer;
    }
    .cancel-button {
        background-color: #374151;
        color: white;
    }
    .confirm-button {
        background-color: #be185d;
        color: white;
    }
</style>