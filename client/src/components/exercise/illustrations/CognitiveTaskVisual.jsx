import React from 'react';
import { FaBrain, FaBullseye, FaBolt } from 'react-icons/fa';

export const CognitiveTaskVisual = () => {
  return (
    <div
      role="img"
      aria-label="Cognitive focus and mental training visual representation"
      className="flex flex-col items-center justify-center p-4 space-y-4"
    >
      <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-tealBrand-500/20 to-purple-500/20 border border-tealBrand-500/30 flex items-center justify-center shadow-lg">
        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-tealBrand-400/30 flex items-center justify-center text-tealBrand-600 dark:text-tealBrand-400 shadow-md">
          <FaBrain className="text-4xl animate-pulse" />
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-xs shadow">
          <FaBolt />
        </div>
        <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-tealBrand-500 text-white flex items-center justify-center text-xs shadow">
          <FaBullseye />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 text-xs font-bold uppercase tracking-wider">
          Executive Function Training
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
        Sharpen your attention, cognitive flexibility, and response control with guided interactive tasks.
      </p>
    </div>
  );
};

