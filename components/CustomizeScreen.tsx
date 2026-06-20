import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Save, Paintbrush, Check, HelpCircle } from 'lucide-react';
import { User, AvatarConfig } from '../types';
import Avatar from './Avatar';
import * as StorageService from '../services/storageService';

interface CustomizeScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
  playSound: (type: 'click' | 'success' | 'tap') => void;
}

export const CustomizeScreen: React.FC<CustomizeScreenProps> = ({ 
  user, 
  onUpdateUser, 
  onBack, 
  playSound 
}) => {
  const [activeCategory, setActiveCategory] = useState<keyof AvatarConfig>('hairStyle');
  const [tempAvatar, setTempAvatar] = useState<AvatarConfig>({ ...user.avatar });

  const CATEGORIES: { key: keyof AvatarConfig; label: string }[] = [
    { key: 'skinTone', label: 'Skin' },
    { key: 'hairStyle', label: 'Hair Style' },
    { key: 'hairColor', label: 'Hair Color' },
    { key: 'beard', label: 'Face' },
    { key: 'topType', label: 'Top' },
    { key: 'bottomType', label: 'Bottom' },
    { key: 'accessory', label: 'Extras' },
  ];

  // Choices Database with friendly aesthetic names
  const choices: Record<keyof AvatarConfig, { value: string; label: string; p?: boolean; id: string }[]> = {
    skinTone: [
      { id: 'skin_core', value: '#f5d0b0', label: 'Classic Peach' },
      { id: 'skin_bronze', value: '#e8b382', label: 'Golden Warmth' },
      { id: 'skin_nuclear', value: '#8d5524', label: 'Deep Bronze' },
      { id: 'skin_nebula', value: '#fed7aa', label: 'Sun Kissed' },
      { id: 'skin_vampire', value: '#e2e8f0', label: 'Mystic Pale', p: true } // Premium
    ],
    hairStyle: [
      { id: 'hair_short', value: 'short', label: 'Casual Short' },
      { id: 'hair_spiky', value: 'spiky', label: 'Modern Spikes' },
      { id: 'hair_long', value: 'long', label: 'Flowing Long' },
      { id: 'hair_bob', value: 'bob', label: 'Chic Bob' },
      { id: 'hair_bald', value: 'bald', label: 'Cool Bald' }
    ],
    hairColor: [
      { id: 'h_coal', value: '#1e293b', label: 'Midnight Black' },
      { id: 'h_rust', value: '#7c2d12', label: 'Chestnut Rust' },
      { id: 'h_xanthic', value: '#eab308', label: 'Sunshine Gold' },
      { id: 'h_neon', value: '#06b6d4', label: 'Electric Cyan' },
      { id: 'hair_silver', value: '#cbd5e1', label: 'Aura Silver', p: true } // Premium
    ],
    beard: [
      { id: 'b_clean', value: 'none', label: 'Clean Shaven' },
      { id: 'b_stubble', value: 'stubble', label: 'Stubble' },
      { id: 'b_full', value: 'full', label: 'Full Beard' },
      { id: 'b_mustache', value: 'mustache', label: 'Classic Mustache' }
    ],
    topType: [
      { id: 't_tshirt', value: 'tshirt', label: 'Casual Tee' },
      { id: 't_shirt', value: 'shirt', label: 'Button Shirt' },
      { id: 'top_hoodie', value: 'hoodie', label: 'Cozy Hoodie', p: true }, // Premium
      { id: 'top_suit', value: 'suit', label: 'Dapper Suit', p: true } // Premium
    ],
    bottomType: [
      { id: 'bot_pants', value: 'pants', label: 'Classic Pants' },
      { id: 'bot_shorts', value: 'shorts', label: 'Active Shorts' },
      { id: 'bot_skirt', value: 'skirt', label: 'Stylized Skirt' }
    ],
    accessory: [
      { id: 'acc_none', value: 'none', label: 'No Extra' },
      { id: 'acc_glasses', value: 'glasses', label: 'Professor Specs' },
      { id: 'acc_sunglasses', value: 'sunglasses', label: 'Cool Sunglasses', p: true }, // Premium
      { id: 'acc_hat', value: 'hat', label: 'Sporty Cap', p: true }, // Premium
      { id: 'acc_crown', value: 'crown', label: 'Royal Crown', p: true }, // Premium
      { id: 'acc_eyepatch', value: 'eyepatch', label: 'Retro Eyepatch', p: true } // Premium
    ]
  };

  const handleSelectChoice = (category: keyof AvatarConfig, value: string, itemId: string, isPremium?: boolean) => {
    if (isPremium && !user.inventory.includes(itemId)) {
      playSound('click');
      alert("This style is locked! Visit the Shop to unlock this extra style.");
      return;
    }
    
    playSound('tap');
    setTempAvatar(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    playSound('success');
    const updatedUser = {
      ...user,
      avatar: tempAvatar
    };
    StorageService.updateUserProfile(updatedUser);
    onUpdateUser(updatedUser);
    alert("Avatar style saved successfully!");
    onBack();
  };

  const handleRandomize = () => {
    playSound('success');
    const randomized: any = {};
    CATEGORIES.forEach(cat => {
      const options = choices[cat.key].filter(opt => !opt.p || user.inventory.includes(opt.id));
      if (options.length > 0) {
        randomized[cat.key] = options[Math.floor(Math.random() * options.length)].value;
      }
    });
    setTempAvatar(randomized);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl select-none"
      id="avatar-customizer-app"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
          id="customization-back-btn"
        >
          <ArrowLeft size={16} />
        </button>

        <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
          <Paintbrush size={15} className="text-blue-500" /> Customize Avatar
        </h2>

        <button 
          onClick={handleRandomize}
          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 transition-all font-bold flex items-center gap-1"
          title="Randomize style"
          id="randomizer-sparkle-btn"
        >
          <Sparkles size={16} />
        </button>
      </div>

      {/* Main split viewport: top is preview, bottom is selections */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Large Avatar preview panel (Fixed scaling to prevent hair/hat cropping!) */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center shrink-0">
          <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden flex items-center justify-center relative">
            {/* Using perfect fitting with margin and relative heights - NO clipping at top */}
            <Avatar 
              config={tempAvatar} 
              language={user.settings.language} 
              className="h-[105%] w-[105%] object-contain translate-y-[2%]" 
            />
          </div>
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-hide shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => { playSound('tap'); setActiveCategory(cat.key); }}
              className={`px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeCategory === cat.key ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selections list */}
        <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-3 overflow-y-auto scrollbar-hide flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Style</span>

          <div className="grid grid-cols-2 gap-2">
            {choices[activeCategory].map(opt => {
              const owned = !opt.p || user.inventory.includes(opt.id);
              const isSelected = tempAvatar[activeCategory] === opt.value;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectChoice(activeCategory, opt.value, opt.id, opt.p)}
                  className={`p-2.5 rounded-xl border-2 text-left flex flex-col justify-between items-center text-center gap-2 transition-all select-none ${isSelected ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                >
                  {/* Decorative preview */}
                  {activeCategory === 'skinTone' || activeCategory === 'hairColor' ? (
                    <div 
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner" 
                      style={{ backgroundColor: opt.value }}
                    />
                  ) : (
                    <div className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {opt.value}
                    </div>
                  )}

                  <div className="text-center w-full">
                    <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-tight block">
                      {opt.label}
                    </span>
                    {!owned && (
                      <span className="text-[8px] text-amber-600 dark:text-amber-400 font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Locked
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[8px] text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Equipped
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 shrink-0">
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black uppercase text-xs tracking-wider rounded-xl transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
          id="save-mutation-btn"
        >
          <Save size={14} /> Save Style
        </button>
      </div>
    </motion.div>
  );
};
