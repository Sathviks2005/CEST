import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const STEPS = [
  '1. Situation',
  '2. Mood & Intensity',
  '3. Automatic Thought',
  '4. Evidence For',
  '5. Evidence Against',
  '6. Balanced Thought',
  '7. Re-rate Mood',
];

export const ThoughtRecordSteps = () => {
  const { isReduced } = useMotionSafe();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="Seven-step progressive path of a CBT thought record"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="w-52 space-y-1.5">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;
          return (
            <motion.div
              key={step}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                isActive
                  ? 'bg-tealBrand-500/20 border-tealBrand-400 text-tealBrand-700 dark:text-tealBrand-300 shadow-sm'
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
              animate={{ x: isReduced ? 0 : isActive ? 4 : 0 }}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  isActive
                    ? 'bg-tealBrand-500 text-white'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {idx + 1}
              </span>
              <span>{step}</span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Step-by-step cognitive restructuring
      </p>
    </div>
  );
};
