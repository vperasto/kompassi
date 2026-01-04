import React, { useState, useEffect } from 'react';
import { useOrientation } from './hooks/useOrientation';
import { CompassDial } from './components/CompassDial';
import { TacticalButton } from './components/TacticalButton';
import { Maximize, Minimize, Navigation, Lock, LockOpen } from 'lucide-react';

export default function App() {
  const { heading, permissionGranted, requestAccess, error, isAbsolute } = useOrientation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Helper to format degrees
  const formattedHeading = Math.round(heading).toString().padStart(3, '0');

  // Determine cardinal text for display
  const getCardinalText = (deg: number) => {
    const directions = ['POHJOINEN', 'KOILLINEN', 'ITÄ', 'KAAKKO', 'ETELÄ', 'LOUNAS', 'LÄNSI', 'LUODE'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleOrientationLock = async () => {
    // Cast to any because standard TypeScript definitions for ScreenOrientation might be missing lock/unlock
    const orientation = screen.orientation as any;
    if (!orientation || !orientation.lock) return;
    try {
      if (isLocked) {
        orientation.unlock();
        setIsLocked(false);
      } else {
        await orientation.lock('portrait');
        setIsLocked(true);
      }
    } catch (e) {
      console.warn('Orientation lock not supported or failed', e);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full bg-black text-white flex flex-col items-center justify-between font-mono overflow-hidden relative">
      
      {/* Background Grid Pattern for Tactical Look */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <header className="w-full p-4 pt-safe z-10 flex justify-between items-start border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-widest border-l-4 border-white pl-3 leading-none">
            COMPASSI
          </h1>
          <p className="text-xs text-gray-400 mt-1 pl-4 tracking-wider">
            SYSTEM: {isAbsolute ? 'GPS/MAG (ABS)' : 'RELATIIVINEN'}
          </p>
        </div>
        <div className="text-right">
           <div className="text-xs text-gray-500 uppercase">Status</div>
           <div className={`text-xs font-bold ${error ? 'text-red-500' : 'text-green-500'}`}>
             {error ? 'VIRHE' : 'AKTIIVINEN'}
           </div>
        </div>
      </header>

      {/* Main Display */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4">
        
        {/* Digital Readout */}
        <div className="mb-8 text-center">
          <div className="text-6xl font-bold tracking-tighter tabular-nums relative inline-block">
            {formattedHeading}
            <span className="text-2xl absolute top-0 -right-6">°</span>
          </div>
          <div className="text-xl mt-2 font-bold text-gray-300 tracking-[0.2em] border-t border-gray-700 pt-2 inline-block px-4">
            {getCardinalText(heading)}
          </div>
        </div>

        {/* Analog Compass */}
        <CompassDial heading={heading} />

      </main>

      {/* Footer Controls */}
      <footer className="w-full pb-safe z-10 bg-black/90 border-t border-gray-800">
        <div className="p-4 grid grid-cols-2 gap-3 max-w-md mx-auto">
          
          {/* Permission / Calibrate Button (Primary Action) */}
          {!permissionGranted ? (
            <TacticalButton 
              onClick={requestAccess}
              label="AKTIVOI ANTURIT"
              icon={<Navigation size={18} />}
              className="col-span-2 border-dashed animate-pulse"
            />
          ) : (
            <>
              <TacticalButton 
                onClick={toggleFullscreen}
                label={isFullscreen ? "PIENENNÄ" : "KOKO NÄYTTÖ"}
                icon={isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              />
              <TacticalButton 
                onClick={toggleOrientationLock}
                label={isLocked ? "VAPAUTA" : "LUKITSE"}
                icon={isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
                className={isLocked ? 'bg-white text-black' : ''}
              />
            </>
          )}

          {/* Calibrate Text Link */}
          {permissionGranted && (
             <div className="col-span-2 text-center mt-2">
               <button 
                 onClick={requestAccess} 
                 className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
               >
                 [ Uudelleenkalibrointi ]
               </button>
             </div>
          )}

          {/* Copyright */}
          <div className="col-span-2 text-center mt-4">
            <p className="text-[10px] text-gray-700 uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Vesa Perasto
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}