<script lang="ts">
    import { gameStore } from '$lib/store';

    $: activeView = $gameStore.activeView;

    const setView = (view) => {
        gameStore.setView(view);
    };
</script>

<nav class="bottom-nav">
    <button on:click={() => setView('clicker')} class:active={activeView === 'clicker'}>
        <svg fill="#000000" width="24px" height="24px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>cursor-hand-click-line</title>
            <path class="clr-i-outline clr-i-outline-path-1" d="M30.4,17.6c-1.8-1.9-4.2-3.2-6.7-3.7c-1.1-0.3-2.2-0.5-3.3-0.6c2.8-3.3,2.3-8.3-1-11.1s-8.3-2.3-11.1,1s-2.3,8.3,1,11.1
                            c0.6,0.5,1.2,0.9,1.8,1.1v2.2l-1.6-1.5c-1.4-1.4-3.7-1.4-5.2,0c-1.4,1.4-1.5,3.6-0.1,5l4.6,5.4c0.2,1.4,0.7,2.7,1.4,3.9
                            c0.5,0.9,1.2,1.8,1.9,2.5v1.9c0,0.6,0.4,1,1,1h13.6c0.5,0,1-0.5,1-1v-2.6c1.9-2.3,2.9-5.2,2.9-8.1v-5.8
                            C30.7,17.9,30.6,17.7,30.4,17.6z M8.4,8.2c0-3.3,2.7-5.9,6-5.8c3.3,0,5.9,2.7,5.8,6c0,1.8-0.8,3.4-2.2,4.5V7.9
                            c-0.1-1.8-1.6-3.2-3.4-3.2c-1.8-0.1-3.4,1.4-3.4,3.2v5.2C9.5,12.1,8.5,10.2,8.4,8.2L8.4,8.2z M28.7,24c0.1,2.6-0.8,5.1-2.5,7.1
                            c-0.2,0.2-0.4,0.4-0.4,0.7v2.1H14.2v-1.4c0-0.3-0.2-0.6-0.4-0.8c-0.7-0.6-1.3-1.3-1.8-2.2c-0.6-1-1-2.2-1.2-3.4
                            c0-0.2-0.1-0.4-0.2-0.6l-4.8-5.7c-0.3-0.3-0.5-0.7-0.5-1.2c0-0.4,0.2-0.9,0.5-1.2c0.7-0.6,1.7-0.6,2.4,0l2.9,2.9v3l1.9-1V7.9
                            c0.1-0.7,0.7-1.3,1.5-1.2c0.7,0,1.4,0.5,1.4,1.2v11.5l2,0.4v-4.6c0.1-0.1,0.2-0.1,0.3-0.2c0.7,0,1.4,0.1,2.1,0.2v5.1l1.6,0.3v-5.2
                            l1.2,0.3c0.5,0.1,1,0.3,1.5,0.5v5l1.6,0.3v-4.6c0.9,0.4,1.7,1,2.4,1.7L28.7,24z"></path>
            <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
        </svg>
        <span>Кликер</span>
    </button>
    <button on:click={() => setView('upgrades')} class:active={activeView === 'upgrades'}>
        <svg width="24px" height="24px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="M256 29.816l-231 154v106.368l231-154 231 154V183.816zm0 128.043L105 259.783v90.283l151-101.925 151 101.925v-90.283zm0 112l-87 58.725v67.6l87-58 87 58v-67.6zm0 89.957l-87 58v64.368l87-58 87 58v-64.368z"/></svg>
        <span>Улучшения</span>
    </button>
    <button on:click={() => setView('daily')} class:active={activeView === 'daily'}>
        <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" 
            width="24px" height="24px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve">
        <g>
            <g>
                <path d="M24,7l-1.7-1.7c-0.5-0.5-1.2-0.5-1.7,0L10,15.8l-4.3-4.2c-0.5-0.5-1.2-0.5-1.7,0l-1.7,1.7
                    c-0.5,0.5-0.5,1.2,0,1.7l5.9,5.9c0.5,0.5,1.1,0.7,1.7,0.7c0.6,0,1.2-0.2,1.7-0.7L24,8.7C24.4,8.3,24.4,7.5,24,7z"/>
            </g>
        </g>
        <g>
            <path d="M48.4,18.4H27.5c-0.9,0-1.6-0.7-1.6-1.6v-3.2c0-0.9,0.7-1.6,1.6-1.6h20.9c0.9,0,1.6,0.7,1.6,1.6v3.2
                C50,17.7,49.3,18.4,48.4,18.4z"/>
        </g>
        <g>
            <path d="M48.4,32.7H22.7c-0.9,0-1.6-0.7-1.6-1.6v-3.2c0-0.9,0.7-1.6,1.6-1.6h25.7c0.9,0,1.6,0.7,1.6,1.6v3.2
                C50,32,49.3,32.7,48.4,32.7z"/>
        </g>
        <g>
            <path d="M13,32.7H9.8c-0.9,0-1.6-0.7-1.6-1.6v-3.2c0-0.9,0.7-1.6,1.6-1.6H13c0.9,0,1.6,0.7,1.6,1.6v3.2
                C14.7,32,13.9,32.7,13,32.7z"/>
        </g>
        <g>
            <path d="M13,47H9.8c-0.9,0-1.6-0.7-1.6-1.6v-3.2c0-0.9,0.7-1.6,1.6-1.6H13c0.9,0,1.6,0.7,1.6,1.6v3.2
                C14.7,46.3,13.9,47,13,47z"/>
        </g>
        <g>
            <path d="M48.4,47H22.7c-0.9,0-1.6-0.7-1.6-1.6v-3.2c0-0.9,0.7-1.6,1.6-1.6h25.7c0.9,0,1.6,0.7,1.6,1.6v3.2
                C50,46.3,49.3,47,48.4,47z"/>
        </g>
        </svg>
        <span>Задания</span>
    </button>
    <button on:click={() => setView('referrals')} class:active={activeView === 'referrals'}>
        <svg width="24px" height ="24px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 481.8 481.8" style="enable-background:new 0 0 481.8 481.8;" xml:space="preserve">
        <g>
            <path d="M481.143,368.863l-11.952-60.019c-4.74-23.763-23.338-42.327-47.099-47.027l-16.173-3.19
                c-9.29-1.835-16.582-9.062-18.517-18.337l-3.087-14.849c-0.975-4.764,0.74-9.686,4.487-12.779
                c14.614-12.094,27.983-29.879,35.715-50.879c10.739-1.929,20.518-12.25,23.683-26.454c3.905-17.606-3.843-34.296-17.321-37.288
                c-0.142-0.023-0.284-0.009-0.456-0.023c-4.063-45.714-21.669-79.561-80.215-79.561c-57.57,0-75.838,33.84-80.137,79.529
                c-0.189,0.047-0.394,0.032-0.535,0.056c-13.463,2.992-21.211,19.683-17.306,37.288c3.133,14.204,12.93,24.525,23.668,26.454
                c7.746,21.008,21.115,38.793,35.697,50.879c3.732,3.094,5.465,8.016,4.473,12.763l-3.07,14.85
                c-1.922,9.283-9.211,16.518-18.519,18.353l-16.141,3.19c-21.116,4.171-38.076,19.296-44.956,39.271
                c20.831,11.826,36.043,32.124,40.91,56.555l10.408,52.178h162.838c10.25,0,19.983-4.599,26.486-12.535
                C480.529,389.357,483.142,378.925,481.143,368.863z"/>
            <path d="M250.578,362.368c-4.741-23.77-23.338-42.336-47.115-47.036l-16.157-3.189c-9.289-1.834-16.597-9.063-18.518-18.337
                l-3.086-14.857c-0.978-4.757,0.739-9.677,4.487-12.778c14.614-12.086,27.982-29.881,35.699-50.879
                c10.755-1.929,20.533-12.252,23.698-26.454c3.905-17.605-3.843-34.298-17.321-37.297c-0.143-0.024-0.284-0.008-0.473-0.024
                c-4.047-45.712-21.652-79.553-80.215-79.553c-57.556,0-75.821,33.833-80.12,79.53c-0.205,0.039-0.394,0.023-0.536,0.047
                c-13.479,2.999-21.227,19.691-17.32,37.297c3.133,14.202,12.928,24.525,23.668,26.454c7.746,21.006,21.115,38.793,35.713,50.887
                c3.732,3.094,5.465,8.014,4.473,12.763l-3.072,14.85c-1.92,9.281-9.211,16.518-18.518,18.352l-16.141,3.189
                c-23.777,4.7-42.374,23.267-47.115,47.036l-11.951,60.02c-2,10.061,0.614,20.494,7.117,28.423
                c6.505,7.935,16.236,12.534,26.486,12.534h194.664c10.25,0,19.982-4.6,26.486-12.534c6.503-7.929,9.117-18.361,7.117-28.423
                L250.578,362.368z"/>
        </g>
        </svg>
        <span>Друзья</span>
    </button>
    <button on:click={() => setView('account')} class:active={activeView === 'account'}>
        <svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><path d="M16 7.992C16 3.58 12.416 0 8 0S0 3.58 0 7.992c0 2.43 1.104 4.62 2.832 6.09.016.016.032.016.032.032.144.112.288.224.448.336.08.048.144.111.224.175A7.98 7.98 0 0 0 8.016 16a7.98 7.98 0 0 0 4.48-1.375c.08-.048.144-.111.224-.16.144-.111.304-.223.448-.335.016-.016.032-.016.032-.032 1.696-1.487 2.8-3.676 2.8-6.106zm-8 7.001c-1.504 0-2.88-.48-4.016-1.279.016-.128.048-.255.08-.383a4.17 4.17 0 0 1 .416-.991c.176-.304.384-.576.64-.816.24-.24.528-.463.816-.639.304-.176.624-.304.976-.4A4.15 4.15 0 0 1 8 10.342a4.185 4.185 0 0 1 2.928 1.166c.368.368.656.8.864 1.295.112.288.192.592.24.911A7.03 7.03 0 0 1 8 14.993zm-2.448-7.4a2.49 2.49 0 0 1-.208-1.024c0-.351.064-.703.208-1.023.144-.32.336-.607.576-.847.24-.24.528-.431.848-.575.32-.144.672-.208 1.024-.208.368 0 .704.064 1.024.208.32.144.608.336.848.575.24.24.432.528.576.847.144.32.208.672.208 1.023 0 .368-.064.704-.208 1.023a2.84 2.84 0 0 1-.576.848 2.84 2.84 0 0 1-.848.575 2.715 2.715 0 0 1-2.064 0 2.84 2.84 0 0 1-.848-.575 2.526 2.526 0 0 1-.56-.848zm7.424 5.306c0-.032-.016-.048-.016-.08a5.22 5.22 0 0 0-.688-1.406 4.883 4.883 0 0 0-1.088-1.135 5.207 5.207 0 0 0-1.04-.608 2.82 2.82 0 0 0 .464-.383 4.2 4.2 0 0 0 .624-.784 3.624 3.624 0 0 0 .528-1.934 3.71 3.71 0 0 0-.288-1.47 3.799 3.799 0 0 0-.816-1.199 3.845 3.845 0 0 0-1.2-.8 3.72 3.72 0 0 0-1.472-.287 3.72 3.72 0 0 0-1.472.288 3.631 3.631 0 0 0-1.2.815 3.84 3.84 0 0 0-.8 1.199 3.71 3.71 0 0 0-.288 1.47c0 .352.048.688.144 1.007.096.336.224.64.4.927.16.288.384.544.624.784.144.144.304.271.48.383a5.12 5.12 0 0 0-1.04.624c-.416.32-.784.703-1.088 1.119a4.999 4.999 0 0 0-.688 1.406c-.016.032-.016.064-.016.08C1.776 11.636.992 9.91.992 7.992.992 4.14 4.144.991 8 .991s7.008 3.149 7.008 7.001a6.96 6.96 0 0 1-2.032 4.907z"/></svg>
        <span>Кабинет</span>
    </button>
</nav>

<style>
    .bottom-nav {
        display: flex;
        justify-content: space-between;
        background-color: var(--surface-color);
        background-color: rgb(184, 241, 255);
        border-top: 1px solid var(--border-color);
        padding: 0.5rem 0;
        flex-shrink: 0;
    }
    
    button {
        max-width: 20%;
        display: flex;
        flex-direction: column;
        row-gap: 7px;
        justify-content: center;
        align-items: center;
        max-width: 20%;
        background: none;
        border: none;
        border-right: 1px solid black;
        color: var(--text-secondary);
        padding: 0.25rem;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        flex-grow: 1;
    }
    button.active {
        color: var(--primary-accent);
        font-weight: 600;
    }
    @media(max-width: 360px) {
        button {
            /* max-width: 100%; */
            font-size: 0.75rem;
            padding: 0.2rem;
        }
    }
</style>