import { useState, useEffect } from 'react';
import { Coins, Zap, Trophy, Users, Home, Star } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

type Tab = 'home' | 'boosts' | 'tasks' | 'friends';

type FloatingNumber = {
  id: number;
  x: number;
  y: number;
  value: number;
};

const API_URL = 'https://onix-coin.onrender.com/api/coins';
const DAY_MS = 24 * 60 * 60 * 1000;

function getTelegramId() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return '';
  return tg.initDataUnsafe?.user?.id?.toString() || '';
}

function normalizeBoost(value: unknown): 'none' | 'tap' | 'mining' {
  const boost = String(value || 'none').trim();

  if (boost === 'tap') return 'tap';
  if (boost === 'mining' || boost === 'miner') return 'mining';

  return 'none';
}

function App() {
  const [balance, setBalance] = useState(0);
  const [energy, setEnergy] = useState(2000);
  const [maxEnergy, setMaxEnergy] = useState(2000);
  const [tapPower, setTapPower] = useState(1);
  const [energyRecharge, setEnergyRecharge] = useState(10);
  const [autoclickers, setAutoclickers] = useState(0);
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
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyCooldown, setDailyCooldown] = useState(0);
  const [channelJoined, setChannelJoined] = useState(false);

  const [tapLevel, setTapLevel] = useState(1);
  const [minerLevel, setMinerLevel] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [rechargeLevel, setRechargeLevel] = useState(1);

  const [offlineRewardVisible, setOfflineRewardVisible] = useState(false);
  const [offlineRewardAmount, setOfflineRewardAmount] = useState(0);
  const [offlineRewardTime, setOfflineRewardTime] = useState('');
  const [isClaimingOfflineReward, setIsClaimingOfflineReward] = useState(false);

  const coinsPerLevel = 500;

  const saveProgress = async (data: {
    balance: number;
    energy: number;
    maxEnergy: number;
    tapPower: number;
    energyRecharge: number;
    autoclickers: number;
    totalEarned: number;
    level: number;
    referralsCount: number;
    tapLevel: number;
    minerLevel: number;
    energyLevel: number;
    rechargeLevel: number;
  }) => {
    try {
      await axios.post(`${API_URL}/save`, {
        telegramId: getTelegramId(),
        data,
      });
    } catch (error) {
      console.log('Ошибка сохранения:', error);
    }
  };

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}
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
        setEnergy(user.energy || 2000);
        setMaxEnergy(user.maxEnergy || 2000);
        setTapPower(user.tapPower || 1);
        setEnergyRecharge(user.energyRecharge || 10);
        setAutoclickers(user.autoclickers || 0);
        setTotalEarned(user.totalEarned || 0);
        setLevel(user.level || 1);
        setReferralsCount(user.referralsCount || 0);
        setCompletedTasks(user.completedTasks || []);
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
          alert(
            `🎉 По вашей ссылке перешёл ${
              user.lastReferralUsername || 'новый пользователь'
            }! Вы получили +5000 ONIX`
          );
        }

        localStorage.setItem('knownReferrals', newRefs.toString());

        if (
          user.referredBy &&
          !localStorage.getItem(`referralWelcomeShown_${user.telegramId}`)
        ) {
          alert(
            `🎁 Вы получили +1000 ONIX за вход по ссылке пользователя ${
              user.referredByUsername || 'друга'
            }!`
          );

          localStorage.setItem(`referralWelcomeShown_${user.telegramId}`, 'true');
        }

        setTapLevel(user.tapLevel || 1);
        setMinerLevel(user.minerLevel || 1);
        setEnergyLevel(user.energyLevel || 1);
        setRechargeLevel(user.rechargeLevel || 1);
      } catch (error) {
        console.log('Ошибка загрузки пользователя:', error);
      }
    };

    loadUser();
  }, []);

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
    const interval = setInterval(() => {
      const now = Date.now();
      const currentBoost = normalizeBoost(activeBoost);
      const currentBoostEndTime = Number(boostEndTime || 0);

      const isMiningBoostActive =
        currentBoost === 'mining' && currentBoostEndTime > now;

      if (
        currentBoost !== 'none' &&
        currentBoostEndTime > 0 &&
        currentBoostEndTime <= now
      ) {
        setActiveBoost('none');
        setBoostEndTime(0);
      }

      const multiplier = isMiningBoostActive ? 2 : 1;
      const income = Math.floor(Number(autoclickers || 0) * multiplier);

      if (income > 0) {
        const newBalance = balance + income;
        const newTotalEarned = totalEarned + income;
        const newEnergy = Math.min(maxEnergy, energy + energyRecharge);
        const newLevel = Math.floor(newTotalEarned / coinsPerLevel) + 1;

        setBalance(newBalance);
        setTotalEarned(newTotalEarned);
        setEnergy(newEnergy);
        setLevel(newLevel);

        saveProgress({
          balance: newBalance,
          energy: newEnergy,
          maxEnergy,
          tapPower,
          energyRecharge,
          autoclickers,
          totalEarned: newTotalEarned,
          level: newLevel,
          referralsCount,
          tapLevel,
          minerLevel,
          energyLevel,
          rechargeLevel,
        });
      } else {
        setEnergy((prev) => Math.min(maxEnergy, prev + energyRecharge));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    balance,
    energy,
    maxEnergy,
    energyRecharge,
    autoclickers,
    totalEarned,
    activeBoost,
    boostEndTime,
    tapPower,
    referralsCount,
    tapLevel,
    minerLevel,
    energyLevel,
    rechargeLevel,
  ]);

  const handleTap = async (e: React.MouseEvent<HTMLDivElement>) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      alert('Не удалось получить Telegram ID');
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
      const points = response.data.points || user.tapPower || tapPower || 1;

      setBalance(user.balance || 0);
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy || 2000);
      setTapPower(user.tapPower || 1);
      setEnergyRecharge(user.energyRecharge || 10);
      setAutoclickers(user.autoclickers || 0);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setCompletedTasks(user.completedTasks || []);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);

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

  const buyUpgrade = (type: 'tap' | 'energy' | 'recharge' | 'miner') => {
    let cost = 0;

    if (type === 'tap') cost = (tapLevel + 1) * 150;
    if (type === 'energy') cost = (energyLevel + 1) * 200;
    if (type === 'recharge') cost = (rechargeLevel + 1) * 180;
    if (type === 'miner') cost = (minerLevel + 1) * 300;

    if (balance < cost) {
      alert('Недостаточно ONIX!');
      return;
    }

    const newBalance = balance - cost;

    let newTapPower = tapPower;
    let newMaxEnergy = maxEnergy;
    let newEnergyRecharge = energyRecharge;
    let newAutoclickers = autoclickers;

    let newTapLevel = tapLevel;
    let newMinerLevel = minerLevel;
    let newEnergyLevel = energyLevel;
    let newRechargeLevel = rechargeLevel;

    if (type === 'tap') {
      newTapLevel += 1;
      newTapPower += 1;
    }

    if (type === 'energy') {
      newEnergyLevel += 1;
      newMaxEnergy += 500;
    }

    if (type === 'recharge') {
      newRechargeLevel += 1;
      newEnergyRecharge += 5;
    }

    if (type === 'miner') {
      newMinerLevel += 1;
      newAutoclickers += 2;
    }

    setBalance(newBalance);
    setTapPower(newTapPower);
    setMaxEnergy(newMaxEnergy);
    setEnergyRecharge(newEnergyRecharge);
    setAutoclickers(newAutoclickers);

    setTapLevel(newTapLevel);
    setMinerLevel(newMinerLevel);
    setEnergyLevel(newEnergyLevel);
    setRechargeLevel(newRechargeLevel);

    saveProgress({
      balance: newBalance,
      energy,
      maxEnergy: newMaxEnergy,
      tapPower: newTapPower,
      energyRecharge: newEnergyRecharge,
      autoclickers: newAutoclickers,
      totalEarned,
      level,
      referralsCount,
      tapLevel: newTapLevel,
      minerLevel: newMinerLevel,
      energyLevel: newEnergyLevel,
      rechargeLevel: newRechargeLevel,
    });

    try {
      WebApp.HapticFeedback?.notificationOccurred('success');
    } catch {}
  };

  const activateBoost = async (
    type: 'tap' | 'mining',
    _minutes: number,
    _cost: number
  ) => {
    const telegramId = getTelegramId();

    if (!telegramId) {
      alert('Не удалось получить Telegram ID');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/activate-boost`, {
        telegramId,
        type,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy || 2000);
      setTapPower(user.tapPower || 1);
      setEnergyRecharge(user.energyRecharge || 10);
      setAutoclickers(user.autoclickers || 0);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setCompletedTasks(user.completedTasks || []);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}

      alert(`⚡ ${type === 'tap' ? 'Тап' : 'Майнинг'} ×2 активирован!`);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Не удалось активировать буст');
    }
  };

  const copyReferralLink = async () => {
    const telegramId = getTelegramId();

    const link = telegramId
      ? `https://t.me/coinonix_bot/onix?startapp=${telegramId}`
      : 'https://t.me/coinonix_bot/onix';

    try {
      await navigator.clipboard.writeText(link);
      alert(`✅ Ссылка скопирована в буфер обмена:\n\n${link}`);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      alert(`✅ Ссылка скопирована в буфер обмена:\n\n${link}`);
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
      alert('Не удалось получить Telegram ID');
      return;
    }

    try {
      setIsClaimingOfflineReward(true);

      const response = await axios.post(`${API_URL}/claim-offline-income`, {
        telegramId,
      });

      const user = response.data.user;

      setBalance(user.balance || 0);
      setEnergy(user.energy || 0);
      setMaxEnergy(user.maxEnergy || 2000);
      setTapPower(user.tapPower || 1);
      setEnergyRecharge(user.energyRecharge || 10);
      setAutoclickers(user.autoclickers || 0);
      setTotalEarned(user.totalEarned || 0);
      setLevel(user.level || 1);
      setReferralsCount(user.referralsCount || 0);
      setCompletedTasks(user.completedTasks || []);
      setActiveBoost(normalizeBoost(user.activeBoost));
      setBoostEndTime(Number(user.boostEndTime || 0));

      setTapLevel(user.tapLevel || 1);
      setMinerLevel(user.minerLevel || 1);
      setEnergyLevel(user.energyLevel || 1);
      setRechargeLevel(user.rechargeLevel || 1);

      setOfflineRewardVisible(false);
      setOfflineRewardAmount(0);
      setOfflineRewardTime('');

      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch {}
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Не удалось забрать доход майнера');
    } finally {
      setIsClaimingOfflineReward(false);
    }
  };

  const currentLevelCoins = totalEarned - (level - 1) * coinsPerLevel;
  const progress = (currentLevelCoins / coinsPerLevel) * 100;
  const activeBoostValue = normalizeBoost(activeBoost);
  const normalizedBoostEndTime = Number(boostEndTime || 0);
  const isBoostActive =
    activeBoostValue !== 'none' && Date.now() < normalizedBoostEndTime;

  const miningMultiplier =
    activeBoostValue === 'mining' && isBoostActive ? 2 : 1;
  const minerIncomePerSecond = Math.floor(autoclickers * miningMultiplier);
  const minerIncomePerHour = minerIncomePerSecond * 60 * 60;
  const maxOfflineHours = 3;
  const maxOfflineIncome = minerIncomePerSecond * maxOfflineHours * 60 * 60;

  const nextTapCost = (tapLevel + 1) * 150;
  const nextMinerCost = (minerLevel + 1) * 300;
  const nextEnergyCost = (energyLevel + 1) * 200;
  const nextRechargeCost = (rechargeLevel + 1) * 180;

  const minerUpgradeProgress = Math.min((balance / nextMinerCost) * 100, 100);
  const nextMinerIncomePerSecond = Math.floor(
    (autoclickers + 2) * miningMultiplier
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
      currentValue: `+${tapPower.toLocaleString('ru-RU')} ONIX/тап`,
      nextLabel: 'После апгрейда',
      nextValue: `+${(tapPower + 1).toLocaleString('ru-RU')} ONIX/тап`,
    },
    {
      type: 'miner',
      icon: '⛏️',
      title: 'Майнер',
      description: 'Пассивный доход онлайн и оффлайн',
      level: minerLevel,
      cost: nextMinerCost,
      currentLabel: 'Сейчас',
      currentValue: `+${minerIncomePerSecond.toLocaleString('ru-RU')} ONIX/сек`,
      nextLabel: 'После апгрейда',
      nextValue: `+${nextMinerIncomePerSecond.toLocaleString('ru-RU')} ONIX/сек`,
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
      currentValue: `+${energyRecharge.toLocaleString('ru-RU')} энергии/сек`,
      nextLabel: 'После апгрейда',
      nextValue: `+${(energyRecharge + 5).toLocaleString('ru-RU')} энергии/сек`,
    },
  ];

  const boostRemainingMs = Math.max(boostEndTime - Date.now(), 0);
  const boostTimeLeft = boostRemainingMs > 0 ? formatTime(boostRemainingMs) : '';
  const isAnyBoostActive = isBoostActive && activeBoost !== 'none';

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
      cost: 300,
      isActive: isBoostActive && activeBoostValue === 'tap',
    },
    {
      type: 'mining',
      icon: '⛏️',
      title: 'Буст майнинга',
      description: 'Удваивает доход майнера онлайн',
      multiplier: '×2',
      durationMinutes: 15,
      cost: 500,
      isActive: isBoostActive && activeBoostValue === 'mining',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-20">
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
            <span className="font-bold">Уровень {level}</span>
          </div>

          <span className="text-sm text-gray-400">
            {currentLevelCoins.toLocaleString('ru-RU')} /{' '}
            {coinsPerLevel.toLocaleString('ru-RU')}
          </span>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
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
          { id: 'friends', label: 'Друзья', icon: Users },
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
                  +{minerIncomePerSecond.toLocaleString('ru-RU')}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0a0f1c] p-4">
                <p className="text-xs text-gray-400">Доход в час</p>
                <p className="mt-1 text-lg font-bold text-yellow-400">
                  +{minerIncomePerHour.toLocaleString('ru-RU')}
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
                  +{maxOfflineIncome.toLocaleString('ru-RU')}
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
                  +{minerIncomeIncrease.toLocaleString('ru-RU')} ONIX/сек
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
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                setDailyCooldown(cooldown);

                localStorage.setItem(
                  'dailyCooldownEnd',
                  (Date.now() + cooldown).toString()
                );

                alert(`🎁 Вы получили +${500 + user.level * 100} ONIX`);
              } catch (error: any) {
                alert(error?.response?.data?.message || 'Ошибка получения награды');
              }
            }}
            className={`shop-item ${
              dailyCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div>
              <p className="font-bold">🎁 Ежедневная награда</p>
              <p className="text-gray-400">+{500 + level * 100} ONIX</p>
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
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                setCompletedTasks(user.completedTasks || []);

                alert('🎉 Подписка подтверждена! +2000 ONIX');
              } catch (error: any) {
                alert(error?.response?.data?.message || 'Сначала подпишитесь на канал');
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
              <p className="text-gray-400">+2000 ONIX</p>
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
                const currentTelegramId =
                  window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() ||
                  getTelegramId();

                if (!currentTelegramId) {
                  alert('Не удалось получить Telegram ID');
                  return;
                }

                const link = `https://t.me/coinonix_bot/onix?startapp=${currentTelegramId}`;

                try {
                  await navigator.clipboard.writeText(link);
                } catch {}

                alert('🔗 Ссылка скопирована! Пригласите друга.');
                return;
              }

              try {
                const response = await axios.post(`${API_URL}/claim-task`, {
                  telegramId: getTelegramId(),
                  task: 'inviteFriend',
                });

                const user = response.data;

                setBalance(user.balance);
                setTotalEarned(user.totalEarned);
                setLevel(user.level);
                setCompletedTasks(user.completedTasks || []);

                alert('🎉 Вы получили +3000 ONIX!');
              } catch (error: any) {
                alert(error?.response?.data?.message || 'Сначала пригласите друга');
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
              <p className="text-gray-400">+3000 ONIX</p>
            </div>

            <span className="text-emerald-400 font-bold">
              {completedTasks.includes('inviteFriend')
                ? 'Выполнено'
                : referralsCount >= 1
                ? 'Забрать'
                : 'Пригласить'}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="px-5 mt-8 text-center">
          <Users className="w-16 h-16 mx-auto text-yellow-400 mb-4" />

          <h2 className="text-2xl font-bold mb-2">Приглашай друзей</h2>

          <p className="text-gray-400 mb-6">
            Получай бонусы за каждого приглашённого
          </p>

          <button
            onClick={copyReferralLink}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl text-lg active:scale-95 transition"
          >
            🔗 Поделиться реф. ссылкой
          </button>

          <p className="mt-8 text-lg">
            Приглашено:{' '}
            <span className="text-yellow-400 font-bold">{referralsCount}</span>
          </p>
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