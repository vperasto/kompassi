import React from 'react';

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({ label, icon, active, className, ...props }) => {
  return (
    <button
      className={`
        flex items-center justify-center gap-2
        px-6 py-4 
        border-2 border-white 
        font-mono uppercase tracking-widest font-bold text-sm
        transition-all duration-100
        active:scale-95
        ${active ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-900'}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {label}
    </button>
  );
};