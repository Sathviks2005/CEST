import React from 'react';

export const DifficultyBadge = ({ difficulty }) => {
  const getStyle = (diff = '') => {
    const d = diff.toLowerCase();
    if (d.includes('easy')) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    }
    if (d.includes('medium')) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }
    if (d.includes('advanced') || d.includes('hard')) {
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
    }
    return 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/30';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStyle(
        difficulty
      )}`}
    >
      Difficulty: {difficulty}
    </span>
  );
};
