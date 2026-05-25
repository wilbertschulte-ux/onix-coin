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

function getTelegramId() {
  const tg = window.Telegram?.WebApp;

  if (!tg) return '';

  return tg.initDataUnsafe?.user?.id?.toString() || '';
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

  const [lastRewardDate, setLastRewardDate] = useState('');
  const [activeBoost, setActiveBoost] = useState<'none' | 'tap' | 'mining'>('none');
  const [boostEndTime, setBoostEndTime] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyCooldown, setDailyCooldown] = useState(0);
  const [channelJoined, setChannelJoined] = useState(false);

  const [tapLevel, setTapLevel] = useState(1);
  const [minerLevel, setMinerLevel] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [rechargeLevel, setRechargeLevel] = useState(1);

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

    const savedDate = localStorage.getItem('lastRewardDate');
    if (savedDate) setLastRewardDate(savedDate);
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

const lastDaily =
  user.dailyRewardLastClaim || user.lastDailyRewardDate;

if (lastDaily) {
  const lastClaim = new Date(
  lastDaily
).getTime();

  const now = Date.now();

  const diff =
    24 * 60 * 60 * 1000 - (now - lastClaim);

  if (diff > 0) {
    setDailyCooldown(diff);
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

        const oldRefs = Number(localStorage.getItem('knownReferrals') || 0);
        const newRefs = user.referralsCount || 0;

        if (newRefs > oldRefs) {
  alert(
    `🎉 По вашей ссылке перешёл ${user.lastReferralUsername || 'новый пользователь'}! Вы получили +5000 ONIX`
  );
}

        localStorage.setItem('knownReferrals', newRefs.toString());

if (
  user.referredBy &&
  !localStorage.getItem(
    `referralWelcomeShown_${user.telegramId}`
  )
) {
  alert(
    `🎁 Вы получили +1000 ONIX за вход по ссылке пользователя ${user.referredByUsername || 'друга'}!`
  );

  localStorage.setItem(
    `referralWelcomeShown_${user.telegramId}`,
    'true'
  );
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
    localStorage.setItem('lastRewardDate', lastRewardDate);
  }, [lastRewardDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier =
        activeBoost === 'mining' && Date.now() < boostEndTime ? 2 : 1;

      const income = Math.floor(autoclickers * multiplier);

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

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const multiplier =
      activeBoost === 'tap' && Date.now() < boostEndTime ? 2 : 1;

    const points = tapPower * multiplier;

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

    const newBalance = balance + points;
    const newTotalEarned = totalEarned + points;
    const newEnergy = Math.max(0, energy - 1);
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

    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 60);

    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
    } catch {}
  };

  const buyUpgrade = (type: 'tap' | 'energy' | 'recharge' | 'miner') => {
    let cost = 0;

    if (type === 'tap') cost = tapLevel * 150;
    if (type === 'energy') cost = energyLevel * 200;
    if (type === 'recharge') cost = rechargeLevel * 180;
    if (type === 'miner') cost = minerLevel * 300;

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

  const activateBoost = (
    type: 'tap' | 'mining',
    minutes: number,
    cost: number
  ) => {
    if (balance < cost) {
      alert('Недостаточно ONIX!');
      return;
    }

    const newBalance = balance - cost;

    setBalance(newBalance);
    setActiveBoost(type);
    setBoostEndTime(Date.now() + minutes * 60000);

    saveProgress({
      balance: newBalance,
      energy,
      maxEnergy,
      tapPower,
      energyRecharge,
      autoclickers,
      totalEarned,
      level,
      referralsCount,
      tapLevel,
      minerLevel,
      energyLevel,
      rechargeLevel,
    });

    try {
      WebApp.HapticFeedback?.notificationOccurred('success');
    } catch {}

    alert(`⚡ ${type === 'tap' ? 'Тап' : 'Майнинг'} ×2 на ${minutes} минут!`);
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

  const progress = ((totalEarned % coinsPerLevel) / coinsPerLevel) * 100;
  const isBoostActive = Date.now() < boostEndTime;

useEffect(() => {
  if (dailyCooldown <= 0) return;

  const timer = setInterval(() => {
    setDailyCooldown((prev) => {
      if (prev <= 1000) {
        clearInterval(timer);
        return 0;
      }

      return prev - 1000;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [dailyCooldown]);

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  return `${hours}ч ${minutes}м ${seconds}с`;
};

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
            {totalEarned.toLocaleString('ru-RU')} /{' '}
            {(level * coinsPerLevel).toLocaleString('ru-RU')}
          </span>
        </div>

        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${progress}%` }}
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
          <div>
            <h2 className="text-2xl font-bold mb-4">Постоянные улучшения</h2>

            <div className="space-y-3">
              <div onClick={() => buyUpgrade('tap')} className="shop-item">
                🎯 Сила тапа — ур. {tapLevel} — цена {tapLevel * 150} ONIX
              </div>

              <div onClick={() => buyUpgrade('miner')} className="shop-item">
                ⛏️ Майнер — ур. {minerLevel} — цена {minerLevel * 300} ONIX
              </div>

              <div onClick={() => buyUpgrade('energy')} className="shop-item">
                🔋 Энергия — ур. {energyLevel} — цена {energyLevel * 200} ONIX
              </div>

              <div onClick={() => buyUpgrade('recharge')} className="shop-item">
                ⚡ Восстановление — ур. {rechargeLevel} — цена{' '}
                {rechargeLevel * 180} ONIX
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">⚡ Временные бусты</h2>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => activateBoost('tap', 10, 300)}
                className="shop-item"
              >
                🎯 ×2 Тап — 10 мин — 300 ONIX
              </div>

              <div
                onClick={() => activateBoost('mining', 15, 500)}
                className="shop-item"
              >
                ⛏️ ×2 Майнинг — 15 мин — 500 ONIX
              </div>
            </div>
          </div>
        </div>
      )}

            {activeTab === 'tasks' && (
  <div className="px-5 mt-8 space-y-4">
    <h2 className="text-2xl font-bold mb-6">
      📋 Задания
    </h2>

    {/* DAILY */}
    <div
      onClick={async () => {
        if (dailyCooldown > 0) return;

        try {
          const response = await axios.post(
            `${API_URL}/claim-task`,
            {
              telegramId: getTelegramId(),
              task: 'daily',
            }
          );

          const user = response.data;

          setBalance(user.balance);
          setTotalEarned(user.totalEarned);

          setDailyCooldown(24 * 60 * 60 * 1000);

          alert(
            `🎁 Вы получили +${
              500 + user.level * 100
            } ONIX`
          );
        } catch (error: any) {
          alert(
            error?.response?.data?.message
          );
        }
      }}
      className={`shop-item ${
        dailyCooldown > 0
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
    >
      <div>
        <p className="font-bold">
          🎁 Ежедневная награда
        </p>

        <p className="text-gray-400">
          +{500 + level * 100} ONIX
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        {dailyCooldown > 0
          ? formatTime(dailyCooldown)
          : 'Забрать'}
      </span>
    </div>

    {/* CHANNEL */}
    <div
      onClick={async () => {
        if (
          completedTasks.includes('channel')
        )
          return;

        if (!channelJoined) {
  localStorage.setItem('channelJoined', 'true');
  setChannelJoined(true);

  window.location.href = 'https://t.me/+LEfKu_gQS_o4YTVh';

  return;
}

        try {
          const response = await axios.post(
            `${API_URL}/claim-task`,
            {
              telegramId: getTelegramId(),
              task: 'channel',
            }
          );

          const user = response.data;

          setBalance(user.balance);
          setTotalEarned(user.totalEarned);

          setCompletedTasks(
            user.completedTasks || []
          );

          alert(
            '🎉 Подписка подтверждена! +2000 ONIX'
          );
        } catch (error: any) {
          alert(
            error?.response?.data?.message
          );
        }
      }}
      className={`shop-item ${
        completedTasks.includes('channel')
          ? 'opacity-50'
          : ''
      }`}
    >
      <div>
        <p className="font-bold">
          📢 Подписаться на канал
        </p>

        <p className="text-gray-400">
          +2000 ONIX
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        {completedTasks.includes(
          'channel'
        )
          ? 'Выполнено'
          : channelJoined
          ? 'Проверить'
          : 'Перейти'}
      </span>
    </div>

    {/* INVITE FRIEND */}
    <div
      onClick={async () => {
        if (
          completedTasks.includes(
            'inviteFriend'
          )
        )
          return;

        if (referralsCount < 1) {
          const link = `https://t.me/coinonix_bot/onix?startapp=${getTelegramId()}`;

          navigator.clipboard.writeText(
            link
          );

          alert(
            '🔗 Ссылка скопирована! Пригласите друга.'
          );

          return;
        }

        try {
          const response = await axios.post(
            `${API_URL}/claim-task`,
            {
              telegramId: getTelegramId(),
              task: 'inviteFriend',
            }
          );

          const user = response.data;

          setBalance(user.balance);
          setTotalEarned(user.totalEarned);

          setCompletedTasks(
            user.completedTasks || []
          );

          alert(
            '🎉 Вы получили +3000 ONIX!'
          );
        } catch (error: any) {
          alert(
            error?.response?.data?.message
          );
        }
      }}
      className={`shop-item ${
  completedTasks.includes('inviteFriend')
    ? 'opacity-50 cursor-not-allowed'
    : ''
}`}
    >
      <div>
        <p className="font-bold">
          👥 Пригласить друга
        </p>

        <p className="text-gray-400">
          +3000 ONIX
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        {completedTasks.includes(
          'inviteFriend'
        )
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
    </div>
  );
}

export default App;