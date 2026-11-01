import React, { useState } from 'react';
import { FaListOl, FaCheckCircle, FaPlus, FaTrash, FaCopy, FaCheck, FaShieldAlt } from 'react-icons/fa';

const SEEDED_SITUATIONS = [
  { id: '1', situation: 'Touching a clean surface that was recently in public without washing hands for 5 minutes', suds: 25 },
  { id: '2', situation: 'Leaving the house after checking the front door lock only once', suds: 45 },
  { id: '3', situation: 'Writing a sentence that feels imperfect without erasing and restarting', suds: 60 },
  { id: '4', situation: 'Using a public restroom and washing hands once for 20 seconds only', suds: 75 },
  { id: '5', situation: 'Not checking the stove burner before heading to bed', suds: 85 },
  { id: '6', situation: 'Touching a public handrail and not washing hands until returning home', suds: 95 },
];

export const ERPHierarchyBuilder = ({ onComplete }) => {
  const [situations, setSituations] = useState(SEEDED_SITUATIONS);
  const [newSituation, setNewSituation] = useState('');
  const [newSuds, setNewSuds] = useState(50);
  const [copied, setCopied] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSituation.trim()) return;

    const newItem = {
      id: 'erp_' + Date.now(),
      situation: newSituation.trim(),
      suds: Number(newSuds),
    };

    const updated = [...situations, newItem];
    setSituations(updated);
    setNewSituation('');
    setNewSuds(50);

    if (updated.length >= 6 && onComplete) {
      onComplete();
    }
  };

  const handleRemove = (id) => {
    setSituations((prev) => prev.filter((s) => s.id !== id));
  };

  // Auto-sort ascending: lowest SUDS at bottom (index 0 at bottom) or ladder view
  // Prompt: auto-sort into a ladder (lowest at the bottom, highest at top)
  const sortedLadder = [...situations].sort((a, b) => b.suds - a.suds); // Highest first, lowest at bottom

  const handleCopy = async () => {
    const textLines = [
      '=== ERP FEAR HIERARCHY LADDER (PREPARATION FOR CLINICAL ERP) ===',
      'Clinical Notice: This ladder is preparation for therapist-guided ERP. Do not self-expose without clinical guidance.',
      '',
      ...sortedLadder.map((item, idx) => {
        return `[SUDS: ${item.suds}/100] ${item.situation}${idx === sortedLadder.length - 1 ? ' <-- Lowest step (start here with therapist)' : ''}`;
      }),
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textLines);
        setCopied(true);
        if (onComplete) onComplete();
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write error', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaListOl className="text-tealBrand-400" /> ERP Fear Hierarchy Builder
          </h4>
          <p className="text-xs text-slate-400">
            Build a 6–12 situation exposure ladder (SUDS 0–100) to prepare for clinical therapy sessions.
          </p>
        </div>
        <span className="text-xs font-bold text-tealBrand-400 bg-tealBrand-500/10 px-3 py-1 rounded-full border border-tealBrand-500/30 self-start sm:self-auto">
          {situations.length} Situations (Ladder)
        </span>
      </div>

      {/* Mandatory Clinical Banner - Note: NO "start exposure" button anywhere! */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <FaShieldAlt className="text-amber-400 text-lg shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-amber-100">
            Clinical Preparation Tool
          </strong>
          <p className="text-amber-200/90 leading-relaxed">
            This ladder is preparation. At your score, exposure practice is most effective and safest with a trained ERP therapist. Bring this ladder to your appointment.
          </p>
        </div>
      </div>

      {/* The Auto-Sorted Exposure Ladder (Lowest at the bottom) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Feared Situations Ladder (Lowest at bottom)
          </span>
          <span>{situations.length} of 6–12 recommended</span>
        </div>

        <div className="space-y-2">
          {sortedLadder.map((item, idx) => {
            const isLowest = idx === sortedLadder.length - 1;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  isLowest
                    ? 'bg-tealBrand-950/40 border-tealBrand-500/50 text-tealBrand-100 ring-2 ring-tealBrand-400/40'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-10 px-1 py-1 rounded-lg text-center font-black text-[11px] shrink-0 mt-0.5 ${
                      item.suds >= 75
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : item.suds >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-tealBrand-500/20 text-tealBrand-300 border border-tealBrand-500/40'
                    }`}
                  >
                    {item.suds}
                  </span>
                  <div>
                    <p className="font-semibold leading-relaxed">{item.situation}</p>
                    {isLowest && (
                      <span className="text-[10px] text-tealBrand-300 font-bold block mt-0.5">
                        ⭐ Start here (first step with your trained therapist)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                  title="Remove situation"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Feared Situation Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-tealBrand-400">
          Add Another Feared Situation or Intrusive Trigger
        </h5>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-300">
            Situation / Thought Trigger
          </label>
          <input
            type="text"
            value={newSituation}
            onChange={(e) => setNewSituation(e.target.value)}
            placeholder="e.g. Touching a kitchen sponge without immediately washing hands..."
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Expected Discomfort / SUDS (0–100):</span>
            <span className="font-bold text-tealBrand-400">{newSuds}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={newSuds}
            onChange={(e) => setNewSuds(Number(e.target.value))}
            className="w-full accent-tealBrand-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Calm / Minimal)</span>
            <span>50 (Moderate distress)</span>
            <span>100 (Maximum anxiety)</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!newSituation.trim()}
          className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
        >
          <FaPlus className="text-[10px]" /> Add to Hierarchy
        </button>
      </form>

      {/* Export / Copy to Bring to Clinical Appointment */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Bring this completed ladder to your appointment with your ERP psychologist or psychiatrist.
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="px-6 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-1.5 transition-all"
        >
          {copied ? <FaCheck /> : <FaCopy />}
          <span>{copied ? 'Copied Ladder!' : 'Copy Ladder for Appointment'}</span>
        </button>
      </div>
    </div>
  );
};
