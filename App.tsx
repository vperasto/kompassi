import React, { useState, useEffect, useMemo } from 'react';
import { useOrientation } from './hooks/useOrientation';
import { CompassDial } from './components/CompassDial';
import { TacticalButton } from './components/TacticalButton';
import { WeatherModal } from './components/WeatherModal';
import { SettingsModal } from './components/SettingsModal';
import { Notification } from './components/Notification';
import { Maximize, Minimize, Navigation, Lock, LockOpen, Cloud, Settings } from 'lucide-react';

export default function App() {
  const { heading: rawHeading, permissionGranted, requestAccess, error, isAbsolute } = useOrientation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Settings State
  const [compassSettings, setCompassSettings] = useState({
    invert: false,
    offset: 0
  });

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('compassi_settings');
    if (saved) {
      try {
        setCompassSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  const saveSettings = (newSettings: { invert: boolean; offset: number }) => {
    setCompassSettings(newSettings);
    localStorage.setItem('compassi_settings', JSON.stringify(newSettings));
    showNotification("Asetukset tallennettu");
  };

  // Calculate adjusted heading based on settings
  const adjustedHeading = useMemo(() => {
    let h = rawHeading;
    
    // 1. Invert if needed (Mirror across N-S axis)
    // If raw is 90 (East) and inverted, it becomes 270 (West)
    if (compassSettings.invert) {
      h = 360 - h;
    }

    // 2. Apply Offset
    h = h + compassSettings.offset;

    // 3. Normalize to 0-360
    h = h % 360;
    if (h < 0) h += 360;

    return h;
  }, [rawHeading, compassSettings]);

  // Helper to format degrees
  const formattedHeading = Math.round(adjustedHeading).toString().padStart(3, '0');

  // Determine cardinal text for display
  const getCardinalText = (deg: number) => {
    const directions = ['POHJOINEN', 'KOILLINEN', 'ITÄ', 'KAAKKO', 'ETELÄ', 'LOUNAS', 'LÄNSI', 'LUODE'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        showNotification("Ei tuettu selaimessa");
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
    
    if (!orientation || !orientation.lock) {
      showNotification("Ei tuettu laitteella");
      return;
    }

    try {
      if (isLocked) {
        orientation.unlock();
        setIsLocked(false);
        showNotification("Lukitus poistettu");
      } else {
        await orientation.lock('portrait');
        setIsLocked(true);
        showNotification("Suunta lukittu");
      }
    } catch (e) {
      console.warn('Orientation lock failed', e);
      // Specific error messaging
      if (e instanceof Error && e.message.includes('not supported')) {
         showNotification("Ei tuettu tällä laitteella");
      } else {
         showNotification("Lukitus vaatii koko näytön");
      }
    }
  };

  const handleCalibrationRequest = () => {
    // Physical calibration instruction
    showNotification("Tee 8-liike laitteella");
    // Also request access again just in case permissions were lost
    requestAccess();
    // Open settings for manual offset as that's the "software calibration"
    setTimeout(() => setIsSettingsOpen(true), 1500);
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
      
      <Notification message={notification} onClear={() => setNotification(null)} />

      {/* Modals */}
      <WeatherModal isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={saveSettings}
        currentSettings={compassSettings}
      />

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
        <div className="flex flex-col items-end gap-2">
           <div className={`text-xs font-bold ${error ? 'text-red-500' : 'text-green-500'}`}>
             {error ? 'VIRHE' : 'AKTIIVINEN'}
           </div>
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2 border border-gray-700 hover:bg-gray-800 active:bg-white active:text-black transition-colors"
             aria-label="Asetukset"
           >
             <Settings size={18} />
           </button>
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
            {getCardinalText(adjustedHeading)}
          </div>
          {(compassSettings.invert || compassSettings.offset !== 0) && (
            <div className="text-[10px] text-yellow-500 uppercase mt-2 font-bold tracking-widest">
              [ KORJAUS: {compassSettings.invert ? 'KÄÄNTÖ ' : ''}{compassSettings.offset !== 0 ? `${compassSettings.offset > 0 ? '+' : ''}${compassSettings.offset}°` : ''} ]
            </div>
          )}
        </div>

        {/* Analog Compass */}
        <CompassDial heading={adjustedHeading} />

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
              {/* Weather Button */}
              <TacticalButton 
                onClick={() => setIsWeatherOpen(true)}
                label="SÄÄTILA"
                icon={<Cloud size={18} />}
                className="col-span-2 mt-1"
              />
            </>
          )}

          {/* Calibrate Text Link */}
          {permissionGranted && (
             <div className="col-span-2 text-center mt-2">
               <button 
                 onClick={handleCalibrationRequest}
                 className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
               >
                 [ Kalibrointi & Asetukset ]
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