import React, { useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaCopy, FaUtensils, FaBed, FaWalking } from 'react-icons/fa';

export const DailyRoutinePlanner = ({ onComplete }) => {
  const [wakeTime, setWakeTime] = useState('07:30');
  const [bedTime, setBedTime] = useState('23:00');
  const [meals, setMeals] = useState(['Breakfast (8:30 AM)', 'Lunch (1:00 PM)', 'Dinner (7:30 PM)']);
  const [movement, setMovement] = useState('15-min afternoon walk or light stretching');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = async () => {
    const text = `=== MY DAILY ROUTINE PLANNER ===\nWake Time: ${wakeTime}\nBed Time: ${bedTime}\nMeals Planned:\n- ${meals.join('\n- ')}\nMovement & Sunlight: ${movement}\n\nNotice: Behavioral routine anchoring for daily stability.`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-tealBrand-400" /> Daily Routine Planner (Sleep, Meals, Movement)
          </h4>
          <p className="text-xs text-slate-400">
            Anchor daily physiological rhythms to support stable mood and combat inertia.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-[10px] font-bold text-tealBrand-400 border border-tealBrand-500/30">
          Routine Anchoring
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FaBed className="text-indigo-400" /> Planned Wake Time:
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FaBed className="text-indigo-400" /> Planned Bed Time:
          </label>
          <input
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaUtensils className="text-amber-400" /> Structured Meal Times:
        </label>
        <div className="space-y-2">
          {meals.map((m, idx) => (
            <input
              key={idx}
              type="text"
              value={m}
              onChange={(e) => {
                const next = [...meals];
                next[idx] = e.target.value;
                setMeals(next);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            />
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FaWalking className="text-tealBrand-400" /> Movement / Sunlight Commitment:
        </label>
        <input
          type="text"
          value={movement}
          onChange={(e) => setMovement(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-xs text-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <FaCopy /> {copied ? 'Copied Plan!' : 'Copy Routine Plan'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isSaved ? 'Routine Saved!' : 'Commit & Mark as Done'}
        </button>
      </div>
    </div>
  );
};

