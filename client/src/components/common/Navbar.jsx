import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaBrain, FaSun, FaMoon, FaUser, FaSignOutAlt, FaBars, FaTimes, FaStethoscope } from 'react-icons/fa';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Mental Health Conditions', path: '/conditions' },
    { name: 'Cognitive Enhancement', path: '/cognitive-enhancement' },
    { name: 'Contact', path: '/contact' },
  ];

  const dashboardPath = role === 'clinician' ? '/dashboard/clinician' : '/dashboard/self';

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-tealBrand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <FaBrain className="text-2xl animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-tealBrand-600 dark:from-brand-300 dark:via-brand-400 dark:to-tealBrand-400 bg-clip-text text-transparent">
                CEST
              </span>
              <span className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Cognitive Enhancement Support Tool
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions (Theme Toggle & Auth) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Toggle light and dark mode theme"
            >
              {theme === 'dark' ? <FaSun className="text-amber-400 text-lg" /> : <FaMoon className="text-slate-600 text-lg" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-600/20 transition-all hover:shadow-lg focus:ring-2 focus:ring-brand-500"
                >
                  {role === 'clinician' ? <FaStethoscope className="text-teal-200" /> : <FaUser className="text-brand-200" />}
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-base" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-600/20 transition-all hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle light and dark mode theme"
            >
              {theme === 'dark' ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-center"
                >
                  {role === 'clinician' ? <FaStethoscope /> : <FaUser />}
                  Dashboard ({role === 'clinician' ? 'Clinician' : 'Self User'})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-brand-600 text-white font-semibold shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
