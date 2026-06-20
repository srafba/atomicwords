import React, { useMemo } from 'react';
import { AvatarConfig, Language } from '../types';

interface AvatarProps {
  config: AvatarConfig;
  language?: Language;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ config, language = Language.ENGLISH, className }) => {
  const isPirate = language === Language.PIRATE;
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  const adjustColor = (hex: string, amt: number) => {
    let usePound = false;
    if (hex.startsWith("#")) {
      hex = hex.slice(1);
      usePound = true;
    }
    // Handle short hex formats
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    let num = parseInt(hex, 16);
    if (isNaN(num)) {
      // Return a safe fallback color if hex parsing fails
      return usePound ? "#333333" : "333333";
    }
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  };

  const skinBase = config.skinTone || '#f5d0b0';
  const skinShadow = adjustColor(skinBase, -35);
  const skinHighlight = adjustColor(skinBase, 20);
  const skinWarmth = adjustColor(skinBase, -15); // Blush / ears

  const hairBase = config.hairColor || '#4a3000';
  const hairDark = adjustColor(hairBase, -45);
  const hairLight = adjustColor(hairBase, 35);

  const topBase = config.topColor || '#3b82f6';
  const topDark = adjustColor(topBase, -45);
  const topLight = adjustColor(topBase, 35);

  const botBase = config.bottomColor || '#1f2937';
  const botDark = adjustColor(botBase, -45);

  return (
    <svg 
      viewBox="0 0 300 300" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* Shadow filter for depth */}
        <filter id={`depth-shadow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.25"/>
        </filter>
        
        {/* Neck occlusion shadow */}
        <filter id={`neck-shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
        </filter>

        {/* Skin gradient */}
        <radialGradient id={`skin-grad-${uniqueId}`} cx="45%" cy="35%" r="60%">
          <stop offset="0%" stopColor={skinHighlight} />
          <stop offset="70%" stopColor={skinBase} />
          <stop offset="100%" stopColor={skinWarmth} />
        </radialGradient>

        {/* Eye Iris Gradient */}
        <radialGradient id={`iris-grad-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={isPirate ? "#115e59" : "#0284c7"} />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Hair shading gradient */}
        <linearGradient id={`hair-grad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="60%" stopColor={hairBase} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>

        {/* Clothes shader */}
        <linearGradient id={`cloth-grad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={topLight} />
          <stop offset="50%" stopColor={topBase} />
          <stop offset="100%" stopColor={topDark} />
        </linearGradient>
      </defs>

      {/* --- BACK HAIR (if long) --- */}
      {config.hairStyle === 'long' && (
        <path 
          d="M75,130 C50,160 55,250 55,270 L245,270 C245,250 250,160 225,130 Z" 
          fill={hairDark} 
        />
      )}
      
      {config.hairStyle === 'bob' && (
        <path 
          d="M78,130 C60,150 62,210 65,230 C80,230 100,210 110,195 L190,195 C200,210 220,230 235,230 C238,210 240,150 222,130 Z" 
          fill={hairDark} 
        />
      )}

      {/* --- BODY (SHOULDERS & TORSO) --- */}
      <g filter={`url(#depth-shadow-${uniqueId})`}>
        {/* Shoulders / Shirt Base */}
        <path 
          d="M60,230 C60,200 95,195 150,195 C205,195 240,200 240,230 C240,260 245,300 245,300 L55,300 C55,300 60,260 60,230 Z" 
          fill={`url(#cloth-grad-${uniqueId})`} 
        />

        {/* Suit Lapels or Hoodie details */}
        {config.topType === 'suit' && (
          <>
            {/* White inner shirt V-neck */}
            <path d="M115,195 L150,235 L185,195 Z" fill="#ffffff" />
            {/* Agent Red Tie */}
            <path d="M142,210 L158,210 L162,260 L150,275 L138,260 Z" fill="#dc2626" />
            {/* Lapel collars */}
            <path d="M90,195 L125,235 L120,270 L110,195 Z" fill={topDark} opacity="0.85" />
            <path d="M210,195 L175,235 L180,270 L190,195 Z" fill={topDark} opacity="0.85" />
            {/* Golden Badge */}
            <circle cx="100" cy="225" r="5" fill="#facc15" />
          </>
        )}

        {config.topType === 'hoodie' && (
          <>
            {/* Hoodie pocket */}
            <path d="M100,265 C100,250 120,245 150,245 C180,245 200,250 200,265 L195,300 L105,300 Z" fill={topDark} opacity="0.4" />
            {/* Drawstrings */}
            <line x1="135" y1="205" x2="135" y2="240" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx="135" cy="242" r="3" fill="#facc15" />
            <line x1="165" y1="205" x2="165" y2="240" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
            <circle cx="165" cy="242" r="3" fill="#facc15" />
          </>
        )}

        {config.topType === 'shirt' && (
          <>
            {/* Collar line */}
            <path d="M115,195 C125,205 135,208 150,208 C165,208 175,205 185,195" fill="none" stroke={topDark} strokeWidth="3" />
            {/* Buttons */}
            <circle cx="150" cy="225" r="3.5" fill="#ffffff" opacity="0.7" />
            <circle cx="150" cy="245" r="3.5" fill="#ffffff" opacity="0.7" />
            <circle cx="150" cy="265" r="3.5" fill="#ffffff" opacity="0.7" />
          </>
        )}
      </g>

      {/* --- NECK --- */}
      <path 
        d="M125,160 L125,205 C125,205 135,215 150,215 C165,215 175,205 175,205 L175,160 Z" 
        fill={skinShadow} 
        filter={`url(#neck-shadow-${uniqueId})`}
      />

      {/* --- HEAD GROUP --- */}
      <g filter={`url(#depth-shadow-${uniqueId})`}>
        {/* Ears */}
        <circle cx="82" cy="130" r="16" fill={skinWarmth} />
        <circle cx="82" cy="130" r="9" fill={skinShadow} />
        <circle cx="218" cy="130" r="16" fill={skinWarmth} />
        <circle cx="218" cy="130" r="9" fill={skinShadow} />

        {/* Head Shape/face (Properly aligned with hair bounding boxes) */}
        <path 
          d="M85,115 C85,70 110,60 150,60 C190,60 215,70 215,115 C215,145 210,180 150,180 C90,180 85,145 85,115 Z" 
          fill={`url(#skin-grad-${uniqueId})`} 
        />

        {/* Blush cheeks */}
        <circle cx="102" cy="138" r="8" fill="#f43f5e" opacity="0.25" />
        <circle cx="198" cy="138" r="8" fill="#f43f5e" opacity="0.25" />

        {/* Facial Features (Eyes, Eyebrows, Nose, Mouth) */}
        {/* Brows */}
        <path d="M98,107 Q112,98 123,107" fill="none" stroke={hairDark} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M177,107 Q188,98 202,107" fill="none" stroke={hairDark} strokeWidth="4.5" strokeLinecap="round" />

        {/* Eyes (Glossy vector style) */}
        {config.accessory !== 'sunglasses' && (
          <>
            {/* Left Eye */}
            <g transform="translate(112, 120)">
              <ellipse rx="12" ry="11" fill="#ffffff" />
              {isPirate ? (
                // Cool Pirate eye patch instead of normal eye
                <path d="M-14, -10 L14, 5 L10, 10 L-10, -5 Z M-10, -8 C-14, 5 5, 14 10, -2 Z" fill="#0f172a" transform="translate(-2, -3) scale(1.1)" />
              ) : (
                <>
                  <circle r="7.5" fill={`url(#iris-grad-${uniqueId})`} />
                  <circle r="3.5" fill="#000000" />
                  {/* Eye reflections */}
                  <circle cx="-3" cy="-3" r="2.5" fill="#ffffff" />
                  <circle cx="3" cy="3" r="1" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g transform="translate(188, 120)">
              <ellipse rx="12" ry="11" fill="#ffffff" />
              <circle r="7.5" fill={`url(#iris-grad-${uniqueId})`} />
              <circle r="3.5" fill="#000000" />
              {/* Eye reflections */}
              <circle cx="-3" cy="-3" r="2.5" fill="#ffffff" />
              <circle cx="3" cy="3" r="1" fill="#ffffff" />
            </g>
          </>
        )}

        {/* Nose */}
        <path d="M145,123 Q150,131 155,123" fill="none" stroke={skinShadow} strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Mouth (Satisfied, gaming grin) */}
        <path d="M136,148 Q150,158 164,148" fill="none" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />

        {/* Cute dimples */}
        <path d="M132,148 Q131,146 131,149" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M168,148 Q169,146 169,149" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>

        {/* Beards / Facial Hair */}
        {config.beard === 'stubble' && (
          <path d="M88,125 C88,160 110,178 150,178 C190,178 212,160 212,125 Q205,170 150,170 Q95,170 88,125 Z" fill={hairDark} opacity="0.2" />
        )}
        
        {config.beard === 'full' && (
          <path d="M85,122 C85,160 102,185 150,185 C198,185 215,160 215,122 C205,178 185,182 150,182 C115,182 95,178 85,122 Z" fill={hairDark} opacity="0.95" />
        )}

        {config.beard === 'mustache' && (
          <path d="M130,138 Q150,146 170,138 Q150,133 130,138" fill={hairBase} />
        )}

        {/* --- FRONT HAIR (Strict layout overlay to avoid rendering discrepancies!) --- */}
        {config.hairStyle === 'short' && (
          <path 
            d="M82,105 C80,68 105,50 150,50 C195,50 220,68 218,105 C205,80 180,82 165,90 C155,95 145,95 135,90 C120,82 95,80 82,105 Z" 
            fill={`url(#hair-grad-${uniqueId})`} 
          />
        )}

        {config.hairStyle === 'spiky' && (
          <path 
            d="M80,105 L95,40 L115,55 L135,30 L150,55 L165,30 L185,55 L205,40 L220,105 C205,85 190,92 170,90 C150,88 135,92 115,90 C100,88 90,95 80,105 Z" 
            fill={`url(#hair-grad-${uniqueId})`} 
          />
        )}

        {config.hairStyle === 'long' && (
          <path 
            d="M81,105 C80,55 105,48 150,48 C195,48 220,55 219,105 C204,82 170,85 150,92 C130,85 96,82 81,105 Z" 
            fill={`url(#hair-grad-${uniqueId})`} 
          />
        )}

        {config.hairStyle === 'bob' && (
          <path 
            d="M80,105 C78,55 105,48 150,48 C195,48 222,55 220,105 C210,88 190,90 175,98 L125,98 C110,90 90,88 80,105 Z" 
            fill={`url(#hair-grad-${uniqueId})`} 
          />
        )}

        {/* --- HAIR HIGHLIGHT OVERLAYS (Adds professional depth!) --- */}
        {config.hairStyle !== 'bald' && (
          <path d="M100,65 Q150,50 200,65" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.3" strokeLinecap="round" />
        )}

        {/* --- EYEGLASSES / SPECIAL GLASSES --- */}
        {config.accessory === 'glasses' && (
          <g filter={`url(#depth-shadow-${uniqueId})`}>
            {/* Elegant Round Specs */}
            <circle cx="112" cy="120" r="16" fill="rgba(14, 165, 233, 0.15)" stroke="#0284c7" strokeWidth="4.5" />
            <circle cx="188" cy="120" r="16" fill="rgba(14, 165, 233, 0.15)" stroke="#0284c7" strokeWidth="4.5" />
            {/* Bridge */}
            <path d="M128,120 L172,120" stroke="#0284c7" strokeWidth="4.5" />
            {/* Reflections */}
            <path d="M102,112 L112,125" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M178,112 L188,125" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </g>
        )}

        {config.accessory === 'sunglasses' && (
          <g filter={`url(#depth-shadow-${uniqueId})`}>
            {/* Cool Aviator Shades */}
            <path d="M96,110 L128,110 L124,132 L102,132 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <path d="M172,110 L204,110 L198,132 L176,132 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <path d="M128,113 L172,113" stroke="#0f172a" strokeWidth="3.5" />
            {/* Gloss reflection lines */}
            <line x1="100" y1="113" x2="115" y2="128" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            <line x1="176" y1="113" x2="191" y2="128" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          </g>
        )}

        {config.accessory === 'eyepatch' && (
          <g>
            {/* Diagonal Strap */}
            <line x1="75" y1="110" x2="225" y2="135" stroke="#0f172a" strokeWidth="4" />
            {/* Patch over Left Eye */}
            <ellipse cx="112" cy="120" rx="17" ry="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          </g>
        )}

        {/* --- PREMIUM CROWNS & HATS --- */}
        {config.accessory === 'crown' && (
          <path 
            d="M93,52 L110,25 L132,45 L150,15 L168,45 L190,25 L207,52 Z" 
            fill="#eab308" 
            stroke="#ca8a04" 
            strokeWidth="3.5" 
            strokeLinejoin="round"
            filter={`url(#depth-shadow-${uniqueId})`}
          />
        )}

        {config.accessory === 'hat' && (
          <g filter={`url(#depth-shadow-${uniqueId})`}>
            {/* Athletic Science Cap */}
            <path d="M80,62 C80,28 110,24 150,24 C190,24 220,28 220,62 Z" fill="#0284c7" />
            {/* Visor / Brim */}
            <path d="M72,62 C72,62 105,75 150,75 C195,75 228,62 228,62 Z" fill="#0369a1" />
            {/* Atoms symbol embroidered */}
            <circle cx="150" cy="43" r="5" fill="#22c55e" />
            <ellipse cx="150" cy="43" rx="10" ry="2.5" fill="none" stroke="#22c55e" strokeWidth="1" transform="rotate(30,150,43)" />
            <ellipse cx="150" cy="43" rx="10" ry="2.5" fill="none" stroke="#22c55e" strokeWidth="1" transform="rotate(-30,150,43)" />
          </g>
        )}
      </g>
    </svg>
  );
};

export default Avatar;
