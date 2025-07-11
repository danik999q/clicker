import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// --- КОНСТАНТЫ (остаются без изменений) ---
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

// Убедитесь, что здесь ваш актуальный ngrok URL или адрес для деплоя
const API_BASE_URL = 'https://b6357454418d.ngrok-free.app/api';

function createGameStore() {
    const defaultState = {
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
        referralSystem: { userId: null, referredCount: 0, earnings: 0, },
        memes: [
            { id: 'crocodilo', name: 'Crocodilo Bombordiro', level: 1, isUnlocked: true, unlockCost: 0, baseViews: 1, passiveViews: 0.1, upgradeCost: 10, imageUrl: 'https://i.kym-cdn.com/entries/icons/original/000/048/739/crocodilo_bombordiro_cover.jpg' },
            { id: 'sahur', name: 'Tung Tung Sahur', level: 1, isUnlocked: false, unlockCost: 500, baseViews: 5, passiveViews: 1, upgradeCost: 100, imageUrl: 'https://i1.sndcdn.com/artworks-KaAh3b3p34BqXn3g-VXZI5w-t500x500.jpg' },
            { id: 'skibidi', name: 'Skibidi Toilet', level: 1, isUnlocked: false, unlockCost: 5000, baseViews: 25, passiveViews: 5, upgradeCost: 1200, imageUrl: 'https://i.ytimg.com/vi/nzp_t-s1k6s/maxresdefault.jpg' }
        ],
        globalUpgrades: GLOBAL_UPGRADE_DEFINITIONS.map(def => ({ id: def.id, isPurchased: false })),
        metaUpgrades: META_UPGRADE_DEFINITIONS.map(def => ({ id: def.id, isPurchased: false })),
        achievementsProgress: { views_1: false, clicks_1: false, unlock_1: false, },
        rewardBonuses: { clickMultiplier: 0, passiveMultiplier: 0 }
    };

    const store = writable(defaultState);
    const { subscribe, set, update } = store;

    function checkAchievements(state) {
        for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
            if (!state.achievementsProgress[achievementDef.id] && achievementDef.checkCondition(state)) {
                state.achievementsProgress[achievementDef.id] = true;
                achievementDef.applyReward(state);
            }
        }
        return state;
    }

    function saveState() {
        const currentState = get(store);
        if (!currentState.isLoading && currentState.telegramId) {
            const savableState = {
                totalViews: currentState.totalViews,
                totalClicks: currentState.totalClicks,
                activeMemeIndex: currentState.activeMemeIndex,
                buyMultiplier: currentState.buyMultiplier,
                lastSaveTime: Date.now(),
                prestigePoints: currentState.prestigePoints,
                memes: currentState.memes,
                globalUpgrades: currentState.globalUpgrades,
                metaUpgrades: currentState.metaUpgrades,
                achievementsProgress: currentState.achievementsProgress,
                rewardBonuses: currentState.rewardBonuses,
                referralSystem: currentState.referralSystem,
            };
            const blob = new Blob([JSON.stringify({ gameState: savableState })], { type: 'application/json; charset=UTF-8' });
            navigator.sendBeacon(`${API_BASE_URL}/users/${currentState.telegramId}/state`, blob);
        }
    }

    if (browser) {
        // --- ВОЗВРАЩАЕМ ПРОСТУЮ И НАДЁЖНУЮ ЛОГИКУ СОХРАНЕНИЯ ---

        // 1. Периодическое сохранение каждые 5 секунд
        setInterval(saveState, 5000);

        // 2. Сохранение при попытке закрыть вкладку (для десктопа)
        window.addEventListener('beforeunload', saveState);

        // 3. Сохранение, когда пользователь сворачивает приложение
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveState();
            }
        });

        // Таймеры пассивного дохода и бонусов остаются без изменений
        setInterval(() => {
            update((state) => {
                if (state.isLoading) return state;
                const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);
                const metaPassiveMultiplier = 1 + META_UPGRADE_DEFINITIONS.filter(def => def.type === 'PASSIVE_MULTIPLIER' && state.metaUpgrades.find(s => s.id === def.id)?.isPurchased).reduce((sum, def) => sum + def.value, 0);
                const globalPassiveMultiplier = 1 + GLOBAL_UPGRADE_DEFINITIONS.filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'PASSIVE_MULTIPLIER').reduce((sum, u) => sum + u.value, 0) + state.rewardBonuses.passiveMultiplier;
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
        set,
        saveState,
        loadStateFromServer: async (telegramId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${telegramId}/state`, {
                    headers: {'ngrok-skip-browser-warning': 'true'}
                });

                if (response.status === 404) {
                    console.log('User not found. Registering new user...');
                    await fetch(`${API_BASE_URL}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegram_id: telegramId, username: 'user_' + telegramId })
                    });
                    const newState = {
                        ...defaultState,
                        telegramId: telegramId,
                        referralSystem: { ...defaultState.referralSystem, userId: telegramId },
                        isLoading: false
                    };
                    set(newState);
                    return;
                }

                if (!response.ok) { throw new Error('Server error while loading state'); }

                const serverState = await response.json();

                const hydratedState = {
                    ...defaultState,
                    ...serverState,
                    telegramId: telegramId,
                    isLoading: false,
                    referralSystem: {
                        ...defaultState.referralSystem,
                        ...(serverState.referralSystem || {}),
                        userId: telegramId
                    },
                    memes: defaultState.memes.map(defaultMeme => {
                        const savedMeme = serverState.memes?.find(m => m.id === defaultMeme.id);
                        return savedMeme ? { ...defaultMeme, ...savedMeme } : defaultMeme;
                    }),
                    globalUpgrades: defaultState.globalUpgrades.map(defaultUpgrade => {
                        const savedUpgrade = serverState.globalUpgrades?.find(u => u.id === defaultUpgrade.id);
                        return savedUpgrade ? { ...defaultUpgrade, ...savedUpgrade } : defaultUpgrade;
                    }),
                    metaUpgrades: defaultState.metaUpgrades.map(defaultUpgrade => {
                        const savedUpgrade = serverState.metaUpgrades?.find(u => u.id === defaultUpgrade.id);
                        return savedUpgrade ? { ...defaultUpgrade, ...savedUpgrade } : defaultUpgrade;
                    }),
                };

                set(hydratedState);

            } catch (error) {
                console.error("Failed to load state from server:", error);
                update(state => ({ ...state, isLoading: false, error: error.message }));
            }
        },
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
            saveState();
            return newState;
        }),
        purchaseMetaUpgrade: (upgradeId) => update(state => {
            const metaUpgradeDef = META_UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
            const metaUpgradeState = state.metaUpgrades.find(u => u.id === upgradeId);
            if (metaUpgradeDef && metaUpgradeState && !metaUpgradeState.isPurchased && state.prestigePoints >= metaUpgradeDef.cost) {
                state.prestigePoints -= metaUpgradeDef.cost;
                metaUpgradeState.isPurchased = true;
                saveState();
            }
            return state;
        }),
        addViews: () =>
            update((state) => {
                state.totalClicks++;
                const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);
                const clickMultiplier = 1 + GLOBAL_UPGRADE_DEFINITIONS.filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'CLICK_MULTIPLIER').reduce((sum, u) => sum + u.value, 0) + state.rewardBonuses.clickMultiplier;
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
                const costReduction = 1 - GLOBAL_UPGRADE_DEFINITIONS.filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'UPGRADE_COST_REDUCTION').reduce((sum, u) => sum + u.value, 0);
                const memeToUpgrade = state.memes.find((m) => m.id === memeId);
                if (!memeToUpgrade) return state;
                const ratio = 1.6;
                let amountToBuy = state.buyMultiplier;
                let totalCost = 0;
                if (amountToBuy > 0) {
                    let currentCost = memeToUpgrade.upgradeCost;
                    for (let i = 0; i < amountToBuy; i++) {
                        totalCost += currentCost;
                        currentCost = Math.round(currentCost * ratio);
                    }
                } else {
                    let currentCost = memeToUpgrade.upgradeCost;
                    let affordableLevels = 0;
                    let availableViews = state.totalViews;
                    while (availableViews >= currentCost * costReduction) {
                        availableViews -= currentCost * costReduction;
                        affordableLevels++;
                        currentCost = Math.round(currentCost * ratio);
                    }
                    amountToBuy = affordableLevels;
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
                const upgradeDef = GLOBAL_UPGRADE_DEFINITIONS.find(d => d.id === upgradeId);
                const upgradeState = state.globalUpgrades.find(u => u.id === upgradeId);
                if (upgradeDef && upgradeState && !upgradeState.isPurchased && state.totalViews >= upgradeDef.cost) {
                    state.totalViews -= upgradeDef.cost;
                    upgradeState.isPurchased = true;
                    saveState();
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
                    const passiveMultiplier = 1 + GLOBAL_UPGRADE_DEFINITIONS.filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'PASSIVE_MULTIPLIER').reduce((sum, u) => sum + u.value, 0) + state.rewardBonuses.passiveMultiplier;
                    let viewsPerSecond = 0;
                    for (const meme of state.memes) { if (meme.isUnlocked) { viewsPerSecond += meme.passiveViews * meme.level; } }
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