import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  FaUser,
  FaUserMd,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

export const Register = () => {
  const [role, setRole] = useState('self_user'); // 'self_user' or 'clinician'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clinician extra fields
  const [title, setTitle] = useState('Dr.');
  const [specialization, setSpecialization] = useState('Clinical Psychologist');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registeringBody, setRegisteringBody] = useState('');
  const [institution, setInstitution] = useState('');

  // 2-Step Authentication state
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) {
      console.warn('[CEST Auth] VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In is hidden.');
    }
  }, [googleClientId]);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    const credential = credentialResponse?.credential;
    if (!credential) {
      setError('No credential received from Google sign-in.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await googleLogin(credential, role);
      if (result && result.success) {
        navigate(result.user?.role === 'clinician' ? '/dashboard/clinician' : '/dashboard/self');
      } else {
        setError(result?.message || 'Google registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was closed or failed. Please try again.');
  };

  // Step 1: Validate details and send 6-digit OTP code to the provided email
  const handleAuthenticate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Please provide your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const trimmedReg = registrationNumber.trim();
    if (role === 'clinician' && trimmedReg.length > 0) {
      if (trimmedReg.length < 3 || trimmedReg.length > 30) {
        setError('Professional registration number must be between 3 and 30 characters.');
        return;
      }
      const regRegex = /^[a-zA-Z0-9\-\/]+$/;
      if (!regRegex.test(trimmedReg)) {
        setError(
          'Professional registration number can only contain letters, numbers, hyphens (-), and slashes (/).'
        );
        return;
      }
    }

    setSendingOtp(true);

    try {
      const res = await authService.sendOtp({
        name: name.trim(),
        email: email.trim(),
        role,
        registrationNumber: role === 'clinician' ? trimmedReg : '',
        registeringBody: role === 'clinician' ? registeringBody.trim() : '',
      });

      if (res && res.success) {
        setStep('otp');
        setResendCooldown(60);
        setOtp('');
        setSuccessMessage(
          `A 6-digit authentication code has been sent to ${email.trim()}. Please enter it below.`
        );
      } else {
        setError(res?.message || 'Failed to send authentication code. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send authentication code. Please verify your email.'
      );
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend 6-digit OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || sendingOtp) return;

    setError('');
    setSuccessMessage('');
    setSendingOtp(true);

    try {
      const res = await authService.sendOtp({
        name: name.trim(),
        email: email.trim(),
        role,
        registrationNumber: role === 'clinician' ? registrationNumber.trim() : '',
        registeringBody: role === 'clinician' ? registeringBody.trim() : '',
      });

      if (res && res.success) {
        setResendCooldown(60);
        setSuccessMessage('A new 6-digit code has been sent to your email.');
      } else {
        setError(res?.message || 'Failed to resend code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend authentication code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP, create account, login, and redirect to dashboard
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        title: role === 'clinician' ? title : '',
        specialization: role === 'clinician' ? specialization : '',
        registrationNumber: role === 'clinician' ? registrationNumber.trim() : '',
        registeringBody: role === 'clinician' ? registeringBody.trim() : '',
        licenseNumber: role === 'clinician' ? registrationNumber.trim() : '',
        institution: role === 'clinician' ? institution : '',
        otp: cleanOtp,
      };

      const result = await register(payload);
      if (result && result.success) {
        navigate(role === 'clinician' ? '/dashboard/clinician' : '/dashboard/self');
      } else {
        setError(result?.message || 'Authentication failed. Please check the code.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please verify the code and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {step === 'form' ? (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Join CEST to access evidence-aligned assessments & cognitive tools.
              </p>
            </div>

            {/* Who Are You Role Selection Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Who are you? (Select Role)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Self User */}
                <div
                  onClick={() => setRole('self_user')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                    role === 'self_user'
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  {role === 'self_user' && (
                    <FaCheckCircle className="absolute top-3 right-3 text-brand-600 dark:text-brand-400 text-lg" />
                  )}
                  <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center text-base mb-2">
                    <FaUser />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Option 1: Self User</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    I want to assess and improve my own mental well-being and cognitive skills.
                  </p>
                </div>

                {/* Option 2: Clinician */}
                <div
                  onClick={() => setRole('clinician')}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                    role === 'clinician'
                      ? 'border-tealBrand-600 bg-tealBrand-50/60 dark:bg-tealBrand-950/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-tealBrand-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  {role === 'clinician' && (
                    <FaCheckCircle className="absolute top-3 right-3 text-tealBrand-600 dark:text-tealBrand-400 text-lg" />
                  )}
                  <div className="w-9 h-9 rounded-xl bg-tealBrand-600 text-white flex items-center justify-center text-base mb-2">
                    <FaUserMd />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Option 2: Clinician</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    I am a psychologist, psychiatrist, counselor, or qualified mental health professional monitoring patients.
                  </p>
                </div>

              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <FaExclamationCircle className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthenticate} className="space-y-4">
              
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'clinician' ? 'Dr. Sarah Jenkins' : 'Alex Johnson'}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cest.org"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>

              {/* Clinician Specific Extra Inputs */}
              {role === 'clinician' && (
                <div className="p-4 rounded-2xl bg-tealBrand-50/40 dark:bg-tealBrand-950/20 border border-tealBrand-200/60 dark:border-tealBrand-800/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tealBrand-700 dark:text-tealBrand-300">
                    Clinician Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-spec" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Specialization
                      </label>
                      <input
                        id="reg-spec"
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Psychiatry / Counseling"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-body" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Registering body (optional)
                      </label>
                      <select
                        id="reg-body"
                        value={registeringBody}
                        onChange={(e) => setRegisteringBody(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="">Select registering body (optional)</option>
                        <option value="National Medical Commission / State Medical Council">
                          National Medical Commission / State Medical Council
                        </option>
                        <option value="Rehabilitation Council of India">
                          Rehabilitation Council of India
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-license" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Professional registration number (optional)
                    </label>
                    <input
                      id="reg-license"
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. 12345/2021 or RCI-CRR-A12345"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1.5 leading-relaxed">
                      CEST does not automatically verify credentials. Your profile will show as unverified until it is reviewed.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      id="reg-password"
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

                <div>
                  <label htmlFor="reg-confirm" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Authenticate Button */}
              <button
                type="submit"
                disabled={sendingOtp}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  role === 'clinician' ? 'bg-tealBrand-600 hover:bg-tealBrand-700' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <FaShieldAlt />
                <span>{sendingOtp ? 'Sending Authentication Code...' : 'Authenticate'}</span>
              </button>
            </form>

            {/* Google Sign-up Section */}
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
                    text="signup_with"
                    shape="rectangular"
                    size="large"
                    width="100%"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                Sign In Here
              </Link>
            </div>
          </>
        ) : (
          /* Step 2: 6-Digit Code Authentication */
          <div className="space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
              <FaShieldAlt />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Authenticate Your Email
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                We've sent a 6-digit authentication code to{' '}
                <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
                Please enter it below to complete registration and log in.
              </p>
            </div>

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <FaCheckCircle className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2">
                <FaExclamationCircle className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="reg-otp"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                >
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center">
                  <input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="••••••"
                    className="w-64 text-center text-3xl font-mono tracking-[0.4em] py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 text-slate-900 dark:text-white font-extrabold shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  otp.length === 6 && !submitting
                    ? role === 'clinician'
                      ? 'bg-tealBrand-600 hover:bg-tealBrand-700'
                      : 'bg-brand-600 hover:bg-brand-700'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                }`}
              >
                <FaCheckCircle />
                <span>{submitting ? 'Authenticating & Logging In...' : 'Verify Code & Complete Login'}</span>
              </button>
            </form>

            <div className="space-y-3 pt-2 text-center text-xs">
              <div>
                {resendCooldown > 0 ? (
                  <span className="text-slate-400">
                    Resend code in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                  >
                    {sendingOtp ? 'Sending code...' : "Didn't receive code? Resend Code"}
                  </button>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                    setSuccessMessage('');
                    setOtp('');
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5 underline"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Change email or edit details</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
