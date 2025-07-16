export const UPGRADE_COST_RATIO = 1.6;
export const SAVE_INTERVAL_MS = 5000;
export const FLOATING_BONUS_INTERVAL_MS = 30000;
export const FLOATING_BONUS_LIFETIME_S = 10;
export const CLICK_FRENZY_MULTIPLIER = 500;
export const INCOME_MULTIPLIER_VALUE = 7;
export const INCOME_MULTIPLIER_DURATION_S = 60;
export const CLICK_FRENZY_DURATION_S = 15;
export const PRESTIGE_THRESHOLD = 1e12;
export const MAX_OFFLINE_EARNINGS_S = 7 * 24 * 60 * 60; // 7 days

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
export const DAILY_QUEST_DEFINITIONS = [
    { id: 'daily_clicks_1', name: 'Энергичный кликер', description: 'Сделать 2,000 кликов.', target: 2000, metric: 'dailyClicks', reward: { type: 'prestigePoints', value: 1 } },
    { id: 'daily_views_1', name: 'Начало хайпа', description: 'Заработать 100,000 просмотров за сегодня.', target: 100000, metric: 'dailyViews', reward: { type: 'prestigePoints', value: 1 } },
    { id: 'daily_upgrades_1', name: 'Инвестор', description: 'Купить 50 уровней для любого мема.', target: 50, metric: 'dailyLevels', reward: { type: 'prestigePoints', value: 2 } },
    { id: 'daily_bonus_1', name: 'Счастливчик', description: 'Поймать 3 случайных бонуса.', target: 3, metric: 'dailyBonuses', reward: { type: 'prestigePoints', value: 3 } },
];