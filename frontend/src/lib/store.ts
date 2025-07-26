import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import * as api from './api';
import * as constants from './constants';
import { calculatePassiveIncome } from './gameLogic';
import type { GameState, LeaderboardEntry, UpgradeDefinition, UpgradeTreeState } from './types';

function initializeUpgradeTrees(): GameState['upgradeTrees'] {
    const trees: GameState['upgradeTrees'] = {};
    for (const tree of constants.UPGRADE_TREES) {
        const treeState: UpgradeTreeState = {};
        function traverse(node: UpgradeDefinition) {
            treeState[node.id] = { level: 0 };
            node.children.forEach(traverse);
        }
        traverse(tree);
        trees[tree.id] = treeState;
    }
    return trees;
}

const defaultState: GameState = {
    isLoading: true,
    totalViews: 0,
    totalClicks: 0,
    activeMemeIndex: 0,
    activeView: 'clicker',
    buyMultiplier: 1,
    lastSaveTime: Date.now(),
    offlineReport: null,
    floatingBonus: { isActive: false, x: 50, y: 50, lifetime: 0 },
    prestigePoints: 0,
    telegramId: null,
    clan: null,
    raid: null,
    referralSystem: { userId: null, referredCount: 0, earnings: 0 },
    walletAddress: null,
    isWalletConnected: false,
    memes: [
        { id: 'crocodilo', name: 'Crocodilo Bombordiro', level: 1, isUnlocked: true, unlockCost: 0, baseViews: 1, passiveViews: 0.2, upgradeCost: 20, imageUrl: '/images/crocodilo.jpeg' },
        { id: 'sahur', name: 'Tung Tung Sahur', level: 1, isUnlocked: false, unlockCost: 1000, baseViews: 10, passiveViews: 1.5, upgradeCost: 250, imageUrl: '/images/sahur.jpeg' },
        { id: 'skibidi', name: 'Skibidi Toilet', level: 1, isUnlocked: false, unlockCost: 12000, baseViews: 50, passiveViews: 8, upgradeCost: 3000, imageUrl: '/images/skibidi.jpeg' }
    ],
    upgradeTrees: initializeUpgradeTrees(),
    metaUpgrades: constants.META_UPGRADE_DEFINITIONS.map(def => ({ id: def.id, isPurchased: false })),
    achievementsProgress: { views_1: false, clicks_1: false, unlock_1: false, },
    rewardBonuses: { clickMultiplier: 0, passiveMultiplier: 0 },
    activeBoosts: {
        clickFrenzy: { isActive: false, expiry: 0 },
        incomeMultiplier: { isActive: false, expiry: 0 }
    },
    daily: {
        lastReset: new Date().toISOString().split('T')[0],
        quests: [],
        progress: { dailyClicks: 0, dailyViews: 0, dailyLevels: 0, dailyBonuses: 0 }
    },
    leaderboard: {
        isLoading: true,
        data: [] as LeaderboardEntry[]
    }
};

const createGameStore = () => {
    const { subscribe, set, update } = writable<GameState>(defaultState);

    const saveState = () => {
        update(state => {
            if (state.isLoading || !state.telegramId) return state;
            const { isLoading, activeView, offlineReport, floatingBonus, leaderboard, ...savableState } = state;
            savableState.lastSaveTime = Date.now();
            api.saveUserState(state.telegramId, savableState);
            return state;
        });
    };

    if (browser) {
        setInterval(() => {
            update(state => {
                if (state.isLoading) return state;
                const passiveIncome = calculatePassiveIncome(state);
                if (passiveIncome > 0) {
                    state.totalViews += passiveIncome;
                }
                return state;
            });
        }, 1000);

        setInterval(saveState, constants.SAVE_INTERVAL_MS);
        window.addEventListener('beforeunload', saveState);
    }

    return {
        subscribe,
        set,
        update,

        loadStateFromServer: async (telegramId: number) => {
            update(s => ({ ...s, isLoading: true, telegramId }));
            try {
                const serverState = await api.loadUserState(telegramId);
                const clanInfo = await api.fetchUserClan(telegramId);

                const hydratedState: GameState = {
                    ...defaultState,
                    ...serverState,
                    clan: clanInfo,
                    upgradeTrees: { ...initializeUpgradeTrees(), ...(serverState.upgradeTrees || {}) },
                    telegramId,
                    isLoading: false,
                    offlineReport: serverState.offlineReport || null,
                    isWalletConnected: !!serverState.walletAddress,
                };
                set(hydratedState);
            } catch (error) {
                console.error("Failed to load state:", error);
                if ((error as any).status === 404) {
                    await api.registerUser(telegramId, `user_${telegramId}`);
                    set({ ...defaultState, telegramId, isLoading: false });
                } else {
                    update(s => ({ ...s, isLoading: false }));
                }
            }
        },

        clearOfflineReport: () => update(state => ({ ...state, offlineReport: null })),

        setView: (view: GameState['activeView']) => update(s => ({ ...s, activeView: view })),

        setBuyMultiplier: (multiplier: number) => update(s => ({ ...s, buyMultiplier: multiplier })),

        setActiveMeme: (index: number) => update(s => {
            if (s.memes[index]?.isUnlocked) {
                s.activeMemeIndex = index;
            }
            return s;
        }),
    };
};

export const gameStore = createGameStore();