import { UPGRADE_TREES, META_UPGRADE_DEFINITIONS, UPGRADE_COST_RATIO } from './constants';
import type { GameState, UpgradeTreeState, UpgradeDefinition } from './types';

function getBonusFromTree(
    node: UpgradeDefinition,
    treeState: UpgradeTreeState,
    type: 'PASSIVE_MULTIPLIER' | 'CLICK_MULTIPLIER' | 'UPGRADE_COST_REDUCTION'
): number {
    let bonus = 0;
    const nodeState = treeState[node.id];
    const currentLevel = nodeState?.level || 0;

    if (currentLevel > 0) {
        if (node.effect.type === type) {
            bonus += node.effect.value * currentLevel;
        }
        for (const child of node.children) {
            bonus += getBonusFromTree(child, treeState, type);
        }
    }
    return bonus;
}

export function calculatePassiveIncome(state: GameState): number {
    const incomeBoostMultiplier = state.activeBoosts.incomeMultiplier.isActive ? 7 : 1;
    const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);

    const metaPassiveMultiplier = 1 + META_UPGRADE_DEFINITIONS
        .filter(def => def.type === 'PASSIVE_MULTIPLIER' && state.metaUpgrades.find(s => s.id === def.id)?.isPurchased)
        .reduce((sum, def) => sum + def.value, 0);

    let globalPassiveMultiplier = 1 + state.rewardBonuses.passiveMultiplier;
    for (const tree of UPGRADE_TREES) {
        const treeState = state.upgradeTrees[tree.id];
        if (treeState) {
            globalPassiveMultiplier += getBonusFromTree(tree, treeState, 'PASSIVE_MULTIPLIER');
        }
    }

    const viewsPerSecond = state.memes
        .filter(meme => meme.isUnlocked)
        .reduce((sum, meme) => sum + meme.passiveViews * meme.level, 0);

    return viewsPerSecond * globalPassiveMultiplier * prestigeMultiplier * incomeBoostMultiplier * metaPassiveMultiplier;
}

export function calculateClickValue(state: GameState): number {
    const clickFrenzyMultiplier = state.activeBoosts.clickFrenzy.isActive ? 500 : 1;
    const prestigeMultiplier = 1 + (state.prestigePoints * 0.02);

    let clickMultiplier = 1 + state.rewardBonuses.clickMultiplier;
    for (const tree of UPGRADE_TREES) {
        const treeState = state.upgradeTrees[tree.id];
        if (treeState) {
            clickMultiplier += getBonusFromTree(tree, treeState, 'CLICK_MULTIPLIER');
        }
    }

    const activeMeme = state.memes[state.activeMemeIndex];
    const baseClickViews = activeMeme.baseViews * activeMeme.level;

    return baseClickViews * clickMultiplier * prestigeMultiplier * clickFrenzyMultiplier;
}

function getGeometricProgressionSum(baseCost: number, ratio: number, levels: number): number {
    if (ratio === 1) {
        return baseCost * levels;
    }
    return baseCost * (1 - Math.pow(ratio, levels)) / (1 - ratio);
}

export function calculateUpgradeCost(state: GameState, memeId: string, buyMultiplier: number): { totalCost: number; levelsToBuy: number } {
    const memeToUpgrade = state.memes.find((m) => m.id === memeId);
    if (!memeToUpgrade) return { totalCost: 0, levelsToBuy: 0 };

    let costReductionBonus = 0;
    for (const tree of UPGRADE_TREES) {
        const treeState = state.upgradeTrees[tree.id];
        if (treeState) {
            costReductionBonus += getBonusFromTree(tree, treeState, 'UPGRADE_COST_REDUCTION');
        }
    }
    const costReductionMultiplier = 1 - costReductionBonus;

    let totalCost = 0;
    let levelsToBuy = 0;
    const currentUpgradeCost = memeToUpgrade.upgradeCost;

    if (buyMultiplier > 0) {
        levelsToBuy = buyMultiplier;
        totalCost = getGeometricProgressionSum(currentUpgradeCost, UPGRADE_COST_RATIO, levelsToBuy);
    } else {
        const availableViews = state.totalViews / costReductionMultiplier;
        if (availableViews < currentUpgradeCost) {
            return { totalCost: 0, levelsToBuy: 0 };
        }
        levelsToBuy = Math.floor(
            Math.log(1 - (availableViews / currentUpgradeCost) * (1 - UPGRADE_COST_RATIO)) / Math.log(UPGRADE_COST_RATIO)
        );
        if (levelsToBuy > 0) {
            totalCost = getGeometricProgressionSum(currentUpgradeCost, UPGRADE_COST_RATIO, levelsToBuy);
        }
    }

    return {
        totalCost: Math.ceil(totalCost * costReductionMultiplier),
        levelsToBuy
    };
}