import React from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode?: boolean;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, isNightMode = false }) => {
  if (!isOpen) return null;

  const colors = {
    bg: 'bg-black',
    border: isNightMode ? 'border-red-600' : 'border-white',
    text: isNightMode ? 'text-red-600' : 'text-white',
    textDim: isNightMode ? 'text-red-800' : 'text-gray-400',
    headerBorder: isNightMode ? 'border-red-900' : 'border-gray-800',
    icon: isNightMode ? 'text-red-500' : 'text-yellow-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className={`w-full max-w-sm ${colors.bg} border-2 ${colors.border} ${colors.text} p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${colors.headerBorder}`}>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <Info size={20} /> TIETOJA
          </h2>
          <button onClick={onClose} className={`hover:bg-gray-800 p-1 transition-colors ${isNightMode ? 'hover:bg-red-900/30' : ''}`}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className={`border-l-4 pl-4 py-1 flex flex-col gap-2 ${isNightMode ? 'border-red-800' : 'border-yellow-600'}`}>
             <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
               <AlertTriangle size={18} className={colors.icon} />
               Huomio
             </div>
             <p className="font-bold leading-relaxed">
               Vain avustavaan käyttöön.
             </p>
          </div>

          <div className={`text-sm leading-relaxed space-y-4 font-mono ${colors.textDim}`}>
            <p>
              Sovellus käyttää puhelimen antureita (magnetometri, kiihtyvyysanturi, GPS), joiden tarkkuus vaihtelee laitteesta, ympäristöstä ja suojakuorista riippuen.
            </p>
            <p>
              Esitetyt koordinaatit ja suunnat ovat arvioita. Elektroniset kompassit ovat herkkiä häiriöille.
            </p>
            <p className={`font-bold uppercase border-t pt-4 ${isNightMode ? 'border-red-900 text-red-500' : 'border-gray-800 text-white'}`}>
              Älä käytä ensisijaisena navigointivälineenä kriittisissä tilanteissa. Käytä aina oikeaa karttaa ja kompassia varmistuksena.
            </p>
          </div>

          <button 
            onClick={onClose}
            className={`w-full py-4 border-2 font-bold uppercase tracking-widest text-sm transition-all active:scale-95 ${isNightMode ? 'border-red-600 bg-red-900/20 hover:bg-red-900/40' : 'border-white hover:bg-gray-900'}`}
          >
            Ymmärretty
          </button>
        </div>

      </div>
    </div>
  );
};