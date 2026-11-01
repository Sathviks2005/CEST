import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const WorryTreeDiagram = () => {
  const { isReduced } = useMotionSafe();
  const [activeBranch, setActiveBranch] = useState('action'); // 'action' | 'postpone'

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setActiveBranch((b) => (b === 'action' ? 'postpone' : 'action'));
    }, 2800);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="Worry Decision Tree flowchart: actionable problem vs hypothetical worry postponed to worry time"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="relative w-52 h-44 flex flex-col items-center">
        {/* Top Node */}
        <div className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-[11px] shadow-sm text-center border border-brand-400">
          What is my worry?
        </div>

        {/* Question Node */}
        <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-600" />
        <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-[10px] border border-slate-300 dark:border-slate-700">
          Can I do something right now?
        </div>

        {/* Branch Lines */}
        <svg className="w-44 h-8" viewBox="0 0 176 32">
          {/* Left Branch */}
          <path
            d="M88 0 L40 32"
            className={`stroke-2 transition-colors ${
              activeBranch === 'action'
                ? 'stroke-tealBrand-500'
                : 'stroke-slate-300 dark:stroke-slate-700'
            }`}
            fill="none"
          />
          {/* Right Branch */}
          <path
            d="M88 0 L136 32"
            className={`stroke-2 transition-colors ${
              activeBranch === 'postpone'
                ? 'stroke-amber-500'
                : 'stroke-slate-300 dark:stroke-slate-700'
            }`}
            fill="none"
          />
        </svg>

        {/* Bottom Two Leaves */}
        <div className="flex items-center justify-between w-full px-2 gap-2">
          <motion.div
            className={`flex-1 p-1.5 rounded-xl border text-center text-[10px] font-bold ${
              activeBranch === 'action'
                ? 'bg-tealBrand-500/20 border-tealBrand-500 text-tealBrand-700 dark:text-tealBrand-300 shadow'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
            animate={{ scale: isReduced ? 1 : activeBranch === 'action' ? 1.05 : 0.95 }}
          >
            <span className="block text-[9px] uppercase font-bold text-tealBrand-600">Yes</span>
            Action Plan Now
          </motion.div>

          <motion.div
            className={`flex-1 p-1.5 rounded-xl border text-center text-[10px] font-bold ${
              activeBranch === 'postpone'
                ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
            animate={{ scale: isReduced ? 1 : activeBranch === 'postpone' ? 1.05 : 0.95 }}
          >
            <span className="block text-[9px] uppercase font-bold text-amber-600">No</span>
            Schedule Worry Time
          </motion.div>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Separate solvable problems from hypothetical worries
      </p>
    </div>
  );
};
