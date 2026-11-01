import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const MoodThermometer = ({ before = 80, after = 40, label = 'Mood & Distress Intensity' }) => {
  const { isReduced } = useMotionSafe();

  return (
    <div
      role="img"
      aria-label={`Mood thermometer comparing before rating ${before}% to after rating ${after}%`}
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="flex items-end justify-center gap-6 h-36">
        {/* Before Column */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-rose-500">{before}%</span>
          <div className="w-7 h-28 bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex items-end">
            <motion.div
              className="w-full bg-gradient-to-t from-rose-500 to-amber-400 rounded-full"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, before)}%` }}
              transition={{ duration: isReduced ? 0.01 : 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Before</span>
        </div>

        {/* Arrow / Shift Indicator */}
        <div className="pb-8 text-tealBrand-500 font-extrabold text-sm">
          ➔
        </div>

        {/* After Column */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-tealBrand-500">{after}%</span>
          <div className="w-7 h-28 bg-slate-200 dark:bg-slate-800 rounded-full p-1 flex items-end">
            <motion.div
              className="w-full bg-gradient-to-t from-tealBrand-600 to-emerald-400 rounded-full"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, after)}%` }}
              transition={{ duration: isReduced ? 0.01 : 0.8, ease: 'easeOut', delay: isReduced ? 0 : 0.2 }}
            />
          </div>
          <span className="text-[10px] font-bold text-tealBrand-500 uppercase">After</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        {label}
      </p>
    </div>
  );
};
