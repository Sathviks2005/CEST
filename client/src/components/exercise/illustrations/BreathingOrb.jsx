import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const BreathingOrb = ({ isBedtime = false }) => {
  const { isReduced } = useMotionSafe();
  const [phase, setPhase] = useState('inhale'); // 'inhale' (4s) | 'exhale' (6s)

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
    }, phase === 'inhale' ? 4000 : 6000);
    return () => clearInterval(interval);
  }, [phase, isReduced]);

  const isInhale = phase === 'inhale';

  return (
    <div
      role="img"
      aria-label="Slow breathing visual orb animating 4-second inhale and 6-second exhale"
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Outer Ripple Rings */}
        {!isReduced && (
          <motion.div
            className={`absolute rounded-full border ${
              isBedtime
                ? 'border-indigo-400/30 bg-indigo-500/10'
                : 'border-tealBrand-400/30 bg-tealBrand-500/10'
            }`}
            animate={{
              width: isInhale ? ['110px', '168px'] : ['168px', '110px'],
              height: isInhale ? ['110px', '168px'] : ['168px', '110px'],
              opacity: isInhale ? [0.4, 0.8] : [0.8, 0.3],
            }}
            transition={{
              duration: isInhale ? 4 : 6,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Central Orb */}
        <motion.div
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors ${
            isBedtime
              ? 'bg-gradient-to-tr from-slate-800 to-indigo-600 text-indigo-100 border border-indigo-400/40'
              : 'bg-gradient-to-tr from-brand-600 to-tealBrand-500 text-white border border-tealBrand-300/40'
          }`}
          animate={{
            scale: isReduced ? 1 : isInhale ? 1.18 : 0.88,
          }}
          transition={{
            duration: isInhale ? 4 : 6,
            ease: 'easeInOut',
          }}
        >
          {/* Nose (inhale) / Mouth (exhale) icon */}
          <svg className="w-6 h-6 mb-1 opacity-90 fill-current" viewBox="0 0 24 24">
            {isInhale ? (
              // Nose icon SVG
              <path d="M12 2C10.3 2 9 3.3 9 5v8.5c0 1.4-1.1 2.5-2.5 2.5H6a1 1 0 0 0 0 2h.5c2.5 0 4.5-2 4.5-4.5V5c0-.6.4-1 1-1s1 .4 1 1v9.5c0 2.5 2 4.5 4.5 4.5h.5a1 1 0 0 0 0-2h-.5c-1.4 0-2.5-1.1-2.5-2.5V5c0-1.7-1.3-3-3-3z" />
            ) : (
              // Calm mouth / smile exhale SVG
              <path d="M12 16c-3.3 0-6-1.5-7-3.5a1 1 0 0 1 1.7-.9c.7 1.4 2.8 2.4 5.3 2.4s4.6-1 5.3-2.4a1 1 0 1 1 1.7.9c-1 2-3.7 3.5-7 3.5z" />
            )}
          </svg>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">
            {isInhale ? 'Inhale 4s' : 'Exhale 6s'}
          </span>
          <span className="text-[9px] opacity-80">
            {isInhale ? 'Nose' : 'Mouth'}
          </span>
        </motion.div>
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        {isInhale ? 'Breathe in slowly (4s)' : 'Breathe out gently (6s)'}
      </p>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        Paced breathing without breath-holds
      </span>
    </div>
  );
};
