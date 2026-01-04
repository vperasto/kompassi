import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Save, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { TacticalButton } from './TacticalButton';

interface CompassSettings {
  invert: boolean;
  offset: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CompassSettings) => void;
  currentSettings: CompassSettings;
  isNightMode?: boolean;
  sensorStatus: {
    active: boolean;
    absolute: boolean;
    error: string | null;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, isNightMode = false, sensorStatus }) => {
  const [invert, setInvert] = useState(currentSettings.invert);
  const [offset, setOffset] = useState(currentSettings.offset);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInvert(currentSettings.invert);
      setOffset(currentSettings.offset);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    onSave({ invert, offset });
    onClose();
  };

  const adjustOffset = (amount: number) => {
    setOffset(prev => {
      let next = prev + amount;
      if (next >= 360) next -= 360;
      if (next < 0) next += 360;
      return next;
    });
  };

  if (!isOpen) return null;

  const colors = {
    bg: 'bg-black',
    border: isNightMode ? 'border-red-600' : 'border-white',
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-800' : 'text-gray-500',
    headerBorder: isNightMode ? 'border-red-900' : 'border-gray-800',
    buttonBorder: isNightMode ? 'border-red-900 hover:bg-red-900/20' : 'border-gray-700 hover:bg-gray-900',
    toggleOn: isNightMode ? 'bg-red-600' : 'bg-white',
    toggleOff: 'bg-black',
    saveButton: isNightMode ? 'bg-red-600 text-black hover:bg-red-500' : 'bg-white text-black hover:bg-gray-200',
    statusBox: isNightMode ? 'bg-red-900/10 border-red-900' : 'bg-gray-900 border-gray-800'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className={`w-full max-w-sm ${colors.bg} border-2 ${colors.border} ${colors.text} p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${colors.headerBorder} flex-none`}>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <Settings size={20} /> ASETUKSET
          </h2>
          <button onClick={onClose} className={`hover:bg-gray-800 p-1 transition-colors ${isNightMode ? 'hover:bg-red-900/30' : ''}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="space-y-8 overflow-y-auto flex-1 pr-2">
          
          {/* Diagnostics Section (Moved from Main UI) */}
          <div className={`p-4 border ${colors.statusBox}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 opacity-70">
              <Activity size={14} /> Järjestelmän Tila
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>ANTURIT:</span>
                <span className={sensorStatus.error ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                  {sensorStatus.error ? "VIRHE" : "AKTIIVINEN"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>MOODI:</span>
                <span className={sensorStatus.absolute ? "text-green-500" : "text-yellow-500"}>
                  {sensorStatus.absolute ? "ABSOLUUTTINEN (Tarkka)" : "RELATIIVINEN (Arvio)"}
                </span>
              </div>
              {!sensorStatus.absolute && (
                <p className={`text-[10px] mt-2 ${colors.textDim}`}>
                  Huom: Laite ei tue kompassisuuntaa tai GPS-tietoa puuttuu. Pohjoinen on arvioitu.
                </p>
              )}
            </div>
          </div>

          {/* Invert Toggle */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold uppercase tracking-wider">Kiertosuunta</label>
              <div 
                className={`w-12 h-6 rounded-full border border-gray-600 relative cursor-pointer transition-colors ${invert ? colors.toggleOn : colors.toggleOff}`}
                onClick={() => setInvert(!invert)}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${invert ? 'left-7 bg-black' : 'left-1 bg-gray-400'}`} />
              </div>
            </div>
            <p className={`text-[10px] leading-tight ${colors.textDim}`}>
              Kytke päälle, jos ilmansuunnat pyörivät väärään suuntaan käännyttäessä.
            </p>
          </div>

          {/* Offset Adjustment */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-bold uppercase tracking-wider">Hienosäätö (Eranto)</label>
                <span className="font-mono text-xl font-bold">{offset > 0 ? `+${offset}` : offset}°</span>
             </div>
             
             <div className="flex gap-2 justify-center">
                <button onClick={() => adjustOffset(-10)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>-10</button>
                <button onClick={() => adjustOffset(-1)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>-1</button>
                <button onClick={() => setOffset(0)} className={`p-3 border transition-colors text-xs uppercase ${colors.buttonBorder}`}>0</button>
                <button onClick={() => adjustOffset(1)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>+1</button>
                <button onClick={() => adjustOffset(10)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>+10</button>
             </div>
             <p className={`text-[10px] leading-tight ${colors.textDim}`}>
              Korjaa lukemaa asteilla. Käytä tätä kalibrointiin vertaamalla oikeaan kompassiin.
            </p>
          </div>

          <TacticalButton 
            label="TALLENNA" 
            icon={<Save size={18} />}
            onClick={handleSave}
            isNightMode={isNightMode}
            className={`w-full mt-4 ${colors.saveButton}`}
          />

          <div className="text-center pt-4 border-t border-gray-800">
             <p className={`text-[10px] uppercase tracking-widest ${colors.textDim}`}>
              © {new Date().getFullYear()} Vesa Perasto
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
};