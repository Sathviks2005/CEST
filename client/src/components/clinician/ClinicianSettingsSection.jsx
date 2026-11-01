import React, { useState, useEffect } from 'react';
import {
  FaCog,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSave,
  FaUserMd,
  FaHospital,
  FaIdBadge,
  FaShieldAlt,
  FaClock,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';
import { clinicianSettingsService } from '../../services/clinicianSettingsService';
import { useAuth } from '../../context/AuthContext';

export const ClinicianSettingsSection = () => {
  const { updateUserState } = useAuth() || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings State
  const [notifyUrgentEmail, setNotifyUrgentEmail] = useState(true);
  const [reportRangeDays, setReportRangeDays] = useState(90);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  // Profile Credentials State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [institution, setInstitution] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registeringBody, setRegisteringBody] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestingVerification, setRequestingVerification] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await clinicianSettingsService.getSettings();
      if (res?.data) {
        const { settings, smtpConfigured, profile } = res.data;
        setNotifyUrgentEmail(Boolean(settings?.notifyUrgentEmail));
        setReportRangeDays(settings?.reportRangeDays || 90);
        setSmtpConfigured(Boolean(smtpConfigured));

        if (profile) {
          setName(profile.name || '');
          setTitle(profile.title || 'Dr.');
          setSpecialization(profile.specialization || '');
          setInstitution(profile.institution || '');
          setRegistrationNumber(profile.registrationNumber || profile.licenseNumber || '');
          setRegisteringBody(profile.registeringBody || '');
          setVerificationStatus(profile.verificationStatus || 'unverified');
          setRejectionReason(profile.rejectionReason || '');
        }
      }
    } catch (err) {
      console.error('Failed to load clinician settings:', err);
      setErrorMsg('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRequestVerification = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setRequestingVerification(true);
    try {
      const res = await clinicianSettingsService.requestVerification();
      if (res?.data) {
        setVerificationStatus(res.data.verificationStatus || 'pending');
        setRejectionReason('');
        setSuccessMsg(res.message || 'Verification request submitted. Status is now pending.');
        if (updateUserState) {
          updateUserState({
            verificationStatus: 'pending',
            rejectionReason: '',
          });
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit verification request.');
    } finally {
      setRequestingVerification(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const trimmedReg = registrationNumber.trim();
    if (trimmedReg.length > 0) {
      if (trimmedReg.length < 3 || trimmedReg.length > 30) {
        setErrorMsg('Professional registration number must be between 3 and 30 characters.');
        setSaving(false);
        return;
      }
      const regRegex = /^[a-zA-Z0-9\-\/]+$/;
      if (!regRegex.test(trimmedReg)) {
        setErrorMsg(
          'Professional registration number can only contain letters, numbers, hyphens (-), and slashes (/).'
        );
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        settings: {
          notifyUrgentEmail: smtpConfigured ? notifyUrgentEmail : false,
          reportRangeDays: Number(reportRangeDays),
        },
        profile: {
          name: name.trim(),
          title: title.trim(),
          specialization: specialization.trim(),
          institution: institution.trim(),
          registrationNumber: trimmedReg,
          registeringBody: registeringBody.trim(),
          licenseNumber: trimmedReg,
        },
      };

      const res = await clinicianSettingsService.updateSettings(payload);
      if (res?.data) {
        setSuccessMsg('Settings and credentials updated successfully.');
        if (res.data.profile) {
          setRegistrationNumber(res.data.profile.registrationNumber || '');
          setRegisteringBody(res.data.profile.registeringBody || '');
          setVerificationStatus(res.data.profile.verificationStatus || 'unverified');
        }
        if (updateUserState && res.data.profile) {
          updateUserState(res.data.profile);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-500" />
        <p className="text-xs text-slate-400">Loading clinician configuration...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaCog className="text-xs" />
              <span>Portal Preferences</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Clinician Portal Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage clinical notifications, default reporting horizons, and your patient directory listing.
            </p>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-800 dark:text-tealBrand-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <FaCheckCircle className="text-tealBrand-600 dark:text-tealBrand-400 shrink-0 text-sm" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Setting 1: Urgent Email Notifications */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Notification Preferences
          </h3>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              smtpConfigured
                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80'
                : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-tealBrand-500 text-xs shrink-0" />
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Email me about new urgent requests
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Sends an instant clinical alert email when a patient connection request includes severe symptom intensity or crisis markers (Item 9 &gt; 0).
                </p>

                {!smtpConfigured && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                    <FaExclamationTriangle className="text-xs shrink-0" />
                    <span>Email is not configured on this server</span>
                  </div>
                )}
              </div>

              <div className="shrink-0 pt-1">
                <input
                  type="checkbox"
                  disabled={!smtpConfigured}
                  checked={smtpConfigured && notifyUrgentEmail}
                  onChange={(e) => setNotifyUrgentEmail(e.target.checked)}
                  className="w-5 h-5 rounded-md text-tealBrand-600 focus:ring-tealBrand-500 border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real Setting 2: Default Report Range */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Reporting Defaults
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              Default report range
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The initial lookback window applied when generating longitudinal patient summary reports.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[30, 90, 180].map((days) => (
                <label
                  key={days}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    reportRangeDays === days
                      ? 'bg-tealBrand-500/15 border-tealBrand-500 text-tealBrand-700 dark:text-tealBrand-300 font-extrabold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportRangeDays"
                    value={days}
                    checked={reportRangeDays === days}
                    onChange={() => setReportRangeDays(days)}
                    className="sr-only"
                  />
                  <span className="block text-sm">{days} Days</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {days === 90 ? '(Recommended)' : `${days / 30} Months`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Real Setting 3: Clinician Public Credentials */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clinician Directory Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These details are what patients see in the self-user clinician directory when choosing a clinician to link with.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <FaCheckCircle className="text-emerald-500" /> Credentials Verified
                </span>
              ) : verificationStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold">
                  <FaClock className="text-sky-500" /> Verification Pending Review
                </span>
              ) : verificationStatus === 'rejected' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  <FaTimes className="text-rose-500" /> Verification Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <FaShieldAlt className="text-amber-500" /> Unverified Profile
                </span>
              )}
            </div>
          </div>

          {verificationStatus === 'rejected' && rejectionReason && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                <FaExclamationTriangle className="shrink-0 text-sm" />
                <span>Verification Request Rejected</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Reviewer feedback:</strong> "{rejectionReason}"
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                You can review or correct your registration details below and click "Request Verification" again.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dr., MD, PsyD, LCSW"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Adult Psychiatry & Cognitive Enhancement"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institution / Practice
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University Outpatient Behavioral Health"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registering Body (optional)
              </label>
              <select
                value={registeringBody}
                onChange={(e) => setRegisteringBody(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
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

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professional Registration Number (optional)
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. 12345/2021 or RCI-CRR-A12345"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealBrand-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1 text-xs">
            <p className="text-slate-600 dark:text-slate-300 italic">
              CEST does not automatically verify credentials. Your profile will show as unverified until it is reviewed.
            </p>
            <p className="text-[11px] text-slate-400">
              Note: Your registration number is visible only to you. Editing your registration number or registering body will reset your status to unverified.
            </p>
          </div>
        </div>

        {/* Submit and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={
                  requestingVerification ||
                  saving ||
                  !registrationNumber.trim() ||
                  !registeringBody.trim()
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  !registrationNumber.trim() || !registeringBody.trim()
                    ? 'Enter both registration number and registering body first'
                    : 'Submit credentials for admin verification'
                }
              >
                {requestingVerification ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaPaperPlane className="text-xs" />
                )}
                <span>Request Verification</span>
              </button>
            )}
            {verificationStatus === 'pending' && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <FaClock />
                <span>Verification request is currently pending review</span>
              </div>
            )}
            {verificationStatus === 'verified' && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FaCheckCircle />
                <span>Credentials verified by administrator</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-6 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
            <span>Save Preferences &amp; Profile</span>
          </button>
        </div>
      </div>
    </form>
  );
};
