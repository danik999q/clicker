import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'brainrotGameState';

// --- КОНСТАНТЫ ---
export const GLOBAL_UPGRADE_DEFINITIONS = [
    { id: 'click_boost_1', name: 'Мощные перчатки', description: 'Сила всех кликов увеличена на 25%.', cost: 10000, type: 'CLICK_MULTIPLIER', value: 0.25 },
    { id: 'passive_boost_1', name: 'Вечный двигатель мемов', description: 'Пассивный доход от всех мемов +15%.', cost: 25000, type: 'PASSIVE_MULTIPLIER', value: 0.15 },
    { id: 'cost_reduction_1', name: 'Оптовые закупки', description: 'Снижает стоимость улучшения мемов на 5%.', cost: 50000, type: 'UPGRADE_COST_REDUCTION', value: 0.05 }
];

export const META_UPGRADE_DEFINITIONS = [
    { id: 'start_bonus_1', name: 'Начальный капитал', description: 'Начинать каждую новую игру с 10,000 просмотров.', cost: 10 },
    { id: 'perm_passive_1', name: 'Квантовая теория мемов', description: 'Пассивный доход дополнительно увеличен на 50%.', cost: 25, type: 'PASSIVE_MULTIPLIER', value: 0.5 }
];

export const ACHIEVEMENT_DEFINITIONS = [
    { id: 'views_1', name: 'Первые шаги', description: 'Накопить 1 000 просмотров.', rewardDescription: '+1% к пассивному доходу', checkCondition: (state) => state.totalViews >= 1000, applyReward: (state) => { state.rewardBonuses.passiveMultiplier += 0.01; } },
    { id: 'clicks_1', name: 'Залипала', description: 'Сделать 500 кликов.', rewardDescription: '+1% к доходу от кликов', checkCondition: (state) => state.totalClicks >= 500, applyReward: (state) => { state.rewardBonuses.clickMultiplier += 0.01; } },
    { id: 'unlock_1', name: 'Коллекционер', description: 'Разблокировать второй мем.', rewardDescription: '+3% к пассивному доходу', checkCondition: (state) => state.memes[1].isUnlocked, applyReward: (state) => { state.rewardBonuses.passiveMultiplier += 0.03; } }
];

export const PRESTIGE_THRESHOLD = 1e12;

