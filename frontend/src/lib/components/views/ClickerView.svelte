<script lang="ts">
	import { gameStore } from '$lib/store';
	import Header from '$lib/components/ui/Header.svelte';

	$: activeMeme = $gameStore.memes[$gameStore.activeMemeIndex];
</script>

<div class="flex flex-col h-full">
	<Header />
	<div class="flex-grow flex flex-col justify-center items-center gap-6 p-4">
		<button
				class="relative group rounded-full focus:outline-none transition-transform active:scale-95 will-change-transform"
				on:click={() => gameStore.addViews()}
		>
			<div class="absolute -inset-2 rounded-full bg-primary/20 blur-xl opacity-75 transition-opacity group-hover:opacity-100" />

			<div class="animated-border" />

			<img
					src={activeMeme.imageUrl}
					alt={activeMeme.name}
					class="relative w-64 h-64 md:w-72 md:h-72 rounded-full object-cover shadow-inner-strong"
			/>
		</button>
		<h2 class="text-3xl font-bold text-text-primary mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{activeMeme.name}</h2>
	</div>
</div>

<style>
	.shadow-inner-strong {
		box-shadow: inset 0 0 30px 15px rgba(0, 0, 0, 0.5);
	}

	.animated-border {
		@apply absolute -inset-1 rounded-full opacity-60 group-hover:opacity-80 transition-opacity;
		background: conic-gradient(from 180deg at 50% 50%, var(--secondary-accent), var(--primary-accent), var(--secondary-accent));
		animation: spin 3s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>