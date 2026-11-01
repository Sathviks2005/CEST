import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const FRAMES = [
  { icon: '🛏️', title: 'Awake ~15–20m', desc: 'No clock watching' },
  { icon: '🚪', title: 'Get Out of Bed', desc: 'Leave bedroom quietly' },
  { icon: '🛋️', title: 'Dim Quiet Room', desc: 'Soft lamp, relaxing read' },
  { icon: '🥱', title: 'Feel Drowsy', desc: 'Heavy eyelids return' },
  { icon: '🌙', title: 'Back to Bed', desc: 'Bed reserved for sleep' },
];

export const BedroomFlow = () => {
  const { isReduced } = useMotionSafe();
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setActiveFrame((f) => (f + 1) % FRAMES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="CBT-I stimulus control storyboard: awake in bed roughly 15-20 min, get up to dim room, return when sleepy"
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="flex items-center justify-center gap-1.5 w-56">
        {FRAMES.map((fr, idx) => {
          const isActive = idx === activeFrame;
          return (
            <motion.div
              key={fr.title}
              className={`p-1.5 rounded-xl border text-center flex-1 transition-all ${
                isActive
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400 shadow'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              animate={{ scale: isReduced ? 1 : isActive ? 1.08 : 0.94 }}
            >
              <span className="text-sm block">{fr.icon}</span>
              <span className="text-[8px] font-bold block truncate leading-tight">{fr.title}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="w-52 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
          Step {activeFrame + 1}: {FRAMES[activeFrame].title}
        </span>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {FRAMES[activeFrame].desc}
        </p>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Rebuild the brain's association: bed = deep sleep
      </p>
    </div>
  );
};
