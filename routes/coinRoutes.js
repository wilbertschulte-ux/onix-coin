const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const API_RATE_LIMITS = new Map();

router.use((req, res, next) => {
  try {
    if (req.path.startsWith('/admin') || req.path.startsWith('/cron')) {
      return next();
    }

    const key =
      String(req.body?.telegramId || req.query?.telegramId || req.ip || 'unknown') +
      ':' +
      req.path;

    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = req.path.includes('/tap') ? 900 : 180;
    const item = API_RATE_LIMITS.get(key) || {
      count: 0,
      startedAt: now,
    };

    if (now - item.startedAt > windowMs) {
      item.count = 0;
      item.startedAt = now;
    }

    item.count += 1;
    API_RATE_LIMITS.set(key, item);

    if (item.count > maxRequests) {
      return res.status(429).json({
        message: 'Слишком много запросов. Попробуйте позже.',
      });
    }

    return next();
  } catch {
    return next();
  }
});

const User = require('../models/User');

const WeeklyPrizeSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true,
    unique: true,
  },
  awardedAt: {
    type: Number,
    default: Date.now,
  },
  winners: {
    type: [
      {
        place: Number,
        telegramId: String,
        username: String,
        weeklyEarned: Number,
        prize: Number,
      },
    ],
    default: [],
  },
});

const WeeklyPrize =
  mongoose.models.WeeklyPrize || mongoose.model('WeeklyPrize', WeeklyPrizeSchema);


const LEVEL_COINS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OFFLINE_SECONDS = 3 * 60 * 60;
const MAX_TAPS_PER_SECOND = 12;
const MAX_PAID_REFERRALS_PER_DAY = getEconomyConfig().maxPaidReferralsPerDay;
const MAX_PAID_REFERRALS_PER_HOUR = getNumberEnv('MAX_PAID_REFERRALS_PER_HOUR', 5);
const DEFAULT_ENERGY = 500;
const DEFAULT_MAX_ENERGY = 500;
const DEFAULT_TAP_POWER = 1;
const DEFAULT_ENERGY_RECHARGE = 0.5;
const DEFAULT_MINER_INCOME = 0.5;

const PERKS = {
  offline_pro: {
    id: 'offline_pro',
    title: 'Offline Pro',
    baseCost: 100000,
    maxLevel: 3,
  },
  energy_saver: {
    id: 'energy_saver',
    title: 'Energy Saver',
    baseCost: 150000,
    maxLevel: 3,
  },
  daily_plus: {
    id: 'daily_plus',
    title: 'Daily Plus',
    baseCost: 200000,
    maxLevel: 3,
  },
  miner_plus: {
    id: 'miner_plus',
    title: 'Miner Plus',
    baseCost: 250000,
    maxLevel: 3,
  },
  boost_master: {
    id: 'boost_master',
    title: 'Boost Master',
    baseCost: 180000,
    maxLevel: 3,
  },
  streak_shield: {
    id: 'streak_shield',
    title: 'Streak Shield',
    baseCost: 220000,
    maxLevel: 1,
  },
  lucky_miner: {
    id: 'lucky_miner',
    title: 'Lucky Miner',
    baseCost: 300000,
    maxLevel: 3,
  },
  referral_pro: {
    id: 'referral_pro',
    title: 'Referral Pro',
    baseCost: 300000,
    maxLevel: 3,
  },
  energy_max_pro: {
    id: 'energy_max_pro',
    title: 'Energy Max Pro',
    baseCost: 175000,
    maxLevel: 3,
  },
  engineer: {
    id: 'engineer',
    title: 'Engineer',
    baseCost: 250000,
    maxLevel: 3,
  },
};

function getPerkLevel(user, perkId) {
  if (!user.perkLevels) return 0;

  const rawLevel =
    typeof user.perkLevels.get === 'function'
      ? user.perkLevels.get(perkId)
      : user.perkLevels[perkId];

  return Number(rawLevel || 0);
}

function setPerkLevel(user, perkId, level) {
  if (!user.perkLevels) user.perkLevels = new Map();

  if (typeof user.perkLevels.set === 'function') {
    user.perkLevels.set(perkId, level);
  } else {
    user.perkLevels[perkId] = level;
  }
}

function getPerkCost(perkId, nextLevel) {
  const perk = PERKS[perkId];

  if (!perk) return 0;

  return Math.round(perk.baseCost * Math.pow(1.85, Number(nextLevel || 1) - 1));
}

function getMaxOfflineSeconds(user) {
  const level = getPerkLevel(user, 'offline_pro');

  return MAX_OFFLINE_SECONDS + level * 60 * 60;
}

function hasPerk(user, perkId) {
  return getPerkLevel(user, perkId) > 0;
}

function getEnergyCost(user) {
  const level = getPerkLevel(user, 'energy_saver');
  const baseCost = Number(user.tapPower || DEFAULT_TAP_POWER);
  const multiplier = Math.max(0.7, 1 - 0.1 * level);

  return Math.max(1, roundOnix(baseCost * multiplier));
}

function getDailyRewardForUser(user) {
  const level = getPerkLevel(user, 'daily_plus');
  const baseReward = getDailyReward(user.level);
  const multiplier = 1 + 0.1 * level;

  return Math.round(baseReward * multiplier);
}

function getDailyRewardWithStreakForUser(user, streakDay) {
  return Math.round(
    getDailyRewardForUser(user) * getDailyStreakMultiplier(streakDay)
  );
}

function getMinerIncome(user) {
  const minerLevel = getPerkLevel(user, 'miner_plus');
  const luckyLevel = getPerkLevel(user, 'lucky_miner');
  const baseIncome = Number(user.autoclickers || DEFAULT_MINER_INCOME);
  const multiplier = 1 + 0.05 * minerLevel + 0.03 * luckyLevel;

  return roundOnix(baseIncome * multiplier);
}

function getReferralRewardForUser(user) {
  const level = getPerkLevel(user, 'referral_pro');
  const economyConfig = getEconomyConfig();

  return Math.round(economyConfig.referralReward * (1 + 0.05 * level));
}

function getUpgradeDiscountMultiplier(user) {
  const level = getPerkLevel(user, 'engineer');

  return Math.max(0.85, 1 - 0.05 * level);
}

function getBoostDurationMultiplier(user) {
  const level = getPerkLevel(user, 'boost_master');

  return 1 + 0.2 * level;
}

function getMaxEnergyWithPerks(user) {
  const level = getPerkLevel(user, 'energy_max_pro');

  return Number(user.maxEnergy || DEFAULT_MAX_ENERGY) + level * 500;
}
function getNumberEnv(name, fallback) {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}

function getEconomyConfig() {
  return {
    onixEurPer1000: getNumberEnv('ONIX_EUR_PER_1000', 0.68),
    minWithdrawOnix: getNumberEnv('MIN_WITHDRAW_ONIX', 750000),
    referralReward: getNumberEnv('REFERRAL_REWARD', 75000),
    referredUserReward: getNumberEnv('REFERRED_USER_REWARD', 15000),
    maxPaidReferralsPerDay: getNumberEnv('MAX_PAID_REFERRALS_PER_DAY', 10),
  };
}

function getOnixEurRate() {
  return getEconomyConfig().onixEurPer1000 / 1000;
}



