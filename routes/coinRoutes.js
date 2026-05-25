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

    const today = new Date().toISOString().split("T")[0];

    if (task === "daily") {
      if (user.lastDailyRewardDate === today) {
        return res.status(400).json({ message: "Daily reward already claimed" });
      }

      user.balance += 500;
      user.totalEarned += 500;
      user.lastDailyRewardDate = today;
      user.tasks.daily = true;
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

module.exports = router;