import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaUserMd,
  FaSearch,
  FaBuilding,
  FaStethoscope,
  FaCheckCircle,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaLock,
  FaCalendarAlt,
  FaClipboardList,
} from 'react-icons/fa';
import { clinicianLinkService } from '../../../services/clinicianLinkService';
import { assessmentService } from '../../../services/assessmentService';
import { CONNECT_WORDING } from '../../../config/connectWording';

export const ClinicianConnectModal = ({
  isOpen,
  onClose,
  mode = 'connect', // 'connect' | 'acceptInvite' | 'editSharing'
  assessmentId = null,
  instrumentName = 'Clinical Assessment',
  score = null,
  severityLabel = null,
  invite = null,
  existingLink = null,
  onSuccess,
}) => {
  const [step, setStep] = useState('list'); // 'list' | 'sharing' | 'success'
  const [clinicians, setClinicians] = useState([]);
  const [loadingClinicians, setLoadingClinicians] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinician, setSelectedClinician] = useState(null);

  // Sharing preferences state
  const [shareScope, setShareScope] = useState('selected'); // 'selected' | 'all'
  const [alertOnHighestBand, setAlertOnHighestBand] = useState(false);
  const [allAssessments, setAllAssessments] = useState([]);
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset and load data when modal opens
  useEffect(() => {
    if (!isOpen) {
      setStep('list');
      setSelectedClinician(null);
      setError('');
      setSuccessMessage('');
      return;
    }

    const loadData = async () => {
      setError('');
      setLoadingAssessments(true);

      try {
        const [clinicianRes, assessmentsRes] = await Promise.all([
          mode === 'connect'
            ? clinicianLinkService.getClinicians().catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          assessmentService.getMyAssessments().catch(() => ({ data: [] })),
        ]);

        if (mode === 'connect') {
          setClinicians(clinicianRes.data || []);
        }

        const userAssessments = assessmentsRes.data || [];
        setAllAssessments(userAssessments);

        if (mode === 'editSharing' && existingLink) {
          setSelectedClinician(existingLink.clinician);
          setShareScope(existingLink.shareScope || 'selected');
          setAlertOnHighestBand(Boolean(existingLink.alertOnHighestBand));
          setSelectedAssessmentIds(
            Array.isArray(existingLink.sharedAssessmentIds)
              ? existingLink.sharedAssessmentIds.map((id) => (typeof id === 'object' ? id._id || id.id : id))
              : []
          );
          setStep('sharing');
        } else if (mode === 'acceptInvite' && invite) {
          setSelectedClinician(invite.clinician);
          setShareScope('selected');
          setAlertOnHighestBand(false);
          // Default select all past assessments or empty
          setSelectedAssessmentIds(userAssessments.map((a) => a._id || a.id));
          setStep('sharing');
        } else {
          // Connect mode
          setShareScope('selected');
          setAlertOnHighestBand(false);
          if (assessmentId) {
            setSelectedAssessmentIds([assessmentId]);
          } else {
            setSelectedAssessmentIds(userAssessments.map((a) => a._id || a.id));
          }
          setStep('list');
        }
      } catch (err) {
        setError('Failed to load connection data. Please try again.');
      } finally {
        setLoadingClinicians(false);
        setLoadingAssessments(false);
      }
    };

    loadData();
  }, [isOpen, mode, invite, existingLink, assessmentId]);

  if (!isOpen) return null;

  const filteredClinicians = clinicians.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.specialization || '').toLowerCase().includes(q) ||
      (c.institution || '').toLowerCase().includes(q)
    );
  });

  const handleSelectClinician = (clinician) => {
    setSelectedClinician(clinician);
    setError('');
    setStep('sharing');
  };

  const toggleAssessmentSelection = (id) => {
    setSelectedAssessmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAssessments = () => {
    if (selectedAssessmentIds.length === allAssessments.length) {
      setSelectedAssessmentIds([]);
    } else {
      setSelectedAssessmentIds(allAssessments.map((a) => a._id || a.id));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'editSharing' && existingLink) {
        await clinicianLinkService.updateSharing(existingLink._id || existingLink.id, {
          shareScope,
          sharedAssessmentIds: shareScope === 'selected' ? selectedAssessmentIds : [],
          alertOnHighestBand,
        });
        setSuccessMessage('Your sharing preferences were updated successfully.');
        setStep('success');
        if (onSuccess) onSuccess();
      } else if (mode === 'acceptInvite' && invite) {
        await clinicianLinkService.acceptInvite(invite._id || invite.id, {
          shareScope,
          sharedAssessmentIds: shareScope === 'selected' ? selectedAssessmentIds : [],
          alertOnHighestBand,
        });
        setSuccessMessage(
          `You are now connected with ${
            selectedClinician?.title ? `${selectedClinician.title} ` : ''
          }${selectedClinician?.name || 'your clinician'}.`
        );
        setStep('success');
        if (onSuccess) onSuccess();
      } else {
        // mode === 'connect'
        if (!selectedClinician) return;

        await clinicianLinkService.createLink({
          clinicianId: selectedClinician.id,
          assessmentId,
          sharedAssessmentIds: shareScope === 'selected' ? selectedAssessmentIds : [],
          shareScope,
          alertOnHighestBand,
        });

        setSuccessMessage(
          `Connection request sent to ${
            selectedClinician.title ? `${selectedClinician.title} ` : ''
          }${selectedClinician.name}.`
        );
        setStep('success');
        if (onSuccess) onSuccess(selectedClinician);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {step === 'sharing' && mode === 'connect' && (
              <button
                type="button"
                onClick={() => setStep('list')}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-xs"
              >
                <FaArrowLeft />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-tealBrand-500/20 text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-lg">
              <FaUserMd />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {mode === 'editSharing'
                  ? 'Edit Sharing Preferences'
                  : mode === 'acceptInvite'
                  ? 'Review & Accept Invitation'
                  : CONNECT_WORDING.modal.title}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'editSharing'
                  ? 'Manage what clinical records your clinician can view'
                  : mode === 'acceptInvite'
                  ? 'Choose what information to share with your clinician'
                  : 'Direct referral & structured clinical review'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
            <FaExclamationTriangle className="text-rose-400 text-base shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Search and Choose Clinician (connect mode only) */}
        {step === 'list' && (
          <div className="space-y-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder={CONNECT_WORDING.modal.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-tealBrand-500 transition-all"
              />
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Select a registered clinician to request clinical review:
            </p>

            {loadingClinicians ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-400" />
                <p className="text-xs">Loading registered clinicians...</p>
              </div>
            ) : filteredClinicians.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
                <p className="text-sm font-bold text-slate-300">No clinicians found</p>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? 'Try searching with a different name or specialization.'
                    : 'No clinicians are currently registered in the system.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {filteredClinicians.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-tealBrand-500 hover:bg-slate-800 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    onClick={() => handleSelectClinician(c)}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-tealBrand-300 transition-colors">
                          {c.title ? `${c.title} ` : ''}
                          {c.name}
                        </h4>
                        {c.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                            <FaCheckCircle className="text-[9px]" /> Credentials verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                            <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-tealBrand-400 flex items-center gap-1.5 font-medium">
                        <FaStethoscope className="text-[10px]" /> {c.specialization}
                      </p>
                      {c.institution && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <FaBuilding className="text-[10px]" /> {c.institution}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shrink-0 transition-all shadow"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Sharing Preferences & Consent */}
        {step === 'sharing' && selectedClinician && (
          <div className="space-y-5 animate-fadeIn">
            {/* Target Clinician Card */}
            <div className="p-4 rounded-2xl bg-tealBrand-950/40 border border-tealBrand-500/40 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-tealBrand-400 tracking-wider">
                  {mode === 'editSharing' ? 'Connected Clinician' : 'Target Clinician'}
                </span>
                {selectedClinician.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    <FaCheckCircle className="text-[9px]" /> Credentials verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                    <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                  </span>
                )}
              </div>
              <p className="text-base font-extrabold text-white">
                {selectedClinician.title ? `${selectedClinician.title} ` : ''}
                {selectedClinician.name}
              </p>
              <p className="text-xs text-slate-300">
                {selectedClinician.specialization} &bull; {selectedClinician.institution}
              </p>
              {invite?.inviteMessage && (
                <div className="mt-2 pt-2 border-t border-tealBrand-500/20 text-xs text-slate-300 italic">
                  "{invite.inviteMessage}"
                </div>
              )}
            </div>

            {/* What would you like to share? */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-white">
                What would you like to share?
              </h4>

              <div className="space-y-2">
                {/* Option 1: Only results I choose now */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="shareScope"
                    value="selected"
                    checked={shareScope === 'selected'}
                    onChange={() => setShareScope('selected')}
                    className="mt-1 text-tealBrand-500 focus:ring-tealBrand-400"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-white">
                      Only the results I choose now
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Share specific completed screening assessments. Future results won't be shared unless you choose them.
                    </p>
                  </div>
                </label>

                {/* Option 2: All results including future */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="shareScope"
                    value="all"
                    checked={shareScope === 'all'}
                    onChange={() => setShareScope('all')}
                    className="mt-1 text-tealBrand-500 focus:ring-tealBrand-400"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-white">
                      All my results, including future ones
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Your clinician can view your complete screening history and any self-assessments you complete in the future.
                    </p>
                  </div>
                </label>
              </div>

              {/* Assessment Checklist if shareScope === 'selected' */}
              {shareScope === 'selected' && (
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Select Assessments to Share ({selectedAssessmentIds.length} selected):
                    </span>
                    {allAssessments.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllAssessments}
                        className="text-[11px] text-tealBrand-400 hover:text-tealBrand-300 font-semibold"
                      >
                        {selectedAssessmentIds.length === allAssessments.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    )}
                  </div>

                  {allAssessments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No assessment records found on your account.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                      {allAssessments.map((a) => {
                        const aId = a._id || a.id;
                        const isChecked = selectedAssessmentIds.includes(aId);
                        return (
                          <label
                            key={aId}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-slate-800/90 border-tealBrand-500/50 text-white'
                                : 'bg-slate-800/30 border-slate-800 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleAssessmentSelection(aId)}
                                className="rounded text-tealBrand-500 focus:ring-tealBrand-400"
                              />
                              <div>
                                <span className="font-bold block text-slate-200">
                                  {a.assessmentType || 'Clinical Assessment'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {a.severity} &bull; Score: {a.totalScore}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Alert Opt-In Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={alertOnHighestBand}
                  onChange={(e) => setAlertOnHighestBand(e.target.checked)}
                  className="mt-1 rounded text-tealBrand-500 focus:ring-tealBrand-400"
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-white">
                    Alert my clinician if a future result is in the highest band.
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    If an assessment score indicates severe or extreme symptom intensity, this connection will be flagged as urgent on your clinician's dashboard.
                  </p>
                </div>
              </label>
            </div>

            {/* Plain Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <FaLock className="text-xs" />
                <span>What is and is not shared</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                <li>
                  <strong className="text-white">Shared:</strong> Assessment instruments, total scores, severity bands, and dates.
                </li>
                <li>
                  <strong className="text-white">Never shared:</strong> Chatbot conversations and cognitive exercise entries remain strictly private and are never shared.
                </li>
                <li>
                  <strong className="text-white">Full control:</strong> You can pause or stop sharing at any time.
                </li>
              </ul>
              <p className="leading-relaxed text-[11px] text-amber-300 font-medium pt-1 border-t border-slate-800">
                This is a request for clinician review, not an emergency service and not real-time monitoring.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {mode === 'connect' && (
                <button
                  type="button"
                  onClick={() => setStep('list')}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FaShieldAlt />{' '}
                    {mode === 'editSharing'
                      ? 'Save Changes'
                      : mode === 'acceptInvite'
                      ? 'Confirm & Connect'
                      : 'Send Request'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FaCheckCircle />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-white">
                {mode === 'editSharing'
                  ? 'Sharing Preferences Updated'
                  : mode === 'acceptInvite'
                  ? 'Invitation Accepted'
                  : 'Connection Request Sent'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
