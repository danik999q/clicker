<script lang="ts">
	import { gameStore } from '$lib/store';
	import ClickerView from '$lib/components/views/ClickerView.svelte';
	import UpgradesView from '$lib/components/views/UpgradesView.svelte';
	import DailyQuestView from '$lib/components/views/DailyQuestView.svelte';
	import ReferralView from '$lib/components/views/ReferralView.svelte';
	import AccountView from '$lib/components/views/AccountView.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';

	const views = {
		clicker: ClickerView,
		upgrades: UpgradesView,
		daily: DailyQuestView,
		referrals: ReferralView,
		account: AccountView
	};
	$: activeView = $gameStore.activeView;
</script>

<div class="flex flex-col h-full">
	<main class="flex-grow overflow-y-auto">
		<svelte:component this={views[activeView] || ClickerView} />
	</main>

	<BottomNav />
</div>