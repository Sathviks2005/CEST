import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { ChatBot } from '../components/chat/ChatBot';
import { FaBrain, FaSun, FaMoon, FaSignOutAlt, FaUser, FaStethoscope, FaHome, FaShieldAlt } from 'react-icons/fa';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <DisclaimerBanner />
      
      {/* Dashboard Topbar */}
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-tealBrand-500 flex items-center justify-center text-white shadow-md">
              <FaBrain className="text-lg" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-tealBrand-600 dark:from-brand-300 dark:to-tealBrand-300 bg-clip-text text-transparent">
              CEST Dashboard
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
            {role === 'admin' ? (
              <FaShieldAlt className="text-amber-500" />
            ) : role === 'clinician' ? (
              <FaStethoscope className="text-tealBrand-500" />
            ) : (
              <FaUser className="text-brand-500" />
            )}
            {role === 'admin'
              ? 'Administrator Workspace'
              : role === 'clinician'
              ? 'Clinician Workspace'
              : 'Self User Workspace'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Return to Public Site"
          >
            <FaHome className="text-lg" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-600" />}
          </button>
          
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">
                {role === 'admin'
                  ? 'System Administrator'
                  : role === 'clinician'
                  ? 'Mental Health Practitioner'
                  : 'Individual User'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>

      {/* Floating Wellbeing Assistant for Self-Users */}
      {user && role !== 'clinician' && role !== 'admin' && <ChatBot />}
    </div>
  );
};
