import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Save } from 'lucide-react';
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, isNightMode = false }) => {
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
    border: isNightMode ? 'border-red-600' : 'border-white',
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-800' : 'text-gray-500',
    headerBorder: isNightMode ? 'border-red-900' : 'border-gray-800',
    buttonBorder: isNightMode ? 'border-red-900 hover:bg-red-900/20' : 'border-gray-700 hover:bg-gray-900',
    toggleOn: isNightMode ? 'bg-red-600' : 'bg-white',
    toggleOff: 'bg-black',
    toggleKnob: isNightMode ? 'bg-black' : 'bg-black', // Invert: black dot on red bg
    saveButton: isNightMode ? 'bg-red-600 text-black hover:bg-red-500' : 'bg-white text-black hover:bg-gray-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className={`w-full max-w-sm bg-black border-2 p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200 ${colors.border} ${colors.text}`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${colors.headerBorder}`}>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <Settings size={20} /> ASETUKSET
          </h2>
          <button onClick={onClose} className={`hover:bg-gray-800 p-1 transition-colors ${isNightMode ? 'hover:bg-red-900/30' : ''}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          
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
              Kytke päälle, jos Itä ja Länsi ovat väärin päin (esim. näyttää Lounaaseen kun pitäisi olla Kaakko).
            </p>
          </div>

          {/* Offset Adjustment */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-bold uppercase tracking-wider">Hienosäätö (Eranto)</label>
                <span className="font-mono text-xl font-bold">{offset > 0 ? `+${offset}` : offset}°</span>
             </div>
             
             <div className="flex gap-2 justify-center">
                <button onClick={() => adjustOffset(-10)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>-10°</button>
                <button onClick={() => adjustOffset(-1)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>-1°</button>
                <button onClick={() => setOffset(0)} className={`p-3 border transition-colors text-xs uppercase ${colors.buttonBorder}`}>Nollaa</button>
                <button onClick={() => adjustOffset(1)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>+1°</button>
                <button onClick={() => adjustOffset(10)} className={`p-3 border transition-colors ${colors.buttonBorder}`}>+10°</button>
             </div>
             <p className={`text-[10px] leading-tight ${colors.textDim}`}>
              Korjaa lukemaa asteilla, jos kompassi heittää johdonmukaisesti tietyn verran.
            </p>
          </div>

          <TacticalButton 
            label="TALLENNA ASETUKSET" 
            icon={<Save size={18} />}
            onClick={handleSave}
            isNightMode={isNightMode}
            className={`w-full mt-4 ${colors.saveButton}`}
          />
          
        </div>

      </div>
    </div>
  );
};