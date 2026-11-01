import React from 'react';

const RUNGS = [
  { level: 'High Distress (80–100)', label: 'Top Trigger', tag: 'Therapist Guided' },
  { level: 'Moderate Distress (50–79)', label: 'Middle Challenges', tag: 'Graded Step' },
  { level: 'Mild Distress (20–49)', label: 'Initial Situations', tag: 'Foundation' },
  { level: 'Low Distress (0–19)', label: 'Start Here (with therapist)', tag: 'First Step', highlight: true },
];

export const ExposureLadder = () => {
  return (
    <div
      role="img"
      aria-label="Exposure hierarchy ladder: feared situations sorted from lowest distress at bottom to highest at top"
      className="flex flex-col items-center justify-center p-3 space-y-2.5"
    >
      <div className="w-56 space-y-1.5">
        {RUNGS.map((rung) => (
          <div
            key={rung.level}
            className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-bold transition-all ${
              rung.highlight
                ? 'bg-tealBrand-500/20 border-tealBrand-500 text-tealBrand-700 dark:text-tealBrand-300 ring-2 ring-tealBrand-400 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div>
              <span className="block">{rung.label}</span>
              <span className="text-[8px] font-medium opacity-70">{rung.level}</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-black ${
                rung.highlight
                  ? 'bg-tealBrand-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {rung.tag}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Preparation ladder for clinical exposure therapy
      </p>
    </div>
  );
};
