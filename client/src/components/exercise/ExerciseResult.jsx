import React from 'react';
import { FaCheckCircle, FaRedo, FaTachometerAlt, FaClock, FaBullseye, FaBrain, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

export const ExerciseResult = ({
  score,
  maxScore = 100,
  accuracy,
  timeTaken,
  attempts = 1,
  cognitiveDomain,
  exerciseName,
  onTryAgain,
  onBackToDashboard,
  isSubmitting = false,
}) => {
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 max-w-2xl mx-auto text-center">
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Exercise Completed!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Great job! You have successfully completed <span className="font-semibold">{exerciseName}</span>.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-center gap-1">
            <FaTachometerAlt /> Score
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {score}
            <span className="text-xs text-slate-400 font-medium">/{maxScore}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-center gap-1">
            <FaBullseye /> Accuracy
          </p>
          <p className="text-2xl font-extrabold text-tealBrand-600 dark:text-tealBrand-400">
            {accuracy}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-center gap-1">
            <FaClock /> Time
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatTime(timeTaken)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-center gap-1">
            Attempts
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{attempts}</p>
        </div>
      </div>

      {/* Domain Trained Card */}
      <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <FaBrain />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-700 dark:text-brand-300">
              Cognitive Domain Trained
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{cognitiveDomain}</p>
          </div>
        </div>
      </div>

      {/* Non-medical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-[11px] text-left leading-relaxed flex items-start gap-2">
        <FaShieldAlt className="mt-0.5 text-purple-600 dark:text-purple-400 shrink-0 text-sm" />
        <span>
          These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment. Exercise scores reflect task engagement and are never used as a clinical measure.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onTryAgain}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 disabled:opacity-50 transition-all"
        >
          <FaRedo /> Try Again
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBackToDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-all text-sm"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};
