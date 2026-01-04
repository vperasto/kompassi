import React, { useState, useEffect } from 'react';
import { X, Cloud, Wind, MapPin, Search, Loader2, Sunrise, Sunset } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  sunrise: string;
  sunset: string;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode?: boolean;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose, isNightMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [view, setView] = useState<'weather' | 'settings'>('weather');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load location from local storage on mount
  useEffect(() => {
    if (!isOpen) return;

    const savedLoc = localStorage.getItem('compassi_location');
    if (savedLoc) {
      const parsed = JSON.parse(savedLoc);
      setLocation(parsed);
      fetchWeather(parsed.lat, parsed.lon);
    } else {
      // Try geolocation if no saved location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            name: 'Oma Sijainti (GPS)',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          setLocation(loc);
          fetchWeather(loc.lat, loc.lon);
        },
        () => {
          setView('settings'); // Force settings if no geo
        }
      );
    }
  }, [isOpen]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&wind_speed_unit=ms&timezone=auto`
      );
      const data = await res.json();
      
      if (data.current && data.daily) {
        // Extract HH:MM from ISO string
        const formatTime = (isoString: string) => {
           if (!isoString) return '--:--';
           const parts = isoString.split('T');
           return parts.length > 1 ? parts[1] : isoString;
        };

        setWeather({
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
          sunrise: formatTime(data.daily.sunrise[0]),
          sunset: formatTime(data.daily.sunset[0])
        });
      }
    } catch (err) {
      setError('Säätietojen haku epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Search for location
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=fi&format=json`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLoc = {
          name: `${result.name}, ${result.country_code.toUpperCase()}`,
          lat: result.latitude,
          lon: result.longitude
        };
        
        localStorage.setItem('compassi_location', JSON.stringify(newLoc));
        setLocation(newLoc);
        setSearchQuery('');
        setView('weather');
        fetchWeather(newLoc.lat, newLoc.lon);
      } else {
        setError('Paikkaa ei löytynyt');
      }
    } catch (err) {
      setError('Haku epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const colors = {
    bg: 'bg-black',
    border: isNightMode ? 'border-red-600' : 'border-white',
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-800' : 'text-gray-500',
    inputBg: isNightMode ? 'bg-red-900/10' : 'bg-gray-900',
    inputBorder: isNightMode ? 'border-red-900' : 'border-gray-700',
    buttonBg: isNightMode ? 'bg-red-600 text-black hover:bg-red-500' : 'bg-white text-black hover:bg-gray-200',
    iconDim: isNightMode ? 'text-red-800' : 'text-gray-400'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className={`w-full max-w-sm ${colors.bg} border-2 ${colors.border} ${colors.text} p-6 relative shadow-2xl transition-colors`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b ${isNightMode ? 'border-red-900' : 'border-gray-800'} pb-4`}>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <Cloud size={20} /> SÄÄTILA
          </h2>
          <button onClick={onClose} className={`hover:bg-gray-800 p-1 transition-colors ${isNightMode ? 'hover:bg-red-900/30' : ''}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40 gap-4">
               <Loader2 className="animate-spin" size={32} />
               <p className="text-xs uppercase tracking-widest animate-pulse">Haetaan...</p>
             </div>
          ) : view === 'settings' ? (
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <label className={`text-xs uppercase tracking-widest ${colors.textDim}`}>Aseta Sijainti</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Esim. Helsinki"
                  className={`w-full ${colors.inputBg} border ${colors.inputBorder} p-3 pl-10 font-mono focus:border-current outline-none uppercase ${colors.text}`}
                  autoFocus
                />
                <Search className={`absolute left-3 top-3.5 ${colors.textDim}`} size={16} />
              </div>
              <button 
                type="submit"
                className={`font-bold uppercase py-3 tracking-widest transition-colors ${colors.buttonBg}`}
              >
                Tallenna & Hae
              </button>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              
              {location && (
                 <button 
                   type="button" 
                   onClick={() => setView('weather')}
                   className={`text-xs underline mt-4 ${colors.textDim}`}
                 >
                   Peruuta
                 </button>
              )}
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Location Display */}
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${colors.textDim}`}>Sijainti</p>
                  <p className="text-lg font-bold leading-none">{location?.name || '---'}</p>
                </div>
                <button 
                  onClick={() => setView('settings')}
                  className={`p-2 border transition-colors ${isNightMode ? 'border-red-900 hover:border-red-600' : 'border-gray-800 hover:border-white'}`}
                >
                  <MapPin size={16} />
                </button>
              </div>

              {/* Weather Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Temp */}
                <div className={`border p-4 flex flex-col items-center justify-center text-center h-24 ${isNightMode ? 'border-red-900' : 'border-gray-800'}`}>
                   <Cloud className={`mb-2 ${colors.iconDim}`} size={20} />
                   <span className="text-2xl font-bold">{weather?.temperature}°C</span>
                   <span className={`text-[10px] uppercase mt-1 ${colors.textDim}`}>Lämpötila</span>
                </div>
                {/* Wind */}
                <div className={`border p-4 flex flex-col items-center justify-center text-center h-24 ${isNightMode ? 'border-red-900' : 'border-gray-800'}`}>
                   <div className="flex items-center gap-1 mb-2">
                     <Wind className={colors.iconDim} size={20} />
                     {weather && (
                       <div 
                         style={{ transform: `rotate(${weather.windDirection}deg)` }}
                         className="transition-transform duration-500"
                       >
                         ↓
                       </div>
                     )}
                   </div>
                   <span className="text-2xl font-bold">{weather?.windSpeed}</span>
                   <span className={`text-[10px] uppercase mt-1 ${colors.textDim}`}>m/s</span>
                </div>
                {/* Sunrise */}
                 <div className={`border p-4 flex flex-col items-center justify-center text-center h-24 ${isNightMode ? 'border-red-900' : 'border-gray-800'}`}>
                   <Sunrise className={`mb-2 ${colors.iconDim}`} size={20} />
                   <span className="text-2xl font-bold">{weather?.sunrise}</span>
                   <span className={`text-[10px] uppercase mt-1 ${colors.textDim}`}>Nousu</span>
                </div>
                {/* Sunset */}
                 <div className={`border p-4 flex flex-col items-center justify-center text-center h-24 ${isNightMode ? 'border-red-900' : 'border-gray-800'}`}>
                   <Sunset className={`mb-2 ${colors.iconDim}`} size={20} />
                   <span className="text-2xl font-bold">{weather?.sunset}</span>
                   <span className={`text-[10px] uppercase mt-1 ${colors.textDim}`}>Lasku</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              
              <div className={`text-[10px] text-center font-mono mt-2 ${colors.textDim}`}>
                Data: Open-Meteo API
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};