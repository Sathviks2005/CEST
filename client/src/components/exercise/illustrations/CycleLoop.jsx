import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const CycleLoop = ({ variant = 'activation' }) => {
  const { isReduced } = useMotionSafe();
  const isOCD = variant === 'ocd';

  // For activation: toggle between downward spiral and upward spiral
  const [spiralType, setSpiralType] = useState('downward');

  useEffect(() => {
    if (isReduced || isOCD) return;
    const interval = setInterval(() => {
      setSpiralType((s) => (s === 'downward' ? 'upward' : 'downward'));
    }, 3000);
    return () => clearInterval(interval);
  }, [isReduced, isOCD]);

  if (isOCD) {
    const ocdNodes = ['Trigger', 'Obsession', 'Anxiety', 'Compulsion', 'Brief Relief'];
    return (
      <div
        role="img"
        aria-label="Five-step OCD cycle diagram showing reinforcement from temporary relief"
        className="flex flex-col items-center justify-center p-3 space-y-3"
      >
        <div className="relative w-52 h-44 flex items-center justify-center">
          {/* Circular Track */}
          <div className="w-36 h-36 rounded-full border-2 border-dashed border-tealBrand-400/50 absolute" />

          {/* 5 Points around the circle */}
          {ocdNodes.map((node, idx) => {
            const angle = (idx / 5) * (2 * Math.PI) - Math.PI / 2;
            const r = 62;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            return (
              <div
                key={node}
                className="absolute px-2 py-0.5 rounded-md text-[9px] font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                {node}
              </div>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
          Temporary relief strengthens the OCD loop
        </p>
      </div>
    );
  }

  // Behavioral Activation Spiral
  const isDownward = spiralType === 'downward';
  const steps = isDownward
    ? ['Low Mood', 'Withdraw / Do Less', 'Fewer Rewards', 'Lower Mood']
    : ['Small Activity', 'Pleasure & Mastery', 'Better Mood', 'More Energy'];

  return (
    <div
      role="img"
      aria-label={`Behavioral Activation cycle showing ${isDownward ? 'downward' : 'upward'} loop`}
      className="flex flex-col items-center justify-center p-3 space-y-3"
    >
      <div className="w-52 p-3 rounded-2xl border transition-all text-center space-y-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            isDownward
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isDownward ? 'Downward Spiral' : 'Upward Activation Spiral'}
        </span>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold pt-1">
          {steps.map((st, idx) => (
            <motion.div
              key={st}
              className={`p-1.5 rounded-lg border ${
                isDownward
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              }`}
              animate={{ scale: isReduced ? 1 : [1, 1.04, 1] }}
              transition={{ delay: idx * 0.15, duration: 1 }}
            >
              {st}
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Small actions reverse low motivation loops
      </p>
    </div>
  );
};
