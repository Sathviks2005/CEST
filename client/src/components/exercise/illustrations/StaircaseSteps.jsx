import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const STEPS = ['Define', 'Goal', 'Brainstorm', 'Decide', 'Action', 'Review'];

export const StaircaseSteps = ({ currentStep = 0 }) => {
  const { isReduced } = useMotionSafe();
  const [animStep, setAnimStep] = useState(currentStep);

  useEffect(() => {
    if (isReduced) {
      setAnimStep(currentStep);
      return;
    }
    const interval = setInterval(() => {
      setAnimStep((s) => (s + 1) % STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isReduced, currentStep]);

  return (
    <div
      role="img"
      aria-label="Six-step staircase diagram for structured problem solving"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="relative w-52 h-36 flex items-end justify-between px-2">
        {STEPS.map((label, idx) => {
          const isCurrent = idx === animStep;
          const isReached = idx <= animStep;
          const heightPx = 20 + idx * 18;

          return (
            <div key={label} className="flex-1 flex flex-col items-center justify-end">
              {/* Climbing Person Marker */}
              {isCurrent && (
                <motion.div
                  className="text-base mb-1"
                  animate={{ y: isReduced ? 0 : [-3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, repeatType: 'reverse' }}
                >
                  🚶
                </motion.div>
              )}

              {/* Step Block */}
              <div
                style={{ height: `${heightPx}px` }}
                className={`w-full rounded-t-md border transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-tealBrand-500 border-tealBrand-400 text-white shadow-md'
                    : isReached
                    ? 'bg-tealBrand-500/20 border-tealBrand-500/40 text-tealBrand-700 dark:text-tealBrand-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-[9px] font-black">{idx + 1}</span>
              </div>
              <span className="text-[8px] font-semibold text-slate-500 truncate mt-0.5">{label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Break large challenges into one manageable step at a time
      </p>
    </div>
  );
};
