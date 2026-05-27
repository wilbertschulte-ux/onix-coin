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
      default: 500,
    },

    maxEnergy: {
      type: Number,
      default: 500,
    },

    tapPower: {
      type: Number,
      default: 1,
    },

    energyRecharge: {
      type: Number,
      default: 0.5,
    },

    autoclickers: {
      type: Number,
      default: 0.5,
    },

    level: {
      type: Number,
      default: 1,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    weeklyEarned: {
      type: Number,
      default: 0,
    },

    weeklyEarnedWeek: {
      type: String,
      default: null,
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

    dailyReferralBonusCount: {
      type: Number,
      default: 0,
    },

    hourlyReferralBonusCount: {
      type: Number,
      default: 0,
    },

    lastReferralBonusHour: {
      type: String,
      default: null,
    },

    lastReferralBonusDay: {
      type: String,
      default: null,
    },

    referredBy: {
      type: String,
      default: null,
    },

    referredByUsername: {
      type: String,
      default: null,
    },

    referredByBonusPaid: {
      type: Boolean,
      default: false,
    },

    referredByQualifiedAt: {
      type: Number,
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

    completedAchievements: {
      type: [String],
      default: [],
    },

    ownedPerks: {
      type: [String],
      default: [],
    },

    totalTaps: {
      type: Number,
      default: 0,
    },

    totalBoostsUsed: {
      type: Number,
      default: 0,
    },

    totalUpgradesBought: {
      type: Number,
      default: 0,
    },

    offlineClaimsCount: {
      type: Number,
      default: 0,
    },

    claimedRankBonuses: {
      type: [String],
      default: [],
    },

    transactions: {
      type: [
        {
          type: {
            type: String,
            default: 'income',
          },
          amount: {
            type: Number,
            default: 0,
          },
          title: {
            type: String,
            default: '',
          },
          status: {
            type: String,
            default: 'completed',
          },
          createdAt: {
            type: Number,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    withdrawalRequests: {
      type: [
        {
          amount: {
            type: Number,
            default: 0,
          },
          eurAmount: {
            type: Number,
            default: 0,
          },
          status: {
            type: String,
            default: 'pending',
          },
          adminComment: {
            type: String,
            default: '',
          },
          reviewedAt: {
            type: Number,
            default: null,
          },
          reviewedBy: {
            type: String,
            default: '',
          },
          createdAt: {
            type: Number,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    seasonBadges: {
      type: [String],
      default: [],
    },

    selectedTitle: {
      type: String,
      default: 'ONIX Player',
    },

    isSuspicious: {
      type: Boolean,
      default: false,
    },

    isFrozen: {
      type: Boolean,
      default: false,
    },

    frozenReason: {
      type: String,
      default: '',
    },

    suspiciousReasons: {
      type: [String],
      default: [],
    },

    dailyRewardLastClaim: {
      type: Number,
      default: null,
    },

    dailyStreak: {
      type: Number,
      default: 0,
    },

    lastDailyClaimDay: {
      type: String,
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

    pendingOfflineIncome: {
      type: Number,
      default: 0,
    },

    pendingOfflineSeconds: {
      type: Number,
      default: 0,
    },

    activeBoost: {
      type: String,
      enum: ['none', 'tap', 'mining'],
      default: 'none',
    },

    boostEndTime: {
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

    lastMineTickAt: {
      type: Number,
      default: 0,
    },

    lastUpgradeBuyAt: {
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