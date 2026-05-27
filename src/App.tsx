import { useState, useEffect } from 'react';
import { Coins, Zap, Trophy, Home, Star, Wallet, UserCircle } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

type Tab = 'home' | 'boosts' | 'tasks' | 'friends' | 'wallet';

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
  if (type.includes('withdrawal')) return '💸';

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
  const [dailyCooldown, setDailyCooldown] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}
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

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось купить улучшение');
    }
  };


  const buyPerk = async (perkId: 'offline_pro' | 'energy_saver' | 'daily_plus' | 'miner_plus') => {
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

    const confirmed = window.confirm(
      `Создать заявку на вывод ${formatOnix(minWithdrawOnix)} ONIX?`
    );

    if (!confirmed) return;

    try {
      setIsWithdrawalLoading(true);

      const response = await axios.post(`${API_URL}/request-withdrawal`, {
        telegramId,
        amount: minWithdrawOnix,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setTransactions(user.transactions || []);
      setWithdrawalRequests(user.withdrawalRequests || []);
      showToast('✅ Заявка на вывод создана', 'success');
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
  const minerBaseMultiplier = ownedPerks.includes('miner_plus') ? 1.05 : 1;
  const minerIncomePerSecond = Number(
    (autoclickers * minerBaseMultiplier * miningMultiplier).toFixed(2)
  );
  const minerIncomePerHour = minerIncomePerSecond * 60 * 60;
  const hasOfflinePro = ownedPerks.includes('offline_pro');
  const hasEnergySaver = ownedPerks.includes('energy_saver');
  const hasDailyPlus = ownedPerks.includes('daily_plus');
  const hasMinerPlus = ownedPerks.includes('miner_plus');

  const offlineProCost = 100000;
  const energySaverCost = 150000;
  const dailyPlusCost = 200000;
  const minerPlusCost = 250000;

  const effectiveTapEnergyCost = Math.max(
    1,
    Number((tapPower * (hasEnergySaver ? 0.9 : 1)).toFixed(2))
  );
  const baseDailyPreview = getDailyReward(level);
  const effectiveDailyPreview = Math.round(
    baseDailyPreview * (hasDailyPlus ? 1.1 : 1)
  );
  const maxOfflineHours = hasOfflinePro ? 4 : 3;
  const maxOfflineIncome = minerIncomePerSecond * maxOfflineHours * 60 * 60;

  const nextTapCost = getTapUpgradeCost(tapLevel);
  const nextMinerCost = getMinerUpgradeCost(minerLevel);
  const nextEnergyCost = getEnergyUpgradeCost(energyLevel);
  const nextRechargeCost = getRechargeUpgradeCost(rechargeLevel);

  const minerUpgradeProgress = Math.min((balance / nextMinerCost) * 100, 100);
  const nextMinerIncomePerSecond = Number(
    ((autoclickers + 0.5) * miningMultiplier).toFixed(2)
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
      description: 'Пассивный доход онлайн и оффлайн',
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
      description: 'Больше максимальной энергии для тапов',
      level: energyLevel,
      cost: nextEnergyCost,
      currentLabel: 'Сейчас',
      currentValue: `${maxEnergy.toLocaleString('ru-RU')} энергии`,
      nextLabel: 'После апгрейда',
      nextValue: `${(maxEnergy + 100).toLocaleString('ru-RU')} энергии`,
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
  const minWithdrawEur = minWithdrawOnix * onixEurRate;
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
      (hasDailyPlus ? 1.1 : 1)
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

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-20">
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
      <div className="bg-[#111827] p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Coins className="w-9 h-9 text-yellow-400" />
          <h1 className="text-2xl font-bold">ONIX COIN</h1>
        </div>

        <div className="flex items-center gap-2 bg-[#1f2937] px-4 py-1 rounded-full">
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
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${Math.min(rankProgress, 100)}%` }}
          />
        </div>
      </div>

      <div className="text-center pt-6 pb-4">
        <p className="text-gray-400 text-sm">Баланс</p>

        <p className="text-6xl font-bold text-yellow-400 tracking-tighter">
          {balance.toLocaleString('ru-RU')}
        </p>

        {isBoostActive && (
          <p className="text-emerald-400 text-sm mt-1">⚡ Буст активен</p>
        )}
      </div>

      <div className="mx-4 bg-[#111827] p-1 rounded-2xl flex sticky top-16 z-50">
        {[
          { id: 'home', label: 'Главная', icon: Home },
          { id: 'boosts', label: 'Улучшения', icon: Zap },
          { id: 'tasks', label: 'Задания', icon: Trophy },
          { id: 'friends', label: 'Профиль', icon: UserCircle },
          { id: 'wallet', label: 'Кошелёк', icon: Wallet },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#1e2937] text-yellow-400'
                : 'text-gray-400'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && (
        <div className="flex flex-col items-center mt-8 relative">
          <div
            onClick={handleTap}
            className={`w-80 h-80 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center text-[170px] cursor-pointer border-8 border-yellow-400 shadow-2xl transition-transform relative ${
              isTapped ? 'scale-90' : ''
            }`}
          >
            🪙

            {floatingNumbers.map((num) => (
              <div
                key={num.id}
                className="absolute text-3xl font-bold text-yellow-200 animate-float"
                style={{ left: num.x - 20, top: num.y - 30 }}
              >
                +{num.value}
              </div>
            ))}
          </div>

          <p className="mt-8 text-xl text-gray-400">
            {energy > 0 ? 'ТАПАЙ МОНЕТУ!' : 'Энергия восстанавливается...'}
          </p>
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



          <div>
            <h2 className="text-2xl font-bold mb-4">🧩 Перки</h2>

            <div className="space-y-4">
              {[
                {
                  id: 'offline_pro' as const,
                  icon: '🧲',
                  title: 'Offline Pro',
                  description: 'Увеличивает максимум оффлайн-дохода с 3 до 4 часов',
                  cost: offlineProCost,
                  owned: hasOfflinePro,
                  current: hasOfflinePro ? '4 часа' : '3 часа',
                  next: '4 часа оффлайн',
                },
                {
                  id: 'energy_saver' as const,
                  icon: '🔋',
                  title: 'Energy Saver',
                  description: 'Снижает расход энергии на тап на 10%',
                  cost: energySaverCost,
                  owned: hasEnergySaver,
                  current: `${formatOnix(effectiveTapEnergyCost)} энергии/тап`,
                  next: `${formatOnix(Math.max(1, tapPower * 0.9))} энергии/тап`,
                },
                {
                  id: 'daily_plus' as const,
                  icon: '🎁',
                  title: 'Daily Plus',
                  description: 'Увеличивает ежедневную награду на 10%',
                  cost: dailyPlusCost,
                  owned: hasDailyPlus,
                  current: `+${formatOnix(effectiveDailyPreview)} ONIX`,
                  next: `+${formatOnix(Math.round(baseDailyPreview * 1.1))} ONIX`,
                },
                {
                  id: 'miner_plus' as const,
                  icon: '⛏️',
                  title: 'Miner Plus',
                  description: 'Увеличивает доход майнера на 5% навсегда',
                  cost: minerPlusCost,
                  owned: hasMinerPlus,
                  current: `+${formatOnix(minerIncomePerSecond)} ONIX/сек`,
                  next: `+${formatOnix(Number((autoclickers * 1.05 * miningMultiplier).toFixed(2)))} ONIX/сек`,
                },
              ].map((perk) => (
                <div
                  key={perk.id}
                  className={`rounded-3xl border p-5 shadow-xl ${
                    perk.owned
                      ? 'border-emerald-400/30 bg-emerald-500/10'
                      : 'border-yellow-400/20 bg-[#111827]'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                          perk.owned ? 'bg-emerald-400' : 'bg-yellow-400'
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
                      <p className="text-xs text-gray-400">Тип</p>
                      <p className="font-bold text-yellow-400">Навсегда</p>
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
                      <p className="text-xs text-gray-400">После покупки</p>
                      <p className="mt-1 text-sm font-bold text-emerald-400">
                        {perk.next}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => buyPerk(perk.id)}
                    disabled={perk.owned || balance < perk.cost}
                    className={`mt-4 w-full rounded-2xl py-4 text-lg font-bold transition ${
                      perk.owned
                        ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                        : balance >= perk.cost
                        ? 'bg-yellow-400 text-black active:scale-95'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {perk.owned
                      ? 'Куплено'
                      : balance >= perk.cost
                      ? `Купить за ${perk.cost.toLocaleString('ru-RU')} ONIX`
                      : `Не хватает ${(perk.cost - balance).toLocaleString('ru-RU')} ONIX`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Постоянные улучшения</h2>

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

          <div>
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
                setTransactions(user.transactions || []);
                setAchievements(user.achievements || response.data.achievements || ACHIEVEMENTS);
                showRewardPopupFromResponse(response.data);
      showReferralBonusPaidToast(response.data);

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

          {seasonHistory.length > 0 && (
            <div className="rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 text-left shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-white">📜 История сезонов</h3>

              <div className="space-y-3">
                {seasonHistory.slice(0, 5).map((season) => (
                  <div key={season.week} className="rounded-2xl bg-[#0a0f1c] p-4">
                    <p className="font-bold text-yellow-400">{season.week}</p>

                    <div className="mt-2 space-y-1">
                      {season.winners.map((winner) => (
                        <p key={`${season.week}-${winner.place}`} className="text-sm text-gray-300">
                          #{winner.place} {winner.username} · +{formatOnix(winner.prize)} ONIX
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <p className="text-sm text-gray-400">Баланс и будущий вывод ONIX</p>
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
                Минимальный вывод ≈ {minWithdrawEur.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} €
              </p>
            </div>


            <div className="mt-5 rounded-2xl bg-[#0a0f1c] p-4">
    
          {withdrawalRequests.length > 0 && (
            <div className="mt-6 rounded-3xl border border-yellow-400/20 bg-[#111827] p-5 shadow-xl">
              <h3 className="text-xl font-bold text-white">💸 Заявки на вывод</h3>

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
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">История операций</h3>
                <span className="text-xs text-gray-500">последние 20</span>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 20).map((transaction, index) => {
                    const isIncome = Number(transaction.amount || 0) >= 0;

                    return (
                      <div
                        key={`${transaction.createdAt || index}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-[#111827] p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a0f1c] text-xl">
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
                <p className="text-sm text-gray-500">
                  Пока операций нет. Здесь будут отображаться награды, покупки, бонусы и будущие выводы.
                </p>
              )}
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

            <p className="mt-4 text-center text-xs text-gray-500">
              Раздел вывода находится в подготовке. Сейчас это расчётный баланс по ориентировочному курсу.
            </p>
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

export default App;