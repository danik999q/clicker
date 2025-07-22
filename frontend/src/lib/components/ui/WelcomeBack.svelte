<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';

    export let report;
    function formatTime(seconds) {
        if (seconds < 60) return `${seconds} сек.`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} мин.`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} ч. ${minutes} мин.`;
    }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="modal-content">
        <span class="text-5xl mb-4">👋</span>
        <h2 class="text-3xl font-bold">С возвращением!</h2>
        <p class="text-text-secondary my-2">
            Пока вас не было ({formatTime(report.timeAway)}), ваши мемы работали!
        </p>
        <p class="text-text-secondary mt-4">Вы заработали:</p>
        <p class="earned-views">
            {formatNumber(report.viewsEarned)}
        </p>
        <button
                class="btn-primary mt-6"
                on:click={() => gameStore.clearOfflineReport()}>
            Продолжить
        </button>
    </div>
</div>

<style>
    .modal-content {
        @apply bg-surface text-text-primary p-8 rounded-2xl border border-border text-center w-11/12 max-w-md;
        animation: fade-in 0.3s ease-out;
        box-shadow: inset 0 4px 0 0 var(--primary-accent), 0 0 30px -10px var(--primary-glow);
    }

    .earned-views {
        @apply text-4xl font-bold text-primary my-4;
        text-shadow: 0 0 15px var(--primary-glow);
    }

    @keyframes fade-in {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
</style>