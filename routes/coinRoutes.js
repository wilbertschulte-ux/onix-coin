const axios = require('axios');
const express = require('express');

const router = express.Router();

const User = require('../models/User');

// GET USER
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({
      telegramId: req.params.telegramId,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.completedTasks) {
      user.completedTasks = [];
      await user.save();
    }

const now = Date.now();
const lastSeenAt = user.lastSeenAt || now;
const offlineSeconds = Math.floor((now - lastSeenAt) / 1000);

if (user.autoclickers > 0 && offlineSeconds > 10) {
  const maxOfflineSeconds = 3 * 60 * 60;
  const countedSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
  const offlineIncome = Math.floor(user.autoclickers * countedSeconds);

  if (offlineIncome > 0) {
    user.balance += offlineIncome;
    user.totalEarned += offlineIncome;
    user.level = Math.floor(user.totalEarned / 500) + 1;
  }
}

user.lastSeenAt = now;
await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CREATE USER
router.post('/create', async (req, res) => {
  try {
    const { telegramId, username, referredBy } = req.body;

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username,
        referredBy: referredBy || null,
        completedTasks: [],
      });

      if (referredBy && referredBy !== telegramId) {
        const refUser = await User.findOne({
          telegramId: referredBy,
        });

        if (refUser) {
          refUser.balance += 5000;
          refUser.referralsCount += 1;
          refUser.lastReferralUsername =
            username || 'новый пользователь';

          await refUser.save();

          user.balance += 1000;
          user.referredByUsername =
            refUser.username || 'пользователя';
        }
      }

      await user.save();
    } else {
      if (!user.completedTasks) {
        user.completedTasks = [];
      }

      if (!user.username && username) {
        user.username = username;
      }

      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// SAVE USER PROGRESS
router.post('/save', async (req, res) => {
  try {
    const { telegramId, data } = req.body;

    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        $set: {
          balance: data.balance,
          energy: data.energy,
          maxEnergy: data.maxEnergy,

          tapPower: data.tapPower,
          energyRecharge: data.energyRecharge,
          autoclickers: data.autoclickers,

          totalEarned: data.totalEarned,
          level: data.level,

          referralsCount: data.referralsCount || 0,

          tapLevel: data.tapLevel || 1,
          minerLevel: data.minerLevel || 1,
          energyLevel: data.energyLevel || 1,
          rechargeLevel: data.rechargeLevel || 1,

          updatedAt: new Date(),
          lastSeenAt: Date.now(),
        },
        $setOnInsert: {
          completedTasks: [],
          dailyRewardLastClaim: null,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!user.completedTasks) {
      user.completedTasks = [];
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CLAIM TASK
router.post('/claim-task', async (req, res) => {
  try {
    const { telegramId, task } = req.body;

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.completedTasks) {
      user.completedTasks = [];
    }

    // DAILY REWARD
    if (task === 'daily') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      if (
        user.dailyRewardLastClaim &&
        now - Number(user.dailyRewardLastClaim) < dayMs
      ) {
        return res.status(400).json({
          message: 'Daily reward already claimed',
        });
      }

      const reward = 500 + user.level * 100;

      user.balance += reward;
      user.totalEarned += reward;
      user.dailyRewardLastClaim = now;

      if (!user.completedTasks.includes('daily')) {
        user.completedTasks.push('daily');
      }

      user.level = Math.floor(user.totalEarned / 500) + 1;
      user.updatedAt = new Date();

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

      const response = await axios.get(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          params: {
            chat_id: process.env.CHANNEL_ID,
            user_id: telegramId,
          },
        }
      );

      const status = response.data.result.status;

      const isSubscribed = [
        'member',
        'administrator',
        'creator',
      ].includes(status);

      if (!isSubscribed) {
        return res.status(400).json({
          message: 'Сначала подпишитесь на канал',
        });
      }

      user.balance += 2000;
      user.totalEarned += 2000;

      if (!user.completedTasks.includes('channel')) {
        user.completedTasks.push('channel');
      }

      user.level = Math.floor(user.totalEarned / 500) + 1;
      user.updatedAt = new Date();

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

      if (!user.completedTasks.includes('inviteFriend')) {
        user.completedTasks.push('inviteFriend');
      }

      user.level = Math.floor(user.totalEarned / 500) + 1;
      user.updatedAt = new Date();

      await user.save();

      return res.json(user);
    }

    return res.status(400).json({
      message: 'Unknown task',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// TAP COIN — backend anti-cheat
router.post('/tap', async (req, res) => {
  try {
    const { telegramId } = req.body;

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (user.energy <= 0) {
      return res.status(400).json({
        message: 'No energy',
      });
    }

const now = Date.now();
const oneSecondAgo = now - 1000;

user.tapTimestamps = (user.tapTimestamps || []).filter(
  (time) => time > oneSecondAgo
);

if (user.tapTimestamps.length >= 12) {
  return res.status(429).json({
    message: 'Too many taps',
  });
}

user.tapTimestamps.push(now);

    const points = user.tapPower || 1;

    user.balance += points;
    user.totalEarned += points;
    user.energy -= 1;

    user.level = Math.floor(user.totalEarned / 500) + 1;
    user.updatedAt = new Date();

    await user.save();

    res.json({
      user,
      points,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;