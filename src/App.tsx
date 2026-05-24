import { useState, useEffect } from 'react';
import {
  Coins,
  Zap,
  Trophy,
  Users,
  Home,
  Star,
  Gift,
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

type Tab = 'home' | 'boosts' | 'tasks' | 'friends';
type FloatingNumber = {
  id: number;
  x: number;
  y: number;
  value: number;
};

const API_URL = 'https://onix-coin.onrender.com/api/coins';

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
  const [activeBoost, setActiveBoost] =
    useState<'none' | 'tap' | 'mining'>('none');
  const [boostEndTime, setBoostEndTime] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [tapLevel, setTapLevel] = useState(1);
  const [minerLevel, setMinerLevel] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [rechargeLevel, setRechargeLevel] = useState(1);

  const coinsPerLevel = 500;

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}

    const savedDate = localStorage.getItem('lastRewardDate');
    if (savedDate) setLastRewardDate(savedDate);
  }, []);

  // Загрузка/создание пользователя
  useEffect(() => {
    const loadUser = async () => {
      try {
        const telegramId =
  WebApp?.initDataUnsafe?.user?.id?.toString() || "123456789";

        await axios.post(`${API_URL}/create`, {
          telegramId,
          username: 'test',
        });

        const response = await axios.get(`${API_URL}/${telegramId}`);
        const user = response.data;

        setBalance(user.balance || 0);
        setEnergy(user.energy || 2000);
        setMaxEnergy(user.maxEnergy || 2000);
        setTapPower(user.tapPower || 1);
        setEnergyRecharge(user.energyRecharge || 10);
        setAutoclickers(user.autoclickers || 0);
        setTotalEarned(user.totalEarned || 0);
        setLevel(user.level || 1);
        setReferralsCount(user.referralsCount || 0);
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

  // Сохранение на backend
useEffect(() => {
  const saveUser = async () => {
    try {
      const telegramUser = WebApp.initDataUnsafe.user;

      if (!telegramUser?.id) {
        console.log("Нет telegram id");
        return;
      }

      const telegramId =
  WebApp?.initDataUnsafe?.user?.id?.toString() || "123456789";

      const payload = {
        telegramId,
        data: {
          balance,
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
        },
      };

      console.log("SAVE:", payload);

      await axios.post(
        "https://onix-coin.onrender.com/api/coins/save",
        payload
      );

      console.log("Сохранено");
    } catch (error) {
      console.log("Ошибка сохранения:", error);
    }
  };

  const timeout = setTimeout(() => {
    saveUser();
  }, 500);

  return () => clearTimeout(timeout);
}, [
  balance,
  energy,
  maxEnergy,
 tapPower,
  energyRecharge,
  autoclickers,
  totalEarned,
  level,
  referralsCount,
]);

  useEffect(() => {
    localStorage.setItem('lastRewardDate', lastRewardDate);
  }, [lastRewardDate]);

  // Автоприбыль
  useEffect(() => {
    const interval = setInterval(() => {
      const multiplier =
        activeBoost === 'mining' && Date.now() < boostEndTime ? 2 : 1;

      const income = Math.floor(autoclickers * multiplier);

      if (income > 0) {
        setBalance((prev) => prev + income);
        setTotalEarned((prev) => prev + income);
      }

      setEnergy((prev) => Math.min(maxEnergy, prev + energyRecharge));
    }, 1000);

    return () => clearInterval(interval);
  }, [autoclickers, maxEnergy, energyRecharge, activeBoost, boostEndTime]);

  // Проверка уровня
  useEffect(() => {
    const newLevel = Math.floor(totalEarned / coinsPerLevel) + 1;
    if (newLevel > level) setLevel(newLevel);
  }, [totalEarned, level]);

  const handleTap = (e: React.MouseEvent) => {
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
      setFloatingNumbers((prev) =>
        prev.filter((n) => n.id !== newNum.id)
      );
    }, 700);

    const newBalance = balance + points;
const newTotalEarned = totalEarned + points;
const newEnergy = Math.max(0, energy - 1);

setBalance(newBalance);
setTotalEarned(newTotalEarned);
setEnergy(newEnergy);

axios.post(`${API_URL}/save`, {
  telegramId: "123456789",
  data: {
    balance: newBalance,
    energy: newEnergy,
    maxEnergy,
    tapPower,
    energyRecharge,
    autoclickers,
    totalEarned: newTotalEarned,
    level,
    referralsCount,
    tapLevel,
    minerLevel,
    energyLevel,
    rechargeLevel,
  },
});

    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 60);

    try {
      WebApp.HapticFeedback?.impactOccurred('medium');
    } catch {}
  };

  const claimDailyReward = () => {
    const today = new Date().toISOString().split('T')[0];

    if (lastRewardDate === today) {
      alert('Вы уже получили награду сегодня!');
      return;
    }

    const reward = 500 + level * 100;

    setBalance((prev) => prev + reward);
    setTotalEarned((prev) => prev + reward);
    setLastRewardDate(today);

    try {
      WebApp.HapticFeedback?.notificationOccurred('success');
    } catch {}

    alert(`🎁 Вы получили ${reward} ONIX!`);
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

    setBalance((prev) => prev - cost);
    setActiveBoost(type);
    setBoostEndTime(Date.now() + minutes * 60000);

    try {
      WebApp.HapticFeedback?.notificationOccurred('success');
    } catch {}

    alert(`⚡ ${type === 'tap' ? 'Тап' : 'Майнинг'} ×2 на ${minutes} минут!`);
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

  setBalance(newBalance);

  if (type === 'tap') {
    setTapLevel((prev) => prev + 1);
    setTapPower((prev) => prev + 1);
  }

  if (type === 'energy') {
    setEnergyLevel((prev) => prev + 1);
    setMaxEnergy((prev) => prev + 500);
  }

  if (type === 'recharge') {
    setRechargeLevel((prev) => prev + 1);
    setEnergyRecharge((prev) => prev + 5);
  }

  if (type === 'miner') {
    setMinerLevel((prev) => prev + 1);
    setAutoclickers((prev) => prev + 2);
  }

  try {
    WebApp.HapticFeedback?.notificationOccurred('success');
  } catch {}
};

    alert('✅ Реферальная ссылка скопирована!');
    setReferralsCount((prev) => prev + 1);
  };

  const progress = ((totalEarned % coinsPerLevel) / coinsPerLevel) * 100;
  const isBoostActive = Date.now() < boostEndTime;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pb-20">
      <div className="bg-[#111827] p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Coins className="w-9 h-9 text-yellow-400" />
          <h1 className="text-2xl font-bold">ONIX COIN</h1>
        </div>

        <div className="flex items-center gap-2 bg-[#1f2937] px-4 py-1 rounded-full">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>{Math.floor(energy)}/{maxEnergy}</span>
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
          <p className="text-emerald-400 text-sm mt-1">
            ⚡ Буст активен
          </p>
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
  ⚡ Восстановление — ур. {rechargeLevel} — цена {rechargeLevel * 180} ONIX
</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">⚡ Временные бусты</h2>

            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => activateBoost('tap', 10, 300)} className="shop-item">
                🎯 ×2 Тап (10 мин)
              </div>

              <div onClick={() => activateBoost('mining', 15, 500)} className="shop-item">
                ⛏️ ×2 Майнинг (15 мин)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="px-5 mt-8">
          <h2 className="text-2xl font-bold mb-6">📋 Задания</h2>

          <div
            onClick={claimDailyReward}
            className="shop-item flex justify-between items-center cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-yellow-400" />

              <div>
                <p className="font-bold">Ежедневная награда</p>
                <p className="text-gray-400">+{500 + level * 100} ONIX</p>
              </div>
            </div>

            <span className="text-emerald-400 font-bold">Забрать</span>
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
            🔗 Скопировать реф. ссылку
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