export interface Meme {
    id: string;
    name: string;
    level: number;
    isUnlocked: boolean;
    unlockCost: number;
    baseViews: number;
    passiveViews: number;
    upgradeCost: number;
    imageUrl: string;
}

export interface RewardBonuses {
    clickMultiplier: number;
    passiveMultiplier: number;
}

export interface OfflineReport {
    timeAway: number;
    viewsEarned: number;
}

export interface GameState {
    totalViews: number;
    prestigePoints?: number;
    memes: Meme[];
    activeMemeIndex?: number;
    rewardBonuses?: RewardBonuses;
    lastSaveTime?: number;
    walletAddress?: string | null;
    isWalletConnected?: boolean;
    offlineReport?: OfflineReport | null;
    [key: string]: any;
}