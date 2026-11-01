import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { useTheme } from '../context/ThemeContext';
import { FaBrain, FaSun, FaMoon, FaArrowLeft } from 'react-icons/fa';

export const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <DisclaimerBanner />
      
      {/* Mini Auth Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 glass-nav">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <FaArrowLeft className="text-xs" />
          <span>Back to Home</span>
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-tealBrand-500 flex items-center justify-center text-white">
            <FaBrain className="text-base" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">CEST</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-600" />}
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
