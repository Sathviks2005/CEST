import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FaUserMd,
  FaUsers,
  FaFileAlt,
  FaTasks,
  FaCog,
  FaPlus,
  FaSave,
  FaCheckCircle,
  FaStethoscope,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaEnvelope,
  FaClock,
  FaLock,
  FaPaperPlane,
  FaExternalLinkAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import { patientService } from '../services/patientService';
import { clinicianLinkService } from '../services/clinicianLinkService';
import { assignedExerciseService } from '../services/assignedExerciseService';
import { PatientProfile } from '../components/patient/PatientProfile';
import { ClinicianExerciseCatalog } from '../components/exercise/ClinicianExerciseCatalog';
import { NeedsAttentionCard } from '../components/clinician/NeedsAttentionCard';
import { PatientReportView } from '../components/clinician/PatientReportView';
import { ClinicianSettingsSection } from '../components/clinician/ClinicianSettingsSection';
import { ClinicianQuestionnairesTab } from '../components/assessment/ClinicianQuestionnairesTab';
import { clinicianSettingsService } from '../services/clinicianSettingsService';
import { FaClipboardList } from 'react-icons/fa';

export const ClinicianDashboard = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || 'Dr.');
  const [specialization, setSpecialization] = useState(user?.specialization || 'Clinical Psychologist');
  const [registrationNumber, setRegistrationNumber] = useState(user?.registrationNumber || user?.licenseNumber || '');
  const [registeringBody, setRegisteringBody] = useState(user?.registeringBody || '');
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus || 'unverified');
  const [rejectionReason, setRejectionReason] = useState(user?.rejectionReason || '');
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [institution, setInstitution] = useState(user?.institution || 'General Health Medical Center');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.verificationStatus) setVerificationStatus(user.verificationStatus);
      if (user.rejectionReason !== undefined) setRejectionReason(user.rejectionReason || '');
      if (user.registrationNumber) setRegistrationNumber(user.registrationNumber);
      if (user.registeringBody) setRegisteringBody(user.registeringBody);
    }
  }, [user]);

  const handleRequestVerification = async () => {
    setVerificationError('');
    setVerificationFeedback('');
    setRequestingVerification(true);
    try {
      const res = await clinicianSettingsService.requestVerification();
      if (res?.data) {
        setVerificationStatus(res.data.verificationStatus || 'pending');
        setRejectionReason('');
        setVerificationFeedback(res.message || 'Verification request submitted. Status is now pending.');
        setTimeout(() => setVerificationFeedback(''), 5000);
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Failed to submit verification request. Please try again.');
      setTimeout(() => setVerificationError(''), 5000);
    } finally {
      setRequestingVerification(false);
    }
  };

  // Real Patients dataset state
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Connection requests & alerts state
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [declineNoteOpenId, setDeclineNoteOpenId] = useState(null);
  const [declineNoteText, setDeclineNoteText] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  // Notification badge counts
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [urgentRequestsCount, setUrgentRequestsCount] = useState(0);
  const [overdueAssignmentsCount, setOverdueAssignmentsCount] = useState(0);

  // Patient Invitations state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState('');
  const [sentInvites, setSentInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Add Patient Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState('prefer_not_to_say');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addError, setAddError] = useState('');
  const [submittingPatient, setSubmittingPatient] = useState(false);

  const fetchNotificationCounts = async () => {
    try {
      const res = await clinicianLinkService.getCounts();
      if (res?.data) {
        setPendingRequestsCount(res.data.pendingRequests || 0);
        setUrgentRequestsCount(res.data.urgentRequests || 0);
      }
      const overdueRes = await assignedExerciseService.getClinicianCounts();
      if (overdueRes?.data?.overdueCount !== undefined) {
        setOverdueAssignmentsCount(overdueRes.data.overdueCount);
      }
    } catch {
      // offline fallback
    }
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setPatientsError('');
    try {
      const res = await patientService.getMyPatients();
      if (res?.data) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load clinician patients:', err);
      setPatientsError(err.response?.data?.message || 'Failed to fetch patients roster.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await clinicianLinkService.getClinicianRequests('pending');
      setPendingRequests(res?.data || []);
      fetchNotificationCounts();
    } catch (err) {
      console.error('Failed to load clinician connection requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchSentInvites = async () => {
    setLoadingInvites(true);
    try {
      const res = await clinicianLinkService.getInvites();
      setSentInvites(res?.data || []);
    } catch (err) {
      console.error('Failed to load clinician invites:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Polling every 60s while visible
  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotificationCounts();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchPendingRequests();
    fetchSentInvites();

    const handleLinkUpdated = () => {
      fetchPatients();
      fetchPendingRequests();
      fetchSentInvites();
      fetchNotificationCounts();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cest:clinician-link-updated', handleLinkUpdated);
      return () => window.removeEventListener('cest:clinician-link-updated', handleLinkUpdated);
    }
  }, []);

  const handleAcceptRequest = async (requestId) => {
    setActionInProgress(true);
    try {
      await clinicianLinkService.acceptRequest(requestId);
      setActionFeedback('Connection request accepted. Patient successfully added to your roster.');
      setTimeout(() => setActionFeedback(''), 4000);
      await Promise.all([fetchPendingRequests(), fetchPatients()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setActionInProgress(true);
    try {
      await clinicianLinkService.declineRequest(requestId, declineNoteText);
      setDeclineNoteOpenId(null);
      setDeclineNoteText('');
      setActionFeedback('Request declined.');
      setTimeout(() => setActionFeedback(''), 4000);
      await fetchPendingRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSubmittingInvite(true);
    setInviteFeedback('');

    try {
      const res = await clinicianLinkService.invitePatient({
        email: inviteEmail.trim(),
        message: inviteMessage.trim(),
      });
      setInviteFeedback(res.message || 'If this person has an account, they will see your invitation.');
      setInviteEmail('');
      setInviteMessage('');
      await fetchSentInvites();
    } catch (err) {
      setInviteFeedback(
        err.response?.data?.message || 'If this person has an account, they will see your invitation.'
      );
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;
    try {
      await clinicianLinkService.cancelInvite(inviteId);
      await fetchSentInvites();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const trimmedReg = registrationNumber.trim();
    if (trimmedReg.length > 0) {
      if (trimmedReg.length < 3 || trimmedReg.length > 30) {
        alert('Professional registration number must be between 3 and 30 characters.');
        return;
      }
      const regRegex = /^[a-zA-Z0-9\-\/]+$/;
      if (!regRegex.test(trimmedReg)) {
        alert(
          'Professional registration number can only contain letters, numbers, hyphens (-), and slashes (/).'
        );
        return;
      }
    }

    try {
      await updateProfile({
        name: profileName,
        title,
        specialization,
        registrationNumber: trimmedReg,
        registeringBody: registeringBody.trim(),
        licenseNumber: trimmedReg,
        institution,
      });
      setVerificationStatus('unverified');
      setRejectionReason('');
      setVerificationFeedback('');
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError('Patient name is required.');
      return;
    }

    setSubmittingPatient(true);
    setAddError('');

    try {
      await patientService.createPatient({
        name: newName,
        age: newAge ? Number(newAge) : undefined,
        dob: newDob || undefined,
        gender: newGender,
        email: newEmail,
        phone: newPhone,
      });

      // Reset modal inputs & refresh roster
      setNewName('');
      setNewAge('');
      setNewDob('');
      setNewGender('prefer_not_to_say');
      setNewEmail('');
      setNewPhone('');
      setShowAddModal(false);
      fetchPatients();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create patient record.');
    } finally {
      setSubmittingPatient(false);
    }
  };

  const urgentItems = pendingRequests.filter((r) => r.urgent || r.isHighestBandAlert);
  const newNonUrgentRequests = pendingRequests.filter((r) => !r.urgent && !r.isHighestBandAlert);

  return (
    <div className="space-y-8">
      {/* Welcome Screen */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-tealBrand-200/80 dark:border-tealBrand-900/60 bg-gradient-to-r from-tealBrand-600/10 via-brand-500/10 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaStethoscope />
              <span>Clinician Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome, {title} {user?.name || 'Practitioner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {specialization} • {institution || 'CEST Clinical Network'}
            </p>
          </div>

          {verificationStatus === 'verified' ? (
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shrink-0">
              <FaCheckCircle className="text-emerald-500" />
              <span>Credentials Verified</span>
            </div>
          ) : verificationStatus === 'pending' ? (
            <div className="px-4 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2 shrink-0">
              <FaClock className="text-sky-500" />
              <span>Verification Pending Review</span>
            </div>
          ) : verificationStatus === 'rejected' ? (
            <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2 shrink-0">
              <FaTimes className="text-rose-500" />
              <span>Verification Rejected</span>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2 shrink-0">
              <FaShieldAlt className="text-amber-500" />
              <span>Unverified Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          {
            id: 'overview',
            label: 'Overview',
            icon: FaUserMd,
            badge: pendingRequests.length > 0 ? pendingRequests.length : null,
            badgeColor: urgentRequestsCount > 0 ? 'bg-rose-500' : 'bg-tealBrand-600',
          },
          { id: 'profile', label: 'Clinician Profile', icon: FaUserMd },
          { id: 'patients', label: 'Patient Management', icon: FaUsers, badge: patients.length },
          { id: 'questionnaires', label: 'Clinical Questionnaires', icon: FaClipboardList },
          { id: 'reports', label: 'Clinical Reports', icon: FaFileAlt },
          {
            id: 'activities',
            label: 'Assign Activities',
            icon: FaTasks,
            badge: overdueAssignmentsCount > 0 ? overdueAssignmentsCount : null,
            badgeColor: 'bg-rose-500',
          },
          { id: 'settings', label: 'Settings', icon: FaCog },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'patients') setSelectedPatient(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-tealBrand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
              {Boolean(tab.badge) && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-white text-[10px] font-extrabold ${
                    tab.badgeColor || 'bg-slate-700'
                  } animate-pulse`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* NEEDS ATTENTION PRIORITIZED TRIAGE CARD */}
          <NeedsAttentionCard
            onSelectPatient={(patientId) => {
              const matched = patients.find(
                (p) => String(p._id || p.id) === String(patientId)
              );
              if (matched) {
                setSelectedPatient(matched);
                setActiveTab('patients');
              }
            }}
          />

          {/* 1. URGENT CONNECTION REQUESTS & ALERTS CARD */}
            {urgentItems.length > 0 && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/10 via-slate-900/50 to-transparent space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center text-lg">
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                        <span>Urgent Clinical Review Requests</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
                          Urgent ({urgentItems.length})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Patients with severe symptom intensity or crisis flags requiring prompt clinical review
                      </p>
                    </div>
                  </div>
                </div>

                {actionFeedback && (
                  <div className="p-3 rounded-xl bg-tealBrand-500/15 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-semibold flex items-center gap-2">
                    <FaCheckCircle /> {actionFeedback}
                  </div>
                )}

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {urgentItems.map((req) => (
                    <div key={req._id || req.id} className="py-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
                              {req.isHighestBandAlert ? 'New highest-band result' : 'Urgent'}
                            </span>
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {req.patientName}
                            </h4>
                            {req.itemNineFlag && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">
                                Crisis Flag: Item 9 &gt; 0
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white">{req.instrument}</strong> &bull;{' '}
                            <span className="text-rose-600 dark:text-rose-400 font-bold">{req.severity}</span> (Score:{' '}
                            {req.score})
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {req.isHighestBandAlert
                              ? `Alert triggered on ${new Date(req.lastAlertAt || req.createdAt).toLocaleString()}`
                              : `Requested on ${new Date(req.createdAt).toLocaleString()}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.isHighestBandAlert ? (
                            <button
                              type="button"
                              onClick={() => {
                                const matched = patients.find(
                                  (p) =>
                                    String(p.linkedUser) === String(req.patientUserId) ||
                                    p.name?.toLowerCase() === req.patientName?.toLowerCase()
                                );
                                if (matched) {
                                  setSelectedPatient(matched);
                                  setActiveTab('patients');
                                } else {
                                  setActiveTab('patients');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                            >
                              <FaUserMd /> View Patient Profile
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(req._id || req.id)}
                                disabled={actionInProgress}
                                className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <FaCheckCircle /> Accept &amp; Add Patient
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (declineNoteOpenId === req._id) {
                                    setDeclineNoteOpenId(null);
                                  } else {
                                    setDeclineNoteOpenId(req._id);
                                    setDeclineNoteText('');
                                  }
                                }}
                                disabled={actionInProgress}
                                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Optional decline note box */}
                      {declineNoteOpenId === req._id && !req.isHighestBandAlert && (
                        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-2 animate-fadeIn">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Optional Note to Patient (max 300 characters):
                          </label>
                          <textarea
                            value={declineNoteText}
                            maxLength={300}
                            onChange={(e) => setDeclineNoteText(e.target.value)}
                            placeholder="e.g., Practice capacity is currently full; please reach out to Dr. Y or local clinic."
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
                            rows={2}
                          />
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{300 - declineNoteText.length} characters left</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDeclineNoteOpenId(null)}
                                className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineRequest(req._id || req.id)}
                                disabled={actionInProgress}
                                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow disabled:opacity-50"
                              >
                                Confirm Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. NEW REQUESTS (NON-URGENT) CARD */}
            {newNonUrgentRequests.length > 0 && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-tealBrand-500/40 bg-tealBrand-500/5 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-tealBrand-500/20 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-lg">
                      <FaClipboardCheck />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                        <span>New Requests</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          {newNonUrgentRequests.length} New
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Standard patient connection requests for routine evaluation and clinical supervision
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {newNonUrgentRequests.map((req) => (
                    <div key={req._id || req.id} className="py-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-tealBrand-500/20 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-500/30 text-[10px] font-extrabold uppercase">
                              Standard Request
                            </span>
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {req.patientName}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white">{req.instrument}</strong> &bull;{' '}
                            <span>{req.severity}</span> {req.score !== undefined && `(Score: ${req.score})`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Requested on {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(req._id || req.id)}
                            disabled={actionInProgress}
                            className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FaCheckCircle /> Accept &amp; Add Patient
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (declineNoteOpenId === req._id) {
                                setDeclineNoteOpenId(null);
                              } else {
                                setDeclineNoteOpenId(req._id);
                                setDeclineNoteText('');
                              }
                            }}
                            disabled={actionInProgress}
                            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </div>

                      {/* Optional decline note box */}
                      {declineNoteOpenId === req._id && (
                        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-2 animate-fadeIn">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Optional Note to Patient (max 300 characters):
                          </label>
                          <textarea
                            value={declineNoteText}
                            maxLength={300}
                            onChange={(e) => setDeclineNoteText(e.target.value)}
                            placeholder="e.g., Practice capacity is full; please reach out to our clinic partner."
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
                            rows={2}
                          />
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{300 - declineNoteText.length} characters left</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDeclineNoteOpenId(null)}
                                className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeclineRequest(req._id || req.id)}
                                disabled={actionInProgress}
                                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow disabled:opacity-50"
                              >
                                Confirm Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-emergency Service Disclaimer Notice */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <FaLock className="text-tealBrand-500 text-xs" />
                <span>Clinical Triage Notice</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                This is a request for clinician review, not an emergency service and not real-time monitoring. Standard response workflows apply.
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Patients</span>
                <FaUsers className="text-tealBrand-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {patients.length}
              </p>
              <p className="text-[11px] text-slate-400">Registered clinician patients</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Pending Reviews</span>
                <FaClipboardCheck className="text-brand-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {pendingRequests.length}
              </p>
              <p className="text-[11px] text-slate-400">
                {pendingRequests.length === 1 ? '1 urgent request waiting' : `${pendingRequests.length} requests waiting`}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Assigned Modules</span>
                <FaTasks className="text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">4</p>
              <p className="text-[11px] text-slate-400">Cognitive exercises assigned</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Clinical Reports</span>
                <FaFileAlt className="text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">0</p>
              <p className="text-[11px] text-slate-400">PDF engine ready in Phase 2</p>
            </div>
          </div>

          {/* Quick Roster Overview */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Patient Roster
              </h3>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setActiveTab('patients');
                }}
                className="text-xs font-semibold text-tealBrand-600 dark:text-tealBrand-400"
              >
                View Full Roster
              </button>
            </div>

            {loadingPatients ? (
              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-tealBrand-500" /> Loading patients...
              </div>
            ) : patients.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">
                No patients registered yet. Go to Patient Management to add your first patient.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {patients.slice(0, 5).map((p) => (
                  <div key={p._id || p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.age ? `Age ${p.age}` : 'Age unassigned'} • {p.email || 'No email'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(p);
                        setActiveTab('patients');
                      }}
                      className="px-3 py-1 rounded-lg bg-tealBrand-50 dark:bg-slate-800 text-tealBrand-600 dark:text-tealBrand-400 text-xs font-semibold"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLINICIAN PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaUserMd className="text-tealBrand-500" />
              <span>Clinician Professional Credentials</span>
            </h2>
            <div>
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
                <span className="font-semibold text-slate-900 dark:text-white">Admin review note: </span>
                {rejectionReason}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Please review your professional registration number and registering body below, update the details if needed, and submit a new verification request.
              </p>
            </div>
          )}

          {verificationFeedback && (
            <div className="p-3.5 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950/40 border border-tealBrand-200 dark:border-tealBrand-800 text-tealBrand-800 dark:text-tealBrand-200 text-xs font-semibold flex items-center gap-2">
              <FaCheckCircle className="text-tealBrand-500" />
              <span>{verificationFeedback}</span>
            </div>
          )}

          {verificationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <FaExclamationTriangle className="text-rose-500" />
              <span>{verificationError}</span>
            </div>
          )}

          {savedMsg && (
            <div className="p-3 rounded-xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-semibold flex items-center gap-2">
              <FaCheckCircle /> Credentials updated successfully! (Status reset to unverified)
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Institution / Practice
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Registering Body (optional)
                </label>
                <select
                  value={registeringBody}
                  onChange={(e) => setRegisteringBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
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
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Professional Registration Number (optional)
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. 12345/2021 or RCI-CRR-A12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <p className="text-slate-600 dark:text-slate-300 italic">
                CEST does not automatically verify credentials. Your profile will show as unverified until it is reviewed.
              </p>
              <p className="text-[11px] text-slate-400">
                Note: Your registration number is visible only to you. Editing your registration number or registering body will reset your status to unverified.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
                  <button
                    type="button"
                    onClick={handleRequestVerification}
                    disabled={
                      requestingVerification ||
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
                className="px-6 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <FaSave /> Save Credentials
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PATIENT MANAGEMENT TAB */}
      {activeTab === 'patients' && (
        <>
          {selectedPatient ? (
            <PatientProfile
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Patient Roster Management
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInviteEmail('');
                      setInviteMessage('');
                      setInviteFeedback('');
                      setShowInviteModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-tealBrand-400 border border-tealBrand-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition-all"
                  >
                    <FaEnvelope /> Invite Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddError('');
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-tealBrand-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-tealBrand-700 transition-all"
                  >
                    <FaPlus /> Add New Patient
                  </button>
                </div>
              </div>

              {patientsError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <FaExclamationTriangle className="shrink-0" />
                  <span>{patientsError}</span>
                </div>
              )}

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                {loadingPatients ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-500" />
                    <p className="text-xs">Loading patient roster...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <FaUsers className="text-3xl text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 dark:text-slate-400">
                      No patients added yet
                    </p>
                    <p>Click "Add New Patient" or "Invite Patient" above to register or link a patient.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patients.map((p) => (
                      <div
                        key={p._id || p.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                              {p.name}
                            </h3>
                            {p.linkedUser && p.linkStatus === 'accepted' ? (
                              <span className="px-2 py-0.5 rounded-full bg-tealBrand-500/20 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-500/30 text-[10px] font-bold">
                                Linked
                              </span>
                            ) : p.linkedUser && p.linkStatus === 'revoked' ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                Sharing paused
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                Clinic patient (not on the app)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {p.age ? `Age: ${p.age}` : 'Age: N/A'} • Gender: {p.gender || 'unspecified'} • Email: {p.email || 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Added: {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPatient(p)}
                            className="px-4 py-2 rounded-xl bg-tealBrand-50 dark:bg-slate-800 text-tealBrand-600 dark:text-tealBrand-400 text-xs font-bold hover:bg-tealBrand-100 transition-all"
                          >
                            View Profile & HAM-D
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INVITATIONS SENT LIST */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <FaPaperPlane className="text-tealBrand-500 text-sm" /> Sent Invitations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Invitations sent to patients to link their self-assessment dashboard with your clinical practice
                    </p>
                  </div>
                  {sentInvites.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {sentInvites.length} Total
                    </span>
                  )}
                </div>

                {loadingInvites ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <FaSpinner className="animate-spin text-lg mx-auto text-tealBrand-500 mb-2" />
                    Loading sent invitations...
                  </div>
                ) : sentInvites.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active invitations sent. Click "Invite Patient" to connect with a self-user.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sentInvites.map((inv) => (
                      <div key={inv._id || inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {inv.patientUser?.name || 'Invited User'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'invited'
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : inv.status === 'accepted'
                                ? 'bg-tealBrand-100 dark:bg-tealBrand-950/40 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-300 dark:border-tealBrand-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Sent on {new Date(inv.createdAt).toLocaleDateString()}
                            {inv.expiresAt && ` • Expires: ${new Date(inv.expiresAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        {inv.status === 'invited' && (
                          <button
                            type="button"
                            onClick={() => handleCancelInvite(inv._id || inv.id)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all self-start sm:self-auto"
                          >
                            Cancel Invite
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* CLINICAL QUESTIONNAIRES TAB */}
      {activeTab === 'questionnaires' && (
        <ClinicianQuestionnairesTab
          patients={patients}
          loadingPatients={loadingPatients}
          onPatientCreated={fetchPatients}
        />
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <PatientReportView
          patients={patients}
          initialPatientId={selectedPatient?._id || selectedPatient?.id || ''}
          defaultRange={user?.settings?.reportRangeDays || 90}
        />
      )}

      {/* ASSIGN ACTIVITIES TAB (EXERCISE CATALOG & ASSIGNMENT ENGINE) */}
      {activeTab === 'activities' && (
        <ClinicianExerciseCatalog
          patients={patients}
          initialSelectedPatientId={selectedPatient?._id || selectedPatient?.id || ''}
          onAssignmentCreated={fetchNotificationCounts}
        />
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && <ClinicianSettingsSection />}

      {/* ADD NEW PATIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaUsers className="text-tealBrand-500" /> Register New Clinical Patient
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                <FaTimes />
              </button>
            </div>

            {addError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <FaExclamationTriangle className="shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 32"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +1 555-0142"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. patient@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPatient}
                  className="px-6 py-2.5 rounded-xl bg-tealBrand-600 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingPatient ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Register Patient'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE PATIENT MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 glass-panel rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center">
                  <FaEnvelope />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Invite Patient to Connect
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Send an invitation to a registered self-assessment user
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteFeedback('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {inviteFeedback ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-tealBrand-50 dark:bg-tealBrand-950/40 border border-tealBrand-200 dark:border-tealBrand-800 text-tealBrand-800 dark:text-tealBrand-200 text-xs font-medium space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <FaCheckCircle className="text-tealBrand-600 dark:text-tealBrand-400" />
                    <span>Invitation Processed</span>
                  </div>
                  <p>{inviteFeedback}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteFeedback('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-tealBrand-600 text-white font-bold text-xs shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tealBrand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The user will see this invitation in their dashboard's "My Clinician" area.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Optional Welcome Note (max 300 characters)
                  </label>
                  <textarea
                    maxLength={300}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="e.g., Looking forward to our intake session. Please connect your assessment results so we can review your trajectory together."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tealBrand-500"
                  />
                  <div className="text-[10px] text-slate-400 text-right">
                    {300 - inviteMessage.length} characters left
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <FaLock className="text-tealBrand-500" /> Privacy &amp; Security Note
                  </p>
                  <p>
                    No patient health data will be shared until the patient reviews and explicitly consents to connecting. Rate limit: 20 invites per day.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvite || !inviteEmail.trim()}
                    className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingInvite ? (
                      <>
                        <FaSpinner className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
