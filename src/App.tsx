import React, { useState, useEffect } from 'react';
import { Zap, Trophy, Home, Star, Wallet, UserCircle, Rocket } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}


const ONIX_THEME_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700;800;900&family=Orbitron:wght@600;700;800;900&display=swap');

:root {
  --onix-bg-main: #080F17;
  --onix-bg-card: #111827;
  --onix-bg-soft: #1A1F2E;
  --onix-bg-deep: #0F1115;

  --onix-purple: #885CF6;
  --onix-violet: #A855F7;
  --onix-deep-purple: #5B21F6;
  --onix-cyan: #06B6D4;
  --onix-cyan-bright: #00E5FF;
  --onix-gold: #FACC15;

  --onix-text-main: #F8FAFC;
  --onix-text-muted: #94A3B8;
  --onix-border: rgba(136, 92, 246, 0.28);
  --onix-border-cyan: rgba(6, 182, 212, 0.28);
}

* {
  -webkit-tap-highlight-color: transparent;
}

body {
  background: #080F17;
}

.onix-app-bg {
  font-family: 'Exo 2', 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(circle at 12% -8%, rgba(136, 92, 246, 0.22), transparent 28%),
    radial-gradient(circle at 88% 6%, rgba(6, 182, 212, 0.14), transparent 26%),
    radial-gradient(circle at 50% 100%, rgba(91, 33, 246, 0.18), transparent 38%),
    linear-gradient(180deg, #080F17 0%, #0A0F1C 45%, #050914 100%);
  color: var(--onix-text-main);
  position: relative;
  overflow-x: hidden;
}

.onix-app-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.38;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.16) 0 1px, transparent 1px),
    radial-gradient(circle at 76% 18%, rgba(0,229,255,0.22) 0 1px, transparent 1px),
    radial-gradient(circle at 62% 76%, rgba(168,85,247,0.18) 0 1px, transparent 1px);
  background-size: 140px 140px, 220px 220px, 180px 180px;
}

.onix-header {
  background: rgba(8, 15, 23, 0.86) !important;
  border-bottom: 1px solid rgba(136, 92, 246, 0.22);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 48px rgba(0,0,0,0.35);
}

.onix-brand-mark {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.22), transparent 54%),
    linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(8, 15, 23, 0.98));
  border: 1px solid rgba(136, 92, 246, 0.45);
  box-shadow:
    0 0 24px rgba(136, 92, 246, 0.55),
    0 0 34px rgba(6, 182, 212, 0.24),
    inset 0 0 22px rgba(136, 92, 246, 0.12);
  position: relative;
}

.onix-brand-mark::before,
.onix-brand-mark::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 36px;
  border: 1px solid rgba(136, 92, 246, 0.55);
  opacity: 0.8;
}

.onix-brand-mark::before {
  left: -9px;
  transform: skewY(-28deg);
  border-right: 0;
}

.onix-brand-mark::after {
  right: -9px;
  transform: skewY(28deg);
  border-left: 0;
}

.onix-crystal-svg {
  display: block;
  overflow: visible;
}

.onix-crystal-svg-tap {
  width: 68%;
  height: 68%;
  filter:
    drop-shadow(0 0 12px rgba(0, 229, 255, 0.75))
    drop-shadow(0 0 28px rgba(136, 92, 246, 0.75));
  animation: onixCrystalFloat 3.2s ease-in-out infinite;
}

.onix-brand-title {
  font-family: 'Orbitron', 'Exo 2', system-ui, sans-serif;
  letter-spacing: 0.04em;
  text-shadow: 0 0 18px rgba(136, 92, 246, 0.36);
}

.onix-energy-pill {
  background: rgba(17, 24, 39, 0.82) !important;
  border: 1px solid rgba(6, 182, 212, 0.28);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.16);
}

.onix-balance-number {
  font-family: 'Orbitron', 'Exo 2', system-ui, sans-serif;
  background: linear-gradient(90deg, #FFFFFF 0%, #B7F9FF 36%, #A855F7 72%, #FACC15 100%);
  -webkit-background-clip: text;
  color: transparent !important;
  text-shadow: 0 0 28px rgba(136, 92, 246, 0.22);
}

.onix-nav {
  background: rgba(8, 15, 23, 0.82) !important;
  border: 1px solid rgba(136, 92, 246, 0.24);
  box-shadow:
    0 18px 50px rgba(0,0,0,0.42),
    inset 0 0 24px rgba(136, 92, 246, 0.08);
  backdrop-filter: blur(18px);
}

.onix-nav button {
  color: #94A3B8;
}

.onix-nav button.onix-nav-active {
  background: linear-gradient(135deg, rgba(6,182,212,0.18), rgba(136,92,246,0.28)) !important;
  color: #B7F9FF !important;
  box-shadow:
    inset 0 0 18px rgba(136, 92, 246, 0.24),
    0 0 18px rgba(6, 182, 212, 0.12);
}

.onix-tap-orb {
  background:
    radial-gradient(circle at 50% 42%, rgba(0, 229, 255, 0.24), transparent 24%),
    radial-gradient(circle at 50% 55%, rgba(136, 92, 246, 0.34), transparent 48%),
    linear-gradient(145deg, rgba(17,24,39,0.72), rgba(8,15,23,0.98)) !important;
  border: 2px solid rgba(136, 92, 246, 0.72) !important;
  box-shadow:
    0 0 42px rgba(136, 92, 246, 0.72),
    0 0 78px rgba(6, 182, 212, 0.28),
    inset 0 0 38px rgba(136, 92, 246, 0.24) !important;
  position: relative;
  overflow: visible;
}

.onix-tap-orb::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 999px;
  border: 2px solid rgba(136, 92, 246, 0.62);
  box-shadow:
    0 0 18px rgba(136, 92, 246, 0.45),
    inset 0 0 24px rgba(6, 182, 212, 0.16);
  animation: onixOrbPulse 2.8s ease-in-out infinite;
}

.onix-tap-orb::after {
  content: '';
  position: absolute;
  inset: 20px;
  border-radius: 999px;
  border: 1px solid rgba(0, 229, 255, 0.34);
  box-shadow:
    inset 0 0 26px rgba(6, 182, 212, 0.14),
    0 0 18px rgba(0, 229, 255, 0.12);
  animation: onixOrbSpin 8s linear infinite;
}

.onix-tap-orb:active {
  transform: scale(0.94);
  box-shadow:
    0 0 62px rgba(6, 182, 212, 0.78),
    0 0 96px rgba(136, 92, 246, 0.62),
    inset 0 0 46px rgba(255, 255, 255, 0.16) !important;
}

.onix-crystal-shards {
  position: absolute;
  inset: -18px;
  pointer-events: none;
  border-radius: 999px;
  background:
    radial-gradient(circle at 18% 26%, rgba(168,85,247,0.9) 0 2px, transparent 3px),
    radial-gradient(circle at 78% 18%, rgba(0,229,255,0.85) 0 2px, transparent 3px),
    radial-gradient(circle at 88% 70%, rgba(136,92,246,0.9) 0 2px, transparent 3px),
    radial-gradient(circle at 28% 84%, rgba(0,229,255,0.65) 0 1px, transparent 3px);
  filter: drop-shadow(0 0 8px rgba(136,92,246,0.85));
  opacity: 0.85;
  animation: onixShardTwinkle 2.4s ease-in-out infinite;
}

@keyframes onixOrbPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.035);
    opacity: 1;
  }
}

@keyframes onixOrbSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes onixCrystalFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.025);
  }
}

@keyframes onixShardTwinkle {
  0%, 100% {
    opacity: 0.55;
    transform: rotate(0deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: rotate(5deg) scale(1.02);
  }
}

.onix-floating-number {
  color: #00E5FF !important;
  text-shadow:
    0 0 10px rgba(6, 182, 212, 0.9),
    0 0 18px rgba(136, 92, 246, 0.65);
  font-weight: 900;
  font-family: 'Orbitron', 'Exo 2', system-ui, sans-serif;
}

.onix-card,
.bg-\\[\\#111827\\] {
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.94), rgba(8, 15, 23, 0.98)) !important;
  border-color: rgba(136, 92, 246, 0.22) !important;
}

.bg-\\[\\#0a0f1c\\],
.bg-\\[\\#0A0F1C\\] {
  background: rgba(8, 15, 23, 0.72) !important;
}

.bg-yellow-400 {
  background: linear-gradient(135deg, #06B6D4 0%, #885CF6 46%, #A855F7 100%) !important;
  color: #ffffff !important;
  box-shadow:
    0 0 22px rgba(136, 92, 246, 0.38),
    inset 0 1px 0 rgba(255,255,255,0.25);
}

.text-yellow-400 {
  color: #B7F9FF !important;
}

.border-yellow-400\\/20,
.border-yellow-400\\/30,
.border-yellow-400 {
  border-color: rgba(136, 92, 246, 0.34) !important;
}

.bg-gray-800 {
  background: rgba(15, 23, 42, 0.92) !important;
}

.bg-emerald-500 {
  background: linear-gradient(135deg, #10B981, #06B6D4) !important;
}

.shadow-xl,
.shadow-2xl {
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.45),
    0 0 28px rgba(136, 92, 246, 0.10) !important;
}

.onix-progress-fill {
  background: linear-gradient(90deg, #06B6D4, #885CF6, #A855F7) !important;
  box-shadow: 0 0 18px rgba(136, 92, 246, 0.55);
}

.onix-gold-accent {
  color: #FACC15 !important;
  text-shadow: 0 0 16px rgba(250, 204, 21, 0.28);
}


.onix-home-shell {
  position: relative;
  padding: 22px 18px 32px;
}

.onix-hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(136, 92, 246, 0.34);
  background:
    radial-gradient(circle at 20% 0%, rgba(136, 92, 246, 0.28), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(6, 182, 212, 0.18), transparent 30%),
    linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(8, 15, 23, 0.98));
  box-shadow:
    0 20px 70px rgba(0, 0, 0, 0.50),
    0 0 40px rgba(136, 92, 246, 0.16);
}

.onix-hero-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  opacity: 0.40;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 0 36%, rgba(0, 229, 255, 0.12) 42%, transparent 50%),
    radial-gradient(circle at 80% 95%, rgba(136, 92, 246, 0.28), transparent 34%);
}

.onix-hero-title {
  font-family: 'Orbitron', 'Exo 2', system-ui, sans-serif;
  letter-spacing: 0.03em;
  background: linear-gradient(90deg, #FFFFFF 0%, #B7F9FF 34%, #A855F7 78%);
  -webkit-background-clip: text;
  color: transparent;
}

.onix-chip {
  border: 1px solid rgba(136, 92, 246, 0.30);
  background: rgba(8, 15, 23, 0.64);
  box-shadow: inset 0 0 18px rgba(136, 92, 246, 0.10);
}

.onix-stat-tile {
  border: 1px solid rgba(136, 92, 246, 0.22);
  background:
    linear-gradient(145deg, rgba(17, 24, 39, 0.84), rgba(8, 15, 23, 0.90));
  box-shadow: inset 0 0 18px rgba(6, 182, 212, 0.04);
}

.onix-tap-stage {
  position: relative;
  margin: 26px auto 0;
  display: grid;
  place-items: center;
  min-height: 330px;
}

.onix-tap-stage::before {
  content: '';
  position: absolute;
  width: min(82vw, 360px);
  height: min(82vw, 360px);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 55%, rgba(0, 229, 255, 0.18), transparent 28%),
    radial-gradient(circle at 50% 55%, rgba(136, 92, 246, 0.20), transparent 54%);
  filter: blur(1px);
}

.onix-tap-stage::after {
  content: '';
  position: absolute;
  bottom: 8px;
  width: min(64vw, 280px);
  height: 32px;
  border-radius: 999px;
  background: radial-gradient(ellipse, rgba(136, 92, 246, 0.35), transparent 70%);
  filter: blur(10px);
}

.onix-tap-orb {
  width: min(72vw, 292px) !important;
  height: min(72vw, 292px) !important;
  z-index: 2;
}

.onix-tap-orb .onix-crystal-svg-tap {
  width: 72% !important;
  height: 72% !important;
}

.onix-tap-label {
  margin-top: 22px;
  font-family: 'Orbitron', 'Exo 2', system-ui, sans-serif;
  letter-spacing: 0.18em;
  color: #B7F9FF;
  text-shadow:
    0 0 12px rgba(6, 182, 212, 0.55),
    0 0 22px rgba(136, 92, 246, 0.35);
}

.onix-action-row button {
  border: 1px solid rgba(136, 92, 246, 0.32);
  background: rgba(8, 15, 23, 0.64);
  box-shadow: inset 0 0 18px rgba(136, 92, 246, 0.10);
}

.onix-energy-bar {
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(6, 182, 212, 0.24);
  border-radius: 999px;
  overflow: hidden;
}

.onix-energy-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #00E5FF, #06B6D4, #885CF6);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.58);
}

@media (max-width: 420px) {
  .onix-home-shell {
    padding-left: 14px;
    padding-right: 14px;
  }

  .onix-hero-card {
    border-radius: 26px;
  }

  .onix-tap-stage {
    min-height: 300px;
  }
}

`;


type OnixCrystalProps = {
  size?: number;
  variant?: 'logo' | 'tap';
};

function OnixCrystal({ size = 44, variant = 'logo' }: OnixCrystalProps) {
  const uid = `onixCrystal${variant}${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'tap' ? 'onix-crystal-svg onix-crystal-svg-tap' : 'onix-crystal-svg'}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}Outer`} x1="16" y1="12" x2="104" y2="108">
          <stop offset="0%" stopColor="#B7F9FF" />
          <stop offset="18%" stopColor="#885CF6" />
          <stop offset="52%" stopColor="#5B21F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id={`${uid}Left`} x1="22" y1="20" x2="60" y2="108">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="46%" stopColor="#5B21F6" />
          <stop offset="100%" stopColor="#1A1F2E" />
        </linearGradient>

        <linearGradient id={`${uid}Right`} x1="98" y1="18" x2="60" y2="108">
          <stop offset="0%" stopColor="#B7F9FF" />
          <stop offset="42%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#5B21F6" />
        </linearGradient>

        <linearGradient id={`${uid}Core`} x1="42" y1="32" x2="80" y2="86">
          <stop offset="0%" stopColor="#B7F9FF" />
          <stop offset="46%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#885CF6" />
        </linearGradient>

        <radialGradient id={`${uid}Glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#885CF6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#885CF6" stopOpacity="0" />
        </radialGradient>

        <filter id={`${uid}Shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00E5FF" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#885CF6" floodOpacity="0.55" />
        </filter>
      </defs>

      <ellipse cx="60" cy="60" rx="42" ry="48" fill={`url(#${uid}Glow)`} opacity="0.45" />

      <g filter={`url(#${uid}Shadow)`}>
        <path
          d="M60 5 L107 60 L60 115 L13 60 Z"
          fill={`url(#${uid}Outer)`}
          opacity="0.95"
        />

        <path
          d="M60 5 L60 115 L13 60 Z"
          fill={`url(#${uid}Left)`}
          opacity="0.84"
        />

        <path
          d="M60 5 L107 60 L60 115 Z"
          fill={`url(#${uid}Right)`}
          opacity="0.88"
        />

        <path
          d="M60 17 L86 60 L60 103 L34 60 Z"
          fill="#080F17"
          opacity="0.42"
        />

        <path
          d="M60 22 L79 60 L60 98 L41 60 Z"
          fill={`url(#${uid}Core)`}
          opacity="0.98"
        />

        <path
          d="M60 22 L60 98 L41 60 Z"
          fill="#885CF6"
          opacity="0.55"
        />

        <path
          d="M60 22 L79 60 L60 98 Z"
          fill="#00E5FF"
          opacity="0.55"
        />

        <path
          d="M60 5 L86 60 L60 115 L34 60 Z"
          stroke="#B7F9FF"
          strokeOpacity="0.65"
          strokeWidth="1.6"
        />

        <path
          d="M13 60 L34 60 M86 60 L107 60 M60 5 L60 22 M60 98 L60 115"
          stroke="#FFFFFF"
          strokeOpacity="0.32"
          strokeWidth="1.2"
        />

        <path
          d="M31 31 L13 60 L31 89"
          stroke="#A855F7"
          strokeOpacity="0.8"
          strokeWidth="2"
        />

        <path
          d="M89 31 L107 60 L89 89"
          stroke="#06B6D4"
          strokeOpacity="0.75"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}


type Tab = 'home' | 'boosts' | 'tasks' | 'friends' | 'wallet' | 'launch';

type BoostSubTab = 'upgrades' | 'perks' | 'boosts';

type FloatingNumber = {
  id: number;
  x: number;
  y: number;
  value: number;
};

type Transaction = {
  type: string;
  amount: number;
  title: string;
  status?: string;
  createdAt?: number;
};

type TransactionFilter =
  | 'all'
  | 'income'
  | 'expense'
  | 'withdrawal'
  | 'referral'
  | 'season'
  | 'missions';

type AdminUserSearchResult = {
  telegramId: string;
  username: string;
  balance: number;
  totalEarned: number;
  weeklyEarned: number;
  referralsCount: number;
  totalTaps: number;
  isSuspicious: boolean;
  isFrozen: boolean;
  frozenReason: string;
};

type AdminOperationsPayload = {
  withdrawals: Array<AdminWithdrawalRequest & {
    telegramId: string;
    username: string;
  }>;
  transactions: Array<Transaction & {
    telegramId: string;
    username: string;
  }>;
};

type AdminUserProfile = AdminUserSearchResult & {
  totalBoostsUsed: number;
  totalUpgradesBought: number;
  offlineClaimsCount: number;
  level: number;
  selectedTitle: string;
  league: string;
  suspiciousReasons: string[];
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  securityLogs: Array<{
    type: string;
    title: string;
    details: string;
    createdAt: number;
  }>;
  adminNotes: Array<{
    text: string;
    adminTelegramId: string;
    createdAt: number;
  }>;
};

type AdminSecurityLog = {
  telegramId: string;
  username: string;
  isFrozen: boolean;
  isSuspicious: boolean;
  type: string;
  title: string;
  details: string;
  createdAt: number;
};

type AdminEconomyDashboard = {
  economyConfig: any;
  totals: {
    users: number;
    frozenUsers: number;
    suspiciousUsers: number;
    totalBalance: number;
    totalEarned: number;
    weeklyEarned: number;
    referrals: number;
    taps: number;
    pendingWithdrawals: number;
    pendingWithdrawOnix: number;
    approvedWithdrawals: number;
    rejectedWithdrawals: number;
    createdOnix: number;
    spentOnix: number;
    totalBalanceEur: number;
    pendingWithdrawEur: number;
  };
  transactionTypes: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  reward: number;
  goal: number;
  progress: number;
  isCompleted: boolean;
};

type AchievementCategory =
  | 'all'
  | 'taps'
  | 'miner'
  | 'referrals'
  | 'seasons'
  | 'perks'
  | 'daily'
  | 'ranks';

type RewardPopupItem = {
  icon: string;
  title: string;
  amount: number;
};

type LeaderboardItem = {
  place: number;
  telegramId?: string;
  username: string;
  weeklyEarned: number;
  totalEarned: number;
};

type ReferralLimit = {
  used: number;
  max: number;
  remaining: number;
  resetAt: number;
  secondsUntilReset: number;
  isLimitReached: boolean;
};

type EconomyConfig = {
  onixEurPer1000: number;
  minWithdrawOnix: number;
  referralReward: number;
  referredUserReward: number;
  maxPaidReferralsPerDay: number;
};

type AdminPrizePreview = {
  place: number;
  telegramId: string;
  username: string;
  weeklyEarned: number;
  totalEarned: number;
  balance: number;
  prize: number;
};

type AdminPrizePreviewResponse = {
  week: string;
  alreadyAwarded: boolean;
  awardedAt: number | null;
  awardedWinners: AdminPrizePreview[];
  preview: AdminPrizePreview[];
};

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type SeasonHistoryItem = {
  week: string;
  awardedAt: number;
  winners: Array<{
    place: number;
    username: string;
    weeklyEarned: number;
    prize: number;
  }>;
};

type TeamLeaderboardItem = {
  place: number;
  teamName: string;
  weeklyEarned: number;
  members: number;
};

type TeamMissionItem = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  reward: number;
  isCompleted: boolean;
  isClaimed: boolean;
};

type TeamSocialDashboard = {
  team: {
    teamName: string;
    members: number;
    weeklyEarned: number;
    totalEarned: number;
    totalTaps: number;
    teamCode: string;
    place: number | null;
    membersList: Array<{
      telegramId: string;
      username: string;
      weeklyEarned: number;
      totalEarned: number;
      totalTaps: number;
      referralsCount: number;
    }>;
  };
  teamMissions: TeamMissionItem[];
  teamPrize: number;
  week: string;
};

