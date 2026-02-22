import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-all duration-300 focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 group"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 w-6 h-6 transform transition-transform duration-500 ease-in-out ${
            theme === 'dark' ? 'rotate-90 opacity-0 translate-y-4' : 'rotate-0 opacity-100 translate-y-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 w-6 h-6 transform transition-transform duration-500 ease-in-out ${
            theme === 'dark' ? 'rotate-0 opacity-100 translate-y-0' : '-rotate-90 opacity-0 -translate-y-4'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
      
      {/* Tooltipish glow */}
      <span className="absolute inset-0 rounded-full bg-primary-400/20 scale-0 group-hover:scale-100 transition-transform duration-300 dark:bg-primary-500/20"></span>
    </button>
  );
};