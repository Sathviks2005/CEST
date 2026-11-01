import React, { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaUserInjured,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaClipboardCheck,
  FaSpinner,
  FaHistory,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaLink,
  FaShieldAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaLock,
  FaSyncAlt,
  FaTimes,
} from 'react-icons/fa';
import { hamdService } from '../../services/hamdService';
import { clinicianLinkService } from '../../services/clinicianLinkService';
import { assignedExerciseService } from '../../services/assignedExerciseService';
import { HamDAssessment } from '../assessment/HamDAssessment';
import { HamDScoreScale } from '../assessment/HamDScoreScale';
import { FaTasks, FaClock, FaHeartbeat } from 'react-icons/fa';
import { ClinicianNotesSection } from '../clinician/ClinicianNotesSection';
import { PatientQuestionnairesSection } from '../assessment/PatientQuestionnairesSection';

export const PatientProfile = ({ patient, onBack }) => {
  const [evaluating, setEvaluating] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Invite modal state for walk-in / unconnected patients
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(patient?.email || '');
  const [inviteMessage, setInviteMessage] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState('');

  // Self-user linked assessments state
  const [selfAssessments, setSelfAssessments] = useState([]);
  const [loadingSelfAssessments, setLoadingSelfAssessments] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);
  const [sharingRevoked, setSharingRevoked] = useState(false);
  const [selectedSelfRecord, setSelectedSelfRecord] = useState(null);
  const [instrumentFilter, setInstrumentFilter] = useState('ALL');
  const [assignedActivities, setAssignedActivities] = useState([]);
  const [loadingAssignedExercises, setLoadingAssignedExercises] = useState(false);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSubmittingInvite(true);
    setInviteFeedback('');
    try {
      await clinicianLinkService.sendInvite({
        email: inviteEmail.trim(),
        message: inviteMessage.trim() || undefined,
      });
      setInviteFeedback(`Invitation successfully dispatched to ${inviteEmail.trim()}.`);
    } catch (err) {
      setInviteFeedback(err.response?.data?.message || 'Failed to dispatch invitation.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const fetchAssignedExercises = async () => {
    if (!patient?.linkedUser) {
      setAssignedActivities([]);
      return;
    }
    setLoadingAssignedExercises(true);
    try {
      const res = await assignedExerciseService.getPatientAssignments(patient.linkedUser);
      setAssignedActivities(res.data || []);
    } catch (err) {
      console.error('Failed to load patient assignments in profile:', err);
      setAssignedActivities([]);
    } finally {
      setLoadingAssignedExercises(false);
    }
  };

  const fetchPatientAssessments = async () => {
    if (!patient) return;
    setLoadingAssessments(true);
    try {
      const res = await hamdService.getMyHamdAssessments();
      if (res?.data) {
        const patientId = patient._id || patient.id;
        const filtered = res.data.filter(
          (a) =>
            (a.patientId && String(a.patientId) === String(patientId)) ||
            (a.patientName && a.patientName.toLowerCase() === patient.name.toLowerCase())
        );
        setAssessments(filtered);
      }
    } catch (err) {
      console.error('Failed to load patient assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const fetchLinkedAssessments = async () => {
    const targetId =
      (typeof patient?.linkedUser === 'object'
        ? patient.linkedUser._id || patient.linkedUser.id
        : patient?.linkedUser) || patient?._id || patient?.id;
    if (!targetId) return;

    setLoadingSelfAssessments(true);
    setSharingRevoked(false);
    try {
      const res = await clinicianLinkService.getPatientAssessments(targetId);
      if (res?.notLinked) {
        setSelfAssessments([]);
        setLinkInfo(null);
      } else {
        setSelfAssessments(res.data || []);
        setLinkInfo(res.linkInfo || null);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setSharingRevoked(true);
      }
      setSelfAssessments([]);
    } finally {
      setLoadingSelfAssessments(false);
    }
  };

  useEffect(() => {
    fetchPatientAssessments();
    fetchLinkedAssessments();
    if (patient?.linkedUser) {
      fetchAssignedExercises();
    } else {
      setAssignedActivities([]);
    }

    const handleUpdate = () => {
      fetchPatientAssessments();
      fetchLinkedAssessments();
      if (patient?.linkedUser) {
        fetchAssignedExercises();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cest:clinician-link-updated', handleUpdate);
      window.addEventListener('focus', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cest:clinician-link-updated', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      }
    };
  }, [patient]);

  if (!patient) return null;

  if (evaluating) {
    return (
      <HamDAssessment
        initialPatientName={patient.name}
        initialPatientId={patient._id || patient.id}
        onCancel={() => setEvaluating(false)}
        onComplete={() => {
          setEvaluating(false);
          fetchPatientAssessments();
        }}
      />
    );
  }

  // Filter self-assessments by selected instrument
  const filteredSelfAssessments = selfAssessments.filter((a) => {
    if (instrumentFilter === 'ALL') return true;
    const type = (a.assessmentType || '').toLowerCase();
    const slug = (a.disorderSlug || '').toLowerCase();
    if (instrumentFilter === 'PHQ9') return type.includes('phq') || slug.includes('depression');
    if (instrumentFilter === 'GAD7') return type.includes('gad') || slug.includes('anxiety');
    if (instrumentFilter === 'ISI') return type.includes('isi') || slug.includes('insomnia');
    if (instrumentFilter === 'PCL5') return type.includes('pcl') || slug.includes('ptsd');
    if (instrumentFilter === 'YBOCS') return type.includes('y-bocs') || type.includes('ybocs') || slug.includes('ocd');
    return true;
  });

  // Calculate points for trend line SVG
  const chartWidth = 540;
  const chartHeight = 150;
  const paddingX = 40;
  const paddingY = 25;

  const chronologicalAssessments = [...filteredSelfAssessments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const maxScaleScore = (() => {
    if (instrumentFilter === 'GAD7') return 21;
    if (instrumentFilter === 'PHQ9') return 27;
    if (instrumentFilter === 'ISI') return 28;
    if (instrumentFilter === 'YBOCS') return 40;
    if (instrumentFilter === 'PCL5') return 80;
    return 80;
  })();

  const chartPoints = chronologicalAssessments.map((item, idx) => {
    const totalCount = chronologicalAssessments.length;
    const x =
      totalCount <= 1
        ? chartWidth / 2
        : paddingX + (idx / (totalCount - 1)) * (chartWidth - 2 * paddingX);
    const normalizedScore = Math.min(item.totalScore, maxScaleScore);
    const y =
      chartHeight -
      paddingY -
      (normalizedScore / maxScaleScore) * (chartHeight - 2 * paddingY);
    return { x, y, item };
  });

  const polylinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const acceptedDate = linkInfo?.acceptedAt
    ? new Date(linkInfo.acceptedAt).toLocaleDateString()
    : patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString()
      : 'Recently';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all shrink-0"
              title="Back to Patient Roster"
            >
              <FaArrowLeft />
            </button>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
                  <FaUserInjured /> Patient Profile
                </span>

                {/* Linked Patient Badges */}
                {patient.linkedUser ? (
                  sharingRevoked ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1">
                      <FaShieldAlt /> Sharing stopped
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/15 border border-tealBrand-500/40 text-tealBrand-600 dark:text-tealBrand-300 text-[11px] font-extrabold flex items-center gap-1">
                      <FaLink /> Linked patient &bull; Accepted {acceptedDate}
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                    Clinic patient (not on the app)
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {patient.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEvaluating(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FaClipboardCheck /> Administer HAM-D Assessment
          </button>
        </div>

        {/* Demographics Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <FaCalendarAlt /> Age / DOB
            </p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {patient.age ? `${patient.age} yrs` : 'N/A'}
              {patient.dob ? ` (${new Date(patient.dob).toLocaleDateString()})` : ''}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <FaVenusMars /> Gender
            </p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
              {patient.gender ? patient.gender.replace(/_/g, ' ') : 'N/A'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <FaEnvelope /> Email
            </p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {patient.email || 'No email registered'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <FaPhone /> Phone
            </p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {patient.phone || 'No phone registered'}
            </p>
          </div>
        </div>
      </div>

      {/* LINKED PATIENT ASSESSMENTS SECTION (PHQ-9 / GAD-7 / ISI / PCL-5 / Y-BOCS) */}
      {!patient.linkedUser && !linkInfo ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaChartLine />
            <span>Self-Reported Assessment History &amp; Trends</span>
          </div>
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <FaClipboardCheck className="text-3xl text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-lg mx-auto">
              This patient is not connected to a CEST account. Self-reported results and exercises are not available.
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setInviteEmail(patient?.email || '');
                  setInviteMessage('');
                  setInviteFeedback('');
                  setShowInviteModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition-all"
              >
                <FaEnvelope /> Invite to connect
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
                <FaChartLine />
                <span>Self-Reported Assessment History &amp; Trends</span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Patient Questionnaires (PHQ-9, GAD-7, ISI, PCL-5, Y-BOCS)
              </h3>
            </div>

            {/* Instrument Filter Buttons */}
            {!sharingRevoked && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'PHQ9', 'GAD7', 'ISI', 'PCL5', 'YBOCS'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInstrumentFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      instrumentFilter === filter
                        ? 'bg-tealBrand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!sharingRevoked && linkInfo?.shareScope && (
            <div className="p-3.5 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 flex items-center justify-between text-xs text-tealBrand-900 dark:text-tealBrand-200">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-tealBrand-500 text-sm shrink-0" />
                <span>
                  <strong>Patient Sharing Scope:</strong>{' '}
                  {linkInfo.shareScope === 'all'
                    ? 'All current and future assessment results shared.'
                    : 'Selected assessment results only.'}
                </span>
              </div>
              {linkInfo.alertOnHighestBand && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold uppercase">
                  Alerts Enabled
                </span>
              )}
            </div>
          )}

          {sharingRevoked ? (
            /* Revoked State: Sharing Stopped Notice */
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
              <FaLock className="text-3xl text-rose-500 mx-auto" />
              <h4 className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                Sharing Stopped by Patient
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                The patient has revoked assessment sharing for this link. Their self-administered questionnaire records are no longer accessible to your clinician account.
              </p>
            </div>
          ) : loadingSelfAssessments ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-500" />
              <p className="text-xs">Loading patient's shared assessment history...</p>
            </div>
          ) : selfAssessments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <FaClipboardCheck className="text-3xl text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No shared results yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TREND LINE CHART WITH SHADED SEVERITY BANDS */}
              {chartPoints.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaChartLine className="text-tealBrand-500" /> Longitudinal Trend &amp; Severity Bands
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50" /> Mild
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500/50" /> Moderate
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500/50" /> Severe
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-40 max-h-40 overflow-visible"
                    >
                      {/* Shaded Severity Bands */}
                      {/* Severe band (top) */}
                      <rect
                        x={paddingX}
                        y={paddingY}
                        width={chartWidth - 2 * paddingX}
                        height={(chartHeight - 2 * paddingY) * 0.35}
                        fill="rgba(244, 63, 94, 0.12)"
                      />
                      {/* Moderate band (middle) */}
                      <rect
                        x={paddingX}
                        y={paddingY + (chartHeight - 2 * paddingY) * 0.35}
                        width={chartWidth - 2 * paddingX}
                        height={(chartHeight - 2 * paddingY) * 0.35}
                        fill="rgba(245, 158, 11, 0.10)"
                      />
                      {/* Minimal/Mild band (bottom) */}
                      <rect
                        x={paddingX}
                        y={paddingY + (chartHeight - 2 * paddingY) * 0.70}
                        width={chartWidth - 2 * paddingX}
                        height={(chartHeight - 2 * paddingY) * 0.30}
                        fill="rgba(16, 185, 129, 0.10)"
                      />

                      {/* Connecting Trend Polyline */}
                      {chartPoints.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#0d9488"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={polylinePoints}
                        />
                      )}

                      {/* Data Point Circles */}
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            className="fill-tealBrand-500 stroke-white dark:stroke-slate-900 stroke-2 hover:r-7 transition-all cursor-pointer"
                          >
                            <title>
                              {pt.item.assessmentType}: Score {pt.item.totalScore} ({pt.item.severity}) on{' '}
                              {new Date(pt.item.createdAt).toLocaleDateString()}
                            </title>
                          </circle>
                          <text
                            x={pt.x}
                            y={pt.y - 8}
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-slate-700 dark:fill-slate-300"
                          >
                            {pt.item.totalScore}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              )}

              {/* TABLE OF QUESTIONNAIRES */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Score &amp; Severity</th>
                      <th className="py-2.5 px-3">Sharing</th>
                      <th className="py-2.5 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSelfAssessments.map((record) => (
                      <React.Fragment key={record._id || record.id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {record.assessmentType}
                          </td>
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-slate-900 dark:text-white mr-1.5">
                              {record.totalScore}
                            </span>
                            <span className="text-xs font-semibold text-tealBrand-600 dark:text-tealBrand-400">
                              ({record.severity})
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {record.isSharedWithClinician ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                Answers Shared
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-[11px]">
                                Summary Only
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSelfRecord(
                                  selectedSelfRecord?._id === record._id ? null : record
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                            >
                              {selectedSelfRecord?._id === record._id ? (
                                <FaChevronUp className="inline" />
                              ) : (
                                <FaChevronDown className="inline" />
                              )}{' '}
                              View
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {selectedSelfRecord?._id === record._id && (
                          <tr>
                            <td colSpan={5} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl">
                              <div className="space-y-3 text-xs">
                                {record.diagnosticConsideration && (
                                  <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                      Interpretation / Diagnostic Consideration:
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                      {record.diagnosticConsideration}
                                    </p>
                                  </div>
                                )}

                                {record.functionalResponse && (
                                  <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                      Functional Difficulty Impact:
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                                      {record.functionalResponse}
                                    </p>
                                  </div>
                                )}

                                {record.isSharedWithClinician && Array.isArray(record.answers) ? (
                                  <div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                      Patient Item Answers (Shared by Patient):
                                    </span>
                                    <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 pt-1.5">
                                      {record.answers.map((ans, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                                        >
                                          <span className="block text-[10px] text-slate-400">Q{idx + 1}</span>
                                          <strong className="text-sm text-slate-900 dark:text-white">
                                            {ans}
                                          </strong>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-slate-400 italic">
                                    Item-level answers withheld by patient consent. Summary scores only are shared.
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assigned Activities & Cognitive Enhancement Status */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FaTasks className="text-tealBrand-500" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Assigned Exercises &amp; Mood Trajectory
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-bold">
            {assignedActivities.length} Assigned
          </span>
        </div>

        {/* SVG MOOD CHANGE CHART (Before vs After over completed exercises) */}
        {(() => {
          const completedWithMood = assignedActivities
            .filter((a) => a.status === 'completed' && a.moodBefore !== null && a.moodAfter !== null)
            .sort((a, b) => new Date(a.completedAt || a.createdAt) - new Date(b.completedAt || b.createdAt));

          if (completedWithMood.length === 0) {
            return (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                <FaHeartbeat className="text-xl text-tealBrand-500/60 mx-auto mb-1" />
                <p className="font-semibold">Mood Change Trajectory Chart</p>
                <p className="text-[11px] text-slate-400">
                  Mood trajectory will plot here as the patient completes assigned exercises and rates their before/after mood.
                </p>
              </div>
            );
          }

          const chartWidth = 500;
          const chartHeight = 160;
          const padX = 45;
          const padY = 25;
          const plotWidth = chartWidth - 2 * padX;
          const plotHeight = chartHeight - 2 * padY;

          const getX = (idx) =>
            completedWithMood.length === 1
              ? chartWidth / 2
              : padX + (idx / (completedWithMood.length - 1)) * plotWidth;

          const getY = (val) => chartHeight - padY - (Math.max(0, Math.min(10, val)) / 10) * plotHeight;

          const beforePoints = completedWithMood.map((item, idx) => `${getX(idx)},${getY(item.moodBefore)}`).join(' ');
          const afterPoints = completedWithMood.map((item, idx) => `${getX(idx)},${getY(item.moodAfter)}`).join(' ');

          return (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FaHeartbeat className="text-tealBrand-500" />
                    <span>Patient Mood Change (Before vs After)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Self-reported rating scale (0–10) across completed exercises over time
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Before Exercise</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-tealBrand-600 dark:text-tealBrand-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-tealBrand-500"></span>
                    <span>After Exercise</span>
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto py-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full max-w-xl mx-auto h-40 text-slate-400"
                >
                  {/* Grid Lines */}
                  {[0, 5, 10].map((v) => {
                    const y = getY(v);
                    return (
                      <g key={v}>
                        <line
                          x1={padX}
                          y1={y}
                          x2={chartWidth - padX}
                          y2={y}
                          stroke="currentColor"
                          strokeDasharray="3 3"
                          strokeOpacity="0.25"
                        />
                        <text
                          x={padX - 8}
                          y={y + 3}
                          fontSize="9"
                          textAnchor="end"
                          fill="currentColor"
                        >
                          {v}
                        </text>
                      </g>
                    );
                  })}

                  {/* Delta connector lines between Before and After */}
                  {completedWithMood.map((item, idx) => {
                    const x = getX(idx);
                    const yB = getY(item.moodBefore);
                    const yA = getY(item.moodAfter);
                    return (
                      <line
                        key={`delta-${idx}`}
                        x1={x}
                        y1={yB}
                        x2={x}
                        y2={yA}
                        stroke="#0d9488"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        strokeOpacity="0.6"
                      />
                    );
                  })}

                  {/* Line Before */}
                  {completedWithMood.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      points={beforePoints}
                    />
                  )}

                  {/* Line After */}
                  {completedWithMood.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2"
                      points={afterPoints}
                    />
                  )}

                  {/* Data Points */}
                  {completedWithMood.map((item, idx) => {
                    const x = getX(idx);
                    const yB = getY(item.moodBefore);
                    const yA = getY(item.moodAfter);
                    const dateStr = new Date(item.completedAt || item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <g key={`points-${idx}`}>
                        {/* Before Dot */}
                        <circle cx={x} cy={yB} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        {/* After Dot */}
                        <circle cx={x} cy={yA} r="4" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
                        {/* Label Date */}
                        <text
                          x={x}
                          y={chartHeight - 8}
                          fontSize="8"
                          textAnchor="middle"
                          fill="currentColor"
                        >
                          {dateStr}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          );
        })()}

        {loadingAssignedExercises ? (
          <div className="p-6 text-center text-xs text-slate-400">
            <FaSpinner className="animate-spin text-lg mx-auto text-tealBrand-500 mb-2" />
            Loading assigned exercises...
          </div>
        ) : assignedActivities.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No specific activities assigned to this patient yet. Use the Assign Activities tab to assign CBT or Cognitive Enhancement exercises.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignedActivities.map((a) => {
              const isCET = a.group === 'cet';
              const isDone = a.status === 'completed';
              const isSkipped = a.status === 'skipped';
              const isOverdue =
                a.dueDate &&
                new Date(a.dueDate) < new Date() &&
                (a.status === 'assigned' || a.status === 'in_progress');

              return (
                <div key={a._id || a.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          isCET
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                            : 'bg-tealBrand-500/15 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-500/30'
                        }`}
                      >
                        {isCET ? 'Cognitive Enhancement' : 'CBT'}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {a.title}
                      </span>
                      {a.dueDate && (
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <FaCalendarAlt className="text-[10px]" /> Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {a.technique && (
                      <p className="text-[11px] text-slate-400">Based on: {a.technique}</p>
                    )}

                    {a.note && (
                      <p className="text-slate-500 italic">Notes: "{a.note}"</p>
                    )}

                    {isCET && (
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                        <FaLock className="text-[9px]" />
                        {a.sharedResult?.score !== undefined && a.sharedResult?.score !== null
                          ? `Shared practice score: ${a.sharedResult.score}`
                          : 'Completion status only • CET score private to patient'}
                      </p>
                    )}

                    {isDone && a.moodBefore !== null && a.moodAfter !== null && (
                      <p className="text-[11px] font-semibold text-tealBrand-700 dark:text-tealBrand-300 flex items-center gap-1">
                        <FaHeartbeat className="text-tealBrand-500 text-[10px]" />
                        <span>Mood rating: {a.moodBefore}/10 &rarr; {a.moodAfter}/10</span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                        <FaExclamationTriangle /> Overdue
                      </span>
                    ) : isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                        <FaCheckCircle className="text-emerald-500" />
                        <span>Completed</span>
                        {a.completedAt && (
                          <span className="text-[10px] opacity-75">
                            ({new Date(a.completedAt).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <span>Skipped ({a.skipReason || 'other'})</span>
                      </span>
                    ) : a.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300">
                        <FaClock className="text-blue-500" />
                        <span>In progress</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-tealBrand-500/15 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300">
                        <FaClock className="text-tealBrand-500" />
                        <span>Assigned</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clinical Questionnaires (HAM-A, HAM-D, ADHD, NSESSS, ISI, Y-BOCS) Section */}
      <PatientQuestionnairesSection patient={patient} />

      {/* Private Clinician Notes Section */}
      <ClinicianNotesSection
        patientId={patient._id || patient.id}
        patientName={patient.name}
      />

      {/* INVITE PATIENT TO CONNECT MODAL */}
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
                    Send an invitation to {patient.name} to link their CEST account
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
                    <span>Invitation Dispatched</span>
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Personalized Clinical Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="We'll be tracking your questionnaire responses and therapy exercises through the CEST platform..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tealBrand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteFeedback('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="px-5 py-2 rounded-xl bg-tealBrand-600 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingInvite ? (
                      <>
                        <FaSpinner className="animate-spin" /> Sending...
                      </>
                    ) : (
                      'Send Invitation'
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
