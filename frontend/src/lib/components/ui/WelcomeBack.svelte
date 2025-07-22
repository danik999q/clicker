<script>
    import { gameStore } from '$lib/store.ts';
    import { formatNumber } from '$lib/utils.ts';

    export let report;

    function formatTime(seconds) {
        if (seconds < 60) return `${seconds} сек.`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} мин.`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} ч. ${minutes} мин.`;
    }
</script>

<div class="modal-backdrop">
    <div class="modal-content">
        <h2>С возвращением!</h2>
        <p>За время вашего отсутствия</p>
        <p class="time-away">({formatTime(report.timeAway)})</p>
        <p>вы заработали:</p>
        <p class="views-earned">{formatNumber(report.viewsEarned)} просмотров</p>
        <button class="action-button" on:click={() => gameStore.clearOfflineReport()}>Продолжить</button>
    </div>
</div>

<style>
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
        z-index: 1000;
    }
    .modal-content {
        background-color: var(--surface-color);
        color: var(--text-primary);
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid var(--border-color);
        text-align: center;
        width: 90%;
        max-width: 400px;
        animation: fade-in 0.3s ease-out;
    }
    h2 {
        margin-top: 0;
        font-size: 1.8rem;
    }
    p {
        color: var(--text-secondary);
        margin: 0.5rem 0;
    }
    .time-away {
        font-size: 0.9rem;
    }
    .views-earned {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-accent);
        margin: 1rem 0 1.5rem 0;
    }
    .action-button {
        background-color: var(--primary-accent);
        color: #064e3b;
        font-weight: 700;
        border: none;
        padding: 1rem;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.2s ease;
    }
    .action-button:hover {
        background-color: #6ee7b7;
    }
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>