function createGameStore() {
    const defaultState = {
        totalViews: 0,
        totalClicks: 0,
        activeMemeIndex: 0,
        activeView: 'clicker',
        lastSaveTime: Date.now(),
        offlineReport: null,
        floatingBonus: { isActive: false, x: 50, y: 50, lifetime: 0 },
        prestigePoints: 0,
        buyMultiplier: 1,
        memes: [
            { id: 'crocodilo', name: 'Crocodilo Bombordiro', level: 1, isUnlocked: true, unlockCost: 0, baseViews: 1, passiveViews: 0.1, upgradeCost: 10, imageUrl: 'https://i.ytimg.com/vi/ni5mjS_OAes/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAgjSg2D81Ggxo_D5QYChQy6i2uVw' },
            { id: 'sahur', name: 'Tung Tung Sahur', level: 1, isUnlocked: false, unlockCost: 500, baseViews: 5, passiveViews: 1, upgradeCost: 100, imageUrl: 'https://i1.sndcdn.com/artworks-KaAh3b3p34BqXn3g-VXZI5w-t500x500.jpg' },
            { id: 'skibidi', name: 'Skibidi Toilet', level: 1, isUnlocked: false, unlockCost: 5000, baseViews: 25, passiveViews: 5, upgradeCost: 1200, imageUrl: 'https://i.ytimg.com/vi/nzp_t-s1k6s/maxresdefault.jpg' }
        ],
        globalUpgrades: GLOBAL_UPGRADE_DEFINITIONS.map(def => ({ id: def.id, isPurchased: false })),
        metaUpgrades: META_UPGRADE_DEFINITIONS.map(def => ({ id: def.id, isPurchased: false })),
        achievementsProgress: { views_1: false, clicks_1: false, unlock_1: false, },
        rewardBonuses: { clickMultiplier: 0, passiveMultiplier: 0 }
    };

    let initialState = defaultState;
    if (browser) {
        const savedStateJSON = localStorage.getItem(STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState.prestigePoints !== undefined) {
                const timeDifferenceInSeconds = Math.floor((Date.now() - (savedState.lastSaveTime || Date.now())) / 1000);
                const maxOfflineSeconds = 7 * 24 * 60 * 60;
                const effectiveOfflineSeconds = Math.min(timeDifferenceInSeconds, maxOfflineSeconds);

                if (effectiveOfflineSeconds > 10) {
                    const prestigeMultiplier = 1 + (savedState.prestigePoints * 0.02);
                    const metaPassiveMultiplier = 1 + META_UPGRADE_DEFINITIONS
                        .filter(def => def.type === 'PASSIVE_MULTIPLIER' && (savedState.metaUpgrades || []).find(s => s.id === def.id)?.isPurchased)
                        .reduce((sum, def) => sum + def.value, 0);
                    const globalPassiveMultiplier = 1 +
                        (savedState.globalUpgrades || []).filter(u => u.isPurchased && GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id)?.type === 'PASSIVE_MULTIPLIER')
                            .reduce((sum, u) => sum + GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id).value, 0) +
                        (savedState.rewardBonuses?.passiveMultiplier || 0);

                    const baseVps = (savedState.memes || []).reduce((total, meme) => {
                        if (meme.isUnlocked) { return total + meme.passiveViews * meme.level; }
                        return total;
                    }, 0);

                    const totalVps = baseVps * globalPassiveMultiplier * prestigeMultiplier * metaPassiveMultiplier;
                    const viewsEarnedOffline = Math.floor(totalVps * effectiveOfflineSeconds);

                    savedState.totalViews += viewsEarnedOffline;
                    savedState.offlineReport = {
                        timeAway: effectiveOfflineSeconds,
                        viewsEarned: viewsEarnedOffline
                    };
                }

                initialState = { ...defaultState, ...savedState };
            }
        }
    }

    const store = writable(initialState);
    const { subscribe, update } = store;

    function checkAchievements(state) {
        for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
            if (!state.achievementsProgress[achievementDef.id] && achievementDef.checkCondition(state)) {
                state.achievementsProgress[achievementDef.id] = true;
                achievementDef.applyReward(state);
            }
        }
        return state;
    }

    if (browser) {
        subscribe((currentState) => {
            const savableState = {
                totalViews: currentState.totalViews,
                totalClicks: currentState.totalClicks,
                activeMemeIndex: currentState.activeMemeIndex,
                lastSaveTime: Date.now(),
                prestigePoints: currentState.prestigePoints,
                memes: currentState.memes,
                globalUpgrades: currentState.globalUpgrades,
                metaUpgrades: currentState.metaUpgrades,
                achievementsProgress: currentState.achievementsProgress,
                rewardBonuses: currentState.rewardBonuses
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savableState));
        });

        setInterval(() => {
            update((state) => {
                const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);
                const metaPassiveMultiplier = 1 + META_UPGRADE_DEFINITIONS.filter(def => def.type === 'PASSIVE_MULTIPLIER' && state.metaUpgrades.find(s => s.id === def.id)?.isPurchased).reduce((sum, def) => sum + def.value, 0);
                const globalPassiveMultiplier = 1 + state.globalUpgrades.filter(u => u.isPurchased && GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id)?.type === 'PASSIVE_MULTIPLIER').reduce((sum, u) => sum + GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id).value, 0) + state.rewardBonuses.passiveMultiplier;
                let viewsPerSecond = 0;
                for (const meme of state.memes) {
                    if (meme.isUnlocked) {
                        viewsPerSecond += meme.passiveViews * meme.level;
                    }
                }
                state.totalViews += viewsPerSecond * globalPassiveMultiplier * prestigeMultiplier * metaPassiveMultiplier;
                return checkAchievements(state);
            });
        }, 1000);

        setInterval(() => { update(state => { if (!state.floatingBonus.isActive) { if (Math.random() < 0.5) { state.floatingBonus = { isActive: true, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, lifetime: 10 }; } } return state; }); }, 30000);
        setInterval(() => { update(state => { if (state.floatingBonus.isActive) { state.floatingBonus.lifetime--; if (state.floatingBonus.lifetime <= 0) { state.floatingBonus.isActive = false; } } return state; }); }, 1000);
    }

    return {
        subscribe,
        calculatePrestigeGain: (views) => {
            if (views < PRESTIGE_THRESHOLD) return 0;
            return Math.floor(5 * Math.log10(views / PRESTIGE_THRESHOLD));
        },
        prestigeReset: () => update(state => {
            const prestigeGain = gameStore.calculatePrestigeGain(state.totalViews);
            if (prestigeGain <= 0) return state;

            const newPrestigePoints = state.prestigePoints + prestigeGain;
            const newMetaUpgrades = state.metaUpgrades;

            const newState = JSON.parse(JSON.stringify(defaultState));

            newState.prestigePoints = newPrestigePoints;
            newState.metaUpgrades = newMetaUpgrades;

            if (newMetaUpgrades.find(m => m.id === 'start_bonus_1' && m.isPurchased)) {
                newState.totalViews = 10000;
            }

            return newState;
        }),
        purchaseMetaUpgrade: (upgradeId) => update(state => {
            const metaUpgradeDef = META_UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
            const metaUpgradeState = state.metaUpgrades.find(u => u.id === upgradeId);

            if (metaUpgradeDef && metaUpgradeState && !metaUpgradeState.isPurchased && state.prestigePoints >= metaUpgradeDef.cost) {
                state.prestigePoints -= metaUpgradeDef.cost;
                metaUpgradeState.isPurchased = true;
            }
            return state;
        }),
        addViews: () =>
            update((state) => {
                state.totalClicks++;
                const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);
                const clickMultiplier = 1 + state.globalUpgrades.filter(u => u.isPurchased && GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id)?.type === 'CLICK_MULTIPLIER').reduce((sum, u) => sum + GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id).value, 0) + state.rewardBonuses.clickMultiplier;
                const activeMeme = state.memes[state.activeMemeIndex];
                const baseClickViews = activeMeme.baseViews * activeMeme.level;
                state.totalViews += baseClickViews * clickMultiplier * prestigeMultiplier;
                return checkAchievements(state);
            }),
        setBuyMultiplier: (multiplier) =>
            update((state) => {
                state.buyMultiplier = multiplier;
                return state;
            }),
        upgradeMeme: (memeId) =>
            update((state) => {
                const memeToUpgrade = state.memes.find((m) => m.id === memeId);
                if (!memeToUpgrade) return state;

                const costReduction = 1 - state.globalUpgrades
                    .filter(u => u.isPurchased && GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id)?.type === 'UPGRADE_COST_REDUCTION')
                    .reduce((sum, u) => sum + GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id).value, 0);

                const ratio = 1.6; // Коэффициент удорожания
                let amountToBuy = state.buyMultiplier;
                let totalCost = 0;

                if (amountToBuy > 0) { // Для x1, x10, x100
                    let currentCost = memeToUpgrade.upgradeCost;
                    for (let i = 0; i < amountToBuy; i++) {
                        totalCost += currentCost;
                        currentCost = Math.round(currentCost * ratio);
                    }
                } else { // для MAX (buyMultiplier === -1)
                    let currentCost = memeToUpgrade.upgradeCost;
                    let affordableLevels = 0;
                    let availableViews = state.totalViews;

                    while (availableViews >= currentCost * costReduction) {
                        availableViews -= currentCost * costReduction;
                        totalCost += currentCost * costReduction;
                        currentCost = Math.round(currentCost * ratio);
                        affordableLevels++;
                    }
                    amountToBuy = affordableLevels;
                    // Для MAX мы уже учли стоимость списания, поэтому обнуляем totalCost
                    // и используем state.totalViews напрямую для списания.
                    totalCost = 0;
                    for(let i=0; i<amountToBuy; i++) {
                        totalCost += memeToUpgrade.upgradeCost * Math.pow(ratio, i);
                    }
                    totalCost = Math.round(totalCost);
                }

                const finalTotalCost = totalCost * costReduction;

                if (amountToBuy > 0 && state.totalViews >= finalTotalCost) {
                    state.totalViews -= finalTotalCost;
                    memeToUpgrade.level += amountToBuy;
                    // Рассчитываем новую стоимость следующего улучшения
                    memeToUpgrade.upgradeCost = Math.round(memeToUpgrade.upgradeCost * Math.pow(ratio, amountToBuy));
                }

                return checkAchievements(state);
            }),
        unlockMeme: (memeId) =>
            update((state) => {
                const memeToUnlock = state.memes.find((m) => m.id === memeId);
                if (memeToUnlock && !memeToUnlock.isUnlocked && state.totalViews >= memeToUnlock.unlockCost) {
                    state.totalViews -= memeToUnlock.unlockCost;
                    memeToUnlock.isUnlocked = true;
                }
                return checkAchievements(state);
            }),
        purchaseGlobalUpgrade: (upgradeId) =>
            update((state) => {
                const upgrade = state.globalUpgrades.find(u => u.id === upgradeId);
                const upgradeDef = GLOBAL_UPGRADE_DEFINITIONS.find(d => d.id === upgradeId);
                if (upgrade && upgradeDef && !upgrade.isPurchased && state.totalViews >= upgradeDef.cost) {
                    state.totalViews -= upgradeDef.cost;
                    upgrade.isPurchased = true;
                }
                return checkAchievements(state);
            }),
        setActiveMeme: (index) =>
            update((state) => {
                if (state.memes[index].isUnlocked) {
                    state.activeMemeIndex = index;
                }
                return state;
            }),
        setView: (viewName) =>
            update((state) => {
                state.activeView = viewName;
                return state;
            }),
        clearOfflineReport: () =>
            update(state => {
                state.offlineReport = null;
                return state;
            }),
        clickFloatingBonus: () =>
            update(state => {
                if (state.floatingBonus.isActive) {
                    const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);
                    const passiveMultiplier = 1 + state.globalUpgrades.filter(u => u.isPurchased && GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id)?.type === 'PASSIVE_MULTIPLIER').reduce((sum, u) => sum + GLOBAL_UPGRADE_DEFINITIONS.find(def => def.id === u.id).value, 0) + state.rewardBonuses.passiveMultiplier;
                    let viewsPerSecond = 0;
                    for (const meme of state.memes) {
                        if (meme.isUnlocked) {
                            viewsPerSecond += meme.passiveViews * meme.level;
                        }
                    }
                    const totalVps = viewsPerSecond * passiveMultiplier * prestigeMultiplier;
                    const reward = (totalVps * 60 * 15) + (state.totalViews * 0.05);
                    state.totalViews += reward;
                    state.floatingBonus.isActive = false;
                }
                return state;
            }),
    };
}

export const gameStore = createGameStore();