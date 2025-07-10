<script>
    import { createEventDispatcher } from 'svelte';

    export let amount = 0;
    export let x = 0;
    export let y = 0;

    const dispatch = createEventDispatcher();

    function onAnimationEnd() {
        dispatch('destroy');
    }
</script>

<div class="floating-number" style="left: {x}px; top: {y}px;" on:animationend={onAnimationEnd}>
    +{amount}
</div>

<style>
    .floating-number {
        position: fixed;
        transform: translateX(-50%);
        font-size: 20px;
        font-weight: bold;
        color: var(--primary-accent);
        pointer-events: none;
        animation: float-up 1.2s ease-out forwards;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
    }

    @keyframes float-up {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-80px);
            opacity: 0;
        }
    }
</style>