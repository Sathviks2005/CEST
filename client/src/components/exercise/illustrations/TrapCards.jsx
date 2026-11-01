import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const TRAPS = [
  { name: 'All-or-Nothing', icon: '⚖️', desc: 'Viewing things in black or white.' },
  { name: 'Catastrophizing', icon: '🔮', desc: 'Predicting the worst possible outcome.' },
  { name: 'Mind Reading', icon: '💭', desc: 'Assuming others think negatively of you.' },
  { name: 'Emotional Reasoning', icon: '❤️‍🔥', desc: 'Assuming feeling it makes it true.' },
  { name: '"Should" Statements', icon: '📜', desc: 'Holding rigid rules and guilt.' },
  { name: 'Overgeneralizing', icon: '🔄', desc: 'Treating one event as an endless pattern.' },
];

export const TrapCards = () => {
  const { isReduced } = useMotionSafe();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TRAPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isReduced]);

  const trap = TRAPS[activeIdx];

  return (
    <div
      role="img"
      aria-label="Thinking Traps cards displaying common cognitive distortions and examples"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="grid grid-cols-3 gap-1.5 w-52">
        {TRAPS.map((t, idx) => (
          <div
            key={t.name}
            onClick={() => setActiveIdx(idx)}
            className={`p-1.5 rounded-xl border text-center cursor-pointer transition-all ${
              idx === activeIdx
                ? 'bg-brand-600 text-white border-brand-400 shadow-md font-bold'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-base block">{t.icon}</span>
            <span className="text-[9px] block leading-tight truncate">{t.name}</span>
          </div>
        ))}
      </div>

      <motion.div
        key={trap.name}
        className="w-52 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block">
          {trap.icon} {trap.name}
        </span>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{trap.desc}</p>
      </motion.div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Thoughts are hypotheses, not objective facts
      </p>
    </div>
  );
};
