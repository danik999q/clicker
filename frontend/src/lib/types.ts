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

export interface Upgrade {
    id: string;
    isPurchased: boolean;
}

export interface AchievementProgress {
    [key: string]: boolean;
}

export interface RewardBonuses {
    clickMultiplier: number;
    passiveMultiplier: number;
}

export interface ActiveBoost {
    isActive: boolean;
    expiry: number;
}

export interface DailyQuest {
    id: string;
    progress: number;
    isCompleted: boolean;
    isClaimed: boolean;
}

export interface DailyProgress {
    dailyClicks: number;
    dailyViews: number;
    dailyLevels: number;
    dailyBonuses: number;
}

export interface OfflineReport {
    timeAway: number;
    viewsEarned: number;
}

export interface UpgradeTreeState {
    [nodeId: string]: {
        level: number;
    };
}

export interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    cost: number;
    prerequisites: string[];
    effect: {
        type: 'PASSIVE_MULTIPLIER' | 'CLICK_MULTIPLIER' | 'UPGRADE_COST_REDUCTION';
        value: number;
    };
    children: UpgradeDefinition[];
}

export interface MetaUpgradeDefinition {
    id: string;
    name: string;
    description: string;
    cost: number;
    type?: 'PASSIVE_MULTIPLIER';
    value?: number;
}

export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    rewardDescription: string;
    checkCondition: (state: GameState) => boolean;
    applyReward: (state: GameState) => void;
}

export interface DailyQuestDefinition {
    id: string;
    name: string;
    description: string;
    target: number;
    metric: keyof DailyProgress;
    reward: {
        type: 'prestigePoints';
        value: number;
    };
}

export interface GameState {
    isLoading: boolean;
    totalViews: number;
    totalClicks: number;
    activeMemeIndex: number;
    activeView: 'clicker' | 'upgrades' | 'daily' | 'referrals' | 'account';
    buyMultiplier: number;
    lastSaveTime: number;
    offlineReport: OfflineReport | null;
    floatingBonus: {
        isActive: boolean;
        x: number;
        y: number;
        lifetime: number;
    };
    prestigePoints: number;
    telegramId: number | null;
    referralSystem: {
        userId: string | null;
        referredCount: number;
        earnings: number;
    };
    walletAddress: string | null;
    isWalletConnected: boolean;
    memes: Meme[];
    upgradeTrees: {
        [treeId: string]: UpgradeTreeState;
    };
    metaUpgrades: Upgrade[];
    achievementsProgress: AchievementProgress;
    rewardBonuses: RewardBonuses;
    activeBoosts: {
        clickFrenzy: ActiveBoost;
        incomeMultiplier: ActiveBoost;
    };
    daily: {
        lastReset: string;
        quests: DailyQuest[];
        progress: DailyProgress;
    };
    leaderboard: {
        isLoading: boolean;
        data: LeaderboardEntry[];
    };
    clan: Clan | null;
    raid: Raid | null;
}
export interface LeaderboardEntry {
    username: string;
    prestigePoints: number;
    totalViews: number;
}
export interface Referral {
    telegram_id: string;
    username: string;
}
export interface ClanMember {
    telegram_id: string;
    username: string;
    totalViews: number;
    roleId: string;
}
export interface ClanLeaderboardEntry {
    id: number;
    name: string;
    memberCount: number;
    totalViews: number;
}
export interface ClanRole {
    id: string;
    name: string;
    permissions: string[];
}

export interface ClanApplication {
    user: ClanMember;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ClanEvent {
    type: 'join' | 'leave' | 'promote' | 'demote' | 'create' | 'edit' | 'raid_start' | 'raid_end' | 'custom';
    user: ClanMember;
    date: string;
    details?: string;
}

export interface Clan {
    id: number;
    name: string;
    description: string;
    avatarUrl: string;
    level: number;
    members: ClanMember[];
    roles: ClanRole[];
    applications: ClanApplication[];
    history: ClanEvent[];
    totalViews: number;
}
export interface RaidParticipant {
    user_id: string;
    damage_dealt: number;
}
export interface Raid {
    id: number;
    clan_id: number;
    boss_health: number;
    max_health: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    participants: RaidParticipant[];
}