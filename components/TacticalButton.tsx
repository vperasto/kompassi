import React from 'react';

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  isNightMode?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({ label, icon, active, isNightMode = false, className, ...props }) => {
  const baseClasses = `
    flex items-center justify-center gap-2
    px-6 py-4 
    border-2 
    font-mono uppercase tracking-widest font-bold text-sm
    transition-all duration-300
    active:scale-95
  `;

  const normalColors = active 
    ? 'bg-white text-black border-white' 
    : 'bg-black text-white border-white hover:bg-gray-900';

  const nightColors = active
    ? 'bg-red-600 text-black border-red-600'
    : 'bg-black text-red-600 border-red-600 hover:bg-red-900/30';

  return (
    <button
      className={`${baseClasses} ${isNightMode ? nightColors : normalColors} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </button>
  );
};