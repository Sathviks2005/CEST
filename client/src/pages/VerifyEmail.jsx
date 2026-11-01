import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaEnvelopeOpenText, FaArrowLeft } from 'react-icons/fa';

export const VerifyEmail = () => {
  const [verified, setVerified] = useState(false);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-tealBrand-50 dark:bg-slate-800 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center text-3xl mx-auto">
          {verified ? <FaCheckCircle /> : <FaEnvelopeOpenText />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {verified ? 'Email Verified!' : 'Email Verification'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {verified
              ? 'Your email address has been successfully confirmed.'
              : 'Please confirm your email address to enable all security features.'}
          </p>
        </div>

        {!verified ? (
          <button
            onClick={() => setVerified(true)}
            className="w-full py-3.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Simulate Email Verification Link
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-block w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md"
          >
            Proceed to Login
          </Link>
        )}

      </div>
    </div>
  );
};
