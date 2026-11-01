import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const ClockMoon = () => {
  const { isReduced } = useMotionSafe();
  const [hourAngle, setHourAngle] = useState(330); // 11 PM (330 deg)

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setHourAngle((prev) => (prev >= 210 ? 330 : prev + 30)); // sweeps from 11pm (330) to 7am (210)
    }, 1500);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="Clock face sweeping between bedtime and morning wake time for the sleep diary"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Clock Dial */}
        <div className="w-32 h-32 rounded-full border-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-inner relative">
          {/* Moon at night side */}
          <span className="absolute top-2 text-xs opacity-75">🌙</span>
          {/* Sun at day side */}
          <span className="absolute bottom-2 text-xs opacity-75">☀️</span>

          {/* Sweeping Clock Hand */}
          <motion.div
            className="absolute w-1 h-12 bg-indigo-500 rounded-full origin-bottom"
            style={{ bottom: '50%', transformOrigin: 'bottom center' }}
            animate={{ rotate: isReduced ? 330 : hourAngle }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          {/* Center Pin */}
          <div className="w-3 h-3 rounded-full bg-indigo-600 z-10" />
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Track bed times, lights-out, and sleep efficiency
      </p>
    </div>
  );
};
