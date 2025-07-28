import { get } from 'svelte/store';
import { gameStore } from './store';
import * as api from './api';
import * as constants from './constants';
import { calculatePassiveIncome, calculateClickValue, calculateUpgradeCost } from './gameLogic';
import type { GameState, FloatingBonusType } from './types';

const updateState = (updater: (state: GameState) => GameState) => {
    gameStore.update(updater);
};

const checkAchievements = (state: GameState): GameState => {
    for (const achievementDef of constants.ACHIEVEMENT_DEFINITIONS) {
        if (!state.achievementsProgress[achievementDef.id] && achievementDef.checkCondition(state)) {
            state.achievementsProgress[achievementDef.id] = true;
            achievementDef.applyReward(state);
        }
    }
    return state;
};

const updateDailyProgress = (state: GameState, metric: keyof GameState['daily']['progress'], value: number): GameState => {
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
};

const checkAndResetDailies = (state: GameState): GameState => {
    const today = new Date().toISOString().split('T')[0];
    if (state.daily.lastReset !== today || state.daily.quests.length === 0) {
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
};

export const GameService = {
    initializeIntervals: () => {
        setInterval(() => {
            updateState(state => {
                const now = Date.now();
                if (state.activeBoosts.clickFrenzy.isActive && now > state.activeBoosts.clickFrenzy.expiry) {
                    state.activeBoosts.clickFrenzy.isActive = false;
                }
                if (state.activeBoosts.incomeMultiplier.isActive && now > state.activeBoosts.incomeMultiplier.expiry) {
                    state.activeBoosts.incomeMultiplier.isActive = false;
                }

                if (state.floatingBonus.isActive) {
                    state.floatingBonus.lifetime--;
                    if (state.floatingBonus.lifetime <= 0) {
                        state.floatingBonus.isActive = false;
                    }
                }
                return state;
            });
        }, 1000);

        setInterval(() => {
            updateState(state => {
                if (state.isLoading || state.floatingBonus.isActive) return state;

                if (Math.random() < 0.7) {
                    const rand = Math.random();
                    let type: FloatingBonusType;
                    if (rand < 0.15) {
                        type = 'CLICK_FRENZY';
                    } else if (rand < 0.45) {
                        type = 'INCOME_MULTIPLIER';
                    } else {
                        type = 'CASH_PAYOUT';
                    }
                    state.floatingBonus = {
                        isActive: true,
                        x: Math.random() * 80 + 10,
                        y: Math.random() * 80 + 10,
                        lifetime: constants.FLOATING_BONUS_LIFETIME_S,
                        type: type
                    };
                }
                return state;
            });
        }, constants.FLOATING_BONUS_INTERVAL_MS);
    },

    clickFloatingBonus: () => updateState(state => {
        if (!state.floatingBonus.isActive) return state;

        const bonusType = state.floatingBonus.type;
        const now = Date.now();

        switch (bonusType) {
            case 'CLICK_FRENZY':
                state.activeBoosts.clickFrenzy = { isActive: true, expiry: now + constants.CLICK_FRENZY_DURATION_S * 1000 };
                break;
            case 'INCOME_MULTIPLIER':
                state.activeBoosts.incomeMultiplier = { isActive: true, expiry: now + constants.INCOME_MULTIPLIER_DURATION_S * 1000 };
                break;
            case 'CASH_PAYOUT':
                const passiveIncome = calculatePassiveIncome(state);
                const payout = (passiveIncome * 60 * 15) + (state.totalViews * 0.05);
                state.totalViews += payout;
                break;
        }

        state.floatingBonus.isActive = false;
        const newState = updateDailyProgress(state, 'dailyBonuses', 1);
        return newState;
    }),

    addViews: () => updateState(state => {
        if (state.isLoading) return state;
        const viewsEarned = calculateClickValue(state);
        state.totalViews += viewsEarned;
        state.totalClicks++;
        let newState = updateDailyProgress(state, 'dailyClicks', 1);
        newState = updateDailyProgress(newState, 'dailyViews', viewsEarned);
        return checkAchievements(newState);
    }),

    upgradeMeme: (memeId: string) => updateState(state => {
        if (state.isLoading) return state;
        const { totalCost, levelsToBuy } = calculateUpgradeCost(state, memeId, state.buyMultiplier);
        if (levelsToBuy > 0 && state.totalViews >= totalCost) {
            state.totalViews -= totalCost;
            const meme = state.memes.find(m => m.id === memeId);
            if (meme) {
                meme.level += levelsToBuy;
                meme.upgradeCost = Math.round(meme.upgradeCost * Math.pow(constants.UPGRADE_COST_RATIO, levelsToBuy));
            }
            const newState = updateDailyProgress(state, 'dailyLevels', levelsToBuy);
            return checkAchievements(newState);
        }
        return state;
    }),

    unlockMeme: (memeId: string) => updateState(state => {
        const memeToUnlock = state.memes.find((m) => m.id === memeId);
        if (memeToUnlock && !memeToUnlock.isUnlocked && state.totalViews >= memeToUnlock.unlockCost) {
            state.totalViews -= memeToUnlock.unlockCost;
            memeToUnlock.isUnlocked = true;
        }
        return checkAchievements(state);
    }),

    claimDailyReward: (questId: string) => updateState(state => {
        const quest = state.daily.quests.find(q => q.id === questId);
        const questDef = constants.DAILY_QUEST_DEFINITIONS.find(d => d.id === questId);
        if (quest?.isCompleted && !quest.isClaimed && questDef) {
            quest.isClaimed = true;
            if (questDef.reward.type === 'prestigePoints') {
                state.prestigePoints += questDef.reward.value;
            }
        }
        return state;
    }),

    prestigeReset: () => updateState(state => {
        const defaultState = get(gameStore);
        const prestigeGain = calculatePrestigeGain(state.totalViews);
        if (prestigeGain <= 0) return state;

        const newState: GameState = {
            ...defaultState,
            isLoading: false,
            telegramId: state.telegramId,
            prestigePoints: state.prestigePoints + prestigeGain,
            metaUpgrades: state.metaUpgrades,
            clan: state.clan
        };
        if (state.metaUpgrades.find(m => m.id === 'start_bonus_1' && m.isPurchased)) {
            newState.totalViews = 10000;
        }
        return checkAndResetDailies(newState);
    }),

    createClan: async (name: string) => {
        const state = get(gameStore);
        if (!state.telegramId) return;
        try {
            await api.createClan(name, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    leaveClan: async () => {
        const state = get(gameStore);
        if (!state.telegramId || !state.clan) return;
        try {
            await api.leaveClan(state.telegramId, state.clan.id);
            updateState(s => ({ ...s, clan: null, raid: null }));
        } catch (error: any) {
            alert(error.message);
        }
    },

    attackRaidBoss: async () => {
        const state = get(gameStore);
        if (!state.raid || !state.telegramId) return;
        try {
            const response = await api.attackRaidBoss(state.raid.id, state.telegramId);
            if (response && response.newBossHealth !== undefined) {
                updateState(s => {
                    if (s.raid) {
                        s.raid.boss_health = response.newBossHealth;
                    }
                    return s;
                });
            }
        } catch (error: any) {
            alert(error.message);
        }
    },

    claimRaidReward: async () => {
        const state = get(gameStore);
        if (!state.raid || !state.telegramId) return;
        try {
            const response = await api.claimRaidReward(state.raid.id, state.telegramId);
            alert(response.message);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    startRaid: async () => {
        const state = get(gameStore);
        if (!state.clan || !state.telegramId) return;
        try {
            await api.startRaid(state.clan.id, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    submitClanApplication: async (clanId: number) => {
        const state = get(gameStore);
        if (!state.telegramId) return;
        try {
            const response = await api.submitClanApplication(clanId, state.telegramId);
            alert(response.message || 'Заявка успешно подана!');
        } catch (error: any) {
            console.error("Failed to submit clan application:", error);
            alert(`Ошибка: ${error.message}`);
        }
    },

    approveClanApplication: async (userId: string) => {
        const state = get(gameStore);
        if (!state.clan || !state.telegramId) return;
        try {
            await api.approveClanApplication(state.clan.id, userId, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    rejectClanApplication: async (userId: string) => {
        const state = get(gameStore);
        if (!state.clan || !state.telegramId) return;
        try {
            await api.rejectClanApplication(state.clan.id, userId, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    changeClanRole: async (userId: string, newRoleId: string) => {
        const state = get(gameStore);
        if (!state.clan || !state.telegramId) return;
        try {
            await api.changeClanRole(state.clan.id, userId, newRoleId, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },

    transferClanLeadership: async (newLeaderId: string) => {
        const state = get(gameStore);
        if (!state.clan || !state.telegramId) return;
        try {
            await api.transferClanLeadership(state.clan.id, newLeaderId, state.telegramId);
            await gameStore.loadStateFromServer(state.telegramId);
        } catch (error: any) {
            alert(error.message);
        }
    },
};

export function calculatePrestigeGain(views: number): number {
    if (views < constants.PRESTIGE_THRESHOLD) return 0;
    return Math.floor(5 * Math.log10(views / constants.PRESTIGE_THRESHOLD));
}