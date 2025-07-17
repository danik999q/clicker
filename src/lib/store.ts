import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import * as api from './api';
import * as constants from './constants';
import { calculatePassiveIncome, calculateClickValue, calculateUpgradeCost } from './gameLogic';
import type { GameState, DailyQuest, Meme, Upgrade, OfflineReport, UpgradeTreeState, UpgradeDefinition } from './types';

function initializeUpgradeTrees(): GameState['upgradeTrees'] {
    const trees: GameState['upgradeTrees'] = {};
    for (const tree of constants.UPGRADE_TREES) {
        const treeState: UpgradeTreeState = {};

        function traverse(node: UpgradeDefinition) {
            treeState[node.id] = { isPurchased: false };
            node.children.forEach(traverse);
        }
        traverse(tree);
        trees[tree.id] = treeState;
    }
    return trees;
}

function createGameStore() {
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
        referralSystem: { userId: null, referredCount: 0, earnings: 0 },
        walletAddress: null,
        isWalletConnected: false,
        memes: [
            { id: 'crocodilo', name: 'Crocodilo Bombordiro', level: 1, isUnlocked: true, unlockCost: 0, baseViews: 1, passiveViews: 0.1, upgradeCost: 10, imageUrl: '/images/crocodilo.jpeg' },
            { id: 'sahur', name: 'Tung Tung Sahur', level: 1, isUnlocked: false, unlockCost: 500, baseViews: 5, passiveViews: 1, upgradeCost: 100, imageUrl: '/images/sahur.jpeg' },
            { id: 'skibidi', name: 'Skibidi Toilet', level: 1, isUnlocked: false, unlockCost: 5000, baseViews: 25, passiveViews: 5, upgradeCost: 1200, imageUrl: '/images/skibidi.jpeg' }
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
        }
    };

    const store: Writable<GameState> = writable(defaultState);
    const { subscribe, set, update } = store;

    function checkAchievements(state: GameState): GameState {
        for (const achievementDef of constants.ACHIEVEMENT_DEFINITIONS) {
            if (!state.achievementsProgress[achievementDef.id] && achievementDef.checkCondition(state)) {
                state.achievementsProgress[achievementDef.id] = true;
                achievementDef.applyReward(state);
            }
        }
        return state;
    }

    function updateDailyProgress(state: GameState, metric: keyof GameState['daily']['progress'], value: number): GameState {
        state.daily.progress[metric] = (state.daily.progress[metric] || 0) + value;
        for (const quest of state.daily.quests) {
            const questDef = constants.DAILY_QUEST_DEFINITIONS.find(d => d.id === quest.id);
            if (questDef && questDef.metric === metric && !quest.isCompleted) {
                quest.progress = state.daily.progress[metric];
                if (quest.progress >= questDef.target) {
                    quest.isCompleted = true;
                }
            }
        }
        return state;
    }

    function checkAndResetDailies(state: GameState): GameState {
        const today = new Date().toISOString().split('T')[0];
        if (state.daily.lastReset !== today) {
            state.daily.lastReset = today;
            state.daily.progress = { dailyClicks: 0, dailyViews: 0, dailyLevels: 0, dailyBonuses: 0 };
            const shuffled = [...constants.DAILY_QUEST_DEFINITIONS].sort(() => 0.5 - Math.random());
            state.daily.quests = shuffled.slice(0, 3).map(q => ({
                id: q.id,
                progress: 0,
                isCompleted: false,
                isClaimed: false
            }));
        }
        return state;
    }

    function saveState() {
        const state = get(store);
        if (state.isLoading || !state.telegramId) return;

        const { isLoading, activeView, offlineReport, floatingBonus, daily, ...savableState } = state;

        api.saveUserState(state.telegramId, savableState);
    }

    if (browser) {
        setInterval(() => update(state => {
            if (state.isLoading) return state;
            const passiveIncome = calculatePassiveIncome(state);
            if (passiveIncome > 0) {
                state.totalViews += passiveIncome;
            }
            if (passiveIncome > 0) {
                return checkAchievements(state);
            }
            return state;
        }), 1000);

        setInterval(saveState, constants.SAVE_INTERVAL_MS);

        setInterval(() => update(state => {
            if (!state.floatingBonus.isActive && Math.random() < 0.5) {
                state.floatingBonus = { isActive: true, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, lifetime: constants.FLOATING_BONUS_LIFETIME_S };
            }
            return state;
        }), constants.FLOATING_BONUS_INTERVAL_MS);

        setInterval(() => update(state => {
            if (state.floatingBonus.isActive) {
                state.floatingBonus.lifetime--;
                if (state.floatingBonus.lifetime <= 0) state.floatingBonus.isActive = false;
            }
            return state;
        }), 1000);

        window.addEventListener('beforeunload', saveState);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveState();
        });
    }

    const self = {
        subscribe,
        set,
        loadStateFromServer: async (telegramId: number) => {
            update(s => ({ ...s, isLoading: true, telegramId }));
            try {
                const serverState = await api.loadUserState(telegramId);
                let offlineReport: OfflineReport | null = null;

                if (serverState.lastSaveTime) {
                    const timeDiff = Math.floor((Date.now() - serverState.lastSaveTime) / 1000);
                    const effectiveOfflineTime = Math.min(timeDiff, constants.MAX_OFFLINE_EARNINGS_S);
                    if (effectiveOfflineTime > 10) {
                        const tempState = { ...defaultState, ...serverState, upgradeTrees: {...initializeUpgradeTrees(), ...(serverState.upgradeTrees || {}) } };
                        const offlineVps = calculatePassiveIncome(tempState);
                        const viewsEarned = Math.floor(offlineVps * effectiveOfflineTime);
                        if(serverState.totalViews) {
                            serverState.totalViews += viewsEarned;
                        } else {
                            serverState.totalViews = viewsEarned;
                        }
                        offlineReport = { timeAway: effectiveOfflineTime, viewsEarned };
                    }
                }

                const hydratedState: GameState = {
                    ...defaultState,
                    ...serverState,
                    upgradeTrees: {
                        ...initializeUpgradeTrees(),
                        ...(serverState.upgradeTrees || {})
                    },
                    telegramId,
                    isLoading: false,
                    offlineReport,
                    isWalletConnected: !!serverState.walletAddress,
                };

                set(checkAndResetDailies(hydratedState));
            } catch (error: any) {
                if (error.status === 404) {
                    await api.registerUser(telegramId, `user_${telegramId}`);
                    let newState = { ...defaultState, telegramId, isLoading: false };
                    newState = checkAndResetDailies(newState);
                    set(newState);
                } else {
                    console.error("Failed to load state:", error);
                    update(s => ({ ...s, isLoading: false }));
                }
            }
        },

        addViews: () => update(state => {
            if (state.isLoading) return state;
            const viewsEarned = calculateClickValue(state);
            state.totalViews += viewsEarned;
            state.totalClicks++;
            state = updateDailyProgress(state, 'dailyClicks', 1);
            state = updateDailyProgress(state, 'dailyViews', viewsEarned);
            return checkAchievements(state);
        }),
        upgradeMeme: (memeId: string) => update(state => {
            if (state.isLoading) return state;
            const { totalCost, levelsToBuy } = calculateUpgradeCost(state, memeId, state.buyMultiplier);
            if (levelsToBuy > 0 && state.totalViews >= totalCost) {
                state.totalViews -= totalCost;
                const meme = state.memes.find(m => m.id === memeId);
                if (meme) {
                    meme.level += levelsToBuy;
                    meme.upgradeCost = Math.round(meme.upgradeCost * Math.pow(constants.UPGRADE_COST_RATIO, levelsToBuy));
                }
                state = updateDailyProgress(state, 'dailyLevels', levelsToBuy);
            }
            return checkAchievements(state);
        }),
        unlockMeme: (memeId: string) => update(state => {
            const memeToUnlock = state.memes.find((m) => m.id === memeId);
            if (memeToUnlock && !memeToUnlock.isUnlocked && state.totalViews >= memeToUnlock.unlockCost) {
                state.totalViews -= memeToUnlock.unlockCost;
                memeToUnlock.isUnlocked = true;
            }
            return checkAchievements(state);
        }),

        purchaseUpgrade: (treeId: string, nodeId: string) => update(state => {
            const treeDef = constants.UPGRADE_TREES.find(t => t.id === treeId);
            if (!treeDef) return state;

            let nodeDef: UpgradeDefinition | null = null;
            let parentDef: UpgradeDefinition | null = null;

            function findNode(current: UpgradeDefinition, parent: UpgradeDefinition | null = null) {
                if (nodeDef) return;
                if (current.id === nodeId) {
                    nodeDef = current;
                    parentDef = parent;
                    return;
                }
                current.children.forEach(child => findNode(child, current));
            }
            findNode(treeDef);

            if (!nodeDef) return state;

            const treeState = state.upgradeTrees[treeId];
            const nodeState = treeState[nodeId];

            const isAffordable = state.totalViews >= nodeDef.cost;
            const isParentPurchased = !parentDef || treeState[parentDef.id]?.isPurchased;

            if (isAffordable && isParentPurchased && !nodeState.isPurchased) {
                state.totalViews -= nodeDef.cost;
                nodeState.isPurchased = true;
            }

            return state;
        }),

        clickFloatingBonus: () => update(state => {
            if (!state.floatingBonus.isActive) return state;
            state = updateDailyProgress(state, 'dailyBonuses', 1);
            const now = Date.now();

            const rand = Math.random();
            if (rand < 0.15) {
                state.activeBoosts.clickFrenzy = { isActive: true, expiry: now + constants.CLICK_FRENZY_DURATION_S * 1000 };
            } else if (rand < 0.45) {
                state.activeBoosts.incomeMultiplier = { isActive: true, expiry: now + constants.INCOME_MULTIPLIER_DURATION_S * 1000 };
            } else {
                state.totalViews += (calculatePassiveIncome(state) * 60 * 15) + (state.totalViews * 0.05);
            }

            state.floatingBonus.isActive = false;
            return state;
        }),
        claimDailyReward: (questId: string) => update(state => {
            const quest = state.daily.quests.find(q => q.id === questId);
            const questDef = constants.DAILY_QUEST_DEFINITIONS.find(d => d.id === questId);
            if (quest && quest.isCompleted && !quest.isClaimed && questDef) {
                quest.isClaimed = true;
                if (questDef.reward.type === 'prestigePoints') state.prestigePoints += questDef.reward.value;
            }
            return state;
        }),

        prestigeReset: () => update(state => {
            const gain = self.calculatePrestigeGain(state.totalViews);
            if (gain <= 0) return state;

            const newState: GameState = {
                ...defaultState,
                isLoading: false,
                telegramId: state.telegramId,
                prestigePoints: state.prestigePoints + gain,
                metaUpgrades: state.metaUpgrades,
                upgradeTrees: initializeUpgradeTrees(),
            };

            if (state.metaUpgrades.find(m => m.id === 'start_bonus_1' && m.isPurchased)) {
                newState.totalViews = 10000;
            }

            return checkAndResetDailies(newState);
        }),

        calculatePrestigeGain: (views: number) => (views < constants.PRESTIGE_THRESHOLD) ? 0 : Math.floor(5 * Math.log10(views / constants.PRESTIGE_THRESHOLD)),
        purchaseMetaUpgrade: (upgradeId: string) => update(state => {
            const metaDef = constants.META_UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
            const metaState = state.metaUpgrades.find(u => u.id === upgradeId);
            if (metaDef && metaState && !metaState.isPurchased && state.prestigePoints >= metaDef.cost) {
                state.prestigePoints -= metaDef.cost;
                metaState.isPurchased = true;
            }
            return state;
        }),
        updateWalletAddress: (address: string | null) => update(state => ({ ...state, walletAddress: address, isWalletConnected: !!address })),
        clearOfflineReport: () => update(state => ({ ...state, offlineReport: null })),
        setView: (viewName: GameState['activeView']) => update(state => ({ ...state, activeView: viewName })),
        setBuyMultiplier: (multiplier: number) => update(state => ({ ...state, buyMultiplier: multiplier })),
        setActiveMeme: (index: number) => update(state => {
            if (state.memes[index]?.isUnlocked) {
                state.activeMemeIndex = index;
            }
            return state;
        }),
    };

    return self;
}

export const gameStore = createGameStore();