const ACHIEVEMENTS = [
  {
    id: 'first_tap',
    title: 'Первый тап',
    description: 'Сделайте первый тап по монете',
    reward: 500,
    goal: 1,
  },
  {
    id: 'taps_100',
    title: '100 тапов',
    description: 'Сделайте 100 тапов',
    reward: 2500,
    goal: 100,
  },
  {
    id: 'taps_1000',
    title: '1 000 тапов',
    description: 'Сделайте 1 000 тапов',
    reward: 10000,
    goal: 1000,
  },
  {
    id: 'first_upgrade',
    title: 'Первое улучшение',
    description: 'Купите любое улучшение',
    reward: 2500,
    goal: 1,
  },
  {
    id: 'miner_level_5',
    title: 'Майнер ур. 5',
    description: 'Прокачайте майнер до 5 уровня',
    reward: 10000,
    goal: 5,
  },
  {
    id: 'first_boost',
    title: 'Первый буст',
    description: 'Активируйте любой временный буст',
    reward: 5000,
    goal: 1,
  },
  {
    id: 'first_offline_claim',
    title: 'Первый оффлайн-доход',
    description: 'Заберите оффлайн-доход майнера',
    reward: 5000,
    goal: 1,
  },
  {
    id: 'first_friend',
    title: 'Первый друг',
    description: 'Пригласите первого друга',
    reward: 25000,
    goal: 1,
  },
  {
    id: 'taps_10000',
    title: '10 000 тапов',
    description: 'Сделайте 10 000 тапов',
    reward: 50000,
    goal: 10000,
  },
  {
    id: 'weekly_100k',
    title: '100 000 ONIX за неделю',
    description: 'Заработайте 100 000 ONIX за неделю',
    reward: 25000,
    goal: 100000,
  },
  {
    id: 'all_perks',
    title: 'Коллекционер перков',
    description: 'Купите все постоянные перки',
    reward: 75000,
    goal: 4,
  },
  {
    id: 'rank_gold',
    title: 'Золотой ранг',
    description: 'Достигните Gold I',
    reward: 50000,
    goal: 750000,
  },
  {
    id: 'rank_diamond',
    title: 'Diamond игрок',
    description: 'Достигните Diamond',
    reward: 250000,
    goal: 5000000,
  },
  {
    id: 'friends_5',
    title: '5 друзей',
    description: 'Пригласите 5 друзей',
    reward: 100000,
    goal: 5,
  },
  {
    id: 'streak_7',
    title: '7 дней подряд',
    description: 'Дойдите до 7 дня daily streak',
    reward: 50000,
    goal: 7,
  },
  {
    id: 'taps_50000',
    title: '50 000 тапов',
    description: 'Сделайте 50 000 тапов',
    reward: 150000,
    goal: 50000,
  },
  {
    id: 'taps_100000',
    title: '100 000 тапов',
    description: 'Сделайте 100 000 тапов',
    reward: 300000,
    goal: 100000,
  },
  {
    id: 'earned_1m',
    title: 'Миллионер ONIX',
    description: 'Заработайте 1 000 000 ONIX всего',
    reward: 100000,
    goal: 1000000,
  },
  {
    id: 'friends_10',
    title: '10 друзей',
    description: 'Пригласите 10 друзей',
    reward: 200000,
    goal: 10,
  },
  {
    id: 'upgrade_master',
    title: 'Мастер апгрейдов',
    description: 'Купите 25 улучшений',
    reward: 100000,
    goal: 25,
  },
  {
    id: 'boost_master',
    title: 'Boost Master',
    description: 'Используйте 10 бустов',
    reward: 75000,
    goal: 10,
  },
  {
    id: 'offline_master',
    title: 'Оффлайн мастер',
    description: 'Заберите оффлайн-доход 10 раз',
    reward: 75000,
    goal: 10,
  },
];

function getAchievementProgressValue(user, achievementId) {
  if (achievementId === 'first_tap') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_100') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_1000') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_10000') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_50000') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_100000') return Number(user.totalTaps || 0);
  if (achievementId === 'earned_1m') return Number(user.totalEarned || 0);
  if (achievementId === 'friends_10') return Number(user.referralsCount || 0);
  if (achievementId === 'upgrade_master') return Number(user.totalUpgradesBought || 0);
  if (achievementId === 'boost_master') return Number(user.totalBoostsUsed || 0);
  if (achievementId === 'offline_master') return Number(user.offlineClaimsCount || 0);
  if (achievementId === 'weekly_100k') return Number(user.weeklyEarned || 0);
  if (achievementId === 'all_perks') return Array.isArray(user.ownedPerks) ? user.ownedPerks.length : 0;
  if (achievementId === 'rank_gold') return Number(user.totalEarned || 0);
  if (achievementId === 'rank_diamond') return Number(user.totalEarned || 0);
  if (achievementId === 'friends_5') return Number(user.referralsCount || 0);
  if (achievementId === 'streak_7') return Number(user.dailyStreak || 0);
  if (achievementId === 'first_upgrade') return Number(user.totalUpgradesBought || 0);
  if (achievementId === 'miner_level_5') return Number(user.minerLevel || 1);
  if (achievementId === 'first_boost') return Number(user.totalBoostsUsed || 0);
  if (achievementId === 'first_offline_claim') return Number(user.offlineClaimsCount || 0);
  if (achievementId === 'first_friend') return Number(user.referralsCount || 0);

  return 0;
}

function getAchievementsPayload(user) {
  if (!user.completedAchievements) user.completedAchievements = [];

  return ACHIEVEMENTS.map((achievement) => {
    const progress = getAchievementProgressValue(user, achievement.id);
    const isCompleted = user.completedAchievements.includes(achievement.id);

    return {
      ...achievement,
      progress: Math.min(progress, achievement.goal),
      isCompleted,
    };
  });
}

function applyAchievements(user) {
  if (!user.completedAchievements) user.completedAchievements = [];

  const awarded = [];

  for (const achievement of ACHIEVEMENTS) {
    if (user.completedAchievements.includes(achievement.id)) continue;

    const progress = getAchievementProgressValue(user, achievement.id);

    if (progress >= achievement.goal) {
      user.completedAchievements.push(achievement.id);
      user.balance = roundOnix(Number(user.balance || 0) + achievement.reward);
      addEarnings(user, achievement.reward);

      addTransaction(
        user,
        'income_achievement',
        achievement.reward,
        `Достижение: ${achievement.title}`
      );

      awarded.push({
        id: achievement.id,
        title: achievement.title,
        reward: achievement.reward,
      });
    }
  }

  return awarded;
}

const RANKS = [
  { id: 'bronze_1', name: 'Bronze I', threshold: 0, bonus: 0 },
  { id: 'bronze_2', name: 'Bronze II', threshold: 25000, bonus: 2500 },
  { id: 'bronze_3', name: 'Bronze III', threshold: 75000, bonus: 7500 },
  { id: 'silver_1', name: 'Silver I', threshold: 150000, bonus: 15000 },
  { id: 'silver_2', name: 'Silver II', threshold: 300000, bonus: 30000 },
  { id: 'silver_3', name: 'Silver III', threshold: 500000, bonus: 50000 },
  { id: 'gold_1', name: 'Gold I', threshold: 750000, bonus: 75000 },
  { id: 'gold_2', name: 'Gold II', threshold: 1000000, bonus: 100000 },
  { id: 'gold_3', name: 'Gold III', threshold: 1500000, bonus: 150000 },
  { id: 'platinum', name: 'Platinum', threshold: 2500000, bonus: 250000 },
  { id: 'diamond', name: 'Diamond', threshold: 5000000, bonus: 500000 },
  { id: 'master', name: 'Master', threshold: 10000000, bonus: 1000000 },
  { id: 'legend', name: 'Legend', threshold: 25000000, bonus: 2500000 },
];

function getRankInfo(totalEarned) {
  const earned = Number(totalEarned || 0);
  let currentRank = RANKS[0];
  let nextRank = null;

  for (let i = 0; i < RANKS.length; i += 1) {
    if (earned >= RANKS[i].threshold) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    }
  }

  const currentThreshold = currentRank.threshold;
  const nextThreshold = nextRank ? nextRank.threshold : currentThreshold;
  const progressTotal = Math.max(1, nextThreshold - currentThreshold);
  const progressCurrent = Math.max(0, earned - currentThreshold);
  const progressPercent = nextRank
    ? Math.min(100, (progressCurrent / progressTotal) * 100)
    : 100;

  return {
    currentRank,
    nextRank,
    progressCurrent: roundOnix(progressCurrent),
    progressTotal: roundOnix(progressTotal),
    progressPercent: roundOnix(progressPercent),
  };
}

function applyRankBonuses(user) {
  if (!user.claimedRankBonuses) user.claimedRankBonuses = [];

  const awarded = [];
  let changed = true;
  let guard = 0;

  while (changed && guard < RANKS.length + 2) {
    changed = false;
    guard += 1;

    for (const rank of RANKS) {
      if (rank.bonus <= 0) continue;
      if (user.claimedRankBonuses.includes(rank.id)) continue;

      if (Number(user.totalEarned || 0) >= rank.threshold) {
        user.balance = roundOnix(Number(user.balance || 0) + rank.bonus);
        addEarnings(user, rank.bonus);
        user.claimedRankBonuses.push(rank.id);
        addTransaction(
          user,
          'income_rank',
          rank.bonus,
          `Бонус ранга ${rank.name}`
        );
        awarded.push({
          id: rank.id,
          name: rank.name,
          bonus: rank.bonus,
        });
        changed = true;
      }
    }
  }

  return awarded;
}


