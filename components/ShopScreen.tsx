import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingBag, Coins, Check, Crown, CreditCard, Smartphone } from 'lucide-react';
import { User } from '../types';

interface ShopScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
  playSound: (type: 'click' | 'success' | 'error') => void;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'accessory' | 'topType' | 'skinTone' | 'hairColor';
  value: string;
  price: number;
  label: string;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, onUpdateUser, onBack, playSound }) => {
  const [activeTab, setActiveTab] = useState<'COINS' | 'ITEMS'>('COINS');
  const [showPurchaseModal, setShowPurchaseModal] = useState<any>(null); // For simulated purchase sheet
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Coins bundle configurations
  const COIN_BUNDLES = [
    { id: 'coin_micro', name: 'Pocket Bundle', coins: 200, price: '$0.99', popular: false },
    { id: 'coin_booster', name: 'Value Pack', coins: 1000, price: '$2.99', popular: true },
    { id: 'coin_vault', name: 'Golden Treasury', coins: 5000, price: '$9.99', popular: false },
    { id: 'no_ads', name: 'VIP Premium Pass', coins: 500, price: '$1.99', popular: false, badge: 'BEST BUY' }
  ];

  // Premium Avatar Accessories for Shop
  const SHOP_ITEMS: ShopItem[] = [
    { id: 'acc_crown', name: 'Golden Crown', category: 'accessory', value: 'crown', price: 1000, label: 'Royal crown styling' },
    { id: 'acc_sunglasses', name: 'Cool Shades', category: 'accessory', value: 'sunglasses', price: 200, label: 'Modern stylized look' },
    { id: 'acc_hat', name: 'Sporty Cap', category: 'accessory', value: 'hat', price: 150, label: 'Cool active cap' },
    { id: 'acc_eyepatch', name: 'Retro Eyepatch', category: 'accessory', value: 'eyepatch', price: 250, label: 'Classic pirate look' },
    { id: 'top_suit', name: 'Dapper Suit', category: 'topType', value: 'suit', price: 500, label: 'Premium tailored suit' },
    { id: 'top_hoodie', name: 'Cozy Hoodie', category: 'topType', value: 'hoodie', price: 300, label: 'Comfortable relaxed threads' },
    { id: 'skin_vampire', name: 'Mystic Pale Skin', category: 'skinTone', value: '#e2e8f0', price: 300, label: 'Fair stylized color tone' },
    { id: 'hair_silver', name: 'Aura Silver Dye', category: 'hairColor', value: '#cbd5e1', price: 150, label: 'Glossy silver dyed hair' }
  ];

  const handleBuyItem = (item: ShopItem) => {
    if (user.coins >= item.price) {
      playSound('success');
      const updatedUser = {
        ...user,
        coins: user.coins - item.price,
        inventory: [...user.inventory, item.id]
      };
      onUpdateUser(updatedUser);
    } else {
      playSound('error');
      alert("Not enough coins! Buy a coin pack to unlock this custom style.");
      setActiveTab('COINS');
    }
  };

  const handleInitiateIAP = (bundle: any) => {
    playSound('click');
    setShowPurchaseModal(bundle);
    setPurchaseSuccess(false);
  };

  const handleConfirmIAP = () => {
    playSound('success');
    setPurchaseSuccess(true);
    setTimeout(() => {
      const bonusCoins = showPurchaseModal.id === 'no_ads' ? 500 : showPurchaseModal.coins;
      const updatedUser = {
        ...user,
        coins: user.coins + bonusCoins
      };
      
      if (showPurchaseModal.id === 'no_ads') {
        updatedUser.inventory = [...updatedUser.inventory, 'no_ads_unlocked'];
      }
      
      onUpdateUser(updatedUser);
      setShowPurchaseModal(null);
      setPurchaseSuccess(false);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl overflow-y-auto scrollbar-hide select-none relative"
      id="shop-screen-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playSound('click'); onBack(); }}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            id="shop-back-btn"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="text-amber-500" size={18} />
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Shop</h2>
          </div>
        </div>

        {/* Coins indicator */}
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full shadow-sm">
          <Coins size={14} className="text-yellow-500" />
          <span className="font-extrabold text-xs text-yellow-600 dark:text-yellow-400">{user.coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 shrink-0">
        <button 
          onClick={() => { playSound('click'); setActiveTab('COINS'); }}
          className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'COINS' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Buy Coins
        </button>
        <button 
          onClick={() => { playSound('click'); setActiveTab('ITEMS'); }}
          className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'ITEMS' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Buy Styles
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-4">
        {activeTab === 'COINS' ? (
          <div className="space-y-3">
            <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              💡 Tap any bundle below to instantly simulate a premium payment transaction inside this preview sandbox!
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {COIN_BUNDLES.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleInitiateIAP(b)}
                  className={`relative p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all bg-white dark:bg-slate-950/40 hover:scale-[1.01] ${b.popular ? 'border-yellow-500 bg-yellow-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  {b.popular && (
                    <span className="absolute top-0 right-3 -translate-y-1/2 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      POPULAR
                    </span>
                  )}
                  {b.badge && (
                    <span className="absolute top-0 right-3 -translate-y-1/2 bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {b.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                      <Coins size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-tight">{b.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        +{b.coins} Coins 
                        {b.id === 'no_ads' && <span className="text-emerald-500 uppercase text-[9px] ml-1 font-black">Ad-Free Block!</span>}
                      </p>
                    </div>
                  </div>

                  <span className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm shrink-0">
                    {b.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {SHOP_ITEMS.map(item => {
              const owned = user.inventory.includes(item.id);
              return (
                <div 
                  key={item.id}
                  className="p-3 bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-blue-500/40 transition-colors"
                >
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{item.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block leading-tight">{item.label}</span>
                  </div>

                  <div className="mt-3">
                    {owned ? (
                      <span className="w-full py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-0.5 select-none border border-emerald-500/10">
                        <Check size={10} /> OWNED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={user.coins < item.price}
                        className={`w-full py-1.5 text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-all ${user.coins >= item.price ? 'bg-yellow-500 hover:bg-yellow-600 text-black active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                      >
                        <Coins size={9} /> {item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated Apple Pay / Google Play Authorization Sheet */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center rounded-3xl">
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="w-full bg-slate-900 text-white rounded-t-3xl p-5 border-t border-white/10 shadow-2xl"
              id="iap-simulation-sheet"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              {!purchaseSuccess ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Sandbox App Purchase</span>
                    <button 
                      onClick={() => { playSound('click'); setShowPurchaseModal(null); }}
                      className="text-[10px] text-slate-400 font-extrabold hover:text-white uppercase bg-white/5 py-1 px-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[9px] uppercase text-slate-400">Transaction Item</h4>
                      <h3 className="font-black text-xs text-white uppercase">{showPurchaseModal.name}</h3>
                      <p className="text-[10px] text-emerald-400 font-mono">+{showPurchaseModal.coins} Coins</p>
                    </div>
                    <div className="text-right font-black text-sm text-yellow-500">
                      {showPurchaseModal.price}
                    </div>
                  </div>

                  <div className="text-center py-3 border border-dashed border-white/10 rounded-xl bg-slate-950/20">
                    <Smartphone className="mx-auto text-blue-400 animate-pulse mb-1.5" size={24} />
                    <p className="text-[10px] text-slate-400">Demo Apple/Google pay authentication simulator</p>
                  </div>

                  <button
                    onClick={handleConfirmIAP}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-md active:scale-95 transition-all text-center"
                  >
                    Confirm Purchase
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="animate-bounce" size={24} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white font-sans">Payment Simulation Approved!</h3>
                  <p className="text-[10px] text-slate-400 px-3">Simulated credits have been safely authorized. Coins and style perks are unlocked!</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
