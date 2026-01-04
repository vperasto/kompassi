import React, { useState, useEffect, useMemo } from 'react';
import { useOrientation } from './hooks/useOrientation';
import { usePosition } from './hooks/usePosition'; // Import Position Hook
import { CompassDial } from './components/CompassDial';
import { TacticalButton } from './components/TacticalButton';
import { WeatherModal } from './components/WeatherModal';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal'; // Import InfoModal
import { Notification } from './components/Notification';
import { formatCoordinates } from './utils/geoUtils'; // Import Utils
import { Maximize, Minimize, Navigation, Lock, LockOpen, Cloud, Settings, Eye, EyeOff, Crosshair, Info } from 'lucide-react';

type CoordFormat = 'decimal' | 'etrs' | 'mgrs' | 'maidenhead';

export default function App() {
  const { heading: rawHeading, permissionGranted, requestAccess, error, isAbsolute } = useOrientation();
  const { lat, lon, accuracy, loading: gpsLoading, error: gpsError } = usePosition(); // Use Position
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false); // Info Modal State
  const [notification, setNotification] = useState<string | null>(null);
  
  // Tactical Modes
  const [isNightMode, setIsNightMode] = useState(false);
  
  // Coordinate Format State
  const [coordFormat, setCoordFormat] = useState<CoordFormat>('decimal');

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
    if (compassSettings.invert) {
      h = 360 - h;
    }
    h = h + compassSettings.offset;
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
      if (e instanceof Error && e.message.includes('not supported')) {
         showNotification("Ei tuettu tällä laitteella");
      } else {
         showNotification("Lukitus vaatii koko näytön");
      }
    }
  };

  const cycleCoordFormat = () => {
    const formats: CoordFormat[] = ['decimal', 'etrs', 'mgrs', 'maidenhead'];
    const currentIndex = formats.indexOf(coordFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setCoordFormat(formats[nextIndex]);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Theme Colors
  const theme = {
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-900' : 'text-gray-400',
    border: isNightMode ? 'border-red-600' : 'border-gray-800',
    accent: isNightMode ? 'text-red-500' : 'text-green-500', // Active status
    error: isNightMode ? 'text-red-800' : 'text-red-500',
    bgHeader: isNightMode ? 'bg-black border-red-900' : 'bg-black/80 border-gray-800',
    cardinalText: isNightMode ? 'text-red-800' : 'text-gray-300'
  };

  // Shared button style for header - Slightly reduced padding for tighter fit
  const headerBtnClass = `p-2 sm:p-2.5 border transition-colors ${isNightMode ? 'border-red-900 hover:bg-red-900/20 text-red-600' : 'border-gray-700 hover:bg-gray-800 active:bg-white active:text-black'}`;

  return (
    <div className={`h-[100dvh] w-full bg-black ${theme.text} flex flex-col font-mono overflow-hidden relative transition-colors duration-500`}>
      
      <Notification message={notification} onClear={() => setNotification(null)} isNightMode={isNightMode} />

      {/* Modals */}
      <WeatherModal isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} isNightMode={isNightMode} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={saveSettings}
        currentSettings={compassSettings}
        isNightMode={isNightMode}
        sensorStatus={{ active: !error, absolute: isAbsolute, error }}
      />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} isNightMode={isNightMode} />

      {/* Background Grid Pattern for Tactical Look */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(${isNightMode ? '#300' : '#333'} 1px, transparent 1px), linear-gradient(90deg, ${isNightMode ? '#300' : '#333'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header - Fixed Height */}
      <header className={`w-full flex-none p-2 pt-safe z-10 flex justify-between items-center border-b backdrop-blur-sm transition-colors duration-500 ${theme.bgHeader}`}>
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-widest border-l-4 pl-3 leading-none ${isNightMode ? 'border-red-600' : 'border-white'}`}>
            COMPASSI
          </h1>
        </div>
        
        {/* Top Toolbar - All controls moved here */}
        <div className="flex gap-1.5 sm:gap-2">
             <button 
                onClick={toggleOrientationLock}
                className={`${headerBtnClass} ${isLocked ? (isNightMode ? 'bg-red-600 text-black' : 'bg-white text-black') : ''}`}
                aria-label="Lukitse"
              >
                {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
              </button>

             <button 
                onClick={() => setIsWeatherOpen(true)}
                className={headerBtnClass}
                aria-label="Sää"
              >
                <Cloud size={18} />
              </button>

             <button 
                onClick={toggleFullscreen}
                className={headerBtnClass}
                aria-label="Koko näyttö"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>

             <button 
                onClick={() => setIsInfoOpen(true)}
                className={headerBtnClass}
                aria-label="Tietoja"
              >
                <Info size={18} />
              </button>
              
              <button 
                onClick={() => setIsNightMode(!isNightMode)}
                className={headerBtnClass}
                aria-label="Yötila"
              >
                {isNightMode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
             
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className={headerBtnClass}
               aria-label="Asetukset"
             >
               <Settings size={18} />
             </button>
        </div>
      </header>

      {/* Main Display - Grows to fill space */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4 pb-safe gap-4 sm:gap-8">
        
        {/* Digital Readout */}
        <div className="text-center mt-4">
          <div className="text-6xl sm:text-7xl font-bold tracking-tighter tabular-nums relative inline-block">
            {formattedHeading}
            <span className="text-2xl absolute top-0 -right-6">°</span>
          </div>
          <div className={`text-xl mt-2 font-bold tracking-[0.2em] border-t pt-2 inline-block px-4 transition-colors ${isNightMode ? 'border-red-900 text-red-700' : 'border-gray-700 text-gray-300'}`}>
            {getCardinalText(adjustedHeading)}
          </div>
        </div>

        {/* Analog Compass */}
        <div className="flex-1 w-full flex items-center justify-center min-h-0">
           <CompassDial heading={adjustedHeading} isNightMode={isNightMode} />
        </div>

        {/* Tactical Coordinate Display (Moved to bottom of Main) */}
        <button 
          onClick={cycleCoordFormat}
          className={`w-full max-w-[320px] mb-4 sm:mb-8 p-3 border-2 flex items-center justify-between transition-all active:scale-95 group flex-none ${isNightMode ? 'border-red-900 bg-black/50 hover:bg-red-900/20' : 'border-gray-800 bg-black/50 hover:bg-gray-900'}`}
        >
          <div className="flex flex-col items-start">
             <div className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 ${theme.textDim}`}>
               <Crosshair size={12} />
               <span>GPS // {gpsLoading ? 'ETSITÄÄN...' : coordFormat.toUpperCase()}</span>
             </div>
             <div className="text-lg font-bold tracking-tighter mt-1 font-mono">
               {gpsError ? (
                 <span className="text-red-500 text-sm">{gpsError}</span>
               ) : gpsLoading || lat === null || lon === null ? (
                 <span className="animate-pulse">--.----- --.-----</span>
               ) : (
                 formatCoordinates(lat, lon, coordFormat)
               )}
             </div>
          </div>
          <div className={`text-[10px] font-bold ${theme.accent} opacity-50 group-hover:opacity-100`}>
             {accuracy ? `±${Math.round(accuracy)}m` : ''}
          </div>
        </button>

      </main>

      {/* Footer - ONLY visible if permission is missing */}
      {!permissionGranted && (
        <footer 
          className={`w-full flex-none z-10 border-t transition-colors duration-500 pb-[calc(2rem+env(safe-area-inset-bottom))] ${isNightMode ? 'bg-black border-red-900' : 'bg-black/90 border-gray-800'}`}
        >
          <div className="p-4 pt-6 max-w-md mx-auto">
            <TacticalButton 
              onClick={requestAccess}
              label="AKTIVOI ANTURIT"
              icon={<Navigation size={18} />}
              isNightMode={isNightMode}
              className="w-full border-dashed animate-pulse"
            />
          </div>
        </footer>
      )}
    </div>
  );
}