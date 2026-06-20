import React from 'react';
import { Atom } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => {
  const isLg = size === 'lg';
  
  if (!isLg) {
    return (
      <div className="flex items-center justify-center gap-1 font-sans font-black uppercase tracking-tight text-lg select-none relative">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Atomic</span>
        <Atom className="text-amber-500 w-4 h-4 animate-spin-slow shrink-0 mx-1" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-sans">Words</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none py-4 px-2 w-full relative max-w-xs mx-auto" style={{ height: '175px' }}>
      {/* Visual Logo Container with stacked lines & overlap */}
      <div className="relative flex flex-col items-center justify-center leading-none text-center">
        {/* FIRST LINE: ATOMIC */}
        <h1 className="text-[54px] xs:text-[62px] font-sans font-black tracking-wider uppercase leading-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-cyan-500 to-blue-600 dark:from-cyan-300 dark:via-cyan-400 dark:to-blue-500">
            ATOMIC
          </span>
        </h1>

        {/* SECOND LINE: WORDS */}
        <h1 className="text-[54px] xs:text-[62px] font-sans font-black tracking-widest uppercase leading-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none mt-[2px]">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 dark:from-amber-300 dark:via-amber-400 dark:to-orange-500">
            WORDS
          </span>
        </h1>

        {/* ATOM OVERLAY: Visually in front of the text, partially covering the center area, overlaps both words slightly */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Soft background glow shadow */}
            <div className="absolute w-24 h-24 rounded-full bg-cyan-500/10 dark:bg-cyan-400/15 blur-xl animate-pulse" />
            
            {/* Spinning Neon Atom Symbol on top */}
            <Atom className="w-16 h-16 xs:w-18 xs:h-18 text-blue-400 dark:text-cyan-300 animate-spin-slow drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]" strokeWidth={3} />
            
            {/* Inner high contrast nucleus */}
            <div className="absolute w-4.5 h-4.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow border-2 border-white dark:border-slate-900 animate-ping duration-1000" />
            <div className="absolute w-3.5 h-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 border border-white dark:border-slate-900 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