type FriendLeaderboardItem = {
  place: number;
  telegramId: string;
  username: string;
  totalEarned: number;
  weeklyEarned: number;
  referralsCount: number;
  isMe: boolean;
};

type SeasonPrizePopup = {
  week: string;
  place: number;
  prize: number;
};

type MissionItem = {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  reward: number;
  category: string;
  secret?: boolean;
  unlocked?: boolean;
  isCompleted: boolean;
  isClaimed: boolean;
};

type MissionsPayload = {
  daily: MissionItem[];
  weekly: MissionItem[];
  difficulty: number;
  dailyKey: string;
  weeklyKey: string;
};

type WithdrawalRequest = {
  amount: number;
  eurAmount: number;
  status: string;
  adminComment?: string;
  createdAt: number;
  reviewedAt?: number | null;
};

type AdminWithdrawalRequest = {
  userTelegramId: string;
  username: string;
  requestIndex: number;
  amount: number;
  eurAmount: number;
  status: string;
  adminComment: string;
  createdAt: number;
  reviewedAt: number | null;
  userStats: {
    balance: number;
    totalEarned: number;
    weeklyEarned: number;
    referralsCount: number;
    totalTaps: number;
    totalBoostsUsed: number;
    totalUpgradesBought: number;
    ownedPerksCount: number;
    achievementsCompleted: number;
    isSuspicious: boolean;
    suspiciousReasons: string[];
  };
};

type SuspiciousUser = {
  telegramId: string;
  username: string;
  balance: number;
  totalEarned: number;
  weeklyEarned: number;
  referralsCount: number;
  totalTaps: number;
  isSuspicious: boolean;
  suspiciousReasons: string[];
  isFrozen: boolean;
  frozenReason: string;
};

const API_URL = 'https://onix-coin.onrender.com/api/coins';
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ONIX_EUR_PER_1000 = 0.68;
const DEFAULT_MIN_WITHDRAW_ONIX = 750000;
const ADMIN_TELEGRAM_ID = String(import.meta.env.VITE_ADMIN_TELEGRAM_ID || '');

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_tap',
    title: 'Первый тап',
    description: 'Сделайте первый тап по монете',
    reward: 500,
    goal: 1,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'taps_100',
    title: '100 тапов',
    description: 'Сделайте 100 тапов',
    reward: 2500,
    goal: 100,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'taps_1000',
    title: '1 000 тапов',
    description: 'Сделайте 1 000 тапов',
    reward: 10000,
    goal: 1000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'first_upgrade',
    title: 'Первое улучшение',
    description: 'Купите любое улучшение',
    reward: 2500,
    goal: 1,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'miner_level_5',
    title: 'Майнер ур. 5',
    description: 'Прокачайте майнер до 5 уровня',
    reward: 10000,
    goal: 5,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'first_boost',
    title: 'Первый буст',
    description: 'Активируйте любой временный буст',
    reward: 5000,
    goal: 1,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'first_offline_claim',
    title: 'Первый оффлайн-доход',
    description: 'Заберите оффлайн-доход майнера',
    reward: 5000,
    goal: 1,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'first_friend',
    title: 'Первый друг',
    description: 'Пригласите первого друга',
    reward: 25000,
    goal: 1,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'taps_10000',
    title: '10 000 тапов',
    description: 'Сделайте 10 000 тапов',
    reward: 50000,
    goal: 10000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'weekly_100k',
    title: '100 000 ONIX за неделю',
    description: 'Заработайте 100 000 ONIX за неделю',
    reward: 25000,
    goal: 100000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'all_perks',
    title: 'Коллекционер перков',
    description: 'Купите все постоянные перки',
    reward: 75000,
    goal: 4,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'rank_gold',
    title: 'Золотой ранг',
    description: 'Достигните Gold I',
    reward: 50000,
    goal: 750000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'rank_diamond',
    title: 'Diamond игрок',
    description: 'Достигните Diamond',
    reward: 250000,
    goal: 5000000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'friends_5',
    title: '5 друзей',
    description: 'Пригласите 5 друзей',
    reward: 100000,
    goal: 5,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'streak_7',
    title: '7 дней подряд',
    description: 'Дойдите до 7 дня daily streak',
    reward: 50000,
    goal: 7,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'taps_50000',
    title: '50 000 тапов',
    description: 'Сделайте 50 000 тапов',
    reward: 150000,
    goal: 50000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'taps_100000',
    title: '100 000 тапов',
    description: 'Сделайте 100 000 тапов',
    reward: 300000,
    goal: 100000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'earned_1m',
    title: 'Миллионер ONIX',
    description: 'Заработайте 1 000 000 ONIX всего',
    reward: 100000,
    goal: 1000000,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'friends_10',
    title: '10 друзей',
    description: 'Пригласите 10 друзей',
    reward: 200000,
    goal: 10,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'upgrade_master',
    title: 'Мастер апгрейдов',
    description: 'Купите 25 улучшений',
    reward: 100000,
    goal: 25,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'boost_master',
    title: 'Boost Master',
    description: 'Используйте 10 бустов',
    reward: 75000,
    goal: 10,
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'offline_master',
    title: 'Оффлайн мастер',
    description: 'Заберите оффлайн-доход 10 раз',
    reward: 75000,
    goal: 10,
    progress: 0,
    isCompleted: false,
  },
];

function formatOnix(value: number) {
  return Number(value || 0).toLocaleString('ru-RU', {
    maximumFractionDigits: 2,
  });
}

function getTapUpgradeCost(tapLevel: number) {
  return Math.round(1000 * Math.pow(1.35, Number(tapLevel || 1) - 1));
}

function getMinerUpgradeCost(minerLevel: number) {
  return Math.round(2500 * Math.pow(1.38, Number(minerLevel || 1) - 1));
}

function getEnergyUpgradeCost(energyLevel: number) {
  return Math.round(1500 * Math.pow(1.25, Number(energyLevel || 1) - 1));
}

function getRechargeUpgradeCost(rechargeLevel: number) {
  return Math.round(1800 * Math.pow(1.28, Number(rechargeLevel || 1) - 1));
}

function getDailyReward(level: number) {
  return Math.min(15000 + Number(level || 1) * 500, 50000);
}

function getDailyStreakMultiplier(streakDay: number) {
  const day = Number(streakDay || 1);

  if (day >= 7) return 2;

  return 1 + (day - 1) * 0.1;
}

function getDailyRewardWithStreak(level: number, streakDay: number) {
  return Math.round(getDailyReward(level) * getDailyStreakMultiplier(streakDay));
}

function getTapBoostCost(tapPower: number) {
  return Math.max(2500, Math.round(Number(tapPower || 1) * 500 * 0.7));
}

function getMiningBoostCost(autoclickers: number) {
  return Math.max(2500, Math.round(Number(autoclickers || 0.5) * 900 * 0.7));
}


const RANKS = [
  { id: 'bronze_1', name: 'Bronze I', threshold: 0, bonus: 0 },
  { id: 'bronze_2', name: 'Bronze II', threshold: 25000, bonus: 2500 },
  { id: 'bronze_3', name: 'Bronze III', threshold: 75000, bonus: 7500 },
  { id: 'silver_1', name: 'Silver I', threshold: 150000, bonus: 15000 },
  { id: 'silver_2', name: 'Silver II', threshold: 300000, bonus: 30000 },
  { id: 'silver_3', name: 'Silver III', threshold: 500000, bonus: 50000 },
  { id: 'gold_1', name: 'Gold I', threshold: 750000, bonus: 75000 },
  { id: 'gold_2', name: 'Gold II', threshold: 1000000, bonus: 100000 },
  { id: 'gold_3', name: 'Gold III', threshold: 1500000, bonus: 150000 },
  { id: 'platinum', name: 'Platinum', threshold: 2500000, bonus: 250000 },
  { id: 'diamond', name: 'Diamond', threshold: 5000000, bonus: 500000 },
  { id: 'master', name: 'Master', threshold: 10000000, bonus: 1000000 },
  { id: 'legend', name: 'Legend', threshold: 25000000, bonus: 2500000 },
];

function getRankInfo(totalEarned: number) {
  const earned = Number(totalEarned || 0);
  let currentRank = RANKS[0];
  let nextRank: (typeof RANKS)[number] | null = null;

  for (let i = 0; i < RANKS.length; i += 1) {
    if (earned >= RANKS[i].threshold) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    }
  }

  const currentThreshold = currentRank.threshold;
  const nextThreshold = nextRank ? nextRank.threshold : currentThreshold;
  const progressTotal = Math.max(1, nextThreshold - currentThreshold);
  const progressCurrent = Math.max(0, earned - currentThreshold);
  const progressPercent = nextRank
    ? Math.min(100, (progressCurrent / progressTotal) * 100)
    : 100;

  return {
    currentRank,
    nextRank,
    progressCurrent,
    progressTotal,
    progressPercent,
  };
}

function getTelegramId() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return '';
  return tg.initDataUnsafe?.user?.id?.toString() || '';
}

function getTransactionIcon(type: string) {
  if (type.includes('daily')) return '🎁';
  if (type.includes('offline')) return '⛏️';
  if (type.includes('rank')) return '🏆';
  if (type.includes('referral')) return '👥';
  if (type.includes('task')) return '✅';
  if (type.includes('upgrade')) return '⬆️';
  if (type.includes('boost')) return '⚡';
  if (type.includes('perk')) return '🧩';
  if (type.includes('chest')) return '🎁';
  if (type.includes('mission')) return '📋';
  if (type.includes('promo')) return '🎟';
  if (type.includes('welcome')) return '🎁';
  if (type.includes('team')) return '👥';
  if (type.includes('withdrawal')) return '💸';
  if (type.includes('admin')) return '🛠️';

  return '🧾';
}

