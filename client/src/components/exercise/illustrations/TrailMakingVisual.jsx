import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const TrailMakingVisual = () => {
  const { isReduced } = useMotionSafe();
  const [step, setStep] = useState(0);

  // Alternating trail: 1 -> A -> 2 -> B -> 3
  const nodes = [
    { id: '1', label: '1', x: 20, y: 30, type: 'num' },
    { id: 'A', label: 'A', x: 50, y: 15, type: 'letter' },
    { id: '2', label: '2', x: 80, y: 35, type: 'num' },
    { id: 'B', label: 'B', x: 65, y: 75, type: 'letter' },
    { id: '3', label: '3', x: 25, y: 70, type: 'num' },
  ];

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % (nodes.length + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isReduced, nodes.length]);

  return (
    <div
      role="img"
      aria-label="Trail making sequence visual illustrating alternation between numbers and letters"
      className="flex flex-col items-center justify-center p-4 space-y-3"
    >
      <div className="relative w-64 h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden">
        {/* SVG connection lines between reached nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.slice(0, Math.min(step, nodes.length - 1)).map((node, i) => {
            const next = nodes[i + 1];
            if (!next) return null;
            return (
              <line
                key={`line-${i}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="rgb(20 184 166)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const isReached = idx < step;
          const isCurrent = idx === step;
          return (
            <motion.div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-sm ${
                isReached
                  ? 'bg-tealBrand-500 text-white ring-2 ring-tealBrand-400'
                  : isCurrent
                  ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-200 dark:ring-amber-500/50 scale-110 z-10'
                  : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              animate={{
                scale: isCurrent ? [1, 1.15, 1] : 1,
              }}
              transition={{ repeat: isCurrent ? Infinity : 0, duration: 1 }}
            >
              {node.label}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="font-bold text-tealBrand-600 dark:text-tealBrand-400">Sequence:</span>
        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono font-bold">
          1 → A → 2 → B → 3
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Alternate between ascending numbers and letters as fast as you can.
      </p>
    </div>
  );
};

