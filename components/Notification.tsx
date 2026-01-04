import React, { useEffect } from 'react';

interface NotificationProps {
  message: string | null;
  onClear: () => void;
  isNightMode?: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClear, isNightMode = false }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`px-6 py-3 border-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] ${
        isNightMode 
          ? 'bg-red-900 text-red-100 border-red-500 shadow-red-900/50' 
          : 'bg-white text-black border-black'
      }`}>
        <p className="font-mono font-bold text-sm uppercase tracking-widest text-center">
          {message}
        </p>
      </div>
    </div>
  );
};