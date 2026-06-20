import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Calendar, Sparkles, Coins, Atom } from 'lucide-react';
import { Language } from '../types';
import * as StorageService from '../services/storageService';

interface LeaderboardScreenProps {
  language: Language;
  onBack: () => void;
  playSound: (type: 'click') => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ language, onBack, playSound }) => {
  const scores = StorageService.getScores();

  // Create mock top levels if empty, so it displays nicely
  const displayScores = scores.length > 0 ? scores : [
    { username: "Marie Curie", score: 8500, date: "System", difficulty: "Expert" },
    { username: "Albert Einstein", score: 7200, date: "System", difficulty: "Hard" },
    { username: "Richard Feynman", score: 5400, date: "System", difficulty: "Normal" },
    { username: "Quantum Niels", score: 3200, date: "System", difficulty: "Beginner" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl overflow-y-auto scrollbar-hide select-none"
      id="leaderboard-screen-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 text-slate-700 dark:text-slate-300 transition-colors"
          id="leaderboard-back-btn"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={22} />
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Reactor Top Scores</h2>
        </div>
      </div>

      {/* Leaderboard Entries List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
        {displayScores.map((s, i) => {
          const isTopThree = i < 3;
          const placementColors = i === 0 
            ? 'from-yellow-400 to-amber-500 text-black' 
            : i === 1 
            ? 'from-slate-300 to-slate-400 text-black' 
            : 'from-amber-600 to-amber-700 text-white';

          return (
            <div 
              key={i} 
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isTopThree ? 'bg-gradient-to-r from-blue-50/40 to-cyan-50/40 dark:from-slate-800/40 dark:to-cyan-950/20 border-cyan-500/10' : 'bg-black/[0.01] dark:bg-white/[0.01] border-black/5 dark:border-white/5'}`}
            >
              <div className="flex items-center gap-3">
                {/* Placement Medal Indicator */}
                <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center bg-gradient-to-br ${isTopThree ? placementColors : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                  {i === 0 ? <Trophy size={14} className="text-black" /> : i + 1}
                </div>
                
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{s.username}</h4>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">{s.difficulty || "Normal"} Mode</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-black text-cyan-600 dark:text-atomic-blue">
                  {s.score.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 block font-bold mt-0.5">Energy units</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
