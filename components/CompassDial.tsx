import React, { useMemo } from 'react';
import { CardinalPoint } from '../types';

interface CompassDialProps {
  heading: number;
}

const CARDINALS: CardinalPoint[] = [
  { label: 'P', degree: 0 },
  { label: 'KI', degree: 45 },
  { label: 'I', degree: 90 },
  { label: 'KA', degree: 135 },
  { label: 'E', degree: 180 },
  { label: 'LO', degree: 225 },
  { label: 'L', degree: 270 },
  { label: 'LU', degree: 315 },
];

export const CompassDial: React.FC<CompassDialProps> = ({ heading }) => {
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

  return (
    <div className="relative w-full max-w-[320px] aspect-square mx-auto">
      {/* Static Indicator Line (The "Lubber Line") */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-8 bg-red-600 z-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-red-600 z-20 pointer-events-none" />

      {/* Rotating Dial Container */}
      <div
        className="w-full h-full rounded-full border-[3px] border-white bg-black relative transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotate(${-heading}deg)` }}
      >
        {/* Inner Border Ring */}
        <div className="absolute inset-[4px] rounded-full border border-gray-600" />
        
        {/* Central Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-50">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
           <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white" />
        </div>

        {/* Ticks */}
        {ticks.map((tick) => (
          <div
            key={tick.degree}
            className={`absolute top-0 left-1/2 -translate-x-1/2 origin-[50%_50%] h-full pointer-events-none`}
            style={{ transform: `rotate(${tick.degree}deg)` }}
          >
            <div
              className={`mx-auto bg-white ${
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
            <div className="mt-8 font-mono font-bold text-xl text-white tracking-tighter">
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
           <div className="mt-16 font-mono text-xs text-gray-400">
             {deg}
           </div>
         </div>
        ))}
      </div>
    </div>
  );
};