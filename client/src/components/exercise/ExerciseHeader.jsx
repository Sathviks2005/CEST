import React from 'react';
import { FaBrain, FaTimes, FaClock } from 'react-icons/fa';
import { DifficultyBadge } from './DifficultyBadge';

export const ExerciseHeader = ({ title, domain, difficulty, estimatedDuration, onExit }) => {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaBrain />
            <span>CET-Informed Cognitive Training Activity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Domain: <span className="text-brand-600 dark:text-brand-400 font-bold">{domain}</span>
            </span>
            <span>•</span>
            <DifficultyBadge difficulty={difficulty} />
            {estimatedDuration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FaClock className="text-slate-400" /> {estimatedDuration}
                </span>
              </>
            )}
          </div>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FaTimes /> Exit Exercise
          </button>
        )}
      </div>
    </div>
  );
};
