import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Atom, Award, Sparkles, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface HowToPlayProps {
  language: Language;
  onBack: () => void;
  playSound: (type: 'click') => void;
}

export const HowToPlayScreen: React.FC<HowToPlayProps> = ({ language, onBack, playSound }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl overflow-y-auto scrollbar-hide select-none"
      id="how-to-play-screen"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          id="how-to-back-btn"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-1.5">
          <BookOpen className="text-blue-500" size={18} />
          <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">How To Play</h2>
        </div>
      </div>

      {/* Rules content */}
      <div className="flex-1 space-y-4 text-slate-700 dark:text-slate-300">
        
        {/* Core Concept */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-2xl border border-cyan-500/10">
          <div className="flex items-center gap-1.5 mb-1.5 text-blue-600 dark:text-blue-400 font-extrabold">
            <Atom className="animate-spin-slow text-amber-500" size={16} />
            <span className="uppercase tracking-wider text-[10px]">The Concept</span>
          </div>
          <p className="text-xs leading-relaxed">
            You are given a large, theme-based master word (e.g. <strong className="text-blue-600 dark:text-blue-400">DICTIONARY</strong>). Your goal is to form smaller, valid words of 3 or more letters using only the letters from that larger word!
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Instructions</h3>

          <div className="flex gap-3">
            <div className="flex-none w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
              1
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase">Tap Letter Tiles</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Tap letters from the main word to assemble your guess. You can only use each letter tile once per word.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-none w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
              2
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase">Submit & Earn</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Once a valid word of 3+ letters is formed, tap <strong className="text-emerald-500">Formulate</strong> to submit it. If it is valid, you earn points and coins!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-none w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-black text-xs">
              3
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase">Get Intelligent Hints</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Stuck on finding a word? Spend 25 coins to get a helpful clue about a word you haven't discovered yet.
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-950/20">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
            <Award className="text-yellow-500" size={14} /> Word Scores
          </h3>
          <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400">
            <li className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
              <span>3-Letter Word</span>
              <span className="font-mono text-cyan-600 dark:text-blue-400 font-bold">+300 Points</span>
            </li>
            <li className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
              <span>4-Letter Word</span>
              <span className="font-mono text-cyan-600 dark:text-blue-400 font-bold">+400 Points</span>
            </li>
            <li className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
              <span>5-Letter Word</span>
              <span className="font-mono text-cyan-600 dark:text-blue-400 font-bold">+500 Points</span>
            </li>
            <li className="flex justify-between">
              <span>6+ Letter Word</span>
              <span className="font-mono text-amber-500 font-extrabold">+600+ Points + Bonus coins</span>
            </li>
          </ul>
        </div>

        {/* Pro-Tip */}
        <div className="flex gap-2 items-start bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 text-[11px] text-yellow-800 dark:text-yellow-400 leading-relaxed">
          <AlertCircle className="flex-none mt-0.5" size={12} />
          <span>
            <strong>Pro Tip:</strong> Tap any letter in your compiled spelling bar to instantly retract it. You do not need to clear your entire guess to fix a simple typo!
          </span>
        </div>
      </div>

      {/* Button */}
      <button 
        onClick={() => { playSound('click'); onBack(); }}
        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-md active:scale-95 transition-all"
        id="how-to-close-btn"
      >
        I'm Ready
      </button>
    </motion.div>
  );
};
