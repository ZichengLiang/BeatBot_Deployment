import React from 'react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const ToggleSwitch = ({ isOn, setIsOn, label }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      {label && (
        <span className={cn(
          "text-sm font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          {label}
        </span>
      )}
      <button 
        onClick={() => setIsOn(!isOn)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          isOn 
            ? "bg-green-600 focus:ring-green-500" 
            : "bg-gray-400 focus:ring-gray-500",
          isDarkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
        )}
      >
        <span className="sr-only">Toggle {label || 'Switch'}</span>
        <span 
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transform transition-transform",
            isOn ? "translate-x-6" : "translate-x-1"
          )} 
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;