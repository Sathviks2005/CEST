import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const GoNoGoVisual = () => {
  const { isReduced } = useMotionSafe();
  const [step, setStep] = useState(0);

  const stimuli = [
    { type: 'go', label: 'GO!', sub: 'PRESS / TAP', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-400' },
    { type: 'go', label: 'GO!', sub: 'PRESS / TAP', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-400' },
    { type: 'nogo', label: 'NO-GO', sub: 'HOLD BACK!', color: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-400' },
    { type: 'go', label: 'GO!', sub: 'PRESS / TAP', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-400' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % stimuli.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isReduced, stimuli.length]);

  const current = stimuli[step];

  return (
    <div
      role="img"
      aria-label="Go / No-Go impulse control visual showing alternating Go and Stop signals"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div
          key={step}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl border-4 ${current.color} ${current.border}`}
        >
          <span className="text-2xl font-black tracking-wider">{current.label}</span>
          <span className="text-[10px] font-bold tracking-widest mt-1 opacity-90">{current.sub}</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          Green = Respond
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30">
          Red = Withhold
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        Train motor inhibition and impulse control by rapidly arresting responses on red cues.
      </p>
    </div>
  );
};

