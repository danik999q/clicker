import {
    GLOBAL_UPGRADE_DEFINITIONS,
    META_UPGRADE_DEFINITIONS,
    UPGRADE_COST_RATIO
} from './constants.js';

export function calculatePassiveIncome(state) {
    const incomeBoostMultiplier = state.activeBoosts.incomeMultiplier.isActive ? 7 : 1;
    const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);

    const metaPassiveMultiplier = 1 + META_UPGRADE_DEFINITIONS
        .filter(def => def.type === 'PASSIVE_MULTIPLIER' && state.metaUpgrades.find(s => s.id === def.id)?.isPurchased)
        .reduce((sum, def) => sum + def.value, 0);

    const globalPassiveMultiplier = 1 + GLOBAL_UPGRADE_DEFINITIONS
        .filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'PASSIVE_MULTIPLIER')
        .reduce((sum, u) => sum + u.value, 0) + state.rewardBonuses.passiveMultiplier;

    let viewsPerSecond = 0;
    for (const meme of state.memes) {
        if (meme.isUnlocked) {
            viewsPerSecond += meme.passiveViews * meme.level;
        }
    }

    return viewsPerSecond * globalPassiveMultiplier * prestigeMultiplier * incomeBoostMultiplier * metaPassiveMultiplier;
}


export function calculateClickValue(state) {
    const clickFrenzyMultiplier = state.activeBoosts.clickFrenzy.isActive ? 500 : 1;
    const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);

    const clickMultiplier = 1 + GLOBAL_UPGRADE_DEFINITIONS
        .filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'CLICK_MULTIPLIER')
        .reduce((sum, u) => sum + u.value, 0) + state.rewardBonuses.clickMultiplier;

    const activeMeme = state.memes[state.activeMemeIndex];
    const baseClickViews = activeMeme.baseViews * activeMeme.level;

    return baseClickViews * clickMultiplier * prestigeMultiplier * clickFrenzyMultiplier;
}

export function calculateUpgradeCost(state, memeId, buyMultiplier) {
    const memeToUpgrade = state.memes.find((m) => m.id === memeId);
    if (!memeToUpgrade) return { totalCost: 0, levelsToBuy: 0 };

    const costReduction = 1 - GLOBAL_UPGRADE_DEFINITIONS
        .filter(u => state.globalUpgrades.find(s => s.id === u.id)?.isPurchased && u.type === 'UPGRADE_COST_REDUCTION')
        .reduce((sum, u) => sum + u.value, 0);

    let totalCost = 0;
    let levelsToBuy = 0;
    let nextUpgradeCost = memeToUpgrade.upgradeCost;

    if (buyMultiplier > 0) {
        levelsToBuy = buyMultiplier;
        for (let i = 0; i < levelsToBuy; i++) {
            totalCost += nextUpgradeCost;
            nextUpgradeCost = Math.round(nextUpgradeCost * UPGRADE_COST_RATIO);
        }
    } else {
        let availableViews = state.totalViews;
        while (availableViews >= nextUpgradeCost * costReduction) {
            availableViews -= nextUpgradeCost * costReduction;
            totalCost += nextUpgradeCost;
            levelsToBuy++;
            nextUpgradeCost = Math.round(nextUpgradeCost * UPGRADE_COST_RATIO);
        }
    }

    return {
        totalCost: Math.round(totalCost * costReduction),
        levelsToBuy
    };
}