import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        group relative flex items-center justify-center w-12 h-12 
        rounded-xl transition-all duration-200 ease-out
        ${theme === 'dark'
          ? 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30'
          : 'bg-black/5 hover:bg-black/10 border border-black/10 hover:border-black/20'
        }
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${theme === 'dark'
          ? 'focus:ring-white/50 focus:ring-offset-black'
          : 'focus:ring-black/50 focus:ring-offset-white'
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Icon Container */}
      <div className="relative w-6 h-6">
        {/* Current Theme Icon */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-200 ease-out
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        >
          <Sun 
            className={`w-full h-full transition-colors duration-200 ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}
            strokeWidth={1.5}
          />
        </div>
        
        {/* Next Theme Icon */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-200 ease-out
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        >
          <Moon 
            className={`w-full h-full transition-colors duration-200 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
            strokeWidth={1.5}
          />
        </div>
      </div>
      
      {/* Subtle hover indicator */}
      <div 
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none
          ${theme === 'dark'
            ? 'bg-white/5'
            : 'bg-black/5'
          }
        `} 
      />
    </button>
  );
};

export default ThemeToggle;
