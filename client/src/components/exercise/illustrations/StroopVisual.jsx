import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const StroopVisual = () => {
  const { isReduced } = useMotionSafe();
  const [index, setIndex] = useState(0);

  const stimuli = [
    { word: 'BLUE', colorName: 'Red', colorClass: 'text-rose-500' },
    { word: 'GREEN', colorName: 'Yellow', colorClass: 'text-amber-500' },
    { word: 'RED', colorName: 'Blue', colorClass: 'text-blue-500' },
    { word: 'YELLOW', colorName: 'Green', colorClass: 'text-emerald-500' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % stimuli.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isReduced, stimuli.length]);

  const current = stimuli[index];

  return (
    <div
      role="img"
      aria-label="Stroop effect color-word interference visual showing conflicting word and font color"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="w-56 p-6 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Ignore the word text:
        </span>
        <motion.div
          key={index}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={`text-3xl sm:text-4xl font-black tracking-widest ${current.colorClass}`}
        >
          {current.word}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
        <span>Correct response:</span>
        <span className="font-extrabold underline">{current.colorName}</span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        Train response inhibition: name the ink color, suppress the impulse to read the word.
      </p>
    </div>
  );
};

