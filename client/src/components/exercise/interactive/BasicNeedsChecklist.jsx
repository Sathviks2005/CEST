import React, { useState } from 'react';
import { FaCheckCircle, FaTint, FaUtensils, FaPills, FaBed, FaSun } from 'react-icons/fa';

const NEEDS = [
  { id: 'water', label: 'Hydration', prompt: 'Have you had a glass of water in the past 3 hours?', icon: FaTint, color: 'text-blue-400' },
  { id: 'food', label: 'Nourishment', prompt: 'Have you eaten something in the last 4–5 hours (even a small snack or piece of fruit)?', icon: FaUtensils, color: 'text-amber-400' },
  { id: 'meds', label: 'Medication', prompt: 'Have you taken your regular prescribed medications or vitamins today?', icon: FaPills, color: 'text-rose-400' },
  { id: 'light', label: 'Natural Light', prompt: 'Have you seen outside daylight or opened a window today?', icon: FaSun, color: 'text-amber-300' },
  { id: 'rest', label: 'Rest / Posture', prompt: 'Have you stretched, uncurled from hunching, or changed position?', icon: FaBed, color: 'text-tealBrand-400' },
];

export const BasicNeedsChecklist = ({ onComplete }) => {
  const [checked, setChecked] = useState({});
  const [isDone, setIsDone] = useState(false);

  const toggleNeed = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const count = Object.values(checked).filter(Boolean).length;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaTint className="text-blue-400" /> Basic-Needs Grounding Checklist
          </h4>
          <p className="text-xs text-slate-400">
            During heavy depression, baseline biological needs often slip quietly. Check in on your physiological foundation.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 border border-blue-500/30">
          Biological Baseline
        </span>
      </div>

      <div className="space-y-3">
        {NEEDS.map((need) => {
          const Icon = need.icon;
          const isChecked = Boolean(checked[need.id]);

          return (
            <div
              key={need.id}
              onClick={() => toggleNeed(need.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                isChecked
                  ? 'bg-blue-500/10 border-blue-400/50 text-white ring-1 ring-blue-400/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 text-sm mt-0.5 transition-colors ${
                  isChecked ? 'bg-blue-500 border-blue-400 text-slate-950 font-black' : 'border-slate-600 bg-slate-900'
                }`}
              >
                {isChecked && '✓'}
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`${need.color} text-sm`} />
                  <span className="font-bold text-xs">{need.label}</span>
                </div>
                <p className="text-xs text-slate-400">{need.prompt}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-tealBrand-600 hover:opacity-95 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isDone ? 'Needs Checked & Saved!' : `Check Off & Complete (${count}/${NEEDS.length})`}
        </button>
      </div>
    </div>
  );
};

