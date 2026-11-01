import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res && res.success) {
        setSubmitted(true);
        if (res.devMode) {
          setDevMode(true);
          setDevResetUrl(res.resetUrl || '');
        }
      } else {
        setError(res?.message || 'Please enter a valid, registered email address');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Please enter a valid, registered email address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
          <FaArrowLeft /> Back to Login
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <FaExclamationCircle className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            {devMode ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs text-left space-y-3">
                <div className="font-bold text-sm flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <FaExclamationCircle className="text-base shrink-0" />
                  <span>Development Mode Notice</span>
                </div>
                <p className="leading-relaxed">
                  SMTP credentials are not configured on the server. The password reset link was printed directly to the server terminal console.
                </p>
                {devResetUrl && (
                  <div className="pt-1">
                    <Link
                      to={devResetUrl.replace(/^https?:\/\/[^\/]+/, '')}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Open Reset Link (Dev Shortcut)
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <FaCheckCircle className="text-4xl text-tealBrand-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  If an account exists for <strong>{email}</strong>, a recovery link has been sent. Please inspect your inbox and spam folder.
                </p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cest.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FaPaperPlane />
              <span>{submitting ? 'Sending Request...' : 'Send Recovery Link'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
