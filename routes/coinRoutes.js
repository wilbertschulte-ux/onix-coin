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

  if (!user.balance) user.balance = 0;
  if (!user.energy) user.energy = 2000;
  if (!user.maxEnergy) user.maxEnergy = 2000;
  if (!user.tapPower) user.tapPower = 1;
  if (!user.energyRecharge) user.energyRecharge = 10;
  if (!user.autoclickers) user.autoclickers = 0;
  if (!user.totalEarned) user.totalEarned = 0;
  if (!user.level) user.level = calculateLevel(user.totalEarned);

  if (!user.referralsCount) user.referralsCount = 0;

  if (!user.tapLevel) user.tapLevel = 1;
  if (!user.minerLevel) user.minerLevel = 1;
  if (!user.energyLevel) user.energyLevel = 1;
  if (!user.rechargeLevel) user.rechargeLevel = 1;

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

    let offlineIncome = 0;

    const now = Date.now();
    const lastSeenAt = user.lastSeenAt || now;
    const offlineSeconds = Math.floor((now - lastSeenAt) / 1000);

    if (user.autoclickers > 0 && offlineSeconds > 10) {
      const countedSeconds = Math.min(offlineSeconds, MAX_OFFLINE_SECONDS);

      offlineIncome = Math.floor(user.autoclickers * countedSeconds);

      if (offlineIncome > 0) {
        user.balance += offlineIncome;
        user.totalEarned += offlineIncome;
        user.level = calculateLevel(user.totalEarned);
      }
    }

    user.lastOfflineIncome = offlineIncome;
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
        lastOfflineIncome: 0,
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

      user.lastSeenAt = Date.now();
      user.updatedAt = new Date();

      await user.save();
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

// SAVE USER PROGRESS
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

    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        $set: {
          balance: Number(data.balance || 0),
          energy: Number(data.energy || 0),
          maxEnergy: Number(data.maxEnergy || 2000),

          tapPower: Number(data.tapPower || 1),
          energyRecharge: Number(data.energyRecharge || 10),
          autoclickers: Number(data.autoclickers || 0),

          totalEarned: Number(data.totalEarned || 0),
          level: Number(data.level || calculateLevel(data.totalEarned || 0)),

          referralsCount: Number(data.referralsCount || 0),

          tapLevel: Number(data.tapLevel || 1),
          minerLevel: Number(data.minerLevel || 1),
          energyLevel: Number(data.energyLevel || 1),
          rechargeLevel: Number(data.rechargeLevel || 1),

          updatedAt: new Date(),
          lastSeenAt: Date.now(),
        },
        $setOnInsert: {
          completedTasks: [],
          tapTimestamps: [],
          dailyRewardLastClaim: null,
          lastOfflineIncome: 0,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    normalizeUserFields(user);

    await user.save();

    return res.json(user);
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

    const points = user.tapPower || 1;

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