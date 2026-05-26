const axios = require('axios');
const express = require('express');

const router = express.Router();

const User = require('../models/User');

const LEVEL_COINS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OFFLINE_SECONDS = 3 * 60 * 60;
const MAX_TAPS_PER_SECOND = 12;
const MAX_PAID_REFERRALS_PER_DAY = 10;
const DEFAULT_ENERGY = 500;
const DEFAULT_MAX_ENERGY = 500;
const DEFAULT_TAP_POWER = 1;
const DEFAULT_ENERGY_RECHARGE = 0.5;
const DEFAULT_MINER_INCOME = 0.5;

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
];

function getAchievementProgressValue(user, achievementId) {
  if (achievementId === 'first_tap') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_100') return Number(user.totalTaps || 0);
  if (achievementId === 'taps_1000') return Number(user.totalTaps || 0);
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
      user.totalEarned = roundOnix(Number(user.totalEarned || 0) + achievement.reward);

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
        user.totalEarned = roundOnix(Number(user.totalEarned || 0) + rank.bonus);
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

  if (user.lastReferralBonusDay !== todayKey) {
    user.lastReferralBonusDay = todayKey;
    user.dailyReferralBonusCount = 0;
  }

  if (user.dailyReferralBonusCount === undefined || user.dailyReferralBonusCount === null) {
    user.dailyReferralBonusCount = 0;
  }

  return todayKey;
}

function canReceivePaidReferralBonus(user, now = Date.now()) {
  prepareReferralBonusWindow(user, now);

  return Number(user.dailyReferralBonusCount || 0) < MAX_PAID_REFERRALS_PER_DAY;
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
      const countedSeconds = Math.min(offlineSeconds, MAX_OFFLINE_SECONDS);

      offlineSecondsForPopup = countedSeconds;
      offlineIncome = roundOnix(Number(user.autoclickers || 0) * countedSeconds);

      if (offlineIncome > 0) {
        user.pendingOfflineIncome += offlineIncome;
        user.pendingOfflineSeconds += offlineSecondsForPopup;
      }
    }

    user.lastOfflineIncome = user.pendingOfflineIncome;
    user.lastOfflineSeconds = user.pendingOfflineSeconds;
    user.lastSeenAt = now;
    user.updatedAt = new Date();

    await user.save();

    return res.json({
      ...user.toObject(),
      achievements: getAchievementsPayload(user),
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
        level: 1,

        referralsCount: 0,
        dailyReferralBonusCount: 0,
        lastReferralBonusDay: null,

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

          const now = Date.now();
          const isPaidReferralAllowed = canReceivePaidReferralBonus(refUser, now);

          refUser.referralsCount += 1;
          refUser.lastReferralUsername = username || 'новый пользователь';
          refUser.updatedAt = new Date();

          if (isPaidReferralAllowed) {
            refUser.dailyReferralBonusCount =
              Number(refUser.dailyReferralBonusCount || 0) + 1;

            refUser.balance = roundOnix(Number(refUser.balance || 0) + 75000);
            refUser.totalEarned = roundOnix(Number(refUser.totalEarned || 0) + 75000);

            addTransaction(
              refUser,
              'income_referral',
              75000,
              `Реферальный бонус ${refUser.dailyReferralBonusCount}/${MAX_PAID_REFERRALS_PER_DAY}`
            );

            const refAchievementBonuses = applyAchievements(refUser);
            const refRankBonuses = applyRankBonuses(refUser);
            refUser.level = calculateLevel(refUser.totalEarned);

            user.balance = roundOnix(Number(user.balance || 0) + 15000);
            user.totalEarned = roundOnix(Number(user.totalEarned || 0) + 15000);

            addTransaction(
              user,
              'income_referral',
              15000,
              'Бонус за вход по ссылке'
            );

            const achievementBonuses = applyAchievements(user);
            const rankBonuses = applyRankBonuses(user);
            user.level = calculateLevel(user.totalEarned);
          }

          user.referredByUsername = refUser.username || 'пользователя';

          await refUser.save();
        }
      }

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

      await user.save();
    }

    return res.json(user);
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
        level: 1,

        referralsCount: 0,
        dailyReferralBonusCount: 0,
        lastReferralBonusDay: null,

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

    await user.save();

    return res.json({
      user: {
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
      },
      achievements: getAchievementsPayload(user),
      achievementBonuses,
      rankBonuses,
      upgrade: {
        type,
        cost,
      },
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
      }

      if (nextStreak > 7) {
        nextStreak = 1;
      }

      const reward = getDailyRewardWithStreak(user.level, nextStreak);

      user.balance = roundOnix(Number(user.balance || 0) + reward);
      user.totalEarned = roundOnix(Number(user.totalEarned || 0) + reward);
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
      user.totalEarned = roundOnix(Number(user.totalEarned || 0) + 25000);
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

      user.balance = roundOnix(Number(user.balance || 0) + 75000);
      user.totalEarned = roundOnix(Number(user.totalEarned || 0) + 75000);
      user.completedTasks.push('inviteFriend');
      addTransaction(user, 'income_task', 75000, 'Задание: пригласить друга');

      const rankBonuses = applyRankBonuses(user);
      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = Date.now();

      await user.save();

      return res.json({
        ...user.toObject(),
        achievements: getAchievementsPayload(user),
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
    user.totalEarned = roundOnix(Number(user.totalEarned || 0) + claimedAmount);
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
      },
      achievements: getAchievementsPayload(user),
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
    const income = roundOnix(Number(user.autoclickers || 0) * multiplier);

    if (income > 0) {
      user.balance = roundOnix(Number(user.balance || 0) + income);
      user.totalEarned = roundOnix(Number(user.totalEarned || 0) + income);
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
    user.boostEndTime = now + durationConfig[type];
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
      },
      achievements: getAchievementsPayload(user),
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

    const energyCost = Math.max(1, Number(user.tapPower || DEFAULT_TAP_POWER));

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
    user.totalEarned = roundOnix(Number(user.totalEarned || 0) + points);
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
      },
      achievements: getAchievementsPayload(user),
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