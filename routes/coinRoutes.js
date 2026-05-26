const axios = require('axios');
const express = require('express');

const router = express.Router();

const User = require('../models/User');

const LEVEL_COINS = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_OFFLINE_SECONDS = 3 * 60 * 60;
const MAX_TAPS_PER_SECOND = 12;

function calculateLevel(totalEarned) {
  return Math.floor((totalEarned || 0) / LEVEL_COINS) + 1;
}

function normalizeUserFields(user) {
  if (!user.completedTasks) user.completedTasks = [];
  if (!user.tapTimestamps) user.tapTimestamps = [];

  if (user.balance === undefined || user.balance === null) user.balance = 0;
  if (user.energy === undefined || user.energy === null) user.energy = 2000;
  if (user.maxEnergy === undefined || user.maxEnergy === null) user.maxEnergy = 2000;
  if (user.tapPower === undefined || user.tapPower === null) user.tapPower = 1;
  if (user.energyRecharge === undefined || user.energyRecharge === null) user.energyRecharge = 10;
  if (user.autoclickers === undefined || user.autoclickers === null) user.autoclickers = 0;
  if (user.totalEarned === undefined || user.totalEarned === null) user.totalEarned = 0;
  if (user.level === undefined || user.level === null) user.level = calculateLevel(user.totalEarned);

  if (user.referralsCount === undefined || user.referralsCount === null) user.referralsCount = 0;

  if (user.tapLevel === undefined || user.tapLevel === null) user.tapLevel = 1;
  if (user.minerLevel === undefined || user.minerLevel === null) user.minerLevel = 1;
  if (user.energyLevel === undefined || user.energyLevel === null) user.energyLevel = 1;
  if (user.rechargeLevel === undefined || user.rechargeLevel === null) user.rechargeLevel = 1;

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

    if (
  user.autoclickers > 0 &&
  offlineSeconds > 10 &&
  Number(user.pendingOfflineIncome || 0) <= 0
) {
      const countedSeconds = Math.min(offlineSeconds, MAX_OFFLINE_SECONDS);

      offlineSecondsForPopup = countedSeconds;
      offlineIncome = Math.floor(user.autoclickers * countedSeconds);

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

    return res.json(user);
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
        tapTimestamps: [],

        balance: 0,
        energy: 2000,
        maxEnergy: 2000,
        tapPower: 1,
        energyRecharge: 10,
        autoclickers: 0,

        totalEarned: 0,
        level: 1,

        referralsCount: 0,

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

          refUser.balance += 5000;
          refUser.totalEarned += 5000;
          refUser.referralsCount += 1;
          refUser.level = calculateLevel(refUser.totalEarned);
          refUser.lastReferralUsername = username || 'новый пользователь';
          refUser.updatedAt = new Date();

          await refUser.save();

          user.balance += 1000;
          user.totalEarned += 1000;
          user.level = calculateLevel(user.totalEarned);
          user.referredByUsername = refUser.username || 'пользователя';
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
        tapTimestamps: [],

        balance: 0,
        energy: 2000,
        maxEnergy: 2000,
        tapPower: 1,
        energyRecharge: 10,
        autoclickers: 0,

        totalEarned: 0,
        level: 1,

        referralsCount: 0,

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
        Math.min(Number(user.maxEnergy || 2000), safeEnergy)
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

    if (type === 'tap') cost = (Number(user.tapLevel || 1) + 1) * 150;
    if (type === 'energy') cost = (Number(user.energyLevel || 1) + 1) * 200;
    if (type === 'recharge') cost = (Number(user.rechargeLevel || 1) + 1) * 180;
    if (type === 'miner') cost = (Number(user.minerLevel || 1) + 1) * 300;

    if (Number(user.balance || 0) < cost) {
      return res.status(400).json({
        message: 'Недостаточно ONIX',
      });
    }

    user.balance -= cost;

    if (type === 'tap') {
      user.tapLevel = Number(user.tapLevel || 1) + 1;
      user.tapPower = Number(user.tapPower || 1) + 1;
    }

    if (type === 'energy') {
      user.energyLevel = Number(user.energyLevel || 1) + 1;
      user.maxEnergy = Number(user.maxEnergy || 2000) + 500;
      user.energy = Math.min(Number(user.energy || 0), Number(user.maxEnergy || 2000));
    }

    if (type === 'recharge') {
      user.rechargeLevel = Number(user.rechargeLevel || 1) + 1;
      user.energyRecharge = Number(user.energyRecharge || 10) + 5;
    }

    if (type === 'miner') {
      user.minerLevel = Number(user.minerLevel || 1) + 1;
      user.autoclickers = Number(user.autoclickers || 0) + 2;
    }

    user.lastUpgradeBuyAt = now;
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user,
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

    // DAILY REWARD
    if (task === 'daily') {
      const now = Date.now();

      if (
        user.dailyRewardLastClaim &&
        now - Number(user.dailyRewardLastClaim) < DAY_MS
      ) {
        return res.status(400).json({
          message: 'Daily reward already claimed',
        });
      }

      const reward = 500 + user.level * 100;

      user.balance += reward;
      user.totalEarned += reward;
      user.dailyRewardLastClaim = now;

      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = now;

      await user.save();

      return res.json(user);
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

      user.balance += 2000;
      user.totalEarned += 2000;
      user.completedTasks.push('channel');

      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = Date.now();

      await user.save();

      return res.json(user);
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

      user.balance += 3000;
      user.totalEarned += 3000;
      user.completedTasks.push('inviteFriend');

      user.level = calculateLevel(user.totalEarned);
      user.updatedAt = new Date();
      user.lastSeenAt = Date.now();

      await user.save();

      return res.json(user);
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

    user.balance += claimedAmount;
    user.totalEarned += claimedAmount;
    user.level = calculateLevel(user.totalEarned);

    user.lastOfflineIncome = claimedAmount;
    user.lastOfflineSeconds = claimedSeconds;

    user.pendingOfflineIncome = 0;
    user.pendingOfflineSeconds = 0;

    user.updatedAt = new Date();
    user.lastSeenAt = Date.now();

    await user.save();

    return res.json({
      user,
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
    const income = Math.floor(Number(user.autoclickers || 0) * multiplier);

    if (income > 0) {
      user.balance += income;
      user.totalEarned += income;
      user.level = calculateLevel(user.totalEarned);
    }

    user.energy = Math.min(
      Number(user.maxEnergy || 2000),
      Number(user.energy || 0) + Number(user.energyRecharge || 10)
    );

    user.lastMineTickAt = now;
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user,
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

    const boostConfig = {
      tap: {
        cost: 300,
        durationMs: 10 * 60 * 1000,
      },
      mining: {
        cost: 500,
        durationMs: 15 * 60 * 1000,
      },
    };

    const config = boostConfig[type];

    if (!config) {
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

    if (user.balance < config.cost) {
      return res.status(400).json({
        message: 'Not enough ONIX',
      });
    }

    user.balance -= config.cost;
    user.activeBoost = type;
    user.boostEndTime = now + config.durationMs;
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user,
      boost: {
        type,
        cost: config.cost,
        boostEndTime: user.boostEndTime,
        durationMs: config.durationMs,
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

    if (user.energy <= 0) {
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

    const points = Math.floor((user.tapPower || 1) * (isTapBoostActive ? 2 : 1));

    user.balance += points;
    user.totalEarned += points;
    user.energy = Math.max(0, user.energy - 1);

    user.level = calculateLevel(user.totalEarned);
    user.updatedAt = new Date();
    user.lastSeenAt = now;

    await user.save();

    return res.json({
      user,
      points,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;