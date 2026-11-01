import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import {
  FaLock,
  FaEnvelope,
  FaSignInAlt,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaUserMd,
} from 'react-icons/fa';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;
  const returnTo = location.state?.from?.pathname || location.state?.returnTo;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) {
      console.warn('[CEST Auth] VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In is hidden.');
    }
  }, [googleClientId]);

  const handleRedirect = (userRole) => {
    if (returnTo) {
      navigate(returnTo);
    } else if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate(userRole === 'clinician' ? '/dashboard/clinician' : '/dashboard/self');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result && result.success) {
        handleRedirect(result?.user?.role);
      } else {
        setError(result?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    const credential = credentialResponse?.credential;
    if (!credential) {
      setError('No credential received from Google sign-in.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await googleLogin(credential);
      if (result && result.success) {
        handleRedirect(result.user?.role);
      } else if (result && result.needsRole) {
        // New account: require role selection
        setPendingGoogleCredential(credential);
        setShowRoleModal(true);
      } else {
        setError(result?.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    if (!pendingGoogleCredential) return;
    setError('');
    setShowRoleModal(false);
    setSubmitting(true);

    try {
      const result = await googleLogin(pendingGoogleCredential, selectedRole);
      if (result && result.success) {
        handleRedirect(result.user?.role);
      } else {
        setError(result?.message || 'Google account creation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google account creation failed.');
    } finally {
      setSubmitting(false);
      setPendingGoogleCredential(null);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was closed or failed. Please try again.');
  };

  return (
    <div className="w-full max-w-md space-y-6">

      {redirectMessage && (
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-medium">
          {redirectMessage}
        </div>
      )}

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your CEST user or clinician dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <FaExclamationCircle className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@cest.org"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Google Sign-in Section */}
        {googleClientId && (
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
              <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase font-semibold absolute">
                or
              </span>
            </div>

            <div className="flex justify-center w-full min-h-[44px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
            Register Now
          </Link>
        </div>

      </div>

      {/* Role Selection Modal for New Google Users */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-slate-900 dark:text-white">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Select Account Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome to CEST! Please choose how you plan to use the platform:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleRoleSelection('self_user')}
                className="p-4 rounded-2xl border-2 border-brand-500/40 hover:border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center mb-2">
                  <FaUser className="text-sm" />
                </div>
                <div className="font-bold text-sm">Self User</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Track my wellbeing & practice cognitive exercises
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelection('clinician')}
                className="p-4 rounded-2xl border-2 border-tealBrand-500/40 hover:border-tealBrand-600 bg-tealBrand-50/50 dark:bg-tealBrand-950/40 text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-lg bg-tealBrand-600 text-white flex items-center justify-center mb-2">
                  <FaUserMd className="text-sm" />
                </div>
                <div className="font-bold text-sm">Clinician</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Psychologist, doctor, or counselor managing patients
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowRoleModal(false);
                setPendingGoogleCredential(null);
              }}
              className="w-full py-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
