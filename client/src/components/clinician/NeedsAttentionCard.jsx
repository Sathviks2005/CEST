import React, { useState, useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserInjured,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaShieldAlt,
  FaSpinner,
  FaEye,
  FaBell,
} from 'react-icons/fa';
import { clinicianAttentionService } from '../../services/clinicianAttentionService';

export const NeedsAttentionCard = ({ onSelectPatient }) => {
  const [activeItems, setActiveItems] = useState([]);
  const [acknowledgedItems, setAcknowledgedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState(null);

  const fetchAttentionList = async () => {
    setLoading(true);
    try {
      const res = await clinicianAttentionService.getNeedsAttentionList();
      if (res?.data) {
        setActiveItems(res.data.active || []);
        setAcknowledgedItems(res.data.acknowledged || []);
      }
    } catch (err) {
      console.error('Failed to load needs-attention list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttentionList();
  }, []);

  const handleAcknowledge = async (patientUserId) => {
    setAcknowledgingId(patientUserId);
    try {
      await clinicianAttentionService.acknowledgePatient(patientUserId);
      await fetchAttentionList();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 font-extrabold text-xs">
            <FaExclamationTriangle className="text-rose-600 dark:text-rose-400 text-xs shrink-0" />
            <span>High Priority</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold text-xs">
            <FaClock className="text-amber-600 dark:text-amber-400 text-xs shrink-0" />
            <span>Medium Priority</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs">
            <FaBell className="text-slate-400 text-xs shrink-0" />
            <span>Low Priority</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <FaExclamationTriangle />
            <span>Clinical Triage</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Needs Attention</span>
            {activeItems.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-extrabold">
                {activeItems.length} Flagged
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Patients with recent severe scores, crisis markers, clinical worsening, or overdue activities
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttentionList}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin text-tealBrand-500" /> : null}
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading && activeItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 space-y-2">
          <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500" />
          <p>Analyzing clinical indicators...</p>
        </div>
      ) : activeItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
          <FaCheckCircle className="text-2xl text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            No patients need attention right now.
          </p>
          <p className="text-xs text-slate-500">
            All linked patients are stable with no crisis indicators, worsening trends, or overdue tasks.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activeItems.map((item) => (
            <div
              key={item.patientUserId}
              className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-1 last:pb-1"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  {getPriorityBadge(item.priority)}
                </div>

                <ul className="space-y-1.5">
                  {item.reasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {onSelectPatient && item.patientId && (
                  <button
                    type="button"
                    onClick={() => onSelectPatient(item.patientId)}
                    className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <FaEye className="text-xs" />
                    <span>View Profile</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={acknowledgingId === item.patientUserId}
                  onClick={() => handleAcknowledge(item.patientUserId)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all disabled:opacity-50"
                  title="Acknowledge this patient alert for 7 days"
                >
                  {acknowledgingId === item.patientUserId ? 'Saving...' : 'Acknowledge (7d)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collapsed Acknowledged Group */}
      {acknowledgedItems.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              <span>Acknowledged Alerts ({acknowledgedItems.length})</span>
            </span>
            {showAcknowledged ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showAcknowledged && (
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
              {acknowledgedItems.map((item) => (
                <div
                  key={item.patientUserId}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      {getPriorityBadge(item.priority)}
                      {item.acknowledgedUntil && (
                        <span className="text-[11px] text-slate-400">
                          (Acknowledged until {new Date(item.acknowledgedUntil).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                    <ul className="space-y-0.5 text-slate-500">
                      {item.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span>&bull;</span>
                          <span>{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {onSelectPatient && item.patientId && (
                    <button
                      type="button"
                      onClick={() => onSelectPatient(item.patientId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Clinical Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs flex items-start gap-2.5">
        <FaShieldAlt className="text-tealBrand-500 text-sm shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          These flags help you prioritise your review. They are not real-time monitoring or an emergency service.
        </p>
      </div>
    </div>
  );
};
