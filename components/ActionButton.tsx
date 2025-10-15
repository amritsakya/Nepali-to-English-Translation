
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-cyan-600 rounded-full shadow-lg transition-all duration-300 ease-in-out
                 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500
                 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
    >
      {children}
    </button>
  );
};

export default ActionButton;
