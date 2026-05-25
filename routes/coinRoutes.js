const axios = require('axios');

const express = require("express");

const router = express.Router();

const User = require("../models/User");

// GET USER
router.get("/:telegramId", async (req, res) => {
  try {
    const user =
      await User.findOne({
        telegramId:
          req.params.telegramId,
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// CREATE USER
router.post("/create", async (req, res) => {
  try {
    const { telegramId, username, referredBy } = req.body;

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username,
        referredBy: referredBy || null,
      });

      if (referredBy && referredBy !== telegramId) {
  const refUser = await User.findOne({
    telegramId: referredBy,
  });

  if (refUser) {
    refUser.balance += 5000;
    refUser.referralsCount += 1;
    refUser.lastReferralUsername = username || "новый пользователь";

    await refUser.save();

    user.balance += 1000;

user.referredByUsername =
  refUser.username ||
  "пользователя";
  }
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

router.post("/save", async (req, res) => {
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
          referralsCount: data.referralsCount,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/claim-task", async (req, res) => {
  try {
    const { telegramId, task } = req.body;

    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.tasks) {
      user.tasks = {
        daily: false,
        channel: false,
        inviteFriend: false,
      };
    }

    if (task === "daily") {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (
    user.dailyRewardLastClaim &&
    now - Number(user.dailyRewardLastClaim) < dayMs
  ) {
    return res.status(400).json({
      message: "Daily reward already claimed",
    });
  }

  const reward = 500 + user.level * 100;

  user.balance += reward;
  user.totalEarned += reward;
  user.dailyRewardLastClaim = now;
}

    if (task === "channel") {
      if (user.tasks.channel) {
        return res.status(400).json({ message: "Task already claimed" });
      }

      user.balance += 2000;
      user.totalEarned += 2000;
      user.tasks.channel = true;
    }

    if (task === "inviteFriend") {
      if (user.tasks.inviteFriend) {
        return res.status(400).json({ message: "Task already claimed" });
      }

      if (user.referralsCount < 1) {
        return res.status(400).json({ message: "Invite one friend first" });
      }

      user.balance += 3000;
      user.totalEarned += 3000;
      user.tasks.inviteFriend = true;
    }

    user.level = Math.floor(user.totalEarned / 500) + 1;
    user.updatedAt = new Date();

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    // DAILY REWARD
    if (task === 'daily') {
      const now = new Date();

      if (user.dailyRewardLastClaim) {
        const diff =
          now - new Date(user.dailyRewardLastClaim);

        const hours24 = 24 * 60 * 60 * 1000;

        if (diff < hours24) {
          return res.status(400).json({
            message:
              'Награда уже получена',
          });
        }
      }

      const reward = 500 + user.level * 100;

      user.balance += reward;
      user.totalEarned += reward;
      user.dailyRewardLastClaim = now;

      await user.save();

      return res.json(user);
    }

    // CHANNEL SUBSCRIBE
    if (task === 'channel') {
      if (
        user.completedTasks.includes('channel')
      ) {
        return res.status(400).json({
          message:
            'Задание уже выполнено',
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

      const status =
        response.data.result.status;

      const isSubscribed = [
        'member',
        'administrator',
        'creator',
      ].includes(status);

      if (!isSubscribed) {
        return res.status(400).json({
          message:
            'Сначала подпишитесь на канал',
        });
      }

      user.balance += 2000;
      user.totalEarned += 2000;

      user.completedTasks.push('channel');

      await user.save();

      return res.json(user);
    }

    // INVITE FRIEND
    if (task === 'inviteFriend') {
      if (
        user.completedTasks.includes(
          'inviteFriend'
        )
      ) {
        return res.status(400).json({
          message:
            'Награда уже получена',
        });
      }

      if (user.referralsCount < 1) {
        return res.status(400).json({
          message:
            'Сначала пригласите друга',
        });
      }

      user.balance += 3000;
      user.totalEarned += 3000;

      user.completedTasks.push(
        'inviteFriend'
      );

      await user.save();

      return res.json(user);
    }

    res.status(400).json({
      message: 'Unknown task',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;