<script lang="ts">
    import { gameStore } from '$lib/store';
    import { formatNumber } from '$lib/utils';
    import { calculatePassiveIncome } from '$lib/gameLogic';
    import { fly } from 'svelte/transition';

    $: passiveIncome = calculatePassiveIncome($gameStore);
    $: totalViews = $gameStore.totalViews;
</script>

<header
        class="flex-shrink-0 p-4"
        in:fly={{ y: -20, duration: 500, delay: 200 }}
>
    <div class="w-full flex justify-between items-center gap-4">
        <div class="text-left">
			<span
                    class="inline-block bg-primary/20 text-primary px-3 py-1 text-sm font-semibold rounded-full border border-primary/50"
            >
				+ {formatNumber(passiveIncome)} / сек
			</span>
        </div>

        <div class="text-right">
			<span class="block text-3xl lg:text-4xl font-bold text-text-primary tracking-tighter drop-shadow-lg">
				{#key totalViews}
					<span in:fly={{ y: -10, duration: 200 }}>
						{formatNumber(totalViews)}
					</span>
				{/key}
			</span>
        </div>
    </div>
</header>