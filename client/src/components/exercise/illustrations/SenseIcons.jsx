import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const SENSES = [
  { count: 5, label: 'See', sub: '5 Things', icon: '👁️' },
  { count: 4, label: 'Touch', sub: '4 Feelings', icon: '✋' },
  { count: 3, label: 'Hear', sub: '3 Sounds', icon: '👂' },
  { count: 2, label: 'Smell', sub: '2 Scents', icon: '👃' },
  { count: 1, label: 'Taste', sub: '1 Taste', icon: '👅' },
];

export const SenseIcons = () => {
  const { isReduced } = useMotionSafe();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SENSES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="Sensory grounding sequence from 5 things to see down to 1 thing to taste"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-xs">
        {SENSES.map((s, idx) => {
          const isActive = idx === activeIdx;
          return (
            <motion.div
              key={s.count}
              className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all ${
                isActive
                  ? 'bg-tealBrand-500/20 border-tealBrand-400 text-tealBrand-600 dark:text-tealBrand-300 ring-2 ring-tealBrand-400 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              animate={{
                scale: isReduced ? 1 : isActive ? 1.08 : 0.95,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xl sm:text-2xl mb-1">{s.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">{s.sub}</span>
              <span className="text-[9px] font-semibold opacity-75">{s.label}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Sensory grounding connects you to the physical room
      </p>
    </div>
  );
};
