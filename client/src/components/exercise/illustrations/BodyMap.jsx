import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

const GROUPS = [
  { name: 'Hands & Arms', cx: 50, cy: 38, rx: 32, ry: 6 },
  { name: 'Shoulders & Neck', cx: 50, cy: 24, rx: 18, ry: 5 },
  { name: 'Face & Jaw', cx: 50, cy: 12, rx: 10, ry: 9 },
  { name: 'Stomach & Core', cx: 50, cy: 42, rx: 14, ry: 10 },
  { name: 'Feet & Legs', cx: 50, cy: 75, rx: 16, ry: 20 },
];

export const BodyMap = () => {
  const { isReduced } = useMotionSafe();
  const [groupIdx, setGroupIdx] = useState(0);
  const [isTense, setIsTense] = useState(true);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setIsTense((prev) => {
        if (prev) {
          return false;
        } else {
          setGroupIdx((g) => (g + 1) % GROUPS.length);
          return true;
        }
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [isReduced]);

  const activeGroup = GROUPS[groupIdx];

  return (
    <div
      role="img"
      aria-label="Human body silhouette diagram highlighting active muscle group in progressive muscle relaxation"
      className="flex flex-col items-center justify-center p-3 space-y-2"
    >
      <div className="relative w-36 h-48 flex items-center justify-center">
        {/* SVG Silhouette */}
        <svg viewBox="0 0 100 110" className="w-full h-full">
          {/* Base Head */}
          <circle cx="50" cy="14" r="9" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          {/* Torso */}
          <path d="M38 26 L62 26 L58 58 L42 58 Z" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          {/* Arms */}
          <path d="M38 27 L20 45 L24 48 L40 32 Z" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          <path d="M62 27 L80 45 L76 48 L60 32 Z" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          {/* Legs */}
          <path d="M42 58 L38 98 L46 98 L48 60 Z" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
          <path d="M58 58 L62 98 L54 98 L52 60 Z" className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />

          {/* Active Muscle Group Glow Zone */}
          <motion.ellipse
            cx={activeGroup.cx}
            cy={activeGroup.cy}
            rx={activeGroup.rx}
            ry={activeGroup.ry}
            className={
              isTense
                ? 'fill-amber-500/40 stroke-amber-500'
                : 'fill-tealBrand-500/40 stroke-tealBrand-400'
            }
            strokeWidth="2"
            animate={{
              scale: isReduced ? 1 : isTense ? 0.94 : 1.06,
              opacity: isReduced ? 0.8 : [0.6, 0.95],
            }}
            transition={{ duration: 0.5, repeat: isReduced ? 0 : Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70">
        <span aria-hidden="true">{isTense ? '⚡' : '🌿'}</span>
        <span>{activeGroup.name}: {isTense ? 'Tense (5s)' : 'Release (10s)'}</span>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
        Progressive release relaxes physical tension
      </p>
    </div>
  );
};
