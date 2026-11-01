import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const NBackVisual = () => {
  const { isReduced } = useMotionSafe();
  const [frame, setFrame] = useState(0);

  // Sequence: B -> K -> B (Match!) -> T -> K -> M
  const sequence = [
    { item: 'B', is2BackMatch: false, label: 'Store in memory (Position 1)' },
    { item: 'K', is2BackMatch: false, label: 'Store in memory (Position 2)' },
    { item: 'B', is2BackMatch: true, label: 'Matches item 2 steps back! (B = B)' },
    { item: 'T', is2BackMatch: false, label: 'Compare with K (Different)' },
    { item: 'K', is2BackMatch: true, label: 'Matches item 2 steps back! (K = K)' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % sequence.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isReduced, sequence.length]);

  const current = sequence[frame];

  return (
    <div
      role="img"
      aria-label="Working memory N-Back visual showing sequential stream of items to remember and match"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="flex items-center gap-3">
        {sequence.map((s, idx) => {
          const isCurrent = idx === frame;
          const isPassed = idx < frame;
          return (
            <motion.div
              key={idx}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all border ${
                isCurrent
                  ? s.is2BackMatch
                    ? 'bg-purple-600 text-white border-purple-400 ring-4 ring-purple-300 shadow-lg scale-110'
                    : 'bg-tealBrand-500 text-white border-tealBrand-400 ring-4 ring-tealBrand-300 shadow-md scale-105'
                  : isPassed
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 opacity-60'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-dashed border-slate-300 dark:border-slate-700 opacity-40'
              }`}
            >
              {s.item}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {current.is2BackMatch ? (
          <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-black animate-bounce">
            ★ 2-BACK MATCH!
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 text-xs font-bold">
            Updating Buffer...
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        {current.label}
      </p>
    </div>
  );
};

