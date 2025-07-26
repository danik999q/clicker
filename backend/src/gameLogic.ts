import { GameState } from './types';

export const calculatePassiveIncome = (state: GameState): number => {
    if (!state || !state.memes) return 0;
    const prestigeMultiplier = 1 + ((state.prestigePoints || 0) * 0.02);
    const passiveMultiplier = 1 + (state.rewardBonuses?.passiveMultiplier || 0);

    const viewsPerSecond = state.memes
        .filter(meme => meme.isUnlocked)
        .reduce((sum, meme) => sum + (meme.passiveViews || 0) * (meme.level || 1), 0);

    return viewsPerSecond * passiveMultiplier * prestigeMultiplier;
};

export const calculateClickValue = (state: GameState): number => {
    if (!state || !state.memes) return 1;
    const prestigeMultiplier = 1 + ((state.prestigePoints || 0) * 0.02);
    const clickMultiplier = 1 + (state.rewardBonuses?.clickMultiplier || 0);
    const activeMeme = state.memes[state.activeMemeIndex || 0];

    if (!activeMeme) {
        return 1 * clickMultiplier * prestigeMultiplier;
    }

    const baseClickViews = (activeMeme.baseViews || 1) * (activeMeme.level || 1);
    return baseClickViews * clickMultiplier * prestigeMultiplier;
};