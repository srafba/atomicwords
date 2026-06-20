import React, { useMemo } from 'react';

interface AtomicBackgroundProps {
  darkMode: boolean;
}

// React.memo wraps the component — type is inferred from the generic parameter
const AtomicBackground = React.memo<AtomicBackgroundProps>(({ darkMode }) => {
  // Generate random letters for the background wallpaper texture
  const letters = useMemo(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: 110 }, () => chars[Math.floor(Math.random() * chars.length)]);
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-blue-50/90'}`}>
      
      {/* Scrambled-letter Grid */}
      <div className="absolute inset-0 grid grid-cols-10 pointer-events-none select-none p-4 gap-y-8 gap-x-4">
        {letters.map((char, i) => (
          <div 
            key={i} 
            className={`
              flex items-center justify-center text-3xl font-black transition-colors duration-500 font-sans
              ${darkMode 
                ? 'text-slate-800/45 dark:opacity-30' 
                : 'text-blue-200/60 opacity-60'} 
            `}
            style={{
              transform: `rotate(${(i * 17) % 360}deg)`,
              textShadow: darkMode 
                ? '1px 1px 0 rgba(255,255,255,0.02), -1px -1px 0 rgba(0,0,0,0.6)' 
                : '-1px -1px 0 rgba(255,255,255,0.9), 1px 1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Dynamic Overlay Gradient for a modern layered shine */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        darkMode 
          ? 'from-transparent via-slate-950/80 to-blue-950/20' 
          : 'from-transparent via-blue-50/50 to-cyan-150/40'
      }`} />
    </div>
  );
});

export default AtomicBackground;