function formatTransactionTime(createdAt?: number) {
  if (!createdAt) return '';

  return new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeBoost(value: unknown): 'none' | 'tap' | 'mining' {
  const boost = String(value || 'none').trim();

  if (boost === 'tap') return 'tap';
  if (boost === 'mining' || boost === 'miner') return 'mining';

  return 'none';
}


type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      message: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || 'Unknown frontend error',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      const telegramId =
        window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';

      fetch(`${API_URL}/frontend-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          message: error?.message || 'Unknown frontend error',
          stack: `${error?.stack || ''}\n${info?.componentStack || ''}`,
          appVersion: '1.0.0',
        }),
      }).catch(() => {});
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
          <div className="w-full max-w-sm rounded-3xl border border-red-400/30 bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-white">
              Что-то пошло не так
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Ошибка уже сохранена в логах. Обновите приложение.
            </p>

            <p className="mt-2 break-words text-xs text-gray-600">
              {this.state.message}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 font-bold text-black"
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


function App() {
  const [balance, setBalance] = useState(0);
  const [economyConfig, setEconomyConfig] = useState<EconomyConfig>({
    onixEurPer1000: DEFAULT_ONIX_EUR_PER_1000,
    minWithdrawOnix: DEFAULT_MIN_WITHDRAW_ONIX,
    referralReward: 75000,
    referredUserReward: 15000,
    maxPaidReferralsPerDay: 10,
  });
  const [username, setUsername] = useState('Пользователь');
  const [selectedTitle, setSelectedTitle] = useState('ONIX Player');
  const [achievementCategory, setAchievementCategory] =
    useState<AchievementCategory>('all');
  const [weeklyEarned, setWeeklyEarned] = useState(0);
  const [currentUserPlace, setCurrentUserPlace] = useState<number | null>(null);
  const [energy, setEnergy] = useState(500);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [tapPower, setTapPower] = useState(1);
  const [energyRecharge, setEnergyRecharge] = useState(0.5);
  const [autoclickers, setAutoclickers] = useState(0.5);
  const [level, setLevel] = useState(1);
  const [totalEarned, setTotalEarned] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [boostSubTab, setBoostSubTab] = useState<BoostSubTab>('upgrades');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isTapped, setIsTapped] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const [activeBoost, setActiveBoost] = useState<'none' | 'tap' | 'mining'>(
    'none'
  );
  const [boostEndTime, setBoostEndTime] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardWeek, setLeaderboardWeek] = useState('');
  const [seasonSecondsLeft, setSeasonSecondsLeft] = useState(0);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [copySuccessVisible, setCopySuccessVisible] = useState(false);
  const [referralLimit, setReferralLimit] = useState<ReferralLimit>({
    used: 0,
    max: 10,
    remaining: 10,
    resetAt: 0,
    secondsUntilReset: 0,
    isLimitReached: false,
  });
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [ownedPerks, setOwnedPerks] = useState<string[]>([]);
  const [perkLevels, setPerkLevels] = useState<Record<string, number>>({});
  const [lastChestReward, setLastChestReward] = useState('');
  const [dailyCooldown, setDailyCooldown] = useState(0);
  const [missions, setMissions] = useState<MissionsPayload>({
    daily: [],
    weekly: [],
    difficulty: 1,
    dailyKey: '',
    weeklyKey: '',
  });
  const [dailyStreak, setDailyStreak] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>('all');
  const [adminEconomyDashboard, setAdminEconomyDashboard] =
    useState<AdminEconomyDashboard | null>(null);
  const [adminEconomyVisible, setAdminEconomyVisible] = useState(false);
  const [adminSearchVisible, setAdminSearchVisible] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<AdminUserSearchResult[]>([]);
  const [adminSelectedUser, setAdminSelectedUser] =
    useState<AdminUserProfile | null>(null);
  const [adminAdjustAmount, setAdminAdjustAmount] = useState('');
  const [adminActionReason, setAdminActionReason] = useState('');
  const [adminSecurityLogs, setAdminSecurityLogs] = useState<AdminSecurityLog[]>([]);
  const [adminSecurityLogsVisible, setAdminSecurityLogsVisible] = useState(false);
  const [admin2Visible, setAdmin2Visible] = useState(false);
  const [adminEconomyConfigDraft, setAdminEconomyConfigDraft] = useState<Record<string, string>>({});
  const [adminBroadcastMessage, setAdminBroadcastMessage] = useState('');
  const [adminBroadcastResult, setAdminBroadcastResult] = useState<any>(null);
  const [adminOperations, setAdminOperations] = useState<AdminOperationsPayload | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [appVersionInfo, setAppVersionInfo] = useState<any>(null);
  const [adminFrontendErrors, setAdminFrontendErrors] = useState<any[]>([]);
  const [launchChecklistVisible, setLaunchChecklistVisible] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [withdrawalCheck, setWithdrawalCheck] = useState('');
  const [shareCardVisible, setShareCardVisible] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [channelJoined, setChannelJoined] = useState(false);

  const [tapLevel, setTapLevel] = useState(1);
  const [minerLevel, setMinerLevel] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [rechargeLevel, setRechargeLevel] = useState(1);

  const [offlineRewardVisible, setOfflineRewardVisible] = useState(false);
  const [offlineRewardAmount, setOfflineRewardAmount] = useState(0);
  const [offlineRewardTime, setOfflineRewardTime] = useState('');
  const [isClaimingOfflineReward, setIsClaimingOfflineReward] = useState(false);
  const [rewardPopupItems, setRewardPopupItems] = useState<RewardPopupItem[]>([]);
  const [rewardPopupVisible, setRewardPopupVisible] = useState(false);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [seasonHistory, setSeasonHistory] = useState<SeasonHistoryItem[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardItem[]>([]);
  const [seasonPrizePopup, setSeasonPrizePopup] =
    useState<SeasonPrizePopup | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamSocialDashboard, setTeamSocialDashboard] =
    useState<TeamSocialDashboard | null>(null);
  const [friendLeaderboard, setFriendLeaderboard] = useState<FriendLeaderboardItem[]>([]);
  const [league, setLeague] = useState('Bronze');
  const [isWithdrawalLoading, setIsWithdrawalLoading] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<AdminWithdrawalRequest[]>([]);
  const [adminWithdrawalsVisible, setAdminWithdrawalsVisible] = useState(false);
  const [adminWithdrawalComment, setAdminWithdrawalComment] = useState('');
  const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
  const [suspiciousUsersVisible, setSuspiciousUsersVisible] = useState(false);

  const [totalTaps, setTotalTaps] = useState(0);
  const [totalBoostsUsed, setTotalBoostsUsed] = useState(0);
  const [totalUpgradesBought, setTotalUpgradesBought] = useState(0);
  const [offlineClaimsCount, setOfflineClaimsCount] = useState(0);
  const [adminPanelVisible, setAdminPanelVisible] = useState(false);
  const [adminPrizePreview, setAdminPrizePreview] =
    useState<AdminPrizePreviewResponse | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || '';

    if (startParam.startsWith('team_')) {
      joinTeamByCode(startParam.replace('team_', ''));
    }
  }, []);

  useEffect(() => {
    const loadAppVersion = async () => {
      try {
        const response = await axios.get(`${API_URL}/version`);
        setAppVersionInfo(response.data);
      } catch {
        setAppVersionInfo({ version: '1.0.0' });
      }
    };

    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}

    loadAppVersion();
  }, []);

  useEffect(() => {
    const loadEconomyConfig = async () => {
      try {
        const response = await axios.get(`${API_URL}/config`);

        setEconomyConfig({
          onixEurPer1000:
            Number(response.data.onixEurPer1000) || DEFAULT_ONIX_EUR_PER_1000,
          minWithdrawOnix:
            Number(response.data.minWithdrawOnix) || DEFAULT_MIN_WITHDRAW_ONIX,
          referralReward: Number(response.data.referralReward) || economyConfig.referralReward,
          referredUserReward: Number(response.data.referredUserReward) || 15000,
          maxPaidReferralsPerDay:
            Number(response.data.maxPaidReferralsPerDay) || 10,
        });
      } catch (error) {
        console.log('Ошибка загрузки конфига экономики:', error);
      }
    };

    loadEconomyConfig();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const telegramId =
          window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';

        const startParam =
          window.Telegram?.WebApp?.initDataUnsafe?.start_param || null;

        await axios.post(`${API_URL}/create`, {
          telegramId,
          username:
            `${window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || ''} ${
              window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name || ''
            }`.trim() || 'Пользователь',
          referredBy: startParam,
        });

        const response = await axios.get(`${API_URL}/${telegramId}`);
        const user = response.data;

        if (localStorage.getItem('channelJoined') === 'true') {
          setChannelJoined(true);
        }

        const savedCooldown = localStorage.getItem('dailyCooldownEnd');

        if (savedCooldown) {
          const diff = Number(savedCooldown) - Date.now();

          if (diff > 0) {
            setDailyCooldown(diff);
          } else {
            localStorage.removeItem('dailyCooldownEnd');
          }
        } else {
          const lastDaily = user.dailyRewardLastClaim || user.lastDailyRewardDate;

          if (lastDaily) {
            const lastClaim = new Date(lastDaily).getTime();
            const diff = DAY_MS - (Date.now() - lastClaim);

            if (diff > 0) {
              setDailyCooldown(diff);
              localStorage.setItem(
                'dailyCooldownEnd',
                (Date.now() + diff).toString()
              );
            }
          }
        }

        setBalance(user.balance || 0);
        setUsername(user.username || 'Пользователь');
        setWeeklyEarned(Number(user.weeklyEarned || 0));
        setEnergy(user.energy ?? 500);
        setMaxEnergy(user.maxEnergy ?? 500);
        setTapPower(user.tapPower ?? 1);
        setEnergyRecharge(user.energyRecharge ?? 0.5);
        setAutoclickers(user.autoclickers ?? 0.5);
        setTotalEarned(user.totalEarned || 0);
        setLevel(user.level || 1);
        setReferralsCount(user.referralsCount || 0);
        setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
        setCompletedTasks(user.completedTasks || []);
        setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
        setDailyStreak(Number(user.dailyStreak || 0));
        setTransactions(user.transactions || []);
        setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
        setActiveBoost(normalizeBoost(user.activeBoost));
        setBoostEndTime(Number(user.boostEndTime || 0));

        setTimeout(() => {
          const offlineIncome = Number(
            user.pendingOfflineIncome || user.lastOfflineIncome || 0
          );

          const offlineSeconds = Number(
            user.pendingOfflineSeconds || user.lastOfflineSeconds || 0
          );

          console.log('PENDING OFFLINE INCOME:', offlineIncome);
          console.log('PENDING OFFLINE SECONDS:', offlineSeconds);

          if (offlineIncome > 0) {
            setOfflineRewardAmount(offlineIncome);
            setOfflineRewardTime(
              offlineSeconds > 0 ? formatOfflineTime(offlineSeconds) : ''
            );
            setOfflineRewardVisible(true);
          }
        }, 1000);

        const oldRefs = Number(localStorage.getItem('knownReferrals') || 0);
        const newRefs = user.referralsCount || 0;

        if (newRefs > oldRefs) {
          showToast(
            `👥 По вашей ссылке перешёл ${
              user.lastReferralUsername || 'новый пользователь'
            }. Бонус +${formatOnix(
              economyConfig.referralReward
            )} ONIX придёт, когда друг сделает 100 тапов.`,
            'info'
          );
        }

        localStorage.setItem('knownReferrals', newRefs.toString());

        if (startParam && startParam.startsWith('team_')) {
          await joinTeamByCode(startParam.replace('team_', ''));
        }

        if (
          user.referredBy &&
          !localStorage.getItem(`referralWelcomeShown_${user.telegramId}`)
        ) {
          showToast(
            `🎁 Вы получили +${formatOnix(economyConfig.referredUserReward)} ONIX за вход по ссылке пользователя ${
              user.referredByUsername || 'друга'
            }!`
          );

          localStorage.setItem(`referralWelcomeShown_${user.telegramId}`, 'true');
        }

        setTapLevel(user.tapLevel || 1);
        setMinerLevel(user.minerLevel || 1);
        setEnergyLevel(user.energyLevel || 1);
        setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
        applyUserStats(user);
      } catch (error) {
        console.log('Ошибка загрузки пользователя:', error);
      } finally {
        setIsAppLoading(false);

        if (!localStorage.getItem('onixTutorialDone')) {
          setTutorialVisible(true);
        }
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadSeasonHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/season-history`);

        setSeasonHistory(response.data.seasons || []);
      } catch (error) {
        console.log('Ошибка загрузки истории сезонов:', error);
      }
    };

    loadSeasonHistory();
  }, []);

  useEffect(() => {
    const loadTeamLeaderboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/leaderboard/teams`);

        setTeamLeaderboard(response.data.teams || []);
      } catch (error) {
        console.log('Ошибка загрузки командного рейтинга:', error);
      }
    };

    loadTeamLeaderboard();
  }, []);

  useEffect(() => {
    const loadSeasonPrizePopup = async () => {
      const telegramId = getTelegramId();

      if (!telegramId) return;

      try {
        const response = await axios.post(`${API_URL}/season-prize-popup`, {
          telegramId,
        });

        if (response.data.prize) {
          setSeasonPrizePopup(response.data.prize);
        }
      } catch (error) {
        console.log('Ошибка загрузки сезонного popup:', error);
      }
    };

    loadSeasonPrizePopup();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const telegramId = getTelegramId();

        const response = await axios.get(`${API_URL}/leaderboard/weekly`, {
          params: {
            telegramId,
          },
        });

        setLeaderboard(response.data.leaderboard || []);
        setLeaderboardWeek(response.data.week || '');
        setSeasonSecondsLeft(Number(response.data.secondsUntilSeasonEnd || 0));
        setCurrentUserPlace(response.data.currentUserPlace || null);
        setWeeklyEarned(Number(response.data.currentUserWeeklyEarned || weeklyEarned));
      } catch (error) {
        console.log('Ошибка загрузки лидерборда:', error);
      }
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (seasonSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSeasonSecondsLeft((prev) => {
        if (prev <= 1) return 0;

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seasonSecondsLeft]);

  useEffect(() => {
    if (referralLimit.secondsUntilReset <= 0) return;

    const timer = setInterval(() => {
      setReferralLimit((prev) => {
        if (prev.secondsUntilReset <= 1) {
          return {
            ...prev,
            used: 0,
            remaining: prev.max,
            secondsUntilReset: 0,
            isLimitReached: false,
          };
        }

        return {
          ...prev,
          secondsUntilReset: prev.secondsUntilReset - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [referralLimit.secondsUntilReset]);

  useEffect(() => {
    if (dailyCooldown <= 0) return;

    const timer = setInterval(() => {
      setDailyCooldown((prev) => {
        if (prev <= 1000) {
          localStorage.removeItem('dailyCooldownEnd');
          clearInterval(timer);
          return 0;
        }

        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dailyCooldown]);

  useEffect(() => {
    let isRequestRunning = false;

    const interval = setInterval(async () => {
      const telegramId = getTelegramId();

      const now = Date.now();
      const currentBoost = normalizeBoost(activeBoost);
      const currentBoostEndTime = Number(boostEndTime || 0);

      if (
        currentBoost !== 'none' &&
        currentBoostEndTime > 0 &&
        currentBoostEndTime <= now
      ) {
        setActiveBoost('none');
        setBoostEndTime(0);
      }

      if (!telegramId) {
        setEnergy((prev) => Math.min(maxEnergy, prev + energyRecharge));
        return;
      }

      if (Number(autoclickers || 0) <= 0) {
        setEnergy((prev) => Math.min(maxEnergy, prev + energyRecharge));
        return;
      }

      if (isRequestRunning) return;

      try {
        isRequestRunning = true;

        const response = await axios.post(`${API_URL}/mine-tick`, {
          telegramId,
        });

        const user = response.data.user;

        setBalance(user.balance || 0);
        setUsername(user.username || 'Пользователь');
        setWeeklyEarned(Number(user.weeklyEarned || 0));
        setEnergy(user.energy || 0);
        setMaxEnergy(user.maxEnergy ?? 500);
        setTapPower(user.tapPower ?? 1);
        setEnergyRecharge(user.energyRecharge ?? 0.5);
        setAutoclickers(user.autoclickers ?? 0.5);
        setTotalEarned(user.totalEarned || 0);
        setLevel(user.level || 1);
        setReferralsCount(user.referralsCount || 0);
        setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
        setCompletedTasks(user.completedTasks || []);
        setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
        setDailyStreak(Number(user.dailyStreak || 0));
        setTransactions(user.transactions || []);
        setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
        setActiveBoost(normalizeBoost(user.activeBoost));
        setBoostEndTime(Number(user.boostEndTime || 0));

        setTapLevel(user.tapLevel || 1);
        setMinerLevel(user.minerLevel || 1);
        setEnergyLevel(user.energyLevel || 1);
        setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
        applyUserStats(user);
      } catch (error) {
        console.log('Ошибка майнинга:', error);
      } finally {
        isRequestRunning = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoclickers, activeBoost, boostEndTime, maxEnergy, energyRecharge]);

  const handleTap = async (e: React.MouseEvent<HTMLDivElement>) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID');
      return;
    }

    if (energy <= 0) return;

    try {
      const rect = e.currentTarget.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const response = await axios.post(`${API_URL}/tap`, {
        telegramId,
      });

      const user = response.data.user;
      const points = response.data.points ?? user.tapPower ?? tapPower ?? 1;

      setBalance(user.balance || 0);
      setUsername(user.username || 'Пользователь');
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy ?? 500);
      setTapPower(user.tapPower ?? 1);
      setEnergyRecharge(user.energyRecharge ?? 0.5);
      setAutoclickers(user.autoclickers ?? 0.5);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
      setCompletedTasks(user.completedTasks || []);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setDailyStreak(Number(user.dailyStreak || 0));
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
      showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);

      const newNum: FloatingNumber = {
        id: Date.now(),
        x,
        y,
        value: points,
      };

      setFloatingNumbers((prev) => [...prev, newNum]);

      setTimeout(() => {
        setFloatingNumbers((prev) => prev.filter((n) => n.id !== newNum.id));
      }, 700);

      setIsTapped(true);
      setTimeout(() => setIsTapped(false), 60);

      try {
        WebApp.HapticFeedback?.impactOccurred('medium');
      } catch {}
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.log('Слишком много тапов');
        return;
      }

      if (error?.response?.status === 400) {
        console.log(error?.response?.data?.message || 'Ошибка тапа');
        return;
      }

      console.log('Ошибка тапа:', error);
    }
  };


  const syncGrowthUser = (user: any, fallbackData: any = {}) => {
    if (!user) return;

    setBalance(user.balance || 0);
    setWeeklyEarned(Number(user.weeklyEarned || 0));
    setTotalEarned(user.totalEarned || 0);
    setLevel(user.level || 1);
    setTransactions(user.transactions || []);
    setAchievements(user.achievements || fallbackData.achievements || ACHIEVEMENTS);
    setOwnedPerks(user.ownedPerks || []);
    setPerkLevels(normalizePerkLevels(user.perkLevels));
    applyUserStats(user);
  };

  const claimWelcomeBonus = async () => {
    const telegramId = getTelegramId();

    try {
      const response = await axios.post(`${API_URL}/claim-welcome-bonus`, {
        telegramId,
      });

      syncGrowthUser(response.data.user, response.data);
      showRewardPopupFromResponse(response.data);
      showToast(`🎁 Welcome bonus: +${formatOnix(response.data.reward)} ONIX`, 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Welcome bonus недоступен', 'error');
    }
  };

  const applyPromoCode = async () => {
    const telegramId = getTelegramId();

    try {
      const response = await axios.post(`${API_URL}/apply-promo`, {
        telegramId,
        code: promoCodeInput,
      });

      syncGrowthUser(response.data.user, response.data);
      showRewardPopupFromResponse(response.data);
      setPromoCodeInput('');
      setPromoModalVisible(false);
      showToast(
        `🎟 Промокод активирован: +${formatOnix(response.data.promo.reward)} ONIX`,
        'success'
      );
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось активировать промокод', 'error');
    }
  };

  const refreshAfterAction = async () => {
    try {
      await loadMissions();
    } catch {}
  };

  const buyUpgrade = async (type: 'tap' | 'energy' | 'recharge' | 'miner') => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/buy-upgrade`, {
        telegramId,
        type,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setUsername(user.username || 'Пользователь');
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy ?? 500);
      setTapPower(user.tapPower ?? 1);
      setEnergyRecharge(user.energyRecharge ?? 0.5);
      setAutoclickers(user.autoclickers ?? 0.5);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
      setCompletedTasks(user.completedTasks || []);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setDailyStreak(Number(user.dailyStreak || 0));
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
      showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);
      refreshAfterAction();

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось купить улучшение');
    }
  };


  const openChest = async () => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/open-chest`, {
        telegramId,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setLastChestReward(user.chestStats?.lastReward || '');

      showToast(
        `🎁 ${response.data.chest.rewardTitle}: +${formatOnix(
          response.data.chest.rewardAmount
        )} ONIX`,
        'success'
      );

      showRewardPopupFromResponse(response.data);
      refreshAfterAction();
      refreshAfterAction();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось открыть сундук', 'error');
    }
  };

  const buyPerk = async (perkId: string) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/buy-perk`, {
        telegramId,
        perkId,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setUsername(user.username || 'Пользователь');
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy ?? 500);
      setTapPower(user.tapPower ?? 1);
      setEnergyRecharge(user.energyRecharge ?? 0.5);
      setAutoclickers(user.autoclickers ?? 0.5);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
      setCompletedTasks(user.completedTasks || []);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setDailyStreak(Number(user.dailyStreak || 0));
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось купить перк');
    }
  };

  const activateBoost = async (
    type: 'tap' | 'mining',
    _minutes: number,
    _cost: number
  ) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/activate-boost`, {
        telegramId,
        type,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setUsername(user.username || 'Пользователь');
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy ?? 500);
      setTapPower(user.tapPower ?? 1);
      setEnergyRecharge(user.energyRecharge ?? 0.5);
      setAutoclickers(user.autoclickers ?? 0.5);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
      setCompletedTasks(user.completedTasks || []);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setDailyStreak(Number(user.dailyStreak || 0));
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
      showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);
      refreshAfterAction();

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}

      showToast(`⚡ ${type === 'tap' ? 'Тап' : 'Майнинг'} ×2 активирован!`);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось активировать буст');
    }
  };

  const getReferralLink = () => {
    const telegramId = getTelegramId();

    return telegramId
      ? `https://t.me/coinonix_bot/onix?startapp=${telegramId}`
      : 'https://t.me/coinonix_bot/onix';
  };

  const getReferralShareText = () =>
    'Присоединяйся к ONIX COIN ⚡ Получи стартовый бонус 15 000 ONIX!';

  const showCopySuccess = () => {
    setCopySuccessVisible(true);

    setTimeout(() => {
      setCopySuccessVisible(false);
    }, 1600);
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();

    try {
      await navigator.clipboard.writeText(link);
      showCopySuccess();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      showCopySuccess();
    }
  };

  const shareReferralLink = () => {
    const link = getReferralLink();
    const text = getReferralShareText();

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    try {
      WebApp.openTelegramLink(shareUrl);
    } catch {
      window.open(shareUrl, '_blank');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}ч ${minutes}м ${seconds}с`;
  };

  const formatOfflineTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }

    if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    }

    return `${secs}с`;
  };

  const claimOfflineReward = async () => {
    if (isClaimingOfflineReward) return;

    const telegramId = getTelegramId();

    if (!telegramId) {
      showToast('Не удалось получить Telegram ID');
      return;
    }

    try {
      setIsClaimingOfflineReward(true);

      const response = await axios.post(`${API_URL}/claim-offline-income`, {
        telegramId,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setUsername(user.username || 'Пользователь');
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy ?? 500);
      setTapPower(user.tapPower ?? 1);
      setEnergyRecharge(user.energyRecharge ?? 0.5);
      setAutoclickers(user.autoclickers ?? 0.5);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setReferralLimit(user.referralLimit || response.data.referralLimit || referralLimit);
      setCompletedTasks(user.completedTasks || []);
      setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
      setDailyStreak(Number(user.dailyStreak || 0));
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);
      applyUserStats(user);
      showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);

      setOfflineRewardVisible(false);
      setOfflineRewardAmount(0);
      setOfflineRewardTime('');

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось забрать доход майнера');
    } finally {
      setIsClaimingOfflineReward(false);
    }
  };


  const applyUserStats = (user: any) => {
    setTotalTaps(Number(user.totalTaps || 0));
    setTotalBoostsUsed(Number(user.totalBoostsUsed || 0));
    setTotalUpgradesBought(Number(user.totalUpgradesBought || 0));
    setOfflineClaimsCount(Number(user.offlineClaimsCount || 0));
    setWithdrawalRequests(user.withdrawalRequests || []);
    setSelectedTitle(user.selectedTitle || 'ONIX Player');
    setPerkLevels(normalizePerkLevels(user.perkLevels));
    setLastChestReward(user.chestStats?.lastReward || '');
    setTeamName(user.teamName || '');
    setTeamNameInput((currentValue) => currentValue || user.teamName || '');
    setLeague(user.league || 'Bronze');
    if (user.missions) setMissions(user.missions);
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    const id = Date.now() + Math.random();

    setToastMessages((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToastMessages((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  };

  const showReferralBonusPaidToast = (data: any) => {
    const referralBonus = data?.referralBonusPaid;

    if (!referralBonus || !Number(referralBonus.reward || 0)) return;

    showToast(
      `👥 Реферальный бонус начислен пригласившему: +${formatOnix(
        referralBonus.reward
      )} ONIX`,
      'success'
    );
  };

  const showRewardPopupFromResponse = (data: any) => {
    const items: RewardPopupItem[] = [];

    const rankBonuses = data?.rankBonuses || data?.user?.rankBonuses || [];
    const achievementBonuses =
      data?.achievementBonuses || data?.user?.achievementBonuses || [];

    if (Array.isArray(rankBonuses)) {
      rankBonuses.forEach((bonus: { name?: string; bonus?: number }) => {
        if (Number(bonus.bonus || 0) > 0) {
          items.push({
            icon: '🏆',
            title: `Новый ранг: ${bonus.name || 'Ранг'}`,
            amount: Number(bonus.bonus || 0),
          });
        }
      });
    }

    if (Array.isArray(achievementBonuses)) {
      achievementBonuses.forEach(
        (achievement: { title?: string; reward?: number }) => {
          if (Number(achievement.reward || 0) > 0) {
            items.push({
              icon: '✅',
              title: `Достижение: ${achievement.title || 'Выполнено'}`,
              amount: Number(achievement.reward || 0),
            });
          }
        }
      );
    }

    if (items.length > 0) {
      setRewardPopupItems(items);
      setRewardPopupVisible(true);

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    }
  };


  const isAdmin = () => {
    const telegramId = getTelegramId();

    return Boolean(ADMIN_TELEGRAM_ID && telegramId === ADMIN_TELEGRAM_ID);
  };

  const loadAdminPrizePreview = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-weekly-prize-preview`, {
        params: {
          telegramId,
        },
      });

      setAdminPrizePreview(response.data);
      setAdminPanelVisible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить preview');
    } finally {
      setIsAdminLoading(false);
    }
  };


  const loadTeamSocialDashboard = async () => {
    const telegramId = getTelegramId();

    if (!telegramId) return;

    try {
      const response = await axios.get(`${API_URL}/team-dashboard/${telegramId}`);
      setTeamSocialDashboard(response.data);
    } catch (error) {
      console.log('Ошибка загрузки команды:', error);
    }
  };

  const loadFriendLeaderboard = async () => {
    const telegramId = getTelegramId();

    if (!telegramId) return;

    try {
      const response = await axios.get(`${API_URL}/friends-leaderboard/${telegramId}`);
      setFriendLeaderboard(response.data.friends || []);
    } catch (error) {
      console.log('Ошибка загрузки рейтинга друзей:', error);
    }
  };

  const getTeamInviteLink = () => {
    const teamCode = teamSocialDashboard?.team?.teamCode;

    if (!teamCode) return 'https://t.me/coinonix_bot/onix';

    return `https://t.me/coinonix_bot/onix?startapp=team_${teamCode}`;
  };

  const shareTeamInviteLink = () => {
    const link = getTeamInviteLink();
    const text = `Вступай в мою команду ${teamName || 'ONIX'} в ONIX COIN ⚡`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    try {
      WebApp.openTelegramLink(shareUrl);
    } catch {
      window.open(shareUrl, '_blank');
    }
  };

  const joinTeamByCode = async (teamCode: string) => {
    const telegramId = getTelegramId();

    if (!telegramId || !teamCode) return;

    try {
      const response = await axios.post(`${API_URL}/join-team`, {
        telegramId,
        teamCode,
      });

      const user = response.data.user;

      setTeamName(user.teamName || '');
      setTeamNameInput(user.teamName || '');
      setTeamSocialDashboard({
        team: response.data.team,
        teamMissions: response.data.teamMissions || [],
        teamPrize: 0,
        week: '',
      });

      showToast(`👥 Вы вступили в команду ${user.teamName}`, 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось вступить в команду', 'error');
    }
  };

  const claimTeamMission = async (mission: TeamMissionItem) => {
    const telegramId = getTelegramId();

    if (!mission.isCompleted || mission.isClaimed) return;

    try {
      const response = await axios.post(`${API_URL}/claim-team-mission`, {
        telegramId,
        missionId: mission.id,
      });

      const user = response.data.user;

      syncGrowthUser(user, response.data);
      showRewardPopupFromResponse(response.data);
      showToast(`✅ Командная миссия: +${formatOnix(response.data.reward.amount)} ONIX`, 'success');
      await loadTeamSocialDashboard();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось забрать награду', 'error');
    }
  };

  const claimTeamPrize = async () => {
    const telegramId = getTelegramId();

    try {
      const response = await axios.post(`${API_URL}/claim-team-prize`, {
        telegramId,
      });

      syncGrowthUser(response.data.user, response.data);
      showRewardPopupFromResponse(response.data);
      showToast(`🏆 Командный приз: +${formatOnix(response.data.prize)} ONIX`, 'success');
      await loadTeamSocialDashboard();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось забрать командный приз', 'error');
    }
  };

  const loadMissions = async () => {
    const telegramId = getTelegramId();

    if (!telegramId) return;

    try {
      const response = await axios.get(`${API_URL}/missions/${telegramId}`);
      setMissions(response.data);
    } catch (error) {
      console.log('Ошибка загрузки миссий:', error);
    }
  };

  const claimMission = async (mission: MissionItem, missionType: 'daily' | 'weekly') => {
    const telegramId = getTelegramId();

    if (!mission.isCompleted || mission.isClaimed) return;

    try {
      const response = await axios.post(`${API_URL}/claim-mission`, {
        telegramId,
        missionId: mission.id,
        missionType,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setWeeklyEarned(Number(user.weeklyEarned || 0));
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setTransactions(user.transactions || []);
      setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
      applyUserStats(user);
      setMissions(response.data.missions || user.missions || { daily: [], weekly: [], difficulty: 1, dailyKey: '', weeklyKey: '' });

      showToast(`✅ Миссия выполнена: +${formatOnix(response.data.missionReward.reward)} ONIX`, 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось забрать миссию', 'error');
    }
  };

  const searchAdminUsers = async () => {
    const telegramId = getTelegramId();

    if (!adminSearchQuery.trim()) {
      setAdminSearchResults([]);
      return;
    }

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-search-users`, {
        params: {
          telegramId,
          query: adminSearchQuery.trim(),
        },
      });

      setAdminSearchResults(response.data.users || []);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось найти пользователей', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadAdminUserProfile = async (targetTelegramId: string) => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-user-profile/${targetTelegramId}`, {
        params: {
          telegramId,
        },
      });

      setAdminSelectedUser(response.data.user);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить профиль', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adjustAdminUserBalance = async () => {
    const telegramId = getTelegramId();

    if (!adminSelectedUser) return;

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-adjust-balance`, {
        telegramId,
        targetTelegramId: adminSelectedUser.telegramId,
        amount: Number(adminAdjustAmount),
        reason: adminActionReason,
      });

      showToast('✅ Баланс обновлён', 'success');
      setAdminAdjustAmount('');
      setAdminActionReason('');
      await loadAdminUserProfile(response.data.user.telegramId);
      await searchAdminUsers();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось изменить баланс', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const toggleAdminUserBan = async () => {
    const telegramId = getTelegramId();

    if (!adminSelectedUser) return;

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-ban-user`, {
        telegramId,
        targetTelegramId: adminSelectedUser.telegramId,
        ban: !adminSelectedUser.isFrozen,
        reason: adminActionReason || 'Решение администратора',
      });

      showToast(
        response.data.user.isFrozen ? '🚫 Пользователь заблокирован' : '✅ Пользователь разблокирован',
        'success'
      );
      setAdminActionReason('');
      await loadAdminUserProfile(response.data.user.telegramId);
      await searchAdminUsers();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось изменить статус', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadAdminSecurityLogs = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-security-logs`, {
        params: {
          telegramId,
        },
      });

      setAdminSecurityLogs(response.data.logs || []);
      setAdminSecurityLogsVisible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить логи', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };



  const downloadMongoBackup = () => {
    const telegramId = getTelegramId();
    const url = `${API_URL}/admin-backup?telegramId=${encodeURIComponent(telegramId)}`;

    window.open(url, '_blank');
  };

  const loadAdminFrontendErrors = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-frontend-errors`, {
        params: { telegramId },
      });

      setAdminFrontendErrors(response.data.logs || []);
      showToast('✅ Frontend errors обновлены', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить frontend errors', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const openAdmin2Panel = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const [configResponse, operationsResponse] = await Promise.all([
        axios.get(`${API_URL}/admin-economy-config`, {
          params: { telegramId },
        }),
        axios.get(`${API_URL}/admin-operations`, {
          params: { telegramId },
        }),
      ]);

      const config = configResponse.data.config || {};

      setAdminEconomyConfigDraft({
        ONIX_EUR_PER_1000: String(config.onixEurPer1000 || ''),
        MIN_WITHDRAW_ONIX: String(config.minWithdrawOnix || ''),
        REFERRAL_REWARD: String(config.referralReward || ''),
        REFERRED_USER_REWARD: String(config.referredUserReward || ''),
        WELCOME_BONUS: String(config.welcomeBonus || ''),
        CHEST_COST: String(config.chestCost || ''),
        MAX_PAID_REFERRALS_PER_DAY: String(config.maxPaidReferralsPerDay || ''),
        MAX_PAID_REFERRALS_PER_HOUR: String(config.maxPaidReferralsPerHour || ''),
      });

      setAdminOperations(operationsResponse.data);
      setAdmin2Visible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось открыть админку 2.0', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const saveAdminEconomyConfig = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-economy-config`, {
        telegramId,
        updates: adminEconomyConfigDraft,
      });

      showToast('✅ Economy config обновлён', 'success');
      setAdminEconomyConfigDraft((current) => ({
        ...current,
        ONIX_EUR_PER_1000: String(response.data.config.onixEurPer1000 || current.ONIX_EUR_PER_1000),
        MIN_WITHDRAW_ONIX: String(response.data.config.minWithdrawOnix || current.MIN_WITHDRAW_ONIX),
        REFERRAL_REWARD: String(response.data.config.referralReward || current.REFERRAL_REWARD),
        REFERRED_USER_REWARD: String(response.data.config.referredUserReward || current.REFERRED_USER_REWARD),
        WELCOME_BONUS: String(response.data.config.welcomeBonus || current.WELCOME_BONUS),
        CHEST_COST: String(response.data.config.chestCost || current.CHEST_COST),
      }));
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось сохранить config', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const sendAdminBroadcast = async (dryRun = false) => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-broadcast`, {
        telegramId,
        message: adminBroadcastMessage,
        dryRun,
      });

      setAdminBroadcastResult(response.data);
      showToast(
        dryRun
          ? `👀 Получателей: ${response.data.recipients}`
          : `✅ Отправлено: ${response.data.sent}, ошибок: ${response.data.failed}`,
        'success'
      );
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось выполнить рассылку', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const downloadUsersCsv = () => {
    const telegramId = getTelegramId();
    const url = `${API_URL}/admin-export-users.csv?telegramId=${encodeURIComponent(telegramId)}`;

    window.open(url, '_blank');
  };

  const loadAdminOperations = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-operations`, {
        params: { telegramId },
      });

      setAdminOperations(response.data);
      showToast('✅ Операции обновлены', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить операции', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const addAdminNote = async () => {
    const telegramId = getTelegramId();

    if (!adminSelectedUser) {
      showToast('Сначала выберите игрока в поиске', 'error');
      return;
    }

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-user-note`, {
        telegramId,
        targetTelegramId: adminSelectedUser.telegramId,
        text: adminNoteText,
      });

      setAdminSelectedUser({
        ...adminSelectedUser,
        adminNotes: response.data.notes || [],
        securityLogs: response.data.securityLogs || adminSelectedUser.securityLogs,
      });
      setAdminNoteText('');
      showToast('✅ Заметка добавлена', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось добавить заметку', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadAdminEconomyDashboard = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-economy-dashboard`, {
        params: {
          telegramId,
        },
      });

      setAdminEconomyDashboard(response.data);
      setAdminEconomyVisible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить экономику', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadSuspiciousUsers = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-suspicious-users`, {
        params: {
          telegramId,
        },
      });

      setSuspiciousUsers(response.data.users || []);
      setSuspiciousUsersVisible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить список', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const toggleFreezeUser = async (target: SuspiciousUser) => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      await axios.post(`${API_URL}/admin-freeze-user`, {
        telegramId,
        targetTelegramId: target.telegramId,
        freeze: !target.isFrozen,
        reason: target.isFrozen ? '' : 'Заморожен из админ-панели',
      });

      showToast(target.isFrozen ? '✅ Аккаунт разморожен' : '🧊 Аккаунт заморожен', 'success');
      await loadSuspiciousUsers();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось изменить статус', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadAdminWithdrawals = async () => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      const response = await axios.get(`${API_URL}/admin-withdrawals`, {
        params: {
          telegramId,
          status: 'pending',
        },
      });

      setAdminWithdrawals(response.data.requests || []);
      setAdminWithdrawalsVisible(true);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить заявки', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const reviewWithdrawal = async (
    request: AdminWithdrawalRequest,
    action: 'approved' | 'rejected'
  ) => {
    const telegramId = getTelegramId();

    try {
      setIsAdminLoading(true);

      await axios.post(`${API_URL}/admin-review-withdrawal`, {
        telegramId,
        userTelegramId: request.userTelegramId,
        requestIndex: request.requestIndex,
        action,
        adminComment: adminWithdrawalComment,
      });

      showToast(
        action === 'approved' ? '✅ Вывод одобрен' : '↩️ Вывод отклонён',
        'success'
      );

      setAdminWithdrawalComment('');
      await loadAdminWithdrawals();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось обработать заявку', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const requestWithdrawal = async () => {
    const telegramId = getTelegramId();

    if (!canWithdraw || isWithdrawalLoading) return;

    if (withdrawalCheck.trim().toUpperCase() !== 'ONIX') {
      showToast('Введите ONIX в поле антибот-проверки', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Создать заявку на вывод ${formatOnix(minWithdrawOnix)} ONIX?`
    );

    if (!confirmed) return;

    try {
      setIsWithdrawalLoading(true);

      const response = await axios.post(`${API_URL}/request-withdrawal`, {
        telegramId,
        amount: minWithdrawOnix,
        withdrawalCheck,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setTransactions(user.transactions || []);
      setWithdrawalRequests(user.withdrawalRequests || []);
      setWithdrawalCheck('');
      showToast('✅ Заявка на вывод создана', 'success');
      refreshAfterAction();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось создать заявку', 'error');
    } finally {
      setIsWithdrawalLoading(false);
    }
  };

  const awardWeeklyPrizes = async () => {
    const telegramId = getTelegramId();

    if (!adminPrizePreview || adminPrizePreview.alreadyAwarded) return;

    const confirmed = window.confirm(
      `Выдать призы топ-3 за неделю ${adminPrizePreview.week}?`
    );

    if (!confirmed) return;

    try {
      setIsAdminLoading(true);

      const response = await axios.post(`${API_URL}/admin-award-weekly-prizes`, {
        telegramId,
        confirm: 'AWARD_WEEKLY_PRIZES',
        week: adminPrizePreview.week,
      });

      showToast('✅ Призы сезона выданы');

      setAdminPrizePreview({
        ...adminPrizePreview,
        alreadyAwarded: true,
        awardedWinners: response.data.winners || [],
      });
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось выдать призы');
    } finally {
      setIsAdminLoading(false);
    }
  };


  const normalizePerkLevels = (levels: any) => {
    if (!levels) return {};

    if (levels instanceof Map) {
      return Object.fromEntries(levels.entries());
    }

    if (typeof levels === 'object') {
      return Object.fromEntries(
        Object.entries(levels).map(([key, value]) => [key, Number(value || 0)])
      );
    }

    return {};
  };

  const getPerkLevel = (perkId: string) => {
    return Number((perkLevels as any)?.[perkId] || 0);
  };

  const getPerkCost = (baseCost: number, nextLevel: number) => {
    return Math.round(baseCost * Math.pow(1.85, nextLevel - 1));
  };

  const getAchievementCategory = (id: string): AchievementCategory => {
    if (id.includes('tap')) return 'taps';
    if (id.includes('miner') || id.includes('offline')) return 'miner';
    if (id.includes('friend')) return 'referrals';
    if (id.includes('weekly') || id.includes('season')) return 'seasons';
    if (id.includes('perk')) return 'perks';
    if (id.includes('streak') || id.includes('daily')) return 'daily';
    if (id.includes('rank')) return 'ranks';

    return 'all';
  };

  const getProfileBadges = () => {
    const badges: Array<{ icon: string; label: string }> = [];

    if (rankInfo.currentRank.threshold >= 750000) {
      badges.push({ icon: '🥇', label: 'Gold+' });
    }

    if (rankInfo.currentRank.id === 'diamond' || rankInfo.currentRank.threshold >= 5000000) {
      badges.push({ icon: '💎', label: 'Diamond' });
    }

    if (referralsCount >= 5) {
      badges.push({ icon: '👥', label: 'Referral' });
    }

    if (dailyStreak >= 7) {
      badges.push({ icon: '🔥', label: 'Streak' });
    }

    if (ownedPerks.length >= 4) {
      badges.push({ icon: '🧩', label: 'Perks' });
    }

    if (currentUserPlace && currentUserPlace <= 3) {
      badges.push({ icon: '🏆', label: 'Top 3' });
    } else if (currentUserPlace && currentUserPlace <= 10) {
      badges.push({ icon: '🎖', label: 'Top 10' });
    }

    return badges.slice(0, 6);
  };

  const getAvailableTitles = () => {
    const titles = ['ONIX Player'];

    if (totalTaps >= 10000) titles.push('Tap Master');
    if (minerLevel >= 5) titles.push('Miner');
    if (referralsCount >= 5) titles.push('Referral Master');
    if (currentUserPlace && currentUserPlace <= 10) titles.push('Season Hunter');
    if (rankInfo.currentRank.threshold >= 5000000) titles.push('Diamond');
    if (totalBoostsUsed >= 10) titles.push('Boost Master');
    if (ownedPerks.length >= 4) titles.push('Perk Collector');

    return titles;
  };

  const getLeagueIcon = (value: string) => {
    if (value === 'Diamond') return '💎';
    if (value === 'Gold') return '🥇';
    if (value === 'Silver') return '🥈';

    return '🥉';
  };

  const saveTeamName = async () => {
    const telegramId = getTelegramId();

    try {
      const response = await axios.post(`${API_URL}/set-team`, {
        telegramId,
        teamName: teamNameInput,
      });

      const user = response.data.user;

      setTeamName(user.teamName || '');
      setTeamNameInput(user.teamName || '');
      showToast('✅ Команда обновлена', 'success');
      loadTeamSocialDashboard();
      loadFriendLeaderboard();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось сохранить команду', 'error');
    }
  };

  const selectProfileTitle = async (title: string) => {
    const telegramId = getTelegramId();

    try {
      const response = await axios.post(`${API_URL}/select-title`, {
        telegramId,
        title,
      });

      const user = response.data.user;

      setSelectedTitle(user.selectedTitle || title);
      showToast('✅ Титул обновлён', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось выбрать титул', 'error');
    }
  };

  const rankInfo = getRankInfo(totalEarned);
  const rankProgress = rankInfo.progressPercent;
  const rankProgressText = rankInfo.nextRank
    ? `${formatOnix(rankInfo.progressCurrent)} / ${formatOnix(rankInfo.progressTotal)}`
    : 'MAX';
  const currentRankBonus = rankInfo.currentRank.bonus || 0;
  const nextRankBonus = rankInfo.nextRank?.bonus || 0;
  const profileLevel = Math.max(1, Math.floor(totalEarned / 100000) + 1);
  const profileLevelProgress = Math.min(((totalEarned % 100000) / 100000) * 100, 100);
  const profileBadges = getProfileBadges();
  const availableTitles = getAvailableTitles();
  const activeBoostValue = normalizeBoost(activeBoost);
  const normalizedBoostEndTime = Number(boostEndTime || 0);
  const isBoostActive =
    activeBoostValue !== 'none' && Date.now() < normalizedBoostEndTime;

  const miningMultiplier =
    activeBoostValue === 'mining' && isBoostActive ? 2 : 1;
  const offlineProLevel = getPerkLevel('offline_pro');
  const energySaverLevel = getPerkLevel('energy_saver');
  const dailyPlusLevel = getPerkLevel('daily_plus');
  const minerPlusLevel = getPerkLevel('miner_plus');
  const boostMasterLevel = getPerkLevel('boost_master');
  const streakShieldLevel = getPerkLevel('streak_shield');
  const luckyMinerLevel = getPerkLevel('lucky_miner');
  const referralProLevel = getPerkLevel('referral_pro');
  const energyMaxProLevel = getPerkLevel('energy_max_pro');
  const engineerLevel = getPerkLevel('engineer');

  const minerBaseMultiplier = 1 + 0.05 * minerPlusLevel + 0.03 * luckyMinerLevel;
  const minerIncomePerSecond = Number(
    (autoclickers * minerBaseMultiplier * miningMultiplier).toFixed(2)
  );
  const minerIncomePerHour = minerIncomePerSecond * 60 * 60;

  const effectiveTapEnergyCost = Math.max(
    1,
    Number((tapPower * Math.max(0.7, 1 - 0.1 * energySaverLevel)).toFixed(2))
  );
  const baseDailyPreview = getDailyReward(level);
  const effectiveDailyPreview = Math.round(
    baseDailyPreview * (1 + 0.1 * dailyPlusLevel)
  );
  const maxOfflineHours = 3 + offlineProLevel;
  const maxOfflineIncome = minerIncomePerSecond * maxOfflineHours * 60 * 60;

  const upgradeDiscountMultiplier = Math.max(0.85, 1 - 0.05 * engineerLevel);

  const nextTapCost = Math.round(getTapUpgradeCost(tapLevel) * upgradeDiscountMultiplier);
  const nextMinerCost = Math.round(getMinerUpgradeCost(minerLevel) * upgradeDiscountMultiplier);
  const nextEnergyCost = Math.round(getEnergyUpgradeCost(energyLevel) * upgradeDiscountMultiplier);
  const nextRechargeCost = Math.round(
    getRechargeUpgradeCost(rechargeLevel) * upgradeDiscountMultiplier
  );

  const minerUpgradeProgress = Math.min((balance / nextMinerCost) * 100, 100);
  const nextMinerIncomePerSecond = Number(
    ((autoclickers + 0.5) * minerBaseMultiplier * miningMultiplier).toFixed(2)
  );
  const minerIncomeIncrease = nextMinerIncomePerSecond - minerIncomePerSecond;

  const upgradeCards: Array<{
    type: 'tap' | 'miner' | 'energy' | 'recharge';
    icon: string;
    title: string;
    description: string;
    level: number;
    cost: number;
    currentLabel: string;
    currentValue: string;
    nextLabel: string;
    nextValue: string;
  }> = [
    {
      type: 'tap',
      icon: '🎯',
      title: 'Сила тапа',
      description: 'Больше ONIX за каждый тап',
      level: tapLevel,
      cost: nextTapCost,
      currentLabel: 'Сейчас',
      currentValue: `+${formatOnix(tapPower)} ONIX/тап`,
      nextLabel: 'После апгрейда',
      nextValue: `+${formatOnix(tapPower + 1)} ONIX/тап`,
    },
    {
      type: 'miner',
      icon: '⛏️',
      title: 'Майнер',
      description: 'Пассивный доход ONIX',
      level: minerLevel,
      cost: nextMinerCost,
      currentLabel: 'Сейчас',
      currentValue: `+${formatOnix(minerIncomePerSecond)} ONIX/сек`,
      nextLabel: 'После апгрейда',
      nextValue: `+${formatOnix(nextMinerIncomePerSecond)} ONIX/сек`,
    },
    {
      type: 'energy',
      icon: '🔋',
      title: 'Энергия',
      description: 'Больше максимальной энергии',
      level: energyLevel,
      cost: nextEnergyCost,
      currentLabel: 'Сейчас',
      currentValue: `${maxEnergy.toLocaleString('ru-RU')} энергии`,
      nextLabel: 'После апгрейда',
      nextValue: `${(maxEnergy + 500).toLocaleString('ru-RU')} энергии`,
    },
    {
      type: 'recharge',
      icon: '⚡',
      title: 'Восстановление',
      description: 'Энергия быстрее восстанавливается',
      level: rechargeLevel,
      cost: nextRechargeCost,
      currentLabel: 'Сейчас',
      currentValue: `+${formatOnix(energyRecharge)} энергии/сек`,
      nextLabel: 'После апгрейда',
      nextValue: `+${formatOnix(energyRecharge + 0.25)} энергии/сек`,
    },
  ];

  const boostRemainingMs = Math.max(boostEndTime - Date.now(), 0);
  const boostTimeLeft = boostRemainingMs > 0 ? formatTime(boostRemainingMs) : '';
  const isAnyBoostActive = isBoostActive && activeBoost !== 'none';

  const onixEurRate = Number(economyConfig.onixEurPer1000 || DEFAULT_ONIX_EUR_PER_1000) / 1000;
  const minWithdrawOnix = Number(economyConfig.minWithdrawOnix || DEFAULT_MIN_WITHDRAW_ONIX);
  const balanceInEur = balance * onixEurRate;
  const withdrawProgress = Math.min((balance / minWithdrawOnix) * 100, 100);
  const leftToWithdraw = Math.max(minWithdrawOnix - balance, 0);

  const completedAchievementsCount = achievements.filter(
    (item: Achievement) => item.isCompleted
  ).length;

  const visibleAchievements = achievements.filter((item: Achievement) => {
    if (item.isCompleted) return false;
    if (achievementCategory === 'all') return true;

    return getAchievementCategory(item.id) === achievementCategory;
  });

  const canWithdraw = balance >= minWithdrawOnix;

  const transactionFilters: Array<{
    id: TransactionFilter;
    label: string;
  }> = [
    { id: 'all', label: 'Все' },
    { id: 'income', label: 'Доходы' },
    { id: 'expense', label: 'Расходы' },
    { id: 'withdrawal', label: 'Выводы' },
    { id: 'referral', label: 'Рефералы' },
    { id: 'season', label: 'Сезоны' },
    { id: 'missions', label: 'Миссии' },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const type = transaction.type || '';
    const amount = Number(transaction.amount || 0);

    if (transactionFilter === 'all') return true;
    if (transactionFilter === 'income') return amount > 0;
    if (transactionFilter === 'expense') return amount < 0;
    if (transactionFilter === 'withdrawal') return type.includes('withdrawal');
    if (transactionFilter === 'referral') return type.includes('referral');
    if (transactionFilter === 'season') return type.includes('season');
    if (transactionFilter === 'missions') return type.includes('mission');

    return true;
  });

  const walletIncomeTotal = transactions
    .filter((transaction) => Number(transaction.amount || 0) > 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const walletExpenseTotal = transactions
    .filter((transaction) => Number(transaction.amount || 0) < 0)
    .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount || 0)), 0);
  const walletPendingWithdrawal = withdrawalRequests
    .filter((request) => request.status === 'pending')
    .reduce((sum, request) => sum + Number(request.amount || 0), 0);

  const earningChartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    const amount = transactions
      .filter((transaction) => {
        if (Number(transaction.amount || 0) <= 0 || !transaction.createdAt) return false;

        return new Date(transaction.createdAt).toISOString().slice(0, 10) === key;
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      key,
      label: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      amount,
    };
  });
  const maxChartAmount = Math.max(
    ...earningChartDays.map((item) => item.amount),
    1
  );
  const tutorialSteps = [
    {
      icon: '🪙',
      title: 'Тапай и зарабатывай',
      text: 'Нажимай на монету, получай ONIX и следи за энергией.',
    },
    {
      icon: '⚡',
      title: 'Прокачивайся',
      text: 'Покупай улучшения, перки и бусты, чтобы зарабатывать быстрее.',
    },
    {
      icon: '📋',
      title: 'Выполняй задания',
      text: 'Daily, weekly и секретные миссии дают дополнительные ONIX.',
    },
    {
      icon: '🏆',
      title: 'Соревнуйся',
      text: 'Попадай в топ недели, команды и сезоны, чтобы получать призы.',
    },
  ];

  const closeTutorial = () => {
    localStorage.setItem('onixTutorialDone', 'true');
    setTutorialVisible(false);
  };

  const achievementCategories: Array<{
    id: AchievementCategory;
    label: string;
  }> = [
    { id: 'all', label: 'Все' },
    { id: 'taps', label: 'Тапы' },
    { id: 'miner', label: 'Майнер' },
    { id: 'referrals', label: 'Рефералы' },
    { id: 'seasons', label: 'Сезоны' },
    { id: 'perks', label: 'Перки' },
    { id: 'daily', label: 'Daily' },
    { id: 'ranks', label: 'Ранги' },
  ];

  const referralProgress = Math.min(
    (Number(referralLimit.used || 0) / Number(referralLimit.max || 10)) * 100,
    100
  );

  const referralResetTime = formatTime(referralLimit.secondsUntilReset * 1000);
  const seasonTimeLeft = formatTime(seasonSecondsLeft * 1000);

  const nextDailyStreakDay =
    dailyCooldown > 0
      ? Math.max(1, Number(dailyStreak || 1))
      : Number(dailyStreak || 0) >= 7
      ? 1
      : Number(dailyStreak || 0) + 1;

  const dailyRewardPreview = Math.round(
    getDailyRewardWithStreak(level, nextDailyStreakDay) *
      (1 + 0.1 * dailyPlusLevel)
  );
  const dailyStreakMultiplier = getDailyStreakMultiplier(nextDailyStreakDay);

  const boostCards: Array<{
    type: 'tap' | 'mining';
    icon: string;
    title: string;
    description: string;
    multiplier: string;
    durationMinutes: number;
    cost: number;
    isActive: boolean;
  }> = [
    {
      type: 'tap',
      icon: '🎯',
      title: 'Буст тапа',
      description: 'Увеличивает силу тапа на время действия',
      multiplier: '×2',
      durationMinutes: 10,
      cost: getTapBoostCost(tapPower),
      isActive: isBoostActive && activeBoostValue === 'tap',
    },
    {
      type: 'mining',
      icon: '⛏️',
      title: 'Буст майнинга',
      description: 'Удваивает доход майнера онлайн',
      multiplier: '×2',
      durationMinutes: 15,
      cost: getMiningBoostCost(autoclickers),
      isActive: isBoostActive && activeBoostValue === 'mining',
    },
  ];

  if (isAppLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-yellow-400/20 bg-[#111827] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-yellow-400 text-4xl">
            🔗
          </div>

          <h1 className="text-3xl font-black text-white">ONIX COIN</h1>
          <p className="mt-3 text-sm text-gray-400">Загрузка майнера...</p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-yellow-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onix-app-bg min-h-screen text-white pb-20">
      <style>{ONIX_THEME_STYLE}</style>
      <div className="fixed left-0 right-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toastMessages.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-sm rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-[#111827] text-yellow-400 border border-yellow-400/30'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <div className="onix-header p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="onix-brand-mark">
            <OnixCrystal size={42} variant="logo" />
          </div>
          <div>
            <h1 className="onix-brand-title text-2xl font-black">$ONIX coin</h1>
            <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-300">
              Web3 tap economy
            </p>
          </div>
        </div>

        <div className="onix-energy-pill flex items-center gap-2 px-4 py-1 rounded-full">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>
            {Math.floor(energy)}/{maxEnergy}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">Ранг {rankInfo.currentRank.name}</span>
          </div>

          <span className="text-sm text-gray-400">
            {rankInfo.nextRank
              ? `${rankProgressText} до ${rankInfo.nextRank.name}`
              : 'Максимальный ранг'}
          </span>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="onix-progress-fill h-full transition-all"
            style={{ width: `${Math.min(rankProgress, 100)}%` }}
          />
        </div>
      </div>

      <div className="text-center pt-6 pb-4">
        <p className="text-gray-400 text-sm">Баланс $ONIX</p>

        <p className="onix-balance-number text-6xl font-black tracking-tighter">
          {balance.toLocaleString('ru-RU')}
        </p>

        {isBoostActive && (
          <p className="text-emerald-400 text-sm mt-1">⚡ Буст активен</p>
        )}
      </div>

      <div className="onix-nav mx-2 sm:mx-4 p-1 rounded-2xl flex sticky top-16 z-50 overflow-x-auto">
        {[
          { id: 'home', label: 'Главная', icon: Home },
          { id: 'boosts', label: 'Улучшения', icon: Zap },
          { id: 'tasks', label: 'Задания', icon: Trophy },
          { id: 'friends', label: 'Профиль', icon: UserCircle },
          { id: 'wallet', label: 'Кошелёк', icon: Wallet },
          { id: 'launch', label: 'Запуск', icon: Rocket },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`min-w-[64px] flex-1 py-3 rounded-xl flex flex-col items-center gap-1 text-[11px] sm:text-sm transition-all ${
              activeTab === tab.id
                ? 'onix-nav-active'
                : ''
            }`}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

            {activeTab === 'home' && (
        <div className="onix-home-shell">
          <div className="onix-hero-card p-5">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <div className="onix-brand-mark scale-90">
                    <OnixCrystal size={42} variant="logo" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-300">
                      Telegram Mini App
                    </p>
                    <h2 className="onix-hero-title mt-1 text-3xl font-black">
                      $ONIX coin
                    </h2>
                  </div>
                </div>

                <p className="max-w-[270px] text-sm leading-6 text-slate-300">
                  Твой тап. Твой рост. Твоя Web3 tap economy.
                </p>
              </div>

              <div className="onix-chip shrink-0 rounded-2xl px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Energy
                </p>
                <p className="font-bold text-cyan-200">
                  ⚡ {Math.floor(energy)}/{maxEnergy}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-5 grid grid-cols-3 gap-3">
              <div className="onix-stat-tile rounded-2xl p-3">
                <p className="text-[10px] text-slate-500">Ранг</p>
                <p className="mt-1 truncate font-bold text-white">
                  {rankInfo.currentRank.name}
                </p>
              </div>

              <div className="onix-stat-tile rounded-2xl p-3">
                <p className="text-[10px] text-slate-500">За неделю</p>
                <p className="mt-1 truncate font-bold text-cyan-200">
                  +{formatOnix(weeklyEarned)}
                </p>
              </div>

              <div className="onix-stat-tile rounded-2xl p-3">
                <p className="text-[10px] text-slate-500">Топ</p>
                <p className="mt-1 truncate font-bold text-purple-200">
                  {currentUserPlace ? `#${currentUserPlace}` : '—'}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">
                  {rankInfo.nextRank ? `До ${rankInfo.nextRank.name}` : 'Максимальный ранг'}
                </span>
                <span className="text-cyan-200">
                  {rankProgressText}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-900/90">
                <div
                  className="onix-progress-fill h-full transition-all"
                  style={{ width: `${Math.min(rankProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
              Баланс $ONIX
            </p>

            <p className="onix-balance-number mt-2 text-5xl font-black tracking-tighter sm:text-6xl">
              {balance.toLocaleString('ru-RU')}
            </p>

            {isBoostActive && (
              <p className="mt-2 text-sm font-bold text-cyan-300">
                ⚡ Буст активен
              </p>
            )}
          </div>

          <div className="onix-tap-stage">
            <div
              onClick={handleTap}
              className={`onix-tap-orb rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-transform relative ${
                isTapped ? 'scale-90' : ''
              }`}
            >
              <div className="onix-crystal-shards" />
              <OnixCrystal size={220} variant="tap" />
              <span className="sr-only">$ONIX crystal</span>

              {floatingNumbers.map((num) => (
                <div
                  key={num.id}
                  className="onix-floating-number absolute text-3xl font-bold animate-float"
                  style={{ left: num.x - 20, top: num.y - 30 }}
                >
                  +{num.value}
                </div>
              ))}
            </div>
          </div>

          <p className="onix-tap-label text-center text-sm font-black">
            {energy > 0 ? 'ТАПАЙ КРИСТАЛЛ' : 'ЭНЕРГИЯ ВОССТАНАВЛИВАЕТСЯ'}
          </p>

          <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-[#111827] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-bold text-white">⚡ Энергия</span>
              <span className="font-bold text-cyan-200">
                {Math.floor(energy)} / {maxEnergy}
              </span>
            </div>

            <div className="onix-energy-bar h-3">
              <div
                className="onix-energy-bar-fill"
                style={{ width: `${Math.min((energy / Math.max(maxEnergy, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="onix-action-row mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('boosts')}
              className="rounded-2xl py-4 text-sm font-bold text-cyan-200 active:scale-95"
            >
              ⚡ Улучшения
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className="rounded-2xl py-4 text-sm font-bold text-purple-200 active:scale-95"
            >
              🏆 Задания
            </button>
          </div>

          <div className="mt-5 rounded-3xl border border-purple-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="onix-brand-mark scale-75">
                <OnixCrystal size={38} variant="logo" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">$ONIX coin launch</h2>
                <p className="text-sm text-gray-400">
                  Web3 tap economy, команды, сезоны и выводы
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('launch')}
                className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-cyan-200 active:scale-95"
              >
                FAQ / Roadmap
              </button>

              <button
                onClick={shareReferralLink}
                className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-purple-200 active:scale-95"
              >
                Поделиться
              </button>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'launch' && (
        <div className="px-5 mt-8 space-y-5">
          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-6 text-left shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-3xl">
                🚀
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">ONIX COIN</h2>
                <p className="text-sm text-gray-400">
                  Tap. Mine. Invite. Compete.
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-300">
              ONIX COIN — это Telegram Mini App, где игроки зарабатывают ONIX за
              тапы, майнинг, задания, команды, сезоны и приглашения друзей.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Игроков</p>
                <p className="mt-1 font-bold text-yellow-400">
                  {backendHealth?.users ?? '—'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Версия</p>
                <p className="mt-1 font-bold text-yellow-400">
                  v{appVersionInfo?.version || '1.0.0'}
                </p>
              </div>
            </div>

            <button
              onClick={shareReferralLink}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              📣 Пригласить в ONIX COIN
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">❓ FAQ</h3>

            <div className="space-y-3">
              {[
                {
                  q: 'Как заработать ONIX?',
                  a: 'Тапайте монету, забирайте оффлайн-майнинг, выполняйте задания, приглашайте друзей и участвуйте в сезонах.',
                },
                {
                  q: 'Как работает энергия?',
                  a: 'Каждый тап тратит энергию. Энергия восстанавливается со временем и улучшается через апгрейды.',
                },
                {
                  q: 'Как получить реферальный бонус?',
                  a: 'Новый игрок получает стартовый бонус. Пригласивший получает бонус после активности приглашённого игрока.',
                },
                {
                  q: 'Как работают сезоны?',
                  a: 'Каждую неделю считается рейтинг по заработанным ONIX. Лучшие игроки и команды получают призы.',
                },
                {
                  q: 'Можно ли вывести ONIX?',
                  a: 'Заявки на вывод доступны после достижения минимальной суммы. Перед выводом действует антибот-проверка.',
                },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl bg-[#0a0f1c] p-4">
                  <p className="font-bold text-white">{item.q}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">🗺 Roadmap</h3>

            <div className="space-y-3">
              {[
                ['✅', 'Tap-to-earn core', 'Тапы, энергия, апгрейды и майнинг'],
                ['✅', 'Seasons & teams', 'Сезонные призы, команды и рейтинги'],
                ['✅', 'Growth tools', 'Промокоды, welcome bonus и share card'],
                ['🟡', 'Public beta', 'Тест с реальными игроками и балансировка экономики'],
                ['🔜', 'Listing preparation', 'Подготовка к будущему листингу и внешним интеграциям'],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex gap-3 rounded-2xl bg-[#0a0f1c] p-4">
                  <div className="text-2xl">{icon}</div>
                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm text-gray-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">📄 Privacy Policy / Terms</h3>

            <div className="space-y-3 text-sm leading-6 text-gray-400">
              <p>
                ONIX COIN использует Telegram ID, username и игровые действия
                только для работы приложения, рейтингов, прогресса, заданий,
                антиабуза и заявок на вывод.
              </p>

              <p>
                Запрещены боты, мультиаккаунты, накрутка рефералов, обход
                лимитов и любые попытки нарушить экономику игры.
              </p>

              <p>
                Администратор может заморозить подозрительный аккаунт, отклонить
                вывод или скорректировать баланс при нарушениях.
              </p>

              <p>
                ONIX внутри приложения является игровой единицей. Условия вывода
                и будущие интеграции могут изменяться во время публичного теста.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/20 to-[#111827] p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl">
              💎
            </div>

            <h3 className="text-2xl font-black text-white">Coming soon: listing</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Публичный тест поможет проверить экономику, антиабуз и активность
              игроков перед следующими этапами развития ONIX COIN.
            </p>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <p className="text-xs text-gray-400">Статус</p>
              <p className="mt-1 font-bold text-yellow-400">
                Public beta preparation
              </p>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'boosts' && (
        <div className="px-5 mt-8 space-y-8">
          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl">
                ⛏️
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Статистика майнера
                </h2>
                <p className="text-sm text-gray-400">Твой пассивный доход</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Доход в секунду</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  +{formatOnix(minerIncomePerSecond)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Доход в час</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  +{formatOnix(minerIncomePerHour)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Макс. оффлайн</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {maxOfflineHours} часа
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Макс. доход</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  +{formatOnix(maxOfflineIncome)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#0a0f1c] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">
                    Следующий уровень майнера
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Ур. {minerLevel + 1}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Цена</p>
                  <p className="mt-1 text-lg font-bold text-yellow-400">
                    {nextMinerCost.toLocaleString('ru-RU')} ONIX
                  </p>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${minerUpgradeProgress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {Math.min(balance, nextMinerCost).toLocaleString('ru-RU')} /{' '}
                  {nextMinerCost.toLocaleString('ru-RU')} ONIX
                </span>

                <span className="font-bold text-emerald-400">
                  +{formatOnix(minerIncomeIncrease)} ONIX/сек
                </span>
              </div>
            </div>

            {isBoostActive && activeBoostValue === 'mining' && (
              <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400">
                ⚡ Активен буст майнинга ×2
              </p>
            )}
          </div>




          <div className="sticky top-32 z-40 rounded-2xl bg-[#111827] p-1 shadow-xl">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'upgrades', label: 'Апгрейды' },
                { id: 'perks', label: 'Перки' },
                { id: 'boosts', label: 'Бусты' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBoostSubTab(tab.id as BoostSubTab)}
                  className={`rounded-xl px-2 py-3 text-xs font-bold transition ${
                    boostSubTab === tab.id
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className={boostSubTab === 'perks' ? '' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-4">🧩 Перки и магазин</h2>

            <div className="mb-5 rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">🎁 ONIX сундук</h3>
                  <p className="text-sm text-gray-400">
                    Случайная награда: от 25 000 до 300 000 ONIX
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0a0f1c] px-3 py-2 text-right">
                  <p className="text-xs text-gray-400">Цена</p>
                  <p className="font-bold text-yellow-400">50 000</p>
                </div>
              </div>

              {lastChestReward && (
                <p className="mb-3 rounded-2xl bg-[#0a0f1c] p-3 text-sm font-bold text-emerald-400">
                  Последний сундук: {lastChestReward}
                </p>
              )}

              <button
                onClick={openChest}
                disabled={balance < 50000}
                className={`w-full rounded-2xl py-4 text-lg font-bold transition ${
                  balance >= 50000
                    ? 'bg-yellow-400 text-black active:scale-95'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {balance >= 50000
                  ? 'Открыть сундук'
                  : `Не хватает ${(50000 - balance).toLocaleString('ru-RU')} ONIX`}
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'offline_pro',
                  icon: '🧲',
                  title: 'Offline Pro',
                  description: '+1 час к максимуму оффлайн-дохода за уровень',
                  baseCost: 100000,
                  level: offlineProLevel,
                  maxLevel: 3,
                  current: `${maxOfflineHours} ч. оффлайн`,
                  next: `${Math.min(maxOfflineHours + 1, 6)} ч. оффлайн`,
                },
                {
                  id: 'energy_saver',
                  icon: '🔋',
                  title: 'Energy Saver',
                  description: '-10% расход энергии на тап за уровень',
                  baseCost: 150000,
                  level: energySaverLevel,
                  maxLevel: 3,
                  current: `${formatOnix(effectiveTapEnergyCost)} энергии/тап`,
                  next: `${formatOnix(Math.max(1, tapPower * Math.max(0.7, 1 - 0.1 * (energySaverLevel + 1))))} энергии/тап`,
                },
                {
                  id: 'daily_plus',
                  icon: '🎁',
                  title: 'Daily Plus',
                  description: '+10% к daily reward за уровень',
                  baseCost: 200000,
                  level: dailyPlusLevel,
                  maxLevel: 3,
                  current: `+${formatOnix(effectiveDailyPreview)} ONIX`,
                  next: `+${formatOnix(Math.round(baseDailyPreview * (1 + 0.1 * (dailyPlusLevel + 1))))} ONIX`,
                },
                {
                  id: 'miner_plus',
                  icon: '⛏️',
                  title: 'Miner Plus',
                  description: '+5% к доходу майнера за уровень',
                  baseCost: 250000,
                  level: minerPlusLevel,
                  maxLevel: 3,
                  current: `+${formatOnix(minerIncomePerSecond)} ONIX/сек`,
                  next: `+${formatOnix(Number((autoclickers * (1 + 0.05 * (minerPlusLevel + 1) + 0.03 * luckyMinerLevel) * miningMultiplier).toFixed(2)))} ONIX/сек`,
                },
                {
                  id: 'boost_master',
                  icon: '⚡',
                  title: 'Boost Master',
                  description: '+20% длительность бустов за уровень',
                  baseCost: 180000,
                  level: boostMasterLevel,
                  maxLevel: 3,
                  current: `+${boostMasterLevel * 20}% времени`,
                  next: `+${Math.min((boostMasterLevel + 1) * 20, 60)}% времени`,
                },
                {
                  id: 'streak_shield',
                  icon: '🛡️',
                  title: 'Streak Shield',
                  description: 'Защищает daily streak от одного пропуска',
                  baseCost: 220000,
                  level: streakShieldLevel,
                  maxLevel: 1,
                  current: streakShieldLevel > 0 ? 'Активно' : 'Нет защиты',
                  next: 'Защита streak',
                },
                {
                  id: 'lucky_miner',
                  icon: '🍀',
                  title: 'Lucky Miner',
                  description: '+3% к доходу майнера за уровень',
                  baseCost: 300000,
                  level: luckyMinerLevel,
                  maxLevel: 3,
                  current: `+${luckyMinerLevel * 3}%`,
                  next: `+${Math.min((luckyMinerLevel + 1) * 3, 9)}%`,
                },
                {
                  id: 'referral_pro',
                  icon: '👥',
                  title: 'Referral Pro',
                  description: '+5% к реферальному бонусу за уровень',
                  baseCost: 300000,
                  level: referralProLevel,
                  maxLevel: 3,
                  current: `+${referralProLevel * 5}%`,
                  next: `+${Math.min((referralProLevel + 1) * 5, 15)}%`,
                },
                {
                  id: 'energy_max_pro',
                  icon: '🔋',
                  title: 'Energy Max Pro',
                  description: '+500 max energy за уровень',
                  baseCost: 175000,
                  level: energyMaxProLevel,
                  maxLevel: 3,
                  current: `+${energyMaxProLevel * 500} энергии`,
                  next: `+${Math.min((energyMaxProLevel + 1) * 500, 1500)} энергии`,
                },
                {
                  id: 'engineer',
                  icon: '🛠️',
                  title: 'Engineer',
                  description: '-5% стоимость апгрейдов за уровень',
                  baseCost: 250000,
                  level: engineerLevel,
                  maxLevel: 3,
                  current: `-${engineerLevel * 5}%`,
                  next: `-${Math.min((engineerLevel + 1) * 5, 15)}%`,
                },
              ].map((perk) => {
                const nextLevel = perk.level + 1;
                const cost = getPerkCost(perk.baseCost, nextLevel);
                const isMaxed = perk.level >= perk.maxLevel;

                return (
                  <div
                    key={perk.id}
                    className={`rounded-3xl border p-5 shadow-xl ${
                      isMaxed
                        ? 'border-emerald-400/30 bg-emerald-500/10'
                        : perk.level > 0
                        ? 'border-yellow-400/30 bg-[#111827]'
                        : 'border-yellow-400/20 bg-[#111827]'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                            isMaxed ? 'bg-emerald-400' : 'bg-yellow-400'
                          }`}
                        >
                          {perk.icon}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {perk.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {perk.description}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] px-3 py-2 text-right">
                        <p className="text-xs text-gray-400">Уровень</p>
                        <p className="font-bold text-yellow-400">
                          {perk.level}/{perk.maxLevel}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">Сейчас</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {perk.current}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">Следующий ур.</p>
                        <p className="mt-1 text-sm font-bold text-emerald-400">
                          {isMaxed ? 'Максимум' : perk.next}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => buyPerk(perk.id)}
                      disabled={isMaxed || balance < cost}
                      className={`mt-4 w-full rounded-2xl py-4 text-lg font-bold transition ${
                        isMaxed
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                          : balance >= cost
                          ? 'bg-yellow-400 text-black active:scale-95'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isMaxed
                        ? 'Максимум'
                        : balance >= cost
                        ? `Купить ур. ${nextLevel} за ${cost.toLocaleString('ru-RU')} ONIX`
                        : `Не хватает ${(cost - balance).toLocaleString('ru-RU')} ONIX`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={boostSubTab === 'upgrades' ? '' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-4">⬆️ Апгрейды</h2>

            <div className="space-y-4">
              {upgradeCards.map((upgrade) => {
                const canBuy = balance >= upgrade.cost;
                const progressToBuy = Math.min((balance / upgrade.cost) * 100, 100);

                return (
                  <div
                    key={upgrade.type}
                    className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-2xl">
                          {upgrade.icon}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {upgrade.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {upgrade.description}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] px-3 py-2 text-right">
                        <p className="text-xs text-gray-400">Уровень</p>
                        <p className="font-bold text-yellow-400">
                          {upgrade.level}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">
                          {upgrade.currentLabel}
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {upgrade.currentValue}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">
                          {upgrade.nextLabel}
                        </p>
                        <p className="mt-1 text-sm font-bold text-emerald-400">
                          {upgrade.nextValue}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#0a0f1c] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Цена: {upgrade.cost.toLocaleString('ru-RU')} ONIX
                        </span>

                        <span
                          className={
                            canBuy
                              ? 'font-bold text-emerald-400'
                              : 'font-bold text-gray-400'
                          }
                        >
                          {canBuy
                            ? 'Можно купить'
                            : `Не хватает ${(upgrade.cost - balance).toLocaleString(
                                'ru-RU'
                              )}`}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${progressToBuy}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => buyUpgrade(upgrade.type)}
                      disabled={!canBuy}
                      className={`mt-4 w-full rounded-2xl py-4 text-lg font-bold transition ${
                        canBuy
                          ? 'bg-yellow-400 text-black active:scale-95'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canBuy ? 'Купить улучшение' : 'Недостаточно ONIX'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={boostSubTab === 'boosts' ? '' : 'hidden'}>
            <h2 className="text-2xl font-bold mb-4">⚡ Временные бусты</h2>

            {isAnyBoostActive && (
              <div className="mb-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-emerald-300">Активный буст</p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {activeBoostValue === 'tap' ? '🎯 Тап ×2' : '⛏️ Майнинг ×2'}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-[#0a0f1c] px-4 py-3 text-right">
                    <p className="text-xs text-gray-400">Осталось</p>
                    <p className="font-bold text-emerald-400">
                      {boostTimeLeft}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {boostCards.map((boost) => {
                const canBuyBoost = balance >= boost.cost && !isAnyBoostActive;
                const isLockedByOtherBoost =
                  isAnyBoostActive && !boost.isActive;

                return (
                  <div
                    key={boost.type}
                    className={`rounded-3xl border p-5 shadow-xl transition ${
                      boost.isActive
                        ? 'border-emerald-400/40 bg-emerald-500/10'
                        : 'border-yellow-400/20 bg-[#111827]'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                            boost.isActive ? 'bg-emerald-400' : 'bg-yellow-400'
                          }`}
                        >
                          {boost.icon}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {boost.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {boost.description}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] px-4 py-3 text-right">
                        <p className="text-xs text-gray-400">Множитель</p>
                        <p className="text-xl font-bold text-yellow-400">
                          {boost.multiplier}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">Длительность</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          {boost.durationMinutes} мин
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#0a0f1c] p-4">
                        <p className="text-xs text-gray-400">Цена</p>
                        <p className="mt-1 text-lg font-bold text-yellow-400">
                          {boost.cost.toLocaleString('ru-RU')} ONIX
                        </p>
                      </div>
                    </div>

                    {boost.isActive && (
                      <div className="mt-4 rounded-2xl bg-[#0a0f1c] p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-400">Статус</span>
                          <span className="font-bold text-emerald-400">
                            Активен: {boostTimeLeft}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full rounded-full bg-emerald-400 transition-all" />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        activateBoost(boost.type, boost.durationMinutes, boost.cost)
                      }
                      disabled={!canBuyBoost}
                      className={`mt-4 w-full rounded-2xl py-4 text-lg font-bold transition ${
                        canBuyBoost
                          ? 'bg-yellow-400 text-black active:scale-95'
                          : boost.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {boost.isActive
                        ? `Активен ${boostTimeLeft}`
                        : isLockedByOtherBoost
                        ? 'Сначала дождитесь окончания буста'
                        : balance >= boost.cost
                        ? 'Активировать буст'
                        : `Не хватает ${(boost.cost - balance).toLocaleString(
                            'ru-RU'
                          )} ONIX`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="px-5 mt-8 space-y-4">
          <h2 className="text-2xl font-bold mb-6">📋 Задания</h2>

          <div
            onClick={async () => {
              if (dailyCooldown > 0) return;

              try {
                const response = await axios.post(`${API_URL}/claim-task`, {
                  telegramId: getTelegramId(),
                  task: 'daily',
                });

                const user = response.data;
                const cooldown = DAY_MS;

                setBalance(user.balance);
                setUsername(user.username || 'Пользователь');
                setWeeklyEarned(Number(user.weeklyEarned || 0));
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                applyUserStats(user);
                setDailyStreak(Number(user.dailyStreak || 0));
                setTransactions(user.transactions || []);
                setDailyCooldown(cooldown);

                localStorage.setItem(
                  'dailyCooldownEnd',
                  (Date.now() + cooldown).toString()
                );

                showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);
                loadMissions();

                const rankBonusText =
                  Array.isArray(response.data.rankBonuses) && response.data.rankBonuses.length
                    ? `\n🏆 Бонус ранга: +${formatOnix(
                        response.data.rankBonuses.reduce(
                          (sum: number, item: { bonus: number }) =>
                            sum + Number(item.bonus || 0),
                          0
                        )
                      )} ONIX`
                    : '';

                showToast(
                  `🎁 Вы получили +${formatOnix(
                    response.data.claimedDailyReward ||
                      getDailyRewardWithStreak(user.level, user.dailyStreak || 1)
                  )} ONIX\n🔥 Стрик: ${user.dailyStreak || 1}/7${rankBonusText}`
                );
              } catch (error: any) {
                showToast(error?.response?.data?.message || 'Ошибка получения награды');
              }
            }}
            className={`shop-item ${
              dailyCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div>
              <p className="font-bold">🎁 Ежедневная награда</p>
              <p className="text-gray-400">
                +{formatOnix(dailyRewardPreview)} ONIX · День {nextDailyStreakDay}/7
              </p>
              <p className="text-xs text-yellow-400">
                Множитель стрика ×{dailyStreakMultiplier.toFixed(1)}
              </p>
            </div>

            <span className="text-emerald-400 font-bold">
              {dailyCooldown > 0 ? formatTime(dailyCooldown) : 'Забрать'}
            </span>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">☀️ Ежедневные миссии</h3>
                <p className="text-sm text-gray-400">
                  Сложность ×{missions.difficulty}
                </p>
              </div>


            </div>

            <div className="space-y-3">
              {missions.daily.length > 0 ? (
                missions.daily.map((mission) => {
                  const progressPercent = Math.min(
                    (Number(mission.progress || 0) / Number(mission.goal || 1)) * 100,
                    100
                  );

                  return (
                    <div
                      key={mission.id}
                      className="rounded-2xl bg-[#0a0f1c] p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">
                            {mission.secret ? '🔒 ' : ''}{mission.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {mission.description}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#111827] px-3 py-2 text-right">
                          <p className="text-xs text-gray-400">Награда</p>
                          <p className="font-bold text-yellow-400">
                            +{formatOnix(mission.reward)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="font-bold text-emerald-400">
                          {formatOnix(mission.progress)} / {formatOnix(mission.goal)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => claimMission(mission, 'daily')}
                        disabled={!mission.isCompleted || mission.isClaimed}
                        className={`mt-3 w-full rounded-2xl py-3 font-bold ${
                          mission.isClaimed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mission.isCompleted
                            ? 'bg-yellow-400 text-black active:scale-95'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {mission.isClaimed
                          ? 'Получено'
                          : mission.isCompleted
                          ? 'Забрать'
                          : 'В процессе'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Миссии загружаются...
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">📅 Еженедельные миссии</h3>
                <p className="text-sm text-gray-400">
                  Секретные задания открываются по прогрессу
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {missions.weekly.length > 0 ? (
                missions.weekly.map((mission) => {
                  const progressPercent = Math.min(
                    (Number(mission.progress || 0) / Number(mission.goal || 1)) * 100,
                    100
                  );

                  return (
                    <div
                      key={mission.id}
                      className="rounded-2xl bg-[#0a0f1c] p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">
                            {mission.secret ? '🔒 ' : ''}{mission.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {mission.description}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#111827] px-3 py-2 text-right">
                          <p className="text-xs text-gray-400">Награда</p>
                          <p className="font-bold text-yellow-400">
                            +{formatOnix(mission.reward)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="font-bold text-emerald-400">
                          {formatOnix(mission.progress)} / {formatOnix(mission.goal)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => claimMission(mission, 'weekly')}
                        disabled={!mission.isCompleted || mission.isClaimed}
                        className={`mt-3 w-full rounded-2xl py-3 font-bold ${
                          mission.isClaimed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : mission.isCompleted
                            ? 'bg-yellow-400 text-black active:scale-95'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {mission.isClaimed
                          ? 'Получено'
                          : mission.isCompleted
                          ? 'Забрать'
                          : 'В процессе'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Миссии загружаются...
                </p>
              )}
            </div>
          </div>

          <div
            onClick={async () => {
              if (completedTasks.includes('channel')) return;

              if (!channelJoined) {
                window.open('https://t.me/+LEfKu_gQS_o4YTVh', '_blank');
                localStorage.setItem('channelJoined', 'true');
                setChannelJoined(true);
                return;
              }

              try {
                const response = await axios.post(`${API_URL}/claim-task`, {
                  telegramId: getTelegramId(),
                  task: 'channel',
                });

                const user = response.data;

                setBalance(user.balance);
                setUsername(user.username || 'Пользователь');
                setWeeklyEarned(Number(user.weeklyEarned || 0));
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                applyUserStats(user);
                setCompletedTasks(user.completedTasks || []);
                setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));
                setTransactions(user.transactions || []);
                setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
                showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);
                loadMissions();

                showToast('🎉 Подписка подтверждена! +25000 ONIX');
              } catch (error: any) {
                showToast(error?.response?.data?.message || 'Сначала подпишитесь на канал');
              }
            }}
            className={`shop-item ${
              completedTasks.includes('channel')
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <div>
              <p className="font-bold">📢 Подписаться на канал</p>
              <p className="text-gray-400">+25000 ONIX</p>
            </div>

            <span className="text-emerald-400 font-bold">
              {completedTasks.includes('channel')
                ? 'Выполнено'
                : channelJoined
                ? 'Проверить'
                : 'Подписаться'}
            </span>
          </div>

          <div
            onClick={async () => {
              if (completedTasks.includes('inviteFriend')) return;

              if (referralsCount < 1) {
                setReferralModalVisible(true);
                return;
              }

              try {
                const response = await axios.post(`${API_URL}/claim-task`, {
                  telegramId: getTelegramId(),
                  task: 'inviteFriend',
                });

                const user = response.data;

                setBalance(user.balance);
                setUsername(user.username || 'Пользователь');
                setWeeklyEarned(Number(user.weeklyEarned || 0));
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                applyUserStats(user);
                setCompletedTasks(user.completedTasks || []);
                setOwnedPerks(user.ownedPerks || []);
      setPerkLevels(normalizePerkLevels(user.perkLevels));

                showToast(`🎉 Вы получили +${formatOnix(economyConfig.referralReward)} ONIX!`, 'success');
              } catch (error: any) {
                showToast(error?.response?.data?.message || 'Сначала пригласите друга');
              }
            }}
            className={`shop-item ${
              completedTasks.includes('inviteFriend')
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <div>
              <p className="font-bold">👥 Пригласить друга</p>
              <p className="text-gray-400">+{formatOnix(economyConfig.referralReward)} ONIX</p>
              <p className="text-xs text-yellow-400">
                Бонусы сегодня: {referralLimit.used}/{referralLimit.max}
              </p>
            </div>

            <span className="text-emerald-400 font-bold">
              {completedTasks.includes('inviteFriend')
                ? 'Выполнено'
                : referralsCount >= 1
                ? 'Забрать'
                : 'Пригласить'}
            </span>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">🏆 Достижения</h2>
              <span className="rounded-full bg-[#111827] px-3 py-1 text-sm font-bold text-yellow-400">
                {completedAchievementsCount} / {achievements.length}
              </span>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {achievementCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setAchievementCategory(category.id)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                    achievementCategory === category.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#111827] text-gray-400'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {visibleAchievements.length > 0 ? (
              <div className="space-y-4">
                {visibleAchievements.map((achievement) => {
                  const progressPercent = Math.min(
                    (Number(achievement.progress || 0) /
                      Number(achievement.goal || 1)) *
                      100,
                    100
                  );

                  return (
                    <div
                      key={achievement.id}
                      className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {achievement.description}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#0a0f1c] px-3 py-2 text-right">
                          <p className="text-xs text-gray-400">Награда</p>
                          <p className="font-bold text-yellow-400">
                            +{formatOnix(achievement.reward)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="font-bold text-emerald-400">
                          {formatOnix(achievement.progress)} /{' '}
                          {formatOnix(achievement.goal)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-center">
                <p className="text-lg font-bold text-emerald-400">
                  Все достижения выполнены 🎉
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Новые достижения появятся в будущих обновлениях.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'friends' && (
        <div className="px-5 mt-8 space-y-5">
          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl">
              👤
            </div>

            <h2 className="text-2xl font-bold text-white">{username}</h2>

            <p className="mt-1 text-sm text-gray-400">{selectedTitle}</p>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Profile Level</p>
                  <p className="text-lg font-bold text-yellow-400">
                    Level {profileLevel}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  {formatOnix(totalEarned % 100000)} / 100 000
                </p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${profileLevelProgress}%` }}
                />
              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">🏟 Лига</p>
                  <p className="mt-1 text-2xl font-bold text-yellow-400">
                    {getLeagueIcon(league)} {league}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] px-4 py-3 text-right">
                  <p className="text-xs text-gray-400">Сезон</p>
                  <p className="font-bold text-emerald-400">
                    {seasonSecondsLeft > 0 ? seasonTimeLeft : 'обновляется'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-white">🏅 Бейджи игрока</p>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-bold text-yellow-400">
                  {profileBadges.length}
                </span>
              </div>

              {profileBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profileBadges.map((badge) => (
                    <div
                      key={badge.label}
                      className="rounded-2xl border border-yellow-400/20 bg-[#111827] p-3 text-center"
                    >
                      <p className="text-2xl">{badge.icon}</p>
                      <p className="mt-1 text-sm font-bold text-yellow-400">
                        {badge.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#111827] p-4 text-center">
                  <p className="text-sm font-bold text-gray-300">
                    Пока нет бейджей
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Получайте ранги, попадайте в топ и выполняйте достижения.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <p className="mb-3 text-sm font-bold text-white">🎖 Титул игрока</p>

              <div className="flex flex-wrap gap-2">
                {availableTitles.map((title) => (
                  <button
                    key={title}
                    onClick={() => selectProfileTitle(title)}
                    className={`rounded-full px-3 py-2 text-xs font-bold ${
                      selectedTitle === title
                        ? 'bg-yellow-400 text-black'
                        : 'bg-[#111827] text-gray-300'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">Текущий ранг</p>
                  <p className="mt-1 text-xl font-bold text-yellow-400">
                    {rankInfo.currentRank.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Бонус ранга</p>
                  <p className="mt-1 font-bold text-emerald-400">
                    +{formatOnix(currentRankBonus)} ONIX
                  </p>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${Math.min(rankProgress, 100)}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {rankInfo.nextRank
                    ? `${rankProgressText} до ${rankInfo.nextRank.name}`
                    : 'Максимальный ранг'}
                </span>

                {rankInfo.nextRank && (
                  <span className="font-bold text-emerald-400">
                    +{formatOnix(nextRankBonus)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <p className="mb-3 text-sm font-bold text-white">👥 Команда игрока</p>

              <div className="flex gap-2">
                <input
                  value={teamNameInput}
                  onChange={(event) => setTeamNameInput(event.target.value)}
                  placeholder="Название команды"
                  className="min-w-0 flex-1 rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                />

                <button
                  onClick={saveTeamName}
                  className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black active:scale-95"
                >
                  OK
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Текущая команда: {teamName || 'не выбрана'}
              </p>
            </div>

            {teamSocialDashboard && teamName && (
              <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">🤝 Командная активность</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {teamSocialDashboard.team.members} участников · место {teamSocialDashboard.team.place ? `#${teamSocialDashboard.team.place}` : '—'}
                    </p>
                  </div>

                  <button
                    onClick={shareTeamInviteLink}
                    className="rounded-2xl bg-yellow-400 px-4 py-3 text-xs font-bold text-black active:scale-95"
                  >
                    Ссылка
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#111827] p-3">
                    <p className="text-xs text-gray-400">Неделя</p>
                    <p className="mt-1 text-sm font-bold text-yellow-400">
                      {formatOnix(teamSocialDashboard.team.weeklyEarned)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#111827] p-3">
                    <p className="text-xs text-gray-400">Тапы</p>
                    <p className="mt-1 text-sm font-bold text-yellow-400">
                      {teamSocialDashboard.team.totalTaps}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#111827] p-3">
                    <p className="text-xs text-gray-400">Приз</p>
                    <p className="mt-1 text-sm font-bold text-emerald-400">
                      +{formatOnix(teamSocialDashboard.teamPrize)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={claimTeamPrize}
                  disabled={!teamSocialDashboard.teamPrize}
                  className={`mt-3 w-full rounded-2xl py-3 font-bold ${
                    teamSocialDashboard.teamPrize
                      ? 'bg-yellow-400 text-black active:scale-95'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {teamSocialDashboard.teamPrize ? 'Забрать командный приз' : 'Команда вне призовой зоны'}
                </button>

                <div className="mt-4 space-y-3">
                  <p className="text-sm font-bold text-white">📋 Командные задания</p>

                  {teamSocialDashboard.teamMissions.map((mission) => {
                    const progressPercent = Math.min(
                      (Number(mission.progress || 0) / Number(mission.goal || 1)) * 100,
                      100
                    );

                    return (
                      <div key={mission.id} className="rounded-2xl bg-[#111827] p-3">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-white">{mission.title}</p>
                            <p className="text-xs text-gray-400">{mission.description}</p>
                          </div>

                          <p className="shrink-0 font-bold text-yellow-400">
                            +{formatOnix(mission.reward)}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {formatOnix(mission.progress)} / {formatOnix(mission.goal)}
                          </span>

                          <button
                            onClick={() => claimTeamMission(mission)}
                            disabled={!mission.isCompleted || mission.isClaimed}
                            className={`rounded-full px-3 py-1 font-bold ${
                              mission.isClaimed
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : mission.isCompleted
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {mission.isClaimed ? 'Получено' : mission.isCompleted ? 'Забрать' : 'В процессе'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Место в топе</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  {currentUserPlace ? `#${currentUserPlace}` : '—'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">За неделю</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  +{formatOnix(weeklyEarned)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">До конца сезона</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">
                  {seasonSecondsLeft > 0 ? seasonTimeLeft : 'обновляется'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Всего заработано</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {formatOnix(totalEarned)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Рефералы</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {referralsCount}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <h3 className="mb-3 text-lg font-bold text-white">📊 Статистика игрока</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Тапов</p>
                  <p className="font-bold text-yellow-400">{formatOnix(totalTaps)}</p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Апгрейдов</p>
                  <p className="font-bold text-yellow-400">{formatOnix(totalUpgradesBought)}</p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Бустов</p>
                  <p className="font-bold text-yellow-400">{formatOnix(totalBoostsUsed)}</p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Оффлайн-клеймов</p>
                  <p className="font-bold text-yellow-400">{formatOnix(offlineClaimsCount)}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">Реферальные бонусы сегодня</p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {referralLimit.used} / {referralLimit.max}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">За друга</p>
                  <p className="mt-1 font-bold text-yellow-400">
                    +{formatOnix(economyConfig.referralReward)} ONIX
                  </p>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${referralProgress}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-400">
                {referralLimit.isLimitReached
                  ? `Лимит исчерпан. Новые бонусы через ${referralResetTime}`
                  : `Осталось оплачиваемых приглашений: ${referralLimit.remaining}`}
              </p>
            </div>

            <button
              onClick={() => setReferralModalVisible(true)}
              className="mt-5 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl text-lg active:scale-95 transition"
            >
              👥 Пригласить друга
            </button>
            <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">🚀 Referral campaign</h3>
                  <p className="text-sm text-gray-400">
                    Приглашай друзей и делись результатом
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0a0f1c] px-3 py-2 text-right">
                  <p className="text-xs text-gray-400">За друга</p>
                  <p className="font-bold text-yellow-400">
                    +{formatOnix(economyConfig.referralReward)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={claimWelcomeBonus}
                  className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-emerald-400 active:scale-95"
                >
                  🎁 Welcome bonus
                </button>

                <button
                  onClick={() => setPromoModalVisible(true)}
                  className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-yellow-400 active:scale-95"
                >
                  🎟 Промокод
                </button>

                <button
                  onClick={() => setShareCardVisible(true)}
                  className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-sky-400 active:scale-95"
                >
                  📣 Share card
                </button>
              </div>
            </div>


            {isAdmin() && (
              <button
                onClick={loadAdminPrizePreview}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-yellow-400 active:scale-95 disabled:opacity-50"
              >
                🛠 Админ: призы сезона
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={loadAdminWithdrawals}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-emerald-400 active:scale-95 disabled:opacity-50"
              >
                💸 Админ: заявки на вывод
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={loadSuspiciousUsers}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-red-400 active:scale-95 disabled:opacity-50"
              >
                🚨 Админ: suspicious
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={loadAdminEconomyDashboard}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-sky-400 active:scale-95 disabled:opacity-50"
              >
                📊 Админ: экономика
              </button>
            )}
{/* SECURITY_ADMIN_VISIBLE_BUTTONS_FIX */}

            {isAdmin() && (
              <button
                onClick={() => setAdminSearchVisible(true)}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-purple-400 active:scale-95 disabled:opacity-50"
              >
                🔎 Админ: поиск игрока
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={loadAdminSecurityLogs}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-orange-400 active:scale-95 disabled:opacity-50"
              >
                🧾 Админ: security logs
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={async () => {
                  try {
                    const response = await axios.get(`${API_URL}/health`);
                    setBackendHealth(response.data);
                  } catch {
                    setBackendHealth({ ok: false });
                  }

                  setLaunchChecklistVisible(true);
                }}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-emerald-400 active:scale-95 disabled:opacity-50"
              >
                🚀 Админ: launch checklist
              </button>
            )}

            {isAdmin() && (
              <button
                onClick={openAdmin2Panel}
                disabled={isAdminLoading}
                className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-fuchsia-400 active:scale-95 disabled:opacity-50"
              >
                🧰 Админ: 2.0
              </button>
            )}



          </div>


          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">👥 Рейтинг друзей</h3>

            {friendLeaderboard.length > 0 ? (
              <div className="space-y-3">
                {friendLeaderboard.map((friend) => (
                  <div
                    key={friend.telegramId}
                    className={`flex items-center justify-between rounded-2xl p-4 ${
                      friend.isMe ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-[#0a0f1c]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">
                        #{friend.place} {friend.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        неделя +{formatOnix(friend.weeklyEarned)} · refs {friend.referralsCount}
                      </p>
                    </div>

                    <p className="font-bold text-yellow-400">
                      {formatOnix(friend.totalEarned)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0a0f1c] p-5 text-center">
                <p className="font-bold text-gray-300">Пока нет друзей</p>
                <p className="mt-1 text-sm text-gray-500">
                  Пригласите игроков по ссылке, и они появятся здесь.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">🏆 Топ недели</h3>
                <p className="text-sm text-gray-400">
                  Заработано ONIX за текущую неделю
                </p>
              </div>

              <div className="text-right">
                {leaderboardWeek && (
                  <span className="rounded-full bg-[#0a0f1c] px-3 py-1 text-xs font-bold text-yellow-400">
                    {leaderboardWeek}
                  </span>
                )}

                <p className="mt-2 text-xs text-emerald-400">
                  До конца: {seasonSecondsLeft > 0 ? seasonTimeLeft : 'обновляется'}
                </p>
              </div>
            </div>


            <div className="mb-5 rounded-3xl border border-yellow-400/20 bg-[#0a0f1c] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-white">🎁 Призы сезона</h4>
                  <p className="text-sm text-gray-400">
                    Награды за топ-3 будут активированы позже
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-2xl">🥇</p>
                  <p className="mt-1 text-xs text-gray-400">1 место</p>
                  <p className="mt-1 text-sm font-bold text-yellow-400">
                    +250 000
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-2xl">🥈</p>
                  <p className="mt-1 text-xs text-gray-400">2 место</p>
                  <p className="mt-1 text-sm font-bold text-yellow-400">
                    +150 000
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-2xl">🥉</p>
                  <p className="mt-1 text-xs text-gray-400">3 место</p>
                  <p className="mt-1 text-sm font-bold text-yellow-400">
                    +75 000
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-lg">🎖</p>
                  <p className="mt-1 text-xs text-gray-400">4–10 место</p>
                  <p className="mt-1 text-sm font-bold text-yellow-400">
                    +25 000
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-lg">⭐</p>
                  <p className="mt-1 text-xs text-gray-400">11–50 место</p>
                  <p className="mt-1 text-sm font-bold text-yellow-400">
                    +5 000
                  </p>
                </div>
              </div>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((item) => {
                  const isCurrentUser =
                    item.telegramId && item.telegramId === getTelegramId();

                  return (
                    <div
                      key={`${item.place}-${item.username}`}
                      className={`flex items-center justify-between gap-3 rounded-2xl p-3 ${
                        isCurrentUser
                          ? 'bg-yellow-400/10 ring-1 ring-yellow-400/40'
                          : 'bg-[#0a0f1c]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 font-bold text-black">
                          {item.place}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">
                            {item.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            за неделю {formatOnix(item.weeklyEarned)} ONIX
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 font-bold text-yellow-400">
                        +{formatOnix(item.weeklyEarned)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Пока нет данных для рейтинга. Начните зарабатывать ONIX.
              </p>
            )}
          </div>

          {teamLeaderboard.length > 0 && (
            <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-white">🏟 Топ команд</h3>

              <div className="space-y-3">
                {teamLeaderboard.map((team) => (
                  <div
                    key={team.teamName}
                    className="flex items-center justify-between rounded-2xl bg-[#0a0f1c] p-4"
                  >
                    <div>
                      <p className="font-bold text-white">
                        #{team.place} {team.teamName}
                      </p>
                      <p className="text-xs text-gray-500">
                        участников: {team.members}
                      </p>
                    </div>

                    <p className="font-bold text-yellow-400">
                      +{formatOnix(team.weeklyEarned)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">📜 История сезонов</h3>

            {seasonHistory.length > 0 ? (
              <div className="space-y-3">
                {seasonHistory.slice(0, 5).map((season) => (
                  <div key={season.week} className="rounded-2xl bg-[#0a0f1c] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="font-bold text-yellow-400">{season.week}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(season.awardedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {season.winners.slice(0, 10).map((winner) => (
                        <div
                          key={`${season.week}-${winner.place}`}
                          className="flex items-center justify-between rounded-2xl bg-[#111827] px-3 py-2 text-sm"
                        >
                          <span className="font-bold text-white">
                            #{winner.place} {winner.username}
                          </span>

                          <span className="font-bold text-yellow-400">
                            +{formatOnix(winner.prize)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0a0f1c] p-5 text-center">
                <p className="font-bold text-gray-300">
                  Пока нет завершённых сезонов
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  После первой выдачи сезонных призов здесь появятся победители.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="px-5 mt-8 space-y-5">
          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-3xl">
                💼
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">Кошелёк</h2>
                <p className="text-sm text-gray-400">
                  Баланс, выводы и экономика аккаунта
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#0a0f1c] p-5 text-center">
              <p className="text-sm text-gray-400">Текущий баланс</p>
              <p className="mt-2 text-5xl font-bold text-yellow-400">
                {formatOnix(balance)}
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-400">
                ≈ {balanceInEur.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} €
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Всего заработано</p>
                <p className="mt-1 text-sm font-bold text-yellow-400">
                  {formatOnix(totalEarned)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">За неделю</p>
                <p className="mt-1 text-sm font-bold text-emerald-400">
                  +{formatOnix(weeklyEarned)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Доходы в истории</p>
                <p className="mt-1 text-sm font-bold text-emerald-400">
                  +{formatOnix(walletIncomeTotal)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Расходы в истории</p>
                <p className="mt-1 text-sm font-bold text-red-400">
                  -{formatOnix(walletExpenseTotal)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Курс</p>
                <p className="mt-1 text-sm font-bold text-white">
                  1000 ONIX = {economyConfig.onixEurPer1000.toLocaleString('ru-RU')}€
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Минимальный вывод</p>
                <p className="mt-1 text-sm font-bold text-yellow-400">
                  {minWithdrawOnix.toLocaleString('ru-RU')} ONIX
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-400">Прогресс до вывода</span>
                <span className="font-bold text-yellow-400">
                  {withdrawProgress.toFixed(1)}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${withdrawProgress}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-400">
                {canWithdraw
                  ? 'Минимальная сумма набрана'
                  : `Осталось ${formatOnix(leftToWithdraw)} ONIX`}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Pending-заявки: {formatOnix(walletPendingWithdrawal)} ONIX
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <p className="text-sm font-bold text-white">🛡 Антибот-проверка</p>
              <p className="mt-1 text-xs text-gray-500">
                Перед созданием заявки введите ONIX.
              </p>

              <input
                value={withdrawalCheck}
                onChange={(event) => setWithdrawalCheck(event.target.value)}
                placeholder="Введите ONIX"
                className="mt-3 w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <button
              onClick={requestWithdrawal}
              disabled={!canWithdraw || isWithdrawalLoading}
              className={`mt-5 w-full rounded-2xl py-4 text-lg font-bold active:scale-95 ${
                canWithdraw
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isWithdrawalLoading
                ? 'Создаём заявку...'
                : canWithdraw
                ? 'Создать заявку на вывод'
                : 'Недостаточно ONIX для вывода'}
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <h3 className="text-xl font-bold text-white">📈 График заработка</h3>
            <p className="mt-1 text-sm text-gray-400">Доходы за последние 7 дней</p>

            <div className="mt-5 flex h-40 items-end gap-2 rounded-2xl bg-[#0a0f1c] p-4">
              {earningChartDays.map((item) => (
                <div key={item.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-xl bg-yellow-400 transition-all"
                      style={{
                        height: `${Math.max((item.amount / maxChartAmount) * 100, item.amount > 0 ? 8 : 2)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <h3 className="text-xl font-bold text-white">💸 Заявки на вывод</h3>

            {withdrawalRequests.length > 0 ? (
              <div className="mt-4 space-y-3">
                {withdrawalRequests.slice(0, 5).map((request, index) => (
                  <div
                    key={`${request.createdAt}-${index}`}
                    className="rounded-2xl bg-[#0a0f1c] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">
                          {formatOnix(request.amount)} ONIX
                        </p>
                        <p className="text-xs text-gray-400">
                          ≈ {formatOnix(request.eurAmount)} €
                        </p>
                        {request.adminComment && (
                          <p className="mt-1 text-xs text-gray-500">
                            {request.adminComment}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          request.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : request.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-400/10 text-yellow-400'
                        }`}
                      >
                        {request.status === 'approved'
                          ? 'Одобрено'
                          : request.status === 'rejected'
                          ? 'Отклонено'
                          : 'В обработке'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#0a0f1c] p-5 text-center">
                <p className="font-bold text-gray-300">Заявок пока нет</p>
                <p className="mt-1 text-sm text-gray-500">
                  Когда вы создадите заявку, она появится здесь.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">🧾 История операций</h3>
                <p className="text-sm text-gray-400">
                  {filteredTransactions.length} операций
                </p>
              </div>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {transactionFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTransactionFilter(filter.id)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                    transactionFilter === filter.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#0a0f1c] text-gray-400'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.slice(0, 40).map((transaction, index) => {
                  const isIncome = Number(transaction.amount || 0) >= 0;

                  return (
                    <div
                      key={`${transaction.createdAt || index}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#0a0f1c] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-xl">
                          {getTransactionIcon(transaction.type)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {transaction.title || 'Операция'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTransactionTime(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`shrink-0 text-sm font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isIncome ? '+' : ''}
                        {formatOnix(transaction.amount)} ONIX
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0a0f1c] p-5 text-center">
                <p className="font-bold text-gray-300">Операций нет</p>
                <p className="mt-1 text-sm text-gray-500">
                  Попробуйте выбрать другой фильтр.
                </p>
              </div>
            )}
          </div>
        </div>
      )}












      {promoModalVisible && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🎟 Промокод</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Введите промокод кампании
                </p>
              </div>

              <button
                onClick={() => setPromoModalVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <input
              value={promoCodeInput}
              onChange={(event) => setPromoCodeInput(event.target.value.toUpperCase())}
              placeholder="Например: LAUNCH"
              className="w-full rounded-2xl bg-[#0a0f1c] px-4 py-4 text-center text-lg font-bold text-white outline-none"
            />

            <button
              onClick={applyPromoCode}
              className="mt-4 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              Активировать
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Промокод можно использовать только один раз.
            </p>
          </div>
        </div>
      )}

      {shareCardVisible && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-sky-400/30 bg-[#111827] p-6 text-center shadow-2xl">
            <button
              onClick={() => setShareCardVisible(false)}
              className="ml-auto block text-2xl text-gray-400"
            >
              ×
            </button>

            <div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl">
              🔗
            </div>

            <h2 className="mt-4 text-3xl font-black text-white">ONIX COIN</h2>
            <p className="mt-2 text-sm text-gray-400">Мой результат</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Баланс</p>
                <p className="font-bold text-yellow-400">{formatOnix(balance)}</p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Всего</p>
                <p className="font-bold text-yellow-400">{formatOnix(totalEarned)}</p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Ранг</p>
                <p className="font-bold text-yellow-400">{rankInfo.currentRank.name}</p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Топ</p>
                <p className="font-bold text-yellow-400">
                  {currentUserPlace ? `#${currentUserPlace}` : '—'}
                </p>
              </div>
            </div>

            <button
              onClick={shareReferralLink}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              Поделиться в Telegram
            </button>
          </div>
        </div>
      )}

      {launchChecklistVisible && (
        <div className="fixed inset-0 z-[89] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-emerald-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🚀 Публичный запуск</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Быстрая проверка перед релизом
                </p>
              </div>

              <button
                onClick={() => setLaunchChecklistVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Backend health',
                  ok: Boolean(backendHealth?.ok),
                  text: backendHealth?.ok
                    ? `OK · users: ${backendHealth.users || 0}`
                    : 'Проверь Render logs',
                },
                {
                  title: 'Telegram Mini App',
                  ok: true,
                  text: 'Проверить кнопку запуска и /start',
                },
                {
                  title: 'Кошелёк и вывод',
                  ok: true,
                  text: 'Проверить создание заявки и админку вывода',
                },
                {
                  title: 'Рефералка',
                  ok: true,
                  text: 'Проверить: +15 000 новому, +75 000 после 100 тапов',
                },
                {
                  title: 'Cron сезона',
                  ok: true,
                  text: 'GitHub Actions / cron должен вызывать weekly prizes',
                },
                {
                  title: 'Антиабуз',
                  ok: true,
                  text: 'Проверить suspicious, ban/unban и security logs',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-[#0a0f1c] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white">{item.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.ok
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {item.ok ? 'OK' : 'CHECK'}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setLaunchChecklistVisible(false)}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              Готово
            </button>
          </div>
        </div>
      )}


      {admin2Visible && (
        <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-fuchsia-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🧰 Админка 2.0</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Economy config, рассылки, CSV и операции
                </p>
              </div>

              <button
                onClick={() => setAdmin2Visible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">🛡 Production stability</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Frontend</p>
                  <p className="font-bold text-yellow-400">
                    v{'1.0.0'}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Backend</p>
                  <p className="font-bold text-yellow-400">
                    v{appVersionInfo?.version || '—'}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={downloadMongoBackup}
                  className="rounded-2xl bg-[#111827] py-3 font-bold text-emerald-400 active:scale-95"
                >
                  Backup JSON
                </button>

                <button
                  onClick={loadAdminFrontendErrors}
                  disabled={isAdminLoading}
                  className="rounded-2xl bg-[#111827] py-3 font-bold text-red-400 active:scale-95 disabled:opacity-50"
                >
                  Error logs
                </button>
              </div>

              {adminFrontendErrors.length > 0 && (
                <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                  {adminFrontendErrors.slice(0, 6).map((error, index) => (
                    <div
                      key={`${error.telegramId}-${error.createdAt}-${index}`}
                      className="rounded-xl bg-[#111827] p-3 text-xs"
                    >
                      <p className="font-bold text-red-400">{error.message}</p>
                      <p className="mt-1 text-gray-500">
                        {error.username} · v{error.appVersion || '—'} · {formatTransactionTime(error.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">⚙️ Economy config</h3>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ['ONIX_EUR_PER_1000', 'Курс /1000'],
                  ['MIN_WITHDRAW_ONIX', 'Мин. вывод'],
                  ['REFERRAL_REWARD', 'Реферал'],
                  ['REFERRED_USER_REWARD', 'Новый игрок'],
                  ['WELCOME_BONUS', 'Welcome'],
                  ['CHEST_COST', 'Сундук'],
                  ['MAX_PAID_REFERRALS_PER_DAY', 'Реф/день'],
                  ['MAX_PAID_REFERRALS_PER_HOUR', 'Реф/час'],
                ].map(([key, label]) => (
                  <label key={key} className="text-xs text-gray-400">
                    {label}
                    <input
                      value={adminEconomyConfigDraft[key] || ''}
                      onChange={(event) =>
                        setAdminEconomyConfigDraft((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl bg-[#111827] px-3 py-2 text-sm font-bold text-white outline-none"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={saveAdminEconomyConfig}
                disabled={isAdminLoading}
                className="mt-4 w-full rounded-2xl bg-yellow-400 py-3 font-bold text-black active:scale-95 disabled:opacity-50"
              >
                Сохранить runtime config
              </button>

              <p className="mt-2 text-xs text-gray-500">
                Runtime config работает до перезапуска backend. Для постоянных значений используй Render Environment.
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">📣 Массовая рассылка</h3>

              <textarea
                value={adminBroadcastMessage}
                onChange={(event) => setAdminBroadcastMessage(event.target.value)}
                placeholder="Текст сообщения игрокам"
                className="h-28 w-full resize-none rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => sendAdminBroadcast(true)}
                  disabled={isAdminLoading}
                  className="rounded-2xl bg-[#111827] py-3 font-bold text-sky-400 active:scale-95 disabled:opacity-50"
                >
                  Dry run
                </button>

                <button
                  onClick={() => sendAdminBroadcast(false)}
                  disabled={isAdminLoading}
                  className="rounded-2xl bg-yellow-400 py-3 font-bold text-black active:scale-95 disabled:opacity-50"
                >
                  Отправить
                </button>
              </div>

              {adminBroadcastResult && (
                <p className="mt-3 rounded-xl bg-[#111827] p-3 text-xs text-gray-300">
                  Получателей: {adminBroadcastResult.recipients || 0} ·
                  отправлено: {adminBroadcastResult.sent || 0} ·
                  ошибок: {adminBroadcastResult.failed || 0}
                </p>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">📦 Экспорт и операции</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadUsersCsv}
                  className="rounded-2xl bg-[#111827] py-3 font-bold text-emerald-400 active:scale-95"
                >
                  CSV users
                </button>

                <button
                  onClick={loadAdminOperations}
                  disabled={isAdminLoading}
                  className="rounded-2xl bg-[#111827] py-3 font-bold text-yellow-400 active:scale-95 disabled:opacity-50"
                >
                  Обновить
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Выводы</p>
                  <p className="font-bold text-yellow-400">
                    {adminOperations?.withdrawals?.length || 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#111827] p-3">
                  <p className="text-xs text-gray-400">Транзакции</p>
                  <p className="font-bold text-yellow-400">
                    {adminOperations?.transactions?.length || 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                {(adminOperations?.withdrawals || []).slice(0, 8).map((item, index) => (
                  <div
                    key={`${item.telegramId}-${item.createdAt}-${index}`}
                    className="rounded-xl bg-[#111827] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-white">{item.username}</p>
                      <p className="font-bold text-yellow-400">
                        {formatOnix(item.amount)} ONIX
                      </p>
                    </div>
                    <p className="mt-1 text-gray-500">
                      {item.status} · {formatTransactionTime(item.createdAt)}
                    </p>
                  </div>
                ))}

                {(adminOperations?.transactions || []).slice(0, 8).map((item, index) => (
                  <div
                    key={`${item.telegramId}-${item.createdAt}-${index}`}
                    className="rounded-xl bg-[#111827] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-white">{item.username}</p>
                      <p className={Number(item.amount || 0) >= 0 ? 'font-bold text-emerald-400' : 'font-bold text-red-400'}>
                        {Number(item.amount || 0) >= 0 ? '+' : ''}
                        {formatOnix(item.amount)}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-500">
                      {item.title || item.type} · {formatTransactionTime(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {adminSearchVisible && (
        <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-purple-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🔎 Админ: поиск игрока</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Поиск по username или Telegram ID
                </p>
              </div>

              <button
                onClick={() => setAdminSearchVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={adminSearchQuery}
                onChange={(event) => setAdminSearchQuery(event.target.value)}
                placeholder="username или telegramId"
                className="min-w-0 flex-1 rounded-2xl bg-[#0a0f1c] px-4 py-3 text-sm text-white outline-none"
              />

              <button
                onClick={searchAdminUsers}
                disabled={isAdminLoading}
                className="rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black active:scale-95 disabled:opacity-50"
              >
                Найти
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {adminSearchResults.length > 0 ? (
                adminSearchResults.map((user) => (
                  <button
                    key={user.telegramId}
                    onClick={() => loadAdminUserProfile(user.telegramId)}
                    className="w-full rounded-2xl bg-[#0a0f1c] p-4 text-left active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{user.username}</p>
                        <p className="text-xs text-gray-500">ID: {user.telegramId}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.isFrozen
                            ? 'bg-red-500/10 text-red-400'
                            : user.isSuspicious
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {user.isFrozen ? 'Banned' : user.isSuspicious ? 'Suspicious' : 'OK'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <p className="rounded-xl bg-[#111827] p-2">
                        Balance: {formatOnix(user.balance)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Earned: {formatOnix(user.totalEarned)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Введите запрос и нажмите “Найти”
                </p>
              )}
            </div>

            {adminSelectedUser && (
              <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-[#0a0f1c] p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {adminSelectedUser.username}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ID: {adminSelectedUser.telegramId}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      adminSelectedUser.isFrozen
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {adminSelectedUser.isFrozen ? 'Banned' : 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-xl bg-[#111827] p-2">
                    Balance: {formatOnix(adminSelectedUser.balance)}
                  </p>
                  <p className="rounded-xl bg-[#111827] p-2">
                    Earned: {formatOnix(adminSelectedUser.totalEarned)}
                  </p>
                  <p className="rounded-xl bg-[#111827] p-2">
                    Week: {formatOnix(adminSelectedUser.weeklyEarned)}
                  </p>
                  <p className="rounded-xl bg-[#111827] p-2">
                    Taps: {adminSelectedUser.totalTaps}
                  </p>
                  <p className="rounded-xl bg-[#111827] p-2">
                    Refs: {adminSelectedUser.referralsCount}
                  </p>
                  <p className="rounded-xl bg-[#111827] p-2">
                    Upgrades: {adminSelectedUser.totalUpgradesBought}
                  </p>
                </div>

                {adminSelectedUser.suspiciousReasons.length > 0 && (
                  <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                    {adminSelectedUser.suspiciousReasons.join(', ')}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  <input
                    value={adminAdjustAmount}
                    onChange={(event) => setAdminAdjustAmount(event.target.value)}
                    placeholder="+10000 или -10000"
                    className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                  />

                  <input
                    value={adminActionReason}
                    onChange={(event) => setAdminActionReason(event.target.value)}
                    placeholder="Причина действия"
                    className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={adjustAdminUserBalance}
                    disabled={isAdminLoading}
                    className="rounded-2xl bg-yellow-400 py-3 font-bold text-black active:scale-95 disabled:opacity-50"
                  >
                    Баланс
                  </button>

                  <button
                    onClick={toggleAdminUserBan}
                    disabled={isAdminLoading}
                    className={`rounded-2xl py-3 font-bold active:scale-95 disabled:opacity-50 ${
                      adminSelectedUser.isFrozen
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {adminSelectedUser.isFrozen ? 'Разбан' : 'Бан'}
                  </button>
                </div>

                <div className="mt-5">
                  <h4 className="mb-3 font-bold text-white">📝 Админские заметки</h4>

                  <div className="flex gap-2">
                    <input
                      value={adminNoteText}
                      onChange={(event) => setAdminNoteText(event.target.value)}
                      placeholder="Заметка по игроку"
                      className="min-w-0 flex-1 rounded-2xl bg-[#111827] px-4 py-3 text-sm text-white outline-none"
                    />

                    <button
                      onClick={addAdminNote}
                      disabled={isAdminLoading}
                      className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black active:scale-95 disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>

                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                    {adminSelectedUser.adminNotes?.length > 0 ? (
                      adminSelectedUser.adminNotes.slice(0, 5).map((note, index) => (
                        <div
                          key={`${note.createdAt}-${index}`}
                          className="rounded-xl bg-[#111827] p-3 text-xs"
                        >
                          <p className="text-gray-300">{note.text}</p>
                          <p className="mt-1 text-gray-600">
                            {formatTransactionTime(note.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-[#111827] p-3 text-center text-xs text-gray-500">
                        Заметок пока нет
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <h4 className="mb-3 font-bold text-white">🧾 Security logs</h4>

                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {adminSelectedUser.securityLogs.length > 0 ? (
                      adminSelectedUser.securityLogs.slice(0, 10).map((log, index) => (
                        <div
                          key={`${log.createdAt}-${index}`}
                          className="rounded-xl bg-[#111827] p-3 text-xs"
                        >
                          <p className="font-bold text-yellow-400">{log.title}</p>
                          <p className="mt-1 text-gray-400">{log.details}</p>
                          <p className="mt-1 text-gray-600">
                            {formatTransactionTime(log.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-[#111827] p-3 text-center text-xs text-gray-500">
                        Логов пока нет
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {adminSecurityLogsVisible && (
        <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-orange-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🧾 Security logs</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Последние подозрительные и админские действия
                </p>
              </div>

              <button
                onClick={() => setAdminSecurityLogsVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {adminSecurityLogs.length > 0 ? (
                adminSecurityLogs.map((log, index) => (
                  <div
                    key={`${log.telegramId}-${log.createdAt}-${index}`}
                    className="rounded-2xl bg-[#0a0f1c] p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{log.username}</p>
                        <p className="text-xs text-gray-500">ID: {log.telegramId}</p>
                      </div>

                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                        {log.type}
                      </span>
                    </div>

                    <p className="font-bold text-yellow-400">{log.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{log.details}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      {formatTransactionTime(log.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Логов пока нет
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tutorialVisible && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl">
              {tutorialSteps[tutorialStep].icon}
            </div>

            <h2 className="text-2xl font-bold text-white">
              {tutorialSteps[tutorialStep].title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {tutorialSteps[tutorialStep].text}
            </p>

            <div className="mt-5 flex justify-center gap-2">
              {tutorialSteps.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === tutorialStep
                      ? 'w-8 bg-yellow-400'
                      : 'w-2 bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={closeTutorial}
                className="rounded-2xl bg-[#0a0f1c] py-4 font-bold text-gray-300 active:scale-95"
              >
                Пропустить
              </button>

              <button
                onClick={() => {
                  if (tutorialStep >= tutorialSteps.length - 1) {
                    closeTutorial();
                  } else {
                    setTutorialStep((step) => step + 1);
                  }
                }}
                className="rounded-2xl bg-yellow-400 py-4 font-bold text-black active:scale-95"
              >
                {tutorialStep >= tutorialSteps.length - 1 ? 'Начать' : 'Дальше'}
              </button>
            </div>
          </div>
        </div>
      )}

      {adminEconomyVisible && adminEconomyDashboard && (
        <div className="fixed inset-0 z-[87] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-sky-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">📊 Админ: dashboard экономики</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Общая экономика ONIX COIN
                </p>
              </div>

              <button
                onClick={() => setAdminEconomyVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Пользователи</p>
                <p className="font-bold text-yellow-400">
                  {adminEconomyDashboard.totals.users}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Баланс всех</p>
                <p className="font-bold text-yellow-400">
                  {formatOnix(adminEconomyDashboard.totals.totalBalance)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Создано ONIX</p>
                <p className="font-bold text-emerald-400">
                  +{formatOnix(adminEconomyDashboard.totals.createdOnix)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Потрачено ONIX</p>
                <p className="font-bold text-red-400">
                  -{formatOnix(adminEconomyDashboard.totals.spentOnix)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Pending выводы</p>
                <p className="font-bold text-yellow-400">
                  {adminEconomyDashboard.totals.pendingWithdrawals}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Сумма pending</p>
                <p className="font-bold text-yellow-400">
                  {formatOnix(adminEconomyDashboard.totals.pendingWithdrawOnix)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Suspicious</p>
                <p className="font-bold text-red-400">
                  {adminEconomyDashboard.totals.suspiciousUsers}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Frozen</p>
                <p className="font-bold text-red-400">
                  {adminEconomyDashboard.totals.frozenUsers}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">⚙️ Backend config</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Курс: 1000 ONIX = {adminEconomyDashboard.economyConfig.onixEurPer1000}€</p>
                <p>Мин. вывод: {formatOnix(adminEconomyDashboard.economyConfig.minWithdrawOnix)} ONIX</p>
                <p>Реферал: +{formatOnix(adminEconomyDashboard.economyConfig.referralReward)} ONIX</p>
                <p>Сундук: {formatOnix(adminEconomyDashboard.economyConfig.chestCost)} ONIX</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
              <h3 className="mb-3 font-bold text-white">🧾 Типы операций</h3>
              <div className="space-y-2">
                {adminEconomyDashboard.transactionTypes.slice(0, 8).map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between rounded-xl bg-[#111827] px-3 py-2 text-sm"
                  >
                    <span className="truncate text-gray-300">{item.type}</span>
                    <span className="font-bold text-yellow-400">
                      {formatOnix(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={loadAdminEconomyDashboard}
              disabled={isAdminLoading}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95 disabled:opacity-50"
            >
              Обновить dashboard
            </button>
          </div>
        </div>
      )}

      {seasonPrizePopup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-yellow-400/40 bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl">
              🏆
            </div>

            <h2 className="text-2xl font-bold text-white">
              Приз сезона получен
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Неделя {seasonPrizePopup.week}
            </p>

            <p className="mt-4 text-lg font-bold text-yellow-400">
              #{seasonPrizePopup.place} место
            </p>

            <p className="mt-2 text-3xl font-black text-yellow-400">
              +{formatOnix(seasonPrizePopup.prize)} ONIX
            </p>

            <button
              onClick={() => setSeasonPrizePopup(null)}
              className="mt-6 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              Забрать
            </button>
          </div>
        </div>
      )}

      {suspiciousUsersVisible && (
        <div className="fixed inset-0 z-[86] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-red-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">🚨 Suspicious users</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Подозрительные и замороженные аккаунты
                </p>
              </div>

              <button
                onClick={() => setSuspiciousUsersVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {suspiciousUsers.length > 0 ? (
                suspiciousUsers.map((user) => (
                  <div key={user.telegramId} className="rounded-2xl bg-[#0a0f1c] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{user.username}</p>
                        <p className="text-xs text-gray-500">ID: {user.telegramId}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.isFrozen
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-yellow-400/10 text-yellow-400'
                        }`}
                      >
                        {user.isFrozen ? 'Frozen' : 'Suspicious'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p className="rounded-xl bg-[#111827] p-2">
                        Balance: {formatOnix(user.balance)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Earned: {formatOnix(user.totalEarned)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Week: {formatOnix(user.weeklyEarned)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Refs: {user.referralsCount}
                      </p>
                    </div>

                    {user.suspiciousReasons.length > 0 && (
                      <p className="mt-3 rounded-xl bg-red-500/10 p-2 text-xs text-red-400">
                        {user.suspiciousReasons.join(', ')}
                      </p>
                    )}

                    <button
                      onClick={() => toggleFreezeUser(user)}
                      disabled={isAdminLoading}
                      className={`mt-4 w-full rounded-2xl py-3 font-bold active:scale-95 disabled:opacity-50 ${
                        user.isFrozen
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {user.isFrozen ? 'Разморозить' : 'Заморозить'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Подозрительных аккаунтов нет
                </p>
              )}
            </div>

            <button
              onClick={loadSuspiciousUsers}
              disabled={isAdminLoading}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95 disabled:opacity-50"
            >
              Обновить список
            </button>
          </div>
        </div>
      )}

      {adminWithdrawalsVisible && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">💸 Админ: выводы</h2>
                <p className="mt-1 text-sm text-gray-400">Pending-заявки игроков</p>
              </div>

              <button
                onClick={() => setAdminWithdrawalsVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <textarea
              value={adminWithdrawalComment}
              onChange={(event) => setAdminWithdrawalComment(event.target.value)}
              placeholder="Комментарий админа"
              className="mb-4 h-24 w-full rounded-2xl bg-[#0a0f1c] p-4 text-sm text-white outline-none"
            />

            <div className="space-y-4">
              {adminWithdrawals.length > 0 ? (
                adminWithdrawals.map((request) => (
                  <div
                    key={`${request.userTelegramId}-${request.requestIndex}`}
                    className="rounded-2xl bg-[#0a0f1c] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{request.username}</p>
                        <p className="text-xs text-gray-500">ID: {request.userTelegramId}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-yellow-400">
                          {formatOnix(request.amount)} ONIX
                        </p>
                        <p className="text-xs text-emerald-400">
                          ≈ {formatOnix(request.eurAmount)} €
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <p className="rounded-xl bg-[#111827] p-2">
                        Balance: {formatOnix(request.userStats.balance)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Earned: {formatOnix(request.userStats.totalEarned)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Week: {formatOnix(request.userStats.weeklyEarned)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Refs: {request.userStats.referralsCount}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Taps: {formatOnix(request.userStats.totalTaps)}
                      </p>
                      <p className="rounded-xl bg-[#111827] p-2">
                        Ach: {request.userStats.achievementsCompleted}
                      </p>
                    </div>

                    {request.userStats.isSuspicious && (
                      <p className="mt-3 rounded-xl bg-red-500/10 p-2 text-xs text-red-400">
                        ⚠️ Suspicious: {request.userStats.suspiciousReasons.join(', ')}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => reviewWithdrawal(request, 'rejected')}
                        disabled={isAdminLoading}
                        className="rounded-2xl bg-red-500/20 py-3 font-bold text-red-400 active:scale-95 disabled:opacity-50"
                      >
                        Отклонить
                      </button>

                      <button
                        onClick={() => reviewWithdrawal(request, 'approved')}
                        disabled={isAdminLoading}
                        className="rounded-2xl bg-emerald-500/20 py-3 font-bold text-emerald-400 active:scale-95 disabled:opacity-50"
                      >
                        Одобрить
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-center text-gray-400">
                  Pending-заявок нет
                </p>
              )}
            </div>

            <button
              onClick={loadAdminWithdrawals}
              disabled={isAdminLoading}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95 disabled:opacity-50"
            >
              Обновить список
            </button>
          </div>
        </div>
      )}

      {adminPanelVisible && adminPrizePreview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🛠 Админ-панель
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Призы недели {adminPrizePreview.week}
                </p>
              </div>

              <button
                onClick={() => setAdminPanelVisible(false)}
                className="text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            <div
              className={`mb-4 rounded-2xl p-4 text-sm font-bold ${
                adminPrizePreview.alreadyAwarded
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-yellow-400/10 text-yellow-400'
              }`}
            >
              {adminPrizePreview.alreadyAwarded
                ? 'Призы за эту неделю уже выданы'
                : 'Призы ещё не выданы'}
            </div>

            <div className="space-y-3">
              {adminPrizePreview.preview.length > 0 ? (
                adminPrizePreview.preview.map((item) => (
                  <div
                    key={`${item.place}-${item.telegramId}`}
                    className="rounded-2xl bg-[#0a0f1c] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">
                          #{item.place} {item.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          week: {formatOnix(item.weeklyEarned)} ONIX
                        </p>
                      </div>

                      <p className="font-bold text-yellow-400">
                        +{formatOnix(item.prize)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#0a0f1c] p-4 text-sm text-gray-400">
                  Нет игроков для выдачи призов.
                </p>
              )}
            </div>

            <button
              onClick={awardWeeklyPrizes}
              disabled={
                isAdminLoading ||
                adminPrizePreview.alreadyAwarded ||
                adminPrizePreview.preview.length === 0
              }
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
            >
              {adminPrizePreview.alreadyAwarded
                ? 'Уже выдано'
                : isAdminLoading
                ? 'Загрузка...'
                : 'Выдать призы топ-3'}
            </button>

            <button
              onClick={loadAdminPrizePreview}
              disabled={isAdminLoading}
              className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-white active:scale-95 disabled:opacity-50"
            >
              Обновить preview
            </button>
          </div>
        </div>
      )}

      {referralModalVisible && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 text-center shadow-2xl">
            <button
              onClick={() => setReferralModalVisible(false)}
              className="absolute right-5 top-5 text-2xl text-gray-400"
            >
              ×
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl">
              👥
            </div>

            <h2 className="text-2xl font-bold text-white">Пригласи друга</h2>
            <p className="mt-2 text-sm text-gray-400">
              Делись ссылкой и получай ONIX за новых игроков
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Ты получишь</p>
                <p className="mt-1 font-bold text-yellow-400">+{formatOnix(economyConfig.referralReward)}</p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Друг получит</p>
                <p className="mt-1 font-bold text-emerald-400">+{formatOnix(economyConfig.referredUserReward)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4 text-left">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Бонусы сегодня</span>
                <span className="font-bold text-yellow-400">
                  {referralLimit.used} / {referralLimit.max}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${referralProgress}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {referralLimit.isLimitReached
                  ? `Лимит бонусов на сегодня исчерпан. Следующие бонусы через ${referralResetTime}`
                  : `Можно получить ещё ${referralLimit.remaining} оплачиваемых бонусов сегодня`}
              </p>
            </div>

            <button
              onClick={shareReferralLink}
              className="mt-5 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              📤 Пригласить в Telegram
            </button>

            <button
              onClick={copyReferralLink}
              className="mt-3 w-full rounded-2xl bg-[#0a0f1c] py-4 text-lg font-bold text-white active:scale-95"
            >
              🔗 Скопировать ссылку
            </button>

            {copySuccessVisible && (
              <p className="mt-3 rounded-2xl bg-emerald-500/10 py-2 text-sm font-bold text-emerald-400">
                ✅ Ссылка скопирована
              </p>
            )}
          </div>
        </div>
      )}

      {rewardPopupVisible && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-yellow-400/30 bg-[#111827] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl">
              🎉
            </div>

            <h2 className="text-2xl font-bold text-white">
              Получены награды
            </h2>

            <div className="mt-5 space-y-3">
              {rewardPopupItems.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl bg-[#0a0f1c] p-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="truncate text-sm font-bold text-white">
                        {item.title}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-yellow-400">
                      +{formatOnix(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setRewardPopupVisible(false);
                setRewardPopupItems([]);
              }}
              className="mt-6 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-bold text-black active:scale-95"
            >
              Забрать
            </button>
          </div>
        </div>
      )}

      {offlineRewardVisible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-yellow-400/30 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl shadow-lg">
              ⛏️
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Майнер заработал
            </h3>

            <p className="text-gray-400 mb-4">
              {offlineRewardTime
                ? `Пока вас не было ${offlineRewardTime}`
                : 'Пока вас не было'}
            </p>

            <p className="text-4xl font-bold text-yellow-400 mb-6">
              +{offlineRewardAmount.toLocaleString('ru-RU')} ONIX
            </p>

            <button
              onClick={claimOfflineReward}
              disabled={isClaimingOfflineReward}
              className={`w-full rounded-2xl py-4 text-lg font-bold text-black transition ${
                isClaimingOfflineReward
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-yellow-400 active:scale-95'
              }`}
            >
              {isClaimingOfflineReward ? 'Забираем...' : 'Забрать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AppWithBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

export default AppWithBoundary;