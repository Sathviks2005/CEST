import React, { useState } from 'react';
import {
  FaTasks,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaUserMd,
  FaSpinner,
  FaHeartbeat,
  FaShieldAlt,
  FaLock,
  FaForward,
} from 'react-icons/fa';

export const PatientAssignedExercisesSection = ({
  assignments = [],
  loading = false,
  onStart,
  compact = false,
  onViewAll,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const openAssignments = assignments.filter(
    (a) => a.status === 'assigned' || a.status === 'in_progress'
  );
  const historyAssignments = assignments.filter(
    (a) => a.status === 'completed' || a.status === 'skipped'
  );

  const displayOpenItems = compact ? openAssignments.slice(0, 3) : openAssignments;

  const formatSkipReason = (reason) => {
    switch (reason) {
      case 'too_hard':
        return 'Too hard';
      case 'not_helpful':
        return 'Not helpful';
      case 'feeling_unwell':
        return 'Not feeling well';
      case 'no_time':
        return 'No time';
      case 'other':
        return 'Other';
      default:
        return reason || 'Skipped';
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaTasks />
            <span>Assigned Activities</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>From your clinician</span>
            {openAssignments.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/15 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-bold">
                {openAssignments.length} Open
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Targeted exercises assigned by your clinician to practise between appointments.
          </p>
        </div>

        {compact && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all self-start sm:self-auto"
          >
            View All ({assignments.length})
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs space-y-2">
          <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500" />
          <p>Loading assignments...</p>
        </div>
      ) : openAssignments.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <FaCheckCircle className="text-2xl text-tealBrand-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No open assignments right now
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You're all caught up! When your clinician assigns new CBT or Cognitive Enhancement exercises, they will appear here.
          </p>
        </div>
      ) : (
        /* Open Assignments List */
        <div className="grid grid-cols-1 gap-4">
          {displayOpenItems.map((item) => {
            const isCET = item.group === 'cet';
            const isOverdue = item.isOverdue;

            return (
              <div
                key={item._id || item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-tealBrand-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCET
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          : 'bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30'
                      }`}
                    >
                      {item.groupLabel || (isCET ? 'Cognitive Enhancement exercises' : 'CBT exercises')}
                    </span>

                    {item.technique && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                        Based on: {item.technique}
                      </span>
                    )}

                    {/* Status Chip (Overdue includes text, not color alone) */}
                    {isOverdue ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1">
                        <FaExclamationTriangle />
                        <span>Overdue</span>
                      </span>
                    ) : item.status === 'in_progress' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1">
                        <FaClock />
                        <span>In progress</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 text-[10px] font-bold flex items-center gap-1">
                        <FaClock />
                        <span>Assigned</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h4>

                  {/* Clinician name and note */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5 font-medium">
                      <FaUserMd className="text-tealBrand-500 text-xs shrink-0" />
                      <span>Assigned by {item.clinicianName}</span>
                      {item.dueDate && (
                        <span className="text-slate-400 flex items-center gap-1 ml-2">
                          <FaCalendarAlt className="text-[10px]" />
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </p>

                    {item.note && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs italic text-slate-700 dark:text-slate-300">
                        "{item.note}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onStart(item)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <FaPlay className="text-[10px]" />
                    <span>{item.status === 'in_progress' ? 'Resume Exercise' : 'Start Exercise'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed History Section (Completed & Skipped) */}
      {historyAssignments.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              <span>Completed &amp; Skipped History ({historyAssignments.length})</span>
            </span>
            {showHistory ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2 animate-fadeIn divide-y divide-slate-100 dark:divide-slate-800">
              {historyAssignments.map((h) => {
                const isCompleted = h.status === 'completed';
                return (
                  <div
                    key={h._id || h.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {h.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isCompleted ? 'Completed' : 'Skipped'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isCompleted
                          ? `Completed on ${new Date(h.completedAt || h.updatedAt).toLocaleDateString()}`
                          : `Skipped: ${formatSkipReason(h.skipReason)}`}
                        {h.clinicianName && ` • Clinician: ${h.clinicianName}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCompleted && h.moodBefore !== null && h.moodAfter !== null && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-tealBrand-500/10 text-tealBrand-700 dark:text-tealBrand-300 font-semibold text-[11px]">
                          <FaHeartbeat className="text-tealBrand-500" />
                          <span>
                            Mood: {h.moodBefore} &rarr; {h.moodAfter}
                          </span>
                        </div>
                      )}

                      {isCompleted && h.sharedResult?.score !== undefined && h.sharedResult?.score !== null && (
                        <div className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold text-[11px] border border-purple-500/30">
                          Shared Score: {h.sharedResult.score}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Self-Help Care Disclaimer */}
      <p className="text-[11px] text-slate-400 italic text-center pt-1">
        These exercises are self-help tools and not a substitute for professional care.
      </p>
    </div>
  );
};
