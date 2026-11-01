import React from 'react';

export const ExerciseProgress = ({ round, totalRounds, score, accuracy, attempts }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Progress:</span>
        <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold border border-brand-500/30">
          Round {round} / {totalRounds}
        </span>
      </div>

      {score !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Score:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{score} pts</span>
        </div>
      )}

      {accuracy !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Accuracy:</span>
          <span className="font-extrabold text-tealBrand-600 dark:text-tealBrand-400">
            {accuracy}%
          </span>
        </div>
      )}

      {attempts !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Attempts:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{attempts}</span>
        </div>
      )}
    </div>
  );
};
