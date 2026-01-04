import React, { useMemo, useState, useEffect } from 'react';
import { CardinalPoint } from '../types';

interface CompassDialProps {
  heading: number;
  isNightMode?: boolean;
}

// Visual layout: 0 is Top (North), 90 is Right (East)
const CARDINALS: CardinalPoint[] = [
  { label: 'P', degree: 0 },
  { label: 'KO', degree: 45 },
  { label: 'I', degree: 90 },
  { label: 'KA', degree: 135 },
  { label: 'E', degree: 180 },
  { label: 'LO', degree: 225 },
  { label: 'L', degree: 270 },
  { label: 'LU', degree: 315 },
];

export const CompassDial: React.FC<CompassDialProps> = ({ heading, isNightMode = false }) => {
  // We keep track of a cumulative heading to allow smooth rotation across the 360/0 boundary.
  const [displayHeading, setDisplayHeading] = useState(heading);

  useEffect(() => {
    setDisplayHeading((prev) => {
      // Normalize previous value to 0-360 for comparison
      let currentRotation = prev % 360;
      if (currentRotation < 0) currentRotation += 360;

      // Calculate the difference
      let diff = heading - currentRotation;

      // Find the shortest path
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      return prev + diff;
    });
  }, [heading]);

  // Generate tick marks
  const ticks = useMemo(() => {
    const items = [];
    for (let i = 0; i < 360; i += 2) {
      const isMajor = i % 10 === 0;
      const isCardinal = i % 90 === 0;
      items.push({
        degree: i,
        isMajor,
        isCardinal,
      });
    }
    return items;
  }, []);

  const colors = {
    border: isNightMode ? 'border-red-600' : 'border-white',
    innerBorder: isNightMode ? 'border-red-900' : 'border-gray-600',
    tick: isNightMode ? 'bg-red-600' : 'bg-white',
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-800' : 'text-gray-200',
    textSub: isNightMode ? 'text-red-900' : 'text-gray-500',
    // In night mode, the red pointer needs to stay visible or change. 
    // Standard red pointer on black is fine, but maybe darker in night mode to not blind?
    // Let's keep it standard red-600 for consistency, or maybe brighter red-500.
    pointer: 'bg-red-600 border-red-600', 
    crosshair: isNightMode ? 'bg-red-800' : 'bg-white'
  };

  return (
    <div className="relative w-full max-w-[320px] aspect-square mx-auto">
      {/* Static Indicator Line (The "Lubber Line") */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-8 z-20 pointer-events-none transition-colors ${colors.pointer}`} />
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] z-20 pointer-events-none transition-colors ${isNightMode ? 'border-t-red-600' : 'border-t-red-600'}`} />

      {/* Rotating Dial Container */}
      <div
        className={`w-full h-full rounded-full border-[3px] bg-black relative transition-all duration-300 ease-out will-change-transform ${colors.border}`}
        style={{ transform: `rotate(${-displayHeading}deg)` }}
      >
        {/* Inner Border Ring */}
        <div className={`absolute inset-[4px] rounded-full border transition-colors ${colors.innerBorder}`} />
        
        {/* Central Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-50">
           <div className={`absolute top-1/2 left-0 w-full h-[1px] transition-colors ${colors.crosshair}`} />
           <div className={`absolute top-0 left-1/2 w-[1px] h-full transition-colors ${colors.crosshair}`} />
        </div>

        {/* Ticks */}
        {ticks.map((tick) => (
          <div
            key={tick.degree}
            className={`absolute top-0 left-1/2 -translate-x-1/2 origin-[50%_50%] h-full pointer-events-none`}
            style={{ transform: `rotate(${tick.degree}deg)` }}
          >
            <div
              className={`mx-auto transition-colors ${colors.tick} ${
                tick.isCardinal ? 'w-[3px] h-5' : tick.isMajor ? 'w-[2px] h-3' : 'w-[1px] h-2'
              }`}
            />
          </div>
        ))}

        {/* Cardinal Labels */}
        {CARDINALS.map((cardinal) => (
          <div
            key={cardinal.label}
            className="absolute top-0 left-1/2 -translate-x-1/2 origin-[50%_50%] h-full pointer-events-none"
            style={{ transform: `rotate(${cardinal.degree}deg)` }}
          >
            <div className={`mt-8 font-mono font-bold tracking-tighter transition-colors ${cardinal.label.length > 1 ? `text-lg ${colors.textDim}` : `text-xl ${colors.text}`}`}>
              {cardinal.label}
            </div>
          </div>
        ))}

        {/* Degree Numbers (Every 30 degrees) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
           <div
           key={`deg-${deg}`}
           className="absolute top-0 left-1/2 -translate-x-1/2 origin-[50%_50%] h-full pointer-events-none"
           style={{ transform: `rotate(${deg}deg)` }}
         >
           <div className={`mt-16 font-mono text-xs font-bold transition-colors ${colors.textSub}`}>
             {deg}
           </div>
         </div>
        ))}
      </div>
    </div>
  );
};