function roundOnix(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function addTransaction(user, type, amount, title, status = 'completed') {
  if (!user.transactions) user.transactions = [];

  user.transactions.unshift({
    type,
    amount: roundOnix(amount),
    title,
    status,
    createdAt: Date.now(),
  });

  user.transactions = user.transactions.slice(0, 50);
}

function prepareReferralBonusWindow(user, now = Date.now()) {
  const todayKey = getUtcDayKey(now);
  const hourKey = getUtcHourKey(now);

  if (user.lastReferralBonusDay !== todayKey) {
    user.lastReferralBonusDay = todayKey;
    user.dailyReferralBonusCount = 0;
  }

  if (user.lastReferralBonusHour !== hourKey) {
    user.lastReferralBonusHour = hourKey;
    user.hourlyReferralBonusCount = 0;
  }

  if (user.dailyReferralBonusCount === undefined || user.dailyReferralBonusCount === null) {
    user.dailyReferralBonusCount = 0;
  }

  if (user.hourlyReferralBonusCount === undefined || user.hourlyReferralBonusCount === null) {
    user.hourlyReferralBonusCount = 0;
  }

  return todayKey;
}

function canReceivePaidReferralBonus(user, now = Date.now()) {
  prepareReferralBonusWindow(user, now);

  return (
    Number(user.dailyReferralBonusCount || 0) < getEconomyConfig().maxPaidReferralsPerDay &&
    Number(user.hourlyReferralBonusCount || 0) < MAX_PAID_REFERRALS_PER_HOUR
  );
}

function getNextUtcDayStart(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
}

function getReferralLimitPayload(user, now = Date.now()) {
  prepareReferralBonusWindow(user, now);

  const used = Number(user.dailyReferralBonusCount || 0);
  const max = getEconomyConfig().maxPaidReferralsPerDay;
  const resetAt = getNextUtcDayStart(now);

  return {
    used,
    max,
    remaining: Math.max(max - used, 0),
    resetAt,
    secondsUntilReset: Math.max(Math.ceil((resetAt - now) / 1000), 0),
    isLimitReached: used >= max,
  };
}

function getTapUpgradeCost(tapLevel) {
  return Math.round(1000 * Math.pow(1.35, Number(tapLevel || 1) - 1));
}

function getMinerUpgradeCost(minerLevel) {
  return Math.round(2500 * Math.pow(1.38, Number(minerLevel || 1) - 1));
}

function getEnergyUpgradeCost(energyLevel) {
  return Math.round(1500 * Math.pow(1.25, Number(energyLevel || 1) - 1));
}

function getRechargeUpgradeCost(rechargeLevel) {
  return Math.round(1800 * Math.pow(1.28, Number(rechargeLevel || 1) - 1));
}

function getDailyReward(level) {
  return Math.min(15000 + Number(level || 1) * 500, 50000);
}

function getUtcDayKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getUtcHourKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 13);
}

function getWeekKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekEndTimestamp(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const day = date.getUTCDay() || 7;
  const daysUntilNextMonday = 8 - day;

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + daysUntilNextMonday,
    0,
    0,
    0,
    0
  );
}

function getPreviousWeekKey(timestamp = Date.now()) {
  return getWeekKey(Number(timestamp) - 7 * 24 * 60 * 60 * 1000);
}

function addEarnings(user, amount) {
  const value = roundOnix(amount);
  const currentWeek = getWeekKey();

  if (!user.weeklyEarnedWeek || user.weeklyEarnedWeek !== currentWeek) {
    user.weeklyEarnedWeek = currentWeek;
    user.weeklyEarned = 0;
  }

  user.totalEarned = roundOnix(Number(user.totalEarned || 0) + value);
  user.weeklyEarned = roundOnix(Number(user.weeklyEarned || 0) + value);
}

function getDailyStreakMultiplier(streakDay) {
  const day = Number(streakDay || 1);

  if (day >= 7) return 2;

  return 1 + (day - 1) * 0.1;
}

function getDailyRewardWithStreak(level, streakDay) {
  return Math.round(getDailyReward(level) * getDailyStreakMultiplier(streakDay));
}

function getTapBoostCost(tapPower) {
  return Math.max(2500, Math.round(Number(tapPower || DEFAULT_TAP_POWER) * 500 * 0.7));
}

function getMiningBoostCost(autoclickers) {
  return Math.max(2500, Math.round(Number(autoclickers || DEFAULT_MINER_INCOME) * 900 * 0.7));
}


function calculateLevel(totalEarned) {
  return Math.floor((totalEarned || 0) / LEVEL_COINS) + 1;
}

function normalizeUserFields(user) {
  if (!user.completedTasks) user.completedTasks = [];
  if (!user.claimedRankBonuses) user.claimedRankBonuses = [];
  if (!user.tapTimestamps) user.tapTimestamps = [];

  if (user.balance === undefined || user.balance === null) user.balance = 0;
  if (user.energy === undefined || user.energy === null) user.energy = DEFAULT_ENERGY;
  if (user.maxEnergy === undefined || user.maxEnergy === null) user.maxEnergy = DEFAULT_MAX_ENERGY;
  if (user.tapPower === undefined || user.tapPower === null) user.tapPower = DEFAULT_TAP_POWER;
  if (user.energyRecharge === undefined || user.energyRecharge === null) user.energyRecharge = DEFAULT_ENERGY_RECHARGE;
  if (user.autoclickers === undefined || user.autoclickers === null) user.autoclickers = DEFAULT_MINER_INCOME;
  if (user.totalEarned === undefined || user.totalEarned === null) user.totalEarned = 0;
  if (user.weeklyEarned === undefined || user.weeklyEarned === null) user.weeklyEarned = 0;
  if (user.weeklyEarnedWeek === undefined || user.weeklyEarnedWeek === null) {
    user.weeklyEarnedWeek = getWeekKey();
  }
  if (user.weeklyEarnedWeek !== getWeekKey()) {
    user.weeklyEarnedWeek = getWeekKey();
    user.weeklyEarned = 0;
  }
  if (user.level === undefined || user.level === null) user.level = calculateLevel(user.totalEarned);

  if (user.referralsCount === undefined || user.referralsCount === null) user.referralsCount = 0;

  if (user.tapLevel === undefined || user.tapLevel === null) user.tapLevel = 1;
  if (user.minerLevel === undefined || user.minerLevel === null) user.minerLevel = 1;
  if (user.energyLevel === undefined || user.energyLevel === null) user.energyLevel = 1;
  if (user.rechargeLevel === undefined || user.rechargeLevel === null) user.rechargeLevel = 1;

  if (user.totalTaps === undefined || user.totalTaps === null) user.totalTaps = 0;
  if (user.totalBoostsUsed === undefined || user.totalBoostsUsed === null) user.totalBoostsUsed = 0;
  if (user.totalUpgradesBought === undefined || user.totalUpgradesBought === null) user.totalUpgradesBought = 0;
  if (user.offlineClaimsCount === undefined || user.offlineClaimsCount === null) user.offlineClaimsCount = 0;

  if (user.dailyStreak === undefined || user.dailyStreak === null) user.dailyStreak = 0;
  if (user.lastDailyClaimDay === undefined || user.lastDailyClaimDay === null) {
    user.lastDailyClaimDay = null;
  }

  if (user.lastOfflineIncome === undefined || user.lastOfflineIncome === null) {
    user.lastOfflineIncome = 0;
  }

  if (user.lastOfflineSeconds === undefined || user.lastOfflineSeconds === null) {
    user.lastOfflineSeconds = 0;
  }

  if (user.pendingOfflineIncome === undefined || user.pendingOfflineIncome === null) {
    user.pendingOfflineIncome = 0;
  }

  if (user.pendingOfflineSeconds === undefined || user.pendingOfflineSeconds === null) {
    user.pendingOfflineSeconds = 0;
  }

  if (!user.activeBoost) {
    user.activeBoost = 'none';
  }

  if (user.boostEndTime === undefined || user.boostEndTime === null) {
    user.boostEndTime = 0;
  }

  if (user.lastMineTickAt === undefined || user.lastMineTickAt === null) {
    user.lastMineTickAt = 0;
  }

  if (user.lastUpgradeBuyAt === undefined || user.lastUpgradeBuyAt === null) {
    user.lastUpgradeBuyAt = 0;
  }

  if (!user.activeBoost) user.activeBoost = 'none';
  if (!user.boostEndTime) user.boostEndTime = 0;

  if (
    user.activeBoost !== 'none' &&
    Number(user.boostEndTime || 0) <= Date.now()
) {
  user.activeBoost = 'none';
  user.boostEndTime = 0;
}

  return user;
}






function isAdminRequest(secret, telegramId) {
  const hasSecret = process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET;
  const hasAdminTelegramId =
    process.env.ADMIN_TELEGRAM_ID &&
    String(telegramId || '') === String(process.env.ADMIN_TELEGRAM_ID);

  return Boolean(hasSecret || hasAdminTelegramId);
}


// CRON: AUTO AWARD WEEKLY PRIZES
// By default awards the previous completed UTC week.

