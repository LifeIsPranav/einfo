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
        group relative flex items-center gap-2 px-3 py-2 text-sm font-medium 
        rounded-lg transition-all duration-200 border
        ${theme === 'dark'
          ? 'bg-zinc-900/50 hover:bg-zinc-800/60 text-zinc-400 border-zinc-800/50 hover:text-zinc-200 hover:border-zinc-700/60'
          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300'
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-4 h-4">
        {theme === 'light' ? (
          <Moon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        ) : (
          <Sun className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        )}
      </div>
      <span className="hidden sm:inline transition-opacity duration-200">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
