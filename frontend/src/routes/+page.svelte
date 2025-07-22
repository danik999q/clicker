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

<main class="main-content">
    <svelte:component this={views[activeView] || ClickerView} />
</main>

<BottomNav />

<style>
    .main-content {
        flex-grow: 1;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
    }
</style>