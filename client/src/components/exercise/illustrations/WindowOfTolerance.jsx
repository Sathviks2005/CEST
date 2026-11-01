import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const WindowOfTolerance = () => {
  const { isReduced } = useMotionSafe();

  return (
    <div
      role="img"
      aria-label="Window of Tolerance teaching model: Hyperarousal top, Optimal Window center, Hypoarousal bottom with grounding arrow"
      className="flex flex-col items-center justify-center p-3 space-y-2.5"
    >
      <div className="w-56 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden text-[10px] font-bold">
        {/* Hyperarousal Zone */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 p-2 text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <span>Hyperarousal (Too Activated)</span>
          <span className="text-[9px] opacity-75">Panic, racing mind</span>
        </div>

        {/* Optimal Window Zone */}
        <div className="bg-tealBrand-500/20 border-b border-tealBrand-500/40 p-3 text-tealBrand-900 dark:text-tealBrand-200 relative flex items-center justify-between">
          <div>
            <span className="block font-black text-[11px]">Window of Tolerance</span>
            <span className="text-[9px] opacity-80">Calm, connected, able to think</span>
          </div>

          {/* Grounding Arrow */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-tealBrand-600 text-white text-[9px] shadow-sm">
            <span>Grounding</span>
            <span>⬇️</span>
          </div>
        </div>

        {/* Hypoarousal Zone */}
        <div className="bg-slate-200/60 dark:bg-slate-800/60 p-2 text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Hypoarousal (Shut Down)</span>
          <span className="text-[9px] opacity-75">Numb, foggy, disconnected</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Teaching model: grounding brings the nervous system back to safety
      </p>
    </div>
  );
};
