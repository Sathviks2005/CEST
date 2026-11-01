import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const CptVisual = () => {
  const { isReduced } = useMotionSafe();
  const [index, setIndex] = useState(0);

  // A-X task: Target is X ONLY after A
  const stream = [
    { letter: 'B', isCue: false, isTarget: false, label: 'Distractor letter — Ignore' },
    { letter: 'A', isCue: true, isTarget: false, label: 'Cue Letter "A"! Prepare for potential target...' },
    { letter: 'X', isCue: false, isTarget: true, label: 'TARGET "X" after "A"! RESPOND NOW!' },
    { letter: 'M', isCue: false, isTarget: false, label: 'Distractor letter — Ignore' },
    { letter: 'X', isCue: false, isTarget: false, label: '"X" without "A" beforehand — Do NOT respond' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % stream.length);
    }, 1900);
    return () => clearInterval(interval);
  }, [isReduced, stream.length]);

  const current = stream[index];

  return (
    <div
      role="img"
      aria-label="Continuous Performance Test visual showing rapid stimulus stream and target detection rule"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="w-44 h-36 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center shadow-xl">
        <motion.div
          key={index}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`text-5xl font-black font-mono tracking-widest ${
            current.isTarget
              ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
              : current.isCue
              ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
              : 'text-slate-300'
          }`}
        >
          {current.letter}
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        {current.isTarget ? (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 text-xs font-black animate-pulse">
            ★ TARGET HIT: [A] → [X]
          </span>
        ) : current.isCue ? (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold">
            Priming Cue: Letter [A]
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 text-xs font-medium">
            Non-target letter
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        {current.label}
      </p>
    </div>
  );
};

