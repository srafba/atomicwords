import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings, ShieldAlert, Sliders, Smartphone, Monitor } from 'lucide-react';
import { User } from '../types';
import { getMinWordLength, setMinWordLength } from '../services/dictionaryService';

interface SettingsScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User | null) => void;
  onBack: () => void;
  playSound: (type: 'click' | 'success' | 'error') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenDeveloperMode: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  onUpdateUser, 
  onBack, 
  playSound, 
  darkMode, 
  setDarkMode,
  onOpenDeveloperMode
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [controlLayout, setControlLayout] = useState<'A' | 'B'>('A');
  const [minWordLen, setMinWordLen] = useState(() => getMinWordLength());

  const handleMinLenChange = (len: number) => {
    playSound('click');
    setMinWordLength(len);
    setMinWordLen(len);
  };

  const handleResetProgress = () => {
    playSound('error');
    localStorage.clear();
    onUpdateUser(null); // Triggers return to login screen
    setShowResetConfirm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl overflow-y-auto scrollbar-hide select-none relative"
      id="settings-panel-screen"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          id="settings-back-btn"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          <Settings className="text-blue-500" size={18} />
          <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Settings</h2>
        </div>
      </div>

      {/* Settings Options */}
      <div className="flex-1 space-y-5">
        
        {/* Toggle Theme */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">App Theme</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => { playSound('click'); setDarkMode(false); }}
              className={`flex-1 py-1.5 text-xs font-black transition-all rounded-lg ${!darkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              ☀️ Light Blue
            </button>
            <button 
              onClick={() => { playSound('click'); setDarkMode(true); }}
              className={`flex-1 py-1.5 text-xs font-black transition-all rounded-lg ${darkMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
            >
              🌙 Dark Slate
            </button>
          </div>
        </div>

        {/* Action Toggle controls */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Audio Info</span>
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
              Sound effects utilize the modern Web Audio API for an instant, lag-free gameplay response.
            </p>
          </div>
        </div>

        {/* Customizable controls */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Tile Layout Options</span>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => { playSound('click'); setControlLayout('A'); }}
              className={`p-3 border rounded-xl text-left flex items-center justify-between transition-all ${controlLayout === 'A' ? 'border-blue-500 bg-blue-500/5 text-slate-900 dark:text-white font-extrabold' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
            >
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-blue-500" />
                <span className="text-xs uppercase">Flexible Row</span>
              </div>
              <span className="text-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black px-1.5 py-0.5 rounded uppercase">Default</span>
            </button>

            <button 
              onClick={() => { playSound('click'); setControlLayout('B'); }}
              className={`p-3 border rounded-xl text-left flex items-center justify-between transition-all ${controlLayout === 'B' ? 'border-amber-500 bg-amber-500/5 text-slate-900 dark:text-white font-extrabold' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
            >
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-amber-500" />
                <span className="text-xs uppercase">Compact Grid</span>
              </div>
              <span className="text-[8px] bg-amber-500/10 text-amber-500 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">Beta</span>
            </button>
          </div>
        </div>

        {/* Word Length Configuration */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Word Rules</span>
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase block">Minimum Word Length</span>
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              {[2, 3, 4].map((len) => (
                <button
                  key={len}
                  onClick={() => handleMinLenChange(len)}
                  className={`flex-1 py-1.5 text-xs font-black transition-all rounded-lg ${minWordLen === len ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                  {len} Letters
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 font-bold leading-normal">
              Determines the minimum letters required to score points. Default is 3. Set to 2 to allow short words!
            </p>
          </div>
        </div>

        {/* Developer sandbox link */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">System Settings</span>
          <button
            onClick={() => { playSound('click'); onOpenDeveloperMode(); }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 animate-pulse"
          >
            🔌 Developer & Test Mode
          </button>
        </div>

        {/* Clear/Reset */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => { playSound('click'); setShowResetConfirm(true); }}
            className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            id="reset-reactor-btn"
          >
            Reset Progress
          </button>
        </div>
      </div>

      {/* Confirmation of Reset Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 rounded-3xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-center shadow-lg"
              id="reset-confirm-dialog"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldAlert size={20} />
              </div>
              
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">Wipe Your Score?</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This will delete your local profile, unlocked outfits, coins, and high scores. This action cannot be undone. Are you sure?
              </p>

              <div className="flex gap-2.5 mt-4">
                <button 
                  onClick={() => { playSound('click'); setShowResetConfirm(false); }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-lg text-xs uppercase"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleResetProgress}
                  className="flex-1 py-2 bg-red-600 text-white font-black rounded-lg text-xs uppercase shadow-md shadow-red-600/20"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
