const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      default: 'Пользователь',
    },

    balance: {
      type: Number,
      default: 0,
    },

    energy: {
      type: Number,
      default: 2000,
    },

    maxEnergy: {
      type: Number,
      default: 2000,
    },

    tapPower: {
      type: Number,
      default: 1,
    },

    energyRecharge: {
      type: Number,
      default: 10,
    },

    autoclickers: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    tapLevel: {
      type: Number,
      default: 1,
    },

    minerLevel: {
      type: Number,
      default: 1,
    },

    energyLevel: {
      type: Number,
      default: 1,
    },

    rechargeLevel: {
      type: Number,
      default: 1,
    },

    referralsCount: {
      type: Number,
      default: 0,
    },

    referredBy: {
      type: String,
      default: null,
    },

    referredByUsername: {
      type: String,
      default: null,
    },

    lastReferralUsername: {
      type: String,
      default: null,
    },

    completedTasks: {
      type: [String],
      default: [],
    },

    dailyRewardLastClaim: {
      type: Number,
      default: null,
    },

    lastDailyRewardDate: {
      type: String,
      default: null,
    },

    lastOfflineIncome: {
      type: Number,
      default: 0,
    },

    lastOfflineSeconds: {
      type: Number,
      default: 0,
    },

    lastSeenAt: {
      type: Number,
      default: Date.now,
    },

    lastTapAt: {
      type: Number,
      default: 0,
    },

    tapTimestamps: {
      type: [Number],
      default: [],
    },

    tasks: {
      daily: {
        type: Boolean,
        default: false,
      },

      channel: {
        type: Boolean,
        default: false,
      },

      inviteFriend: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);