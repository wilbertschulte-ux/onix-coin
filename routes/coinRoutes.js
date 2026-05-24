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
    } = req.body;

    let user =
      await User.findOne({
        telegramId,
      });

    if (!user) {
      user = new User({
        telegramId,
        username,
      });

      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// SAVE USER
router.post("/save", async (req, res) => {
  try {
    const {
      telegramId,
      data,
    } = req.body;

    const user =
      await User.findOneAndUpdate(
        {
          telegramId,
        },
        {
          ...data,
          updatedAt:
            new Date(),
        },
        {
          new: true,
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