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
    const {
  telegramId,
  username,
  referredBy,
} = req.body;

    let user =
      await User.findOne({
        telegramId,
      });

    if (!user) {
      user = new User({
        telegramId,
        username,
        referredBy: referredBy || null,
      });

      await user.save();

if (referredBy && referredBy !== telegramId) {
  const refUser = await User.findOne({
    telegramId: referredBy,
  });

  if (refUser) {
    refUser.balance += 5000;
    refUser.referralsCount += 1;
    await refUser.save();

    user.balance += 1000;
    await user.save();
  }
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

module.exports = router;