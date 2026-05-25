const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    unique: true,
  },

  username: String,

  referredByUsername: {
    type: String,
    default: null,
  },

  lastReferralUsername: {
    type: String,
    default: null,
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

  level: {
    type: Number,
    default: 1,
  },

  totalEarned: {
    type: Number,
    default: 0,
  },

  autoclickers: {
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

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.model(
    'User',
    userSchema
  );