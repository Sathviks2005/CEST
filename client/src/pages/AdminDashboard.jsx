import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaSpinner,
  FaUserMd,
  FaInfoCircle,
  FaCalendarAlt,
  FaIdCard,
  FaTimes,
  FaCheck,
  FaHistory,
} from 'react-icons/fa';
import { adminService } from '../services/adminService';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'history'

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Reject Modal State
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);
  const [rejectError, setRejectError] = useState('');

  // Approve In-progress State
  const [approvingId, setApprovingId] = useState(null);

  // Reviewed History State
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPending = async () => {
    setLoadingRequests(true);
    setRequestsError('');
    try {
      const res = await adminService.getPendingRequests();
      if (res && res.success) {
        setPendingRequests(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load pending requests:', err);
      setRequestsError(err.response?.data?.message || 'Failed to load pending requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const params = {};
      if (decisionFilter) params.decision = decisionFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminService.getReviewedHistory(params);
      if (res && res.success) {
        setHistoryList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load verification history:', err);
      setHistoryError(err.response?.data?.message || 'Failed to load verification history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPending();
    } else {
      fetchHistory();
    }
  }, [activeTab]);

  const handleApprove = async (clinician) => {
    if (!window.confirm(`Approve credentials for ${clinician.name} (${clinician.registrationNumber})?`)) {
      return;
    }

    setApprovingId(clinician.id || clinician._id);
    setRequestsError('');
    setActionSuccessMsg('');

    try {
      const res = await adminService.approveClinician(clinician.id || clinician._id);
      setActionSuccessMsg(res?.message || `Clinician ${clinician.name} successfully verified.`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
      await fetchPending();
    } catch (err) {
      setRequestsError(err.response?.data?.message || 'Failed to approve clinician verification.');
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (clinician) => {
    setRejectModalItem(clinician);
    setRejectReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    setRejectModalItem(null);
    setRejectReason('');
    setRejectError('');
    setSubmittingReject(false);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError('A reason for rejection is required.');
      return;
    }
    if (rejectReason.trim().length > 300) {
      setRejectError('Rejection reason cannot exceed 300 characters.');
      return;
    }

    setSubmittingReject(true);
    setRejectError('');

    try {
      const res = await adminService.rejectClinician(
        rejectModalItem.id || rejectModalItem._id,
        rejectReason.trim()
      );
      closeRejectModal();
      setActionSuccessMsg(res?.message || `Verification request for ${rejectModalItem.name} rejected.`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
      await fetchPending();
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject verification request.');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-brand-600/10 via-tealBrand-500/10 to-transparent space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaShieldAlt />
              <span>Administrative Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Clinician Verification Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Review and authenticate practitioner professional credentials across healthcare registries.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 shrink-0">
            <FaShieldAlt className="text-amber-500" />
            <span>Strict Privacy: No Health Data Access</span>
          </div>
        </div>

        {/* Official Register Check Advisory Note */}
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-200 text-xs sm:text-sm flex items-start gap-3">
          <FaInfoCircle className="text-sky-600 dark:text-sky-400 text-base shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Verification Requirement: </span>
            Check the name and number against the official register (for example the National Medical
            Commission's Indian Medical Register or the relevant State Medical Council, or the
            Rehabilitation Council of India for clinical psychologists) before approving.
          </p>
        </div>
      </div>

      {/* Global Action Success / Error Notifications */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {requestsError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <FaExclamationTriangle className="text-rose-500 shrink-0" />
          <span>{requestsError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'requests'
              ? 'bg-tealBrand-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaClock />
          <span>Verification Requests</span>
          {pendingRequests.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'requests'
                  ? 'bg-white text-tealBrand-700'
                  : 'bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400'
              }`}
            >
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-tealBrand-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaHistory />
          <span>Reviewed History</span>
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaUserMd className="text-tealBrand-500" />
              <span>Pending Practitioner Requests</span>
            </h2>
            <button
              type="button"
              onClick={fetchPending}
              disabled={loadingRequests}
              className="text-xs font-semibold text-tealBrand-600 dark:text-tealBrand-400 hover:underline flex items-center gap-1.5"
            >
              {loadingRequests ? <FaSpinner className="animate-spin" /> : null}
              <span>Refresh list</span>
            </button>
          </div>

          {loadingRequests ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FaSpinner className="text-3xl text-tealBrand-500 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Loading verification requests from registry...
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <FaCheckCircle className="text-4xl text-tealBrand-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All caught up!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no pending clinician verification requests awaiting review at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((c) => {
                const clinicianId = c.id || c._id;
                const isApproving = approvingId === clinicianId;
                return (
                  <div
                    key={clinicianId}
                    className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-tealBrand-400 transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Clinician Identification & Credentials */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900 dark:text-white">
                            {c.title} {c.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[11px] font-bold">
                            Pending Review
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Email Address
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {c.email}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Registering Body
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.registeringBody || 'None specified'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Registration Number
                            </span>
                            <span className="font-mono font-bold text-tealBrand-600 dark:text-tealBrand-400">
                              {c.registrationNumber || 'Not provided'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Requested Date
                            </span>
                            <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <FaCalendarAlt className="text-slate-400" />
                              {c.requestedAt ? new Date(c.requestedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openRejectModal(c)}
                          disabled={isApproving}
                          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(c)}
                          disabled={isApproving}
                          className="px-5 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isApproving ? (
                            <>
                              <FaSpinner className="animate-spin" /> Approving...
                            </>
                          ) : (
                            <>
                              <FaCheck /> Approve Credentials
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVIEWED HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaHistory className="text-tealBrand-500" />
              <span>Audit Trail: Reviewed Verifications</span>
            </h2>

            {/* Filters Form */}
            <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2">
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="">All Decisions</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, or number..."
                  className="px-3 py-2 pl-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 w-48 sm:w-64"
                />
                <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs" />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800"
              >
                Filter
              </button>
            </form>
          </div>

          {loadingHistory ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FaSpinner className="text-3xl text-tealBrand-500 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Loading audit verification history...
              </p>
            </div>
          ) : historyList.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <FaHistory className="text-4xl text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No history records found
              </h3>
              <p className="text-xs text-slate-500">
                {decisionFilter || searchQuery
                  ? 'No audit log entries matched the applied filters.'
                  : 'No verification decisions have been recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4">Clinician</th>
                      <th className="p-4">Registering Body &amp; Number</th>
                      <th className="p-4">Decision</th>
                      <th className="p-4">Rejection Note</th>
                      <th className="p-4">Reviewed By</th>
                      <th className="p-4">Reviewed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyList.map((log) => (
                      <tr key={log._id || log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white">{log.clinicianName}</p>
                          <p className="text-[11px] text-slate-400">{log.clinicianEmail}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {log.registeringBody || 'N/A'}
                          </p>
                          <p className="font-mono text-[11px] text-tealBrand-600 dark:text-tealBrand-400">
                            {log.registrationNumber || 'N/A'}
                          </p>
                        </td>
                        <td className="p-4">
                          {log.decision === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                              <FaCheckCircle className="text-emerald-500" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                              <FaTimesCircle className="text-rose-500" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 max-w-xs">
                          {log.reason ? (
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2" title={log.reason}>
                              {log.reason}
                            </p>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {log.adminEmail || 'Admin'}
                        </td>
                        <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                          {log.reviewedAt ? new Date(log.reviewedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REJECT CLINICIAN MODAL (REASON REQUIRED, MAX 300 CHARS) */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FaTimesCircle />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Reject Verification
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {rejectModalItem.title} {rejectModalItem.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={submittingReject}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaTimes />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <FaExclamationTriangle className="shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  maxLength={300}
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why the credentials could not be verified (e.g. 'Registration number does not match name in the SMC registry'). This note will be shown to the clinician so they can correct it."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Required. Visible to clinician.</span>
                  <span>{300 - rejectReason.length} characters left</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={submittingReject}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingReject ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <FaTimes /> Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