router.get('/cron-award-weekly-prizes', async (req, res) => {
  try {
    const secret = req.query.secret ? String(req.query.secret) : '';

    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const targetWeek = req.query.week ? String(req.query.week) : getPreviousWeekKey();
    const alreadyAwarded = await WeeklyPrize.findOne({ week: targetWeek });

    if (alreadyAwarded) {
      return res.json({
        message: 'Already awarded',
        week: targetWeek,
        winners: alreadyAwarded.winners,
      });
    }

    const prizes = Array.from({ length: 50 }, (_, index) => getSeasonPrizeByPlace(index + 1));

    const topUsers = await User.find({
      weeklyEarnedWeek: targetWeek,
      weeklyEarned: { $gt: 0 },
    })
      .sort({ weeklyEarned: -1 })
      .limit(50);

    const winners = [];

    for (let i = 0; i < topUsers.length; i += 1) {
      const user = topUsers[i];
      const prize = prizes[i];
      const place = i + 1;
      const seasonBadge = getSeasonBadgeByPlace(place);

      if (!prize) continue;

      normalizeUserFields(user);

      user.balance = roundOnix(Number(user.balance || 0) + prize);
      addEarnings(user, prize);

      if (seasonBadge && !user.seasonBadges.includes(seasonBadge)) {
        user.seasonBadges.push(seasonBadge);
      }

      addTransaction(user, 'income_season_prize', prize, `Приз сезона: ${place} место`);

      applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();

      const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

      winners.push({
        place,
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        weeklyEarned: roundOnix(user.weeklyEarned || 0),
        prize,
      });
    }

    await WeeklyPrize.create({
      week: targetWeek,
      awardedAt: Date.now(),
      winners,
    });

    return res.json({
      message: 'Weekly prizes awarded by cron',
      week: targetWeek,
      winners,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.json({ message: 'Already awarded' });
    }

    return res.status(500).json({ error: error.message });
  }
});

// ADMIN: PREVIEW WEEKLY SEASON PRIZES
router.get('/admin-weekly-prize-preview', async (req, res) => {
  try {
    const secret = req.query.secret ? String(req.query.secret) : '';
    const telegramId = req.query.telegramId ? String(req.query.telegramId) : '';

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    const targetWeek = req.query.week ? String(req.query.week) : getWeekKey();
    const prizes = Array.from({ length: 50 }, (_, index) => getSeasonPrizeByPlace(index + 1));

    const alreadyAwarded = await WeeklyPrize.findOne({ week: targetWeek });

    const topUsers = await User.find({
      weeklyEarnedWeek: targetWeek,
      weeklyEarned: { $gt: 0 },
    })
      .sort({ weeklyEarned: -1 })
      .limit(50)
      .select('telegramId username weeklyEarned totalEarned balance');

    return res.json({
      week: targetWeek,
      alreadyAwarded: Boolean(alreadyAwarded),
      awardedAt: alreadyAwarded?.awardedAt || null,
      awardedWinners: alreadyAwarded?.winners || [],
      preview: topUsers.map((user, index) => ({
        place: index + 1,
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        weeklyEarned: roundOnix(user.weeklyEarned || 0),
        totalEarned: roundOnix(user.totalEarned || 0),
        balance: roundOnix(user.balance || 0),
        prize: prizes[index],
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// ADMIN: AWARD WEEKLY SEASON PRIZES
router.post('/admin-award-weekly-prizes', async (req, res) => {
  try {
    const { secret, confirm, week, telegramId } = req.body;

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    if (confirm !== 'AWARD_WEEKLY_PRIZES') {
      return res.status(400).json({
        message: 'Confirmation is required',
      });
    }

    const targetWeek = week || getWeekKey();

    const alreadyAwarded = await WeeklyPrize.findOne({ week: targetWeek });

    if (alreadyAwarded) {
      return res.status(400).json({
        message: 'Weekly prizes already awarded',
        week: targetWeek,
        winners: alreadyAwarded.winners,
      });
    }

    const prizes = Array.from({ length: 50 }, (_, index) => getSeasonPrizeByPlace(index + 1));

    const topUsers = await User.find({
      weeklyEarnedWeek: targetWeek,
      weeklyEarned: { $gt: 0 },
    })
      .sort({ weeklyEarned: -1 })
      .limit(50);

    if (!topUsers.length) {
      return res.status(400).json({
        message: 'No eligible users for this week',
        week: targetWeek,
      });
    }

    const winners = [];

    for (let i = 0; i < topUsers.length; i += 1) {
      const user = topUsers[i];
      const prize = prizes[i];
      const place = i + 1;
      const seasonBadge = getSeasonBadgeByPlace(place);

      if (!prize) continue;

      normalizeUserFields(user);

      user.balance = roundOnix(Number(user.balance || 0) + prize);
      addEarnings(user, prize);

      if (seasonBadge && !user.seasonBadges.includes(seasonBadge)) {
        user.seasonBadges.push(seasonBadge);
      }

      addTransaction(
        user,
        'income_season_prize',
        prize,
        `Приз сезона: ${place} место`
      );

      const rankBonuses = applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();

      const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

      winners.push({
        place,
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        weeklyEarned: roundOnix(user.weeklyEarned || 0),
        prize,
        rankBonuses,
      });
    }

    await WeeklyPrize.create({
      week: targetWeek,
      awardedAt: Date.now(),
      winners,
    });

    return res.json({
      message: 'Weekly prizes awarded',
      week: targetWeek,
      winners,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({
        message: 'Weekly prizes already awarded',
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
});



// SEASON PRIZE POPUP FOR USER
router.post('/season-prize-popup', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID is required' });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    normalizeUserFields(user);

    const latestSeason = await WeeklyPrize.findOne({
      'winners.telegramId': telegramId,
    }).sort({ awardedAt: -1 });

    if (!latestSeason || user.lastSeenSeasonPrizeWeek === latestSeason.week) {
      return res.json({ prize: null });
    }

    const winner = latestSeason.winners.find(
      (item) => String(item.telegramId) === String(telegramId)
    );

    user.lastSeenSeasonPrizeWeek = latestSeason.week;
    await user.save();

    return res.json({
      prize: winner
        ? {
            week: latestSeason.week,
            place: winner.place,
            prize: winner.prize,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// SEASON HISTORY
router.get('/season-history', async (req, res) => {
  try {
    const seasons = await WeeklyPrize.find({})
      .sort({ awardedAt: -1 })
      .limit(10);

    return res.json({
      seasons: seasons.map((season) => ({
        week: season.week,
        awardedAt: season.awardedAt,
        winners: season.winners || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



// ADMIN: LIST SUSPICIOUS USERS
router.get('/admin-suspicious-users', async (req, res) => {
  try {
    const secret = req.query.secret ? String(req.query.secret) : '';
    const telegramId = req.query.telegramId ? String(req.query.telegramId) : '';

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find({
      $or: [
        { isSuspicious: true },
        { isFrozen: true },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .select('telegramId username balance totalEarned weeklyEarned referralsCount totalTaps isSuspicious suspiciousReasons isFrozen frozenReason');

    return res.json({
      users: users.map((user) => ({
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        balance: roundOnix(user.balance || 0),
        totalEarned: roundOnix(user.totalEarned || 0),
        weeklyEarned: roundOnix(user.weeklyEarned || 0),
        referralsCount: Number(user.referralsCount || 0),
        totalTaps: Number(user.totalTaps || 0),
        isSuspicious: Boolean(user.isSuspicious),
        suspiciousReasons: user.suspiciousReasons || [],
        isFrozen: Boolean(user.isFrozen),
        frozenReason: user.frozenReason || '',
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ADMIN: FREEZE / UNFREEZE USER
router.post('/admin-freeze-user', async (req, res) => {
  try {
    const { secret, telegramId, targetTelegramId, freeze, reason } = req.body;

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findOne({ telegramId: targetTelegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isFrozen = Boolean(freeze);
    user.frozenReason = freeze ? String(reason || 'Аккаунт заморожен администратором') : '';
    user.updatedAt = new Date();

    if (freeze) {
      addSuspiciousReason(user, user.frozenReason);
    }

    await user.save();

    return res.json({
      message: freeze ? 'User frozen' : 'User unfrozen',
      user: {
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        isFrozen: user.isFrozen,
        frozenReason: user.frozenReason,
      },
      referralBonusPaid: typeof referralBonus !== 'undefined' ? referralBonus : null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ADMIN: LIST WITHDRAWAL REQUESTS
router.get('/admin-withdrawals', async (req, res) => {
  try {
    const secret = req.query.secret ? String(req.query.secret) : '';
    const telegramId = req.query.telegramId ? String(req.query.telegramId) : '';
    const status = req.query.status ? String(req.query.status) : 'pending';

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find({
      'withdrawalRequests.0': { $exists: true },
    }).select(
      'telegramId username balance totalEarned weeklyEarned referralsCount totalTaps totalBoostsUsed totalUpgradesBought ownedPerks completedAchievements withdrawalRequests isSuspicious suspiciousReasons'
    );

    const requests = [];

    users.forEach((user) => {
      user.withdrawalRequests.forEach((request, index) => {
        if (status !== 'all' && request.status !== status) return;

        requests.push({
          userTelegramId: user.telegramId,
          username: user.username || 'Пользователь',
          requestIndex: index,
          amount: roundOnix(request.amount || 0),
          eurAmount: roundOnix(request.eurAmount || 0),
          status: request.status || 'pending',
          adminComment: request.adminComment || '',
          createdAt: request.createdAt || 0,
          reviewedAt: request.reviewedAt || null,
          reviewedBy: request.reviewedBy || '',
          userStats: {
            balance: roundOnix(user.balance || 0),
            totalEarned: roundOnix(user.totalEarned || 0),
            weeklyEarned: roundOnix(user.weeklyEarned || 0),
            referralsCount: Number(user.referralsCount || 0),
            totalTaps: Number(user.totalTaps || 0),
            totalBoostsUsed: Number(user.totalBoostsUsed || 0),
            totalUpgradesBought: Number(user.totalUpgradesBought || 0),
            ownedPerksCount: Array.isArray(user.ownedPerks) ? user.ownedPerks.length : 0,
            achievementsCompleted: Array.isArray(user.completedAchievements) ? user.completedAchievements.length : 0,
            isSuspicious: Boolean(user.isSuspicious),
            suspiciousReasons: user.suspiciousReasons || [],
          },
        });
      });
    });

    requests.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

    return res.json({ status, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ADMIN: REVIEW WITHDRAWAL REQUEST
router.post('/admin-review-withdrawal', async (req, res) => {
  try {
    const { secret, telegramId, userTelegramId, requestIndex, action, adminComment } = req.body;

    if (!isAdminRequest(secret, telegramId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approved or rejected' });
    }

    const user = await User.findOne({ telegramId: userTelegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    normalizeUserFields(user);

    const index = Number(requestIndex);
    const request = user.withdrawalRequests[index];

    if (!request) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request already reviewed' });
    }

    request.status = action;
    request.adminComment = String(adminComment || '');
    request.reviewedAt = Date.now();
    request.reviewedBy = String(telegramId || 'admin');

    if (action === 'rejected') {
      user.balance = roundOnix(Number(user.balance || 0) + Number(request.amount || 0));

      addTransaction(
        user,
        'withdrawal_rejected',
        Number(request.amount || 0),
        request.adminComment
          ? `Вывод отклонён: ${request.adminComment}`
          : 'Вывод отклонён, ONIX возвращены',
        'rejected'
      );
    } else {
      addTransaction(
        user,
        'withdrawal_approved',
        0,
        request.adminComment
          ? `Вывод одобрен: ${request.adminComment}`
          : 'Вывод одобрен',
        'approved'
      );
    }

    user.markModified('withdrawalRequests');
    user.updatedAt = new Date();

    const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

    return res.json({
      message: `Withdrawal ${action}`,
      user: {
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        balance: roundOnix(user.balance || 0),
      },
      request,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUBLIC ECONOMY CONFIG
router.get('/config', async (req, res) => {
  try {
    return res.json(getEconomyConfig());
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});


// TEAM WEEKLY LEADERBOARD
router.get('/leaderboard/teams', async (req, res) => {
  try {
    const currentWeek = getWeekKey();

    const teams = await User.aggregate([
      {
        $match: {
          weeklyEarnedWeek: currentWeek,
          weeklyEarned: { $gt: 0 },
          teamName: { $nin: ['', null] },
        },
      },
      {
        $group: {
          _id: '$teamName',
          weeklyEarned: { $sum: '$weeklyEarned' },
          members: { $sum: 1 },
        },
      },
      { $sort: { weeklyEarned: -1 } },
      { $limit: 20 },
    ]);

    return res.json({
      week: currentWeek,
      teams: teams.map((team, index) => ({
        place: index + 1,
        teamName: team._id,
        weeklyEarned: roundOnix(team.weeklyEarned || 0),
        members: team.members,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// WEEKLY LEADERBOARD
router.get('/leaderboard/weekly', async (req, res) => {
  try {
    const currentWeek = getWeekKey();
    const telegramId = req.query.telegramId ? String(req.query.telegramId) : '';

    await User.updateMany(
      {
        weeklyEarnedWeek: { $ne: currentWeek },
      },
      {
        $set: {
          weeklyEarnedWeek: currentWeek,
          weeklyEarned: 0,
        },
      }
    );

    const users = await User.find({})
      .sort({ weeklyEarned: -1 })
      .limit(20)
      .select('telegramId username weeklyEarned totalEarned');

    let currentUserPlace = null;
    let currentUserWeeklyEarned = 0;

    if (telegramId) {
      const currentUser = await User.findOne({ telegramId }).select(
        'weeklyEarned weeklyEarnedWeek'
      );

      if (currentUser) {
        const weeklyEarned = Number(currentUser.weeklyEarned || 0);
        currentUserWeeklyEarned = roundOnix(weeklyEarned);

        const playersAbove = await User.countDocuments({
          weeklyEarnedWeek: currentWeek,
          weeklyEarned: { $gt: weeklyEarned },
        });

        currentUserPlace = playersAbove + 1;
      }
    }

    const seasonEndsAt = getWeekEndTimestamp();

    return res.json({
      week: currentWeek,
      seasonEndsAt,
      secondsUntilSeasonEnd: Math.max(Math.ceil((seasonEndsAt - Date.now()) / 1000), 0),
      currentUserPlace,
      currentUserWeeklyEarned,
      leaderboard: users.map((user, index) => ({
        place: index + 1,
        telegramId: user.telegramId,
        username: user.username || 'Пользователь',
        weeklyEarned: roundOnix(user.weeklyEarned || 0),
        totalEarned: roundOnix(user.totalEarned || 0),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// GET USER
router.get('/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const now = Date.now();

    if (
      user.activeBoost &&
      user.activeBoost !== 'none' &&
      Number(user.boostEndTime || 0) <= now
    ) {
      user.activeBoost = 'none';
      user.boostEndTime = 0;
    }

    let offlineIncome = 0;
    let offlineSecondsForPopup = 0;

    const lastSeenAt = user.lastSeenAt || now;
    const offlineSeconds = Math.floor((now - lastSeenAt) / 1000);

    if (offlineSeconds > 0) {
      const offlineEnergy = roundOnix(
        Number(user.energy || 0) +
          Number(user.energyRecharge || DEFAULT_ENERGY_RECHARGE) * offlineSeconds
      );

      user.energy = Math.min(
        Number(user.maxEnergy || DEFAULT_MAX_ENERGY),
        offlineEnergy
      );
    }

    if (
  user.autoclickers > 0 &&
  offlineSeconds > 10 &&
  Number(user.pendingOfflineIncome || 0) <= 0
) {
      const countedSeconds = Math.min(offlineSeconds, getMaxOfflineSeconds(user));

      offlineSecondsForPopup = countedSeconds;
      offlineIncome = roundOnix(getMinerIncome(user) * countedSeconds);

      if (offlineIncome > 0) {
        user.pendingOfflineIncome += offlineIncome;
        user.pendingOfflineSeconds += offlineSecondsForPopup;
      }
    }

    user.lastOfflineIncome = user.pendingOfflineIncome;
    user.lastOfflineSeconds = user.pendingOfflineSeconds;
    user.lastSeenAt = now;
    user.updatedAt = new Date();

    const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

    return res.json({
      ...user.toObject(),
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// CREATE USER
router.post('/create', async (req, res) => {
  try {
    const { telegramId, username, referredBy } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username: username || 'Пользователь',
        referredBy: referredBy || null,
        completedTasks: [],
        completedAchievements: [],
        ownedPerks: [],
        perkLevels: {},
        chestStats: {
          opened: 0,
          lastReward: '',
        },
        claimedRankBonuses: [],
        transactions: [],
        totalTaps: 0,
        totalBoostsUsed: 0,
        totalUpgradesBought: 0,
        offlineClaimsCount: 0,
        dailyStreak: 0,
        lastDailyClaimDay: null,
        tapTimestamps: [],

        balance: 0,
        energy: DEFAULT_ENERGY,
        maxEnergy: DEFAULT_MAX_ENERGY,
        tapPower: DEFAULT_TAP_POWER,
        energyRecharge: DEFAULT_ENERGY_RECHARGE,
        autoclickers: DEFAULT_MINER_INCOME,

        totalEarned: 0,
        weeklyEarned: 0,
        weeklyEarnedWeek: getWeekKey(),
        level: 1,

        referralsCount: 0,
        dailyReferralBonusCount: 0,
        hourlyReferralBonusCount: 0,
        lastReferralBonusHour: null,
        lastReferralBonusDay: null,
        withdrawalRequests: [],
        seasonBadges: [],
        selectedTitle: 'ONIX Player',
        lastSeenSeasonPrizeWeek: '',
        teamName: '',
        league: 'Bronze',
        isSuspicious: false,
        isFrozen: false,
        frozenReason: '',
        suspiciousReasons: [],

        tapLevel: 1,
        minerLevel: 1,
        energyLevel: 1,
        rechargeLevel: 1,

        lastSeenAt: Date.now(),
        lastMineTickAt: 0,
        lastUpgradeBuyAt: 0,
        lastOfflineIncome: 0,
        lastOfflineSeconds: 0,
        pendingOfflineIncome: 0,
        pendingOfflineSeconds: 0,
        activeBoost: 'none',
        boostEndTime: 0,
      });

      if (referredBy && referredBy !== telegramId) {
        const refUser = await User.findOne({
          telegramId: referredBy,
        });

        if (refUser) {
          normalizeUserFields(refUser);

          const economyConfig = getEconomyConfig();

          refUser.referralsCount += 1;
          refUser.lastReferralUsername = username || 'новый пользователь';
          refUser.updatedAt = new Date();

          user.referredByUsername = refUser.username || 'пользователя';

          // Реферальный бонус пригласившему теперь начисляется не сразу,
          // а после активности нового игрока: 100 тапов.
          user.referredByBonusPaid = false;

          user.balance = roundOnix(Number(user.balance || 0) + economyConfig.referredUserReward);
          addEarnings(user, economyConfig.referredUserReward);

          addTransaction(
            user,
            'income_referral',
            economyConfig.referredUserReward,
            'Бонус за вход по ссылке'
          );

          applyAchievements(user);
          applyRankBonuses(user);
          user.level = calculateLevel(user.totalEarned);

          await refUser.save();
        }
      }

      const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();
    } else {
      normalizeUserFields(user);

      if (username && user.username !== username) {
        user.username = username;
      }

      user.updatedAt = new Date();

      // ВАЖНО:
      // lastSeenAt здесь НЕ обновляем.
      // Иначе offline income не успеет посчитаться в GET /:telegramId.

      const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();
    }

    return res.json({
      ...user.toObject(),
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// SAVE USER PROGRESS — SAFE LEGACY ROUTE
// This route is kept only for compatibility.
// Important game economy fields are no longer accepted from frontend.
// Balance, totalEarned, levels, upgrades, boosts and miners are changed only by backend routes.
router.post('/save', async (req, res) => {
  try {
    const { telegramId, data } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    if (!data) {
      return res.status(400).json({
        message: 'Data is required',
      });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        completedTasks: [],
        completedAchievements: [],
        ownedPerks: [],
        perkLevels: {},
        chestStats: {
          opened: 0,
          lastReward: '',
        },
        claimedRankBonuses: [],
        transactions: [],
        totalTaps: 0,
        totalBoostsUsed: 0,
        totalUpgradesBought: 0,
        offlineClaimsCount: 0,
        dailyStreak: 0,
        lastDailyClaimDay: null,
        tapTimestamps: [],

        balance: 0,
        energy: DEFAULT_ENERGY,
        maxEnergy: DEFAULT_MAX_ENERGY,
        tapPower: DEFAULT_TAP_POWER,
        energyRecharge: DEFAULT_ENERGY_RECHARGE,
        autoclickers: DEFAULT_MINER_INCOME,

        totalEarned: 0,
        weeklyEarned: 0,
        weeklyEarnedWeek: getWeekKey(),
        level: 1,

        referralsCount: 0,
        dailyReferralBonusCount: 0,
        hourlyReferralBonusCount: 0,
        lastReferralBonusHour: null,
        lastReferralBonusDay: null,
        withdrawalRequests: [],
        seasonBadges: [],
        selectedTitle: 'ONIX Player',
        lastSeenSeasonPrizeWeek: '',
        teamName: '',
        league: 'Bronze',
        isSuspicious: false,
        isFrozen: false,
        frozenReason: '',
        suspiciousReasons: [],

        tapLevel: 1,
        minerLevel: 1,
        energyLevel: 1,
        rechargeLevel: 1,

        lastSeenAt: Date.now(),
        lastMineTickAt: 0,
        lastUpgradeBuyAt: 0,
        lastOfflineIncome: 0,
        lastOfflineSeconds: 0,
        pendingOfflineIncome: 0,
        pendingOfflineSeconds: 0,
        activeBoost: 'none',
        boostEndTime: 0,
      });
    }

    normalizeUserFields(user);

    const safeEnergy = Number(data.energy);

    if (Number.isFinite(safeEnergy)) {
      user.energy = Math.max(
        0,
        Math.min(Number(user.maxEnergy || DEFAULT_MAX_ENERGY), safeEnergy)
      );
    }

    user.updatedAt = new Date();
    user.lastSeenAt = Date.now();

    const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});


// BUY UPGRADE — BACKEND AUTHORITATIVE PURCHASE
router.post('/buy-upgrade', async (req, res) => {
  try {
    const { telegramId, type } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const allowedTypes = ['tap', 'energy', 'recharge', 'miner'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Unknown upgrade type',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const now = Date.now();
    const lastUpgradeBuyAt = Number(user.lastUpgradeBuyAt || 0);
    const elapsedMs = now - lastUpgradeBuyAt;

    if (lastUpgradeBuyAt > 0 && elapsedMs < 500) {
      return res.status(429).json({
        message: 'Upgrade purchase cooldown',
        retryAfterMs: 500 - elapsedMs,
      });
    }

    let cost = 0;

    if (type === 'tap') cost = getTapUpgradeCost(user.tapLevel);
    if (type === 'energy') cost = getEnergyUpgradeCost(user.energyLevel);
    if (type === 'recharge') cost = getRechargeUpgradeCost(user.rechargeLevel);
    if (type === 'miner') cost = getMinerUpgradeCost(user.minerLevel);

    cost = Math.round(cost * getUpgradeDiscountMultiplier(user));

    if (Number(user.balance || 0) < cost) {
      return res.status(400).json({
        message: 'Недостаточно ONIX',
      });
    }

    user.balance = roundOnix(Number(user.balance || 0) - cost);

    const upgradeTitles = {
      tap: 'Улучшение силы тапа',
      energy: 'Улучшение энергии',
      recharge: 'Улучшение восстановления',
      miner: 'Улучшение майнера',
    };

    addTransaction(
      user,
      'expense_upgrade',
      -cost,
      upgradeTitles[type] || 'Покупка улучшения'
    );

    if (type === 'tap') {
      user.tapLevel = Number(user.tapLevel || 1) + 1;
      user.tapPower = Number(user.tapPower || 1) + 1;
    }

    if (type === 'energy') {
      user.energyLevel = Number(user.energyLevel || 1) + 1;
      user.maxEnergy = Number(user.maxEnergy || DEFAULT_MAX_ENERGY) + 500;
      user.energy = Math.min(Number(user.energy || 0), Number(user.maxEnergy || DEFAULT_MAX_ENERGY));
    }

    if (type === 'recharge') {
      user.rechargeLevel = Number(user.rechargeLevel || 1) + 1;
      user.energyRecharge = roundOnix(Number(user.energyRecharge || DEFAULT_ENERGY_RECHARGE) + 0.25);
    }

    if (type === 'miner') {
      user.minerLevel = Number(user.minerLevel || 1) + 1;
      user.autoclickers = roundOnix(Number(user.autoclickers || DEFAULT_MINER_INCOME) + 0.5);
    }

    user.totalUpgradesBought = Number(user.totalUpgradesBought || 0) + 1;
    const achievementBonuses = applyAchievements(user);
    const rankBonuses = applyRankBonuses(user);
    user.level = calculateLevel(user.totalEarned);

    user.lastUpgradeBuyAt = now;
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    const referralBonus = await tryPayQualifiedReferralBonus(user);

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
      achievementBonuses,
      rankBonuses,
      upgrade: {
        type,
        cost,
      },
      referralBonusPaid: typeof referralBonus !== 'undefined' ? referralBonus : null,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});




function addSuspiciousReason(user, reason) {
  if (!user.suspiciousReasons) user.suspiciousReasons = [];
  if (user.referredByBonusPaid === undefined || user.referredByBonusPaid === null) {
    user.referredByBonusPaid = false;
  }
  if (user.referredByQualifiedAt === undefined || user.referredByQualifiedAt === null) {
    user.referredByQualifiedAt = null;
  }
  if (user.isFrozen === undefined || user.isFrozen === null) {
    user.isFrozen = false;
  }
  if (user.frozenReason === undefined || user.frozenReason === null) {
    user.frozenReason = '';
  }

  if (!user.suspiciousReasons.includes(reason)) {
    user.suspiciousReasons.push(reason);
  }

  user.isSuspicious = true;
}

function ensureUserNotFrozen(user, res) {
  if (user.isFrozen) {
    return res.status(403).json({
      message: user.frozenReason || 'Аккаунт заморожен',
    });
  }

  return null;
}

function isReferralQualified(user) {
  // Важно: НЕ используем totalEarned/balance для проверки,
  // потому что новый игрок получает стартовый бонус 15 000 ONIX по реферальной ссылке.
  // Иначе пригласивший получит большой бонус сразу.
  return Number(user.totalTaps || 0) >= 100;
}

async function tryPayQualifiedReferralBonus(user) {
  if (!user.referredBy || user.referredByBonusPaid) return null;
  if (!isReferralQualified(user)) return null;

  const refUser = await User.findOne({
    telegramId: user.referredBy,
  });

  if (!refUser) {
    user.referredByBonusPaid = true;
    return null;
  }

  normalizeUserFields(refUser);

  const now = Date.now();
  const economyConfig = getEconomyConfig();

  if (!canReceivePaidReferralBonus(refUser, now)) {
    addSuspiciousReason(refUser, 'referral_bonus_limit_reached');
    refUser.updatedAt = new Date();
    await refUser.save();
    return null;
  }

  refUser.dailyReferralBonusCount = Number(refUser.dailyReferralBonusCount || 0) + 1;
  refUser.hourlyReferralBonusCount = Number(refUser.hourlyReferralBonusCount || 0) + 1;
  const referralReward = getReferralRewardForUser(refUser);

  refUser.balance = roundOnix(
    Number(refUser.balance || 0) + referralReward
  );
  addEarnings(refUser, referralReward);
  refUser.lastReferralUsername = user.username || 'новый пользователь';

  addTransaction(
    refUser,
    'income_referral',
    referralReward,
    `Реферальный бонус за активного друга: ${user.username || 'новый пользователь'}`
  );

  applyAchievements(refUser);
  applyRankBonuses(refUser);
  refUser.level = calculateLevel(refUser.totalEarned);
  refUser.updatedAt = new Date();

  user.referredByBonusPaid = true;
  user.referredByQualifiedAt = now;

  await refUser.save();

  return {
    referrerTelegramId: refUser.telegramId,
    referrerUsername: refUser.username || 'Пользователь',
    reward: referralReward,
  };
}



function getLeagueByTotalEarned(totalEarned) {
  const earned = Number(totalEarned || 0);

  if (earned >= 5000000) return 'Diamond';
  if (earned >= 1500000) return 'Gold';
  if (earned >= 500000) return 'Silver';

  return 'Bronze';
}

function getSeasonPrizeByPlace(place) {
  if (place === 1) return 250000;
  if (place === 2) return 150000;
  if (place === 3) return 75000;
  if (place >= 4 && place <= 10) return 25000;
  if (place >= 11 && place <= 50) return 5000;

  return 0;
}

function getSeasonBadgeByPlace(place) {
  if (place === 1) return 'Season Winner';
  if (place === 2) return 'Season Top 2';
  if (place === 3) return 'Season Top 3';
  if (place <= 10) return 'Season Top 10';
  if (place <= 50) return 'Season Top 50';

  return '';
}


// SET TEAM NAME
router.post('/set-team', async (req, res) => {
  try {
    const { telegramId, teamName } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID is required' });
    }

    const cleanTeamName = String(teamName || '').trim().slice(0, 24);

    if (!cleanTeamName) {
      return res.status(400).json({ message: 'Введите название команды' });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    normalizeUserFields(user);

    user.teamName = cleanTeamName;
    user.updatedAt = new Date();

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// SELECT PROFILE TITLE
router.post('/select-title', async (req, res) => {
  try {
    const { telegramId, title } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID is required' });
    }

    const allowedTitles = [
      'ONIX Player',
      'Tap Master',
      'Miner',
      'Referral Master',
      'Season Hunter',
      'Diamond',
      'Boost Master',
      'Perk Collector',
    ];

    if (!allowedTitles.includes(title)) {
      return res.status(400).json({ message: 'Недоступный титул' });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    normalizeUserFields(user);

    user.selectedTitle = title;
    user.updatedAt = new Date();

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// REQUEST WITHDRAWAL — creates a pending withdrawal request
router.post('/request-withdrawal', async (req, res) => {
  try {
    const { telegramId, amount } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: 'Telegram ID is required' });
    }

    const economyConfig = getEconomyConfig();
    const withdrawAmount = roundOnix(Number(amount || economyConfig.minWithdrawOnix));

    if (withdrawAmount < economyConfig.minWithdrawOnix) {
      return res.status(400).json({
        message: `Минимальный вывод ${economyConfig.minWithdrawOnix} ONIX`,
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const hasPendingWithdrawal = user.withdrawalRequests.some(
      (request) => request.status === 'pending'
    );

    if (hasPendingWithdrawal) {
      return res.status(400).json({
        message: 'У вас уже есть заявка на вывод в обработке',
      });
    }

    const lastWithdrawal = user.withdrawalRequests[0];
    const withdrawalCooldownMs = 24 * 60 * 60 * 1000;

    if (
      lastWithdrawal &&
      Date.now() - Number(lastWithdrawal.createdAt || 0) < withdrawalCooldownMs
    ) {
      return res.status(400).json({
        message: 'Создавать заявку на вывод можно не чаще 1 раза в 24 часа',
      });
    }

    if (Number(user.balance || 0) < withdrawAmount) {
      return res.status(400).json({ message: 'Недостаточно ONIX для вывода' });
    }

    user.balance = roundOnix(Number(user.balance || 0) - withdrawAmount);

    const eurAmount = roundOnix(withdrawAmount * getOnixEurRate());

    user.withdrawalRequests.unshift({
      amount: withdrawAmount,
      eurAmount,
      status: 'pending',
      createdAt: Date.now(),
    });

    user.withdrawalRequests = user.withdrawalRequests.slice(0, 20);

    addTransaction(
      user,
      'withdrawal_pending',
      -withdrawAmount,
      `Заявка на вывод ≈ ${eurAmount}€`,
      'pending'
    );

    user.updatedAt = new Date();
    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      withdrawal: user.withdrawalRequests[0],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// BUY PERK — ONE-TIME PERMANENT BONUSES
router.post('/buy-perk', async (req, res) => {
  try {
    const { telegramId, perkId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const perk = PERKS[perkId];

    if (!perk) {
      return res.status(400).json({
        message: 'Unknown perk',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const currentLevel = getPerkLevel(user, perk.id);
    const nextLevel = currentLevel + 1;

    if (currentLevel >= perk.maxLevel) {
      return res.status(400).json({
        message: 'Перк уже максимального уровня',
      });
    }

    const cost = getPerkCost(perk.id, nextLevel);

    if (Number(user.balance || 0) < cost) {
      return res.status(400).json({
        message: 'Недостаточно ONIX',
      });
    }

    user.balance = roundOnix(Number(user.balance || 0) - cost);
    setPerkLevel(user, perk.id, nextLevel);

    if (!user.ownedPerks.includes(perk.id)) {
      user.ownedPerks.push(perk.id);
    }

    if (perk.id === 'energy_max_pro') {
      user.maxEnergy = getMaxEnergyWithPerks(user);
      user.energy = Math.min(Number(user.energy || 0), Number(user.maxEnergy || DEFAULT_MAX_ENERGY));
    }

    addTransaction(
      user,
      'expense_perk',
      -cost,
      `Перк: ${perk.title} ур. ${nextLevel}`
    );

    const achievementBonuses = applyAchievements(user);
    user.updatedAt = new Date();
    user.lastSeenAt = Date.now();

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      perk: {
        id: perk.id,
        title: perk.title,
        cost,
        level: nextLevel,
        maxLevel: perk.maxLevel,
      },
      achievementBonuses,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// OPEN CHEST — RANDOM SHOP REWARD
router.post('/open-chest', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const chestCost = 50000;

    if (Number(user.balance || 0) < chestCost) {
      return res.status(400).json({
        message: 'Недостаточно ONIX',
      });
    }

    const roll = Math.random();
    let rewardAmount = 0;
    let rewardTitle = '';

    if (roll < 0.45) {
      rewardAmount = 25000;
      rewardTitle = 'Сундук: малый бонус';
    } else if (roll < 0.75) {
      rewardAmount = 60000;
      rewardTitle = 'Сундук: хороший бонус';
    } else if (roll < 0.93) {
      rewardAmount = 125000;
      rewardTitle = 'Сундук: редкий бонус';
    } else {
      rewardAmount = 300000;
      rewardTitle = 'Сундук: джекпот';
    }

    user.balance = roundOnix(Number(user.balance || 0) - chestCost);
    addTransaction(user, 'expense_chest', -chestCost, 'Открытие сундука');

    user.balance = roundOnix(Number(user.balance || 0) + rewardAmount);
    addEarnings(user, rewardAmount);
    addTransaction(user, 'income_chest', rewardAmount, rewardTitle);

    user.chestStats = {
      opened: Number(user.chestStats?.opened || 0) + 1,
      lastReward: `${rewardTitle}: +${rewardAmount} ONIX`,
    };

    const achievementBonuses = applyAchievements(user);
    const rankBonuses = applyRankBonuses(user);
    user.level = calculateLevel(user.totalEarned);
    user.updatedAt = new Date();
    user.lastSeenAt = Date.now();

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      chest: {
        cost: chestCost,
        rewardAmount,
        rewardTitle,
      },
      achievementBonuses,
      rankBonuses,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// CLAIM TASK
router.post('/claim-task', async (req, res) => {
  try {
    const { telegramId, task } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    if (!task) {
      return res.status(400).json({
        message: 'Task is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    // DAILY REWARD WITH STREAK
    if (task === 'daily') {
      const now = Date.now();
      const todayKey = getUtcDayKey(now);

      if (user.dailyRewardLastClaim) {
        const lastClaimTime = Number(user.dailyRewardLastClaim || 0);
        const lastClaimDay = user.lastDailyClaimDay || getUtcDayKey(lastClaimTime);

        if (lastClaimDay === todayKey || now - lastClaimTime < DAY_MS) {
          return res.status(400).json({
            message: 'Daily reward already claimed',
          });
        }
      }

      const yesterdayKey = getUtcDayKey(now - DAY_MS);
      const previousClaimDay =
        user.lastDailyClaimDay ||
        (user.dailyRewardLastClaim ? getUtcDayKey(Number(user.dailyRewardLastClaim)) : null);

      let nextStreak = 1;

      if (previousClaimDay === yesterdayKey) {
        nextStreak = Number(user.dailyStreak || 0) + 1;
      } else if (getPerkLevel(user, 'streak_shield') > 0 && Number(user.dailyStreak || 0) > 1) {
        nextStreak = Number(user.dailyStreak || 0);
      }

      if (nextStreak > 7) {
        nextStreak = 1;
      }

      const reward = getDailyRewardWithStreakForUser(user, nextStreak);

      user.balance = roundOnix(Number(user.balance || 0) + reward);
      addEarnings(user, reward);
      user.dailyRewardLastClaim = now;
      user.lastDailyClaimDay = todayKey;
      user.dailyStreak = nextStreak;

      addTransaction(user, 'income_daily', reward, `Ежедневная награда · День ${nextStreak}/7`);

      const rankBonuses = applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = now;

      await user.save();

      return res.json({
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        claimedDailyReward: reward,
        rankBonuses,
        dailyStreak: nextStreak,
        dailyStreakMultiplier: getDailyStreakMultiplier(nextStreak),
      });
    }

    // CHANNEL SUBSCRIBE
    if (task === 'channel') {
      if (user.completedTasks.includes('channel')) {
        return res.status(400).json({
          message: 'Task already claimed',
        });
      }

      if (!process.env.BOT_TOKEN || !process.env.CHANNEL_ID) {
        return res.status(500).json({
          message: 'Telegram bot settings are missing',
        });
      }

      const response = await axios.get(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          params: {
            chat_id: process.env.CHANNEL_ID,
            user_id: telegramId,
          },
        }
      );

      const status = response.data?.result?.status;

      const isSubscribed = ['member', 'administrator', 'creator'].includes(
        status
      );

      if (!isSubscribed) {
        return res.status(400).json({
          message: 'Сначала подпишитесь на канал',
        });
      }

      user.balance = roundOnix(Number(user.balance || 0) + 25000);
      addEarnings(user, 25000);
      user.completedTasks.push('channel');
      addTransaction(user, 'income_task', 25000, 'Задание: подписка на канал');

      const rankBonuses = applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = Date.now();

      await user.save();

      return res.json({
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
        rankBonuses: typeof rankBonuses !== 'undefined' ? rankBonuses : [],
        achievementBonuses: typeof achievementBonuses !== 'undefined' ? achievementBonuses : [],
      });
    }

    // INVITE FRIEND
    if (task === 'inviteFriend') {
      if (user.completedTasks.includes('inviteFriend')) {
        return res.status(400).json({
          message: 'Task already claimed',
        });
      }

      if (user.referralsCount < 1) {
        return res.status(400).json({
          message: 'Сначала пригласите друга',
        });
      }

      const economyConfig = getEconomyConfig();

      user.balance = roundOnix(Number(user.balance || 0) + economyConfig.referralReward);
      addEarnings(user, economyConfig.referralReward);
      user.completedTasks.push('inviteFriend');
      addTransaction(
        user,
        'income_task',
        economyConfig.referralReward,
        'Задание: пригласить друга'
      );

      const rankBonuses = applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = Date.now();

      await user.save();

      return res.json({
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
        rankBonuses: typeof rankBonuses !== 'undefined' ? rankBonuses : [],
        achievementBonuses: typeof achievementBonuses !== 'undefined' ? achievementBonuses : [],
      });
    }

    return res.status(400).json({
      message: 'Unknown task',
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// CLAIM OFFLINE INCOME
router.post('/claim-offline-income', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const claimedAmount = Number(user.pendingOfflineIncome || 0);
    const claimedSeconds = Number(user.pendingOfflineSeconds || 0);

    if (claimedAmount <= 0) {
      return res.status(400).json({
        message: 'No offline income to claim',
      });
    }

    user.balance = roundOnix(Number(user.balance || 0) + claimedAmount);
    addEarnings(user, claimedAmount);
    addTransaction(user, 'income_offline', claimedAmount, 'Оффлайн-майнинг');
    user.offlineClaimsCount = Number(user.offlineClaimsCount || 0) + 1;
    const achievementBonuses = applyAchievements(user);
    const rankBonuses = applyRankBonuses(user);
    user.level = calculateLevel(user.totalEarned);

    user.lastOfflineIncome = claimedAmount;
    user.lastOfflineSeconds = claimedSeconds;

    user.pendingOfflineIncome = 0;
    user.pendingOfflineSeconds = 0;

    user.updatedAt = new Date();
    user.lastSeenAt = Date.now();

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
      achievementBonuses,
      rankBonuses,
      claimedAmount,
      claimedSeconds,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});



// MINE TICK — BACKEND ONLINE MINING
router.post('/mine-tick', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const now = Date.now();
    const lastMineTickAt = Number(user.lastMineTickAt || 0);
    const elapsedMs = now - lastMineTickAt;

    if (lastMineTickAt > 0 && elapsedMs < 900) {
      return res.status(429).json({
        message: 'Mine tick cooldown',
        user,
        income: 0,
        multiplier: 1,
        isMiningBoostActive: false,
        retryAfterMs: 900 - elapsedMs,
      });
    }

    if (
      user.activeBoost &&
      user.activeBoost !== 'none' &&
      Number(user.boostEndTime || 0) <= now
    ) {
      user.activeBoost = 'none';
      user.boostEndTime = 0;
    }

    const isMiningBoostActive =
      user.activeBoost === 'mining' && Number(user.boostEndTime || 0) > now;

    const multiplier = isMiningBoostActive ? 2 : 1;
    const income = roundOnix(getMinerIncome(user) * multiplier);

    if (income > 0) {
      user.balance = roundOnix(Number(user.balance || 0) + income);
      addEarnings(user, income);
      applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
    }

    user.energy = Math.min(
      Number(user.maxEnergy || DEFAULT_MAX_ENERGY),
      Number(user.energy || 0) + Number(user.energyRecharge || DEFAULT_ENERGY_RECHARGE)
    );

    user.lastMineTickAt = now;
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      achievements: getAchievementsPayload(user),
      income,
      multiplier,
      isMiningBoostActive,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// ACTIVATE BOOST
router.post('/activate-boost', async (req, res) => {
  try {
    const { telegramId, type } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const durationConfig = {
      tap: 10 * 60 * 1000,
      mining: 15 * 60 * 1000,
    };

    if (!durationConfig[type]) {
      return res.status(400).json({
        message: 'Unknown boost type',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const now = Date.now();

    if (
      user.activeBoost &&
      user.activeBoost !== 'none' &&
      Number(user.boostEndTime || 0) > now
    ) {
      return res.status(400).json({
        message: 'Boost already active',
      });
    }

    const cost =
      type === 'tap'
        ? getTapBoostCost(user.tapPower)
        : getMiningBoostCost(user.autoclickers);

    if (Number(user.balance || 0) < cost) {
      return res.status(400).json({
        message: 'Not enough ONIX',
      });
    }

    user.balance = roundOnix(Number(user.balance || 0) - cost);
    addTransaction(
      user,
      'expense_boost',
      -cost,
      type === 'tap' ? 'Буст тапа ×2' : 'Буст майнинга ×2'
    );
    user.activeBoost = type;
    user.boostEndTime = now + Math.round(durationConfig[type] * getBoostDurationMultiplier(user));
    user.totalBoostsUsed = Number(user.totalBoostsUsed || 0) + 1;
    const achievementBonuses = applyAchievements(user);
    const rankBonuses = applyRankBonuses(user);
    user.level = calculateLevel(user.totalEarned);
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
      achievementBonuses,
      rankBonuses,
      boost: {
        type,
        cost,
        boostEndTime: user.boostEndTime,
        durationMs: durationConfig[type],
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// TAP COIN — BACKEND ANTI-CHEAT
router.post('/tap', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({
        message: 'Telegram ID is required',
      });
    }

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    normalizeUserFields(user);

    const frozenResponse = ensureUserNotFrozen(user, res);
    if (frozenResponse) return frozenResponse;

    const energyCost = getEnergyCost(user);

    if (Number(user.energy || 0) < energyCost) {
      return res.status(400).json({
        message: 'No energy',
      });
    }

    const now = Date.now();
    const oneSecondAgo = now - 1000;

    user.tapTimestamps = user.tapTimestamps.filter((time) => {
      return Number(time) > oneSecondAgo;
    });

    if (user.tapTimestamps.length >= MAX_TAPS_PER_SECOND) {
      return res.status(429).json({
        message: 'Too many taps',
      });
    }

    user.tapTimestamps.push(now);

    if (
      user.activeBoost &&
      user.activeBoost !== 'none' &&
      Number(user.boostEndTime || 0) <= now
    ) {
      user.activeBoost = 'none';
      user.boostEndTime = 0;
    }

    const isTapBoostActive =
      user.activeBoost === 'tap' && Number(user.boostEndTime || 0) > now;

    const points = roundOnix(Number(user.tapPower || DEFAULT_TAP_POWER) * (isTapBoostActive ? 2 : 1));

    user.balance = roundOnix(Number(user.balance || 0) + points);
    addEarnings(user, points);
    user.energy = Math.max(0, roundOnix(Number(user.energy || 0) - energyCost));
    user.totalTaps = Number(user.totalTaps || 0) + 1;

    const achievementBonuses = applyAchievements(user);
    const rankBonuses = applyRankBonuses(user);
    user.level = calculateLevel(user.totalEarned);
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
        referralLimit: getReferralLimitPayload(user),
      },
      achievements: getAchievementsPayload(user),
      referralLimit: getReferralLimitPayload(user),
      achievementBonuses,
      rankBonuses,
      points,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;