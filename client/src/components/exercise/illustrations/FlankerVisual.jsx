import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const FlankerVisual = () => {
  const { isReduced } = useMotionSafe();
  const [trial, setTrial] = useState(0);

  // Alternates between congruent (>>>>>) and incongruent (<<><<)
  const trials = [
    { target: 'right', items: ['→', '→', '→', '→', '→'], type: 'Congruent: Target matches flankers' },
    { target: 'right', items: ['←', '←', '→', '←', '←'], type: 'Incongruent: Focus on CENTER arrow only' },
    { target: 'left', items: ['←', '←', '←', '←', '←'], type: 'Congruent: Target matches flankers' },
    { target: 'left', items: ['→', '→', '←', '→', '→'], type: 'Incongruent: Focus on CENTER arrow only' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setTrial((prev) => (prev + 1) % trials.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isReduced]);

  const current = trials[trial];

  return (
    <div
      role="img"
      aria-label="Eriksen Flanker task visual illustration showing central target arrow amidst flanking distractor arrows"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner">
        {current.items.map((arrow, idx) => {
          const isCenter = idx === 2;
          return (
            <motion.div
              key={`${trial}-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all ${
                isCenter
                  ? 'bg-tealBrand-500 text-white shadow-lg ring-4 ring-tealBrand-300 dark:ring-tealBrand-600 scale-110 z-10'
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              {arrow}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-tealBrand-500 animate-pulse" />
        <span className="text-xs font-bold text-tealBrand-600 dark:text-tealBrand-400 uppercase tracking-wider">
          Center Target: {current.target.toUpperCase()}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center max-w-xs">
        {current.type}
      </p>
    </div>
  );
};

