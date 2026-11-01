import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const HabituationCurve = () => {
  const { isReduced } = useMotionSafe();

  return (
    <div
      role="img"
      aria-label="Habituation curve diagram showing discomfort naturally rising, peaking, and subsiding when a compulsion is resisted"
      className="flex flex-col items-center justify-center p-3 space-y-2.5"
    >
      <div className="relative w-56 h-32 flex flex-col justify-end p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Axis */}
          <line x1="20" y1="85" x2="190" y2="85" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
          <line x1="20" y1="15" x2="20" y2="85" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />

          {/* Dotted Compulsion Loop Line (relief drops immediately, then re-spikes) */}
          <path
            d="M20 75 Q45 25 65 30 L70 80"
            className="stroke-rose-400 stroke-dasharray-2"
            strokeWidth="2"
            strokeDasharray="4 3"
            fill="none"
          />

          {/* Natural Habituation Curve (rises, peaks, smoothly decays over time) */}
          <motion.path
            d="M20 75 Q65 20 100 25 T180 80"
            className="stroke-tealBrand-500"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: isReduced ? 0.01 : 1.5, ease: 'easeInOut' }}
          />
        </svg>

        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 px-1">
          <span>Trigger</span>
          <span className="text-tealBrand-500">Peak Distress</span>
          <span>Natural Habituation</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        When rituals are resisted, anxiety peaks and falls on its own
      </p>
    </div>
  );
};
