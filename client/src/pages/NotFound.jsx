import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

export const NotFound = () => {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto">
        <FaExclamationTriangle />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404 - Page Not Found</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md">
        Return to Home Page
      </Link>
    </div>
  );
};
