import React, { useState } from 'react';
import { FaTree, FaCheckCircle, FaClock, FaCheck, FaCopy, FaPlus, FaRedo, FaHeartbeat } from 'react-icons/fa';

export const WorryDecisionTree = ({ onComplete }) => {
  const [worryInput, setWorryInput] = useState('');
  const [isPractical, setIsPractical] = useState(null); // true | false | null
  const [nextStep, setNextStep] = useState('');
  const [stepWhen, setStepWhen] = useState('');
  const [worryTimeSlot, setWorryTimeSlot] = useState('17:00'); // default 5:00 PM
  const [worriesList, setWorriesList] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveCurrentWorry = () => {
    if (!worryInput.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: worryInput.trim(),
      type: isPractical ? 'practical' : 'hypothetical',
      actionPlan: isPractical ? `${nextStep} (${stepWhen})` : null,
      postponedTo: isPractical ? null : worryTimeSlot,
    };

    const updated = [...worriesList, newEntry];
    setWorriesList(updated);
    setWorryInput('');
    setIsPractical(null);
    setNextStep('');
    setStepWhen('');

    if (updated.length >= 5) {
      setShowSummary(true);
      if (onComplete) onComplete();
    }
  };

  const handleFinishSession = () => {
    setShowSummary(true);
    if (onComplete) onComplete();
  };

  const handleCopy = async () => {
    const textLines = [
      '=== WORRY DECISION TREE & WORRY TIME LIST ===',
      `Scheduled Daily Worry Time: ${worryTimeSlot} (15 minutes)`,
      '',
      ...worriesList.map((w, idx) => {
        return `${idx + 1}. [${w.type === 'practical' ? 'ACTIONABLE' : 'POSTPONED TO WORRY TIME'}] ${w.text}${w.actionPlan ? ` -> Action: ${w.actionPlan}` : ` -> Scheduled for ${w.postponedTo}`}`;
      }),
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textLines);
        setCopied(true);
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
            <FaTree className="text-tealBrand-400" /> Worry Decision Tree & Worry Time
          </h4>
          <p className="text-xs text-slate-400">
            CBT for GAD: Separate actionable problems from hypothetical worries and schedule daily Worry Time.
          </p>
        </div>
        <span className="text-xs font-bold text-tealBrand-400 bg-tealBrand-500/10 px-3 py-1 rounded-full border border-tealBrand-500/30 self-start sm:self-auto">
          {worriesList.length} / 5 Worries
        </span>
      </div>

      {showSummary ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-xl font-bold text-white">Worry Tree Session Saved</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              You separated your worries into actionable tasks and scheduled hypothetical worries for your daily 15-minute Worry Time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-lg mx-auto space-y-3 text-xs text-left">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <span className="font-bold block text-[11px] uppercase tracking-wider">
                ⏰ Daily 15-Minute Worry Time:
              </span>
              <p className="text-white font-black text-base mt-0.5">{worryTimeSlot}</p>
              <p className="text-[10px] text-slate-300 mt-1">
                When hypothetical worries pop into your mind during the day, gently write them down and say: "I will think about this during my worry time at {worryTimeSlot}."
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Worry List:</span>
              {worriesList.map((w, idx) => (
                <div
                  key={w.id}
                  className={`p-3 rounded-xl border ${
                    w.type === 'practical'
                      ? 'bg-tealBrand-950/30 border-tealBrand-500/40 text-tealBrand-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white">
                      {idx + 1}. {w.text}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 bg-slate-800 text-slate-400">
                      {w.type === 'practical' ? 'Action Plan' : 'Postponed'}
                    </span>
                  </div>
                  {w.actionPlan && (
                    <p className="text-[11px] text-tealBrand-300 mt-1">
                      <strong>Next step:</strong> {w.actionPlan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Worry List!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setWorriesList([]);
                setShowSummary(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
            >
              <FaRedo /> New Session
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Step 1: Type the worry */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200 block">
              1. What is on your mind? Type a specific worry:
            </label>
            <input
              type="text"
              value={worryInput}
              onChange={(e) => setWorryInput(e.target.value)}
              placeholder="e.g. What if I can't finish the quarterly report on time?..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
            />
          </div>

          {/* Step 2: The Core Decision Question */}
          {worryInput.trim() && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 animate-fadeIn">
              <p className="text-xs font-extrabold uppercase tracking-wider text-tealBrand-400">
                2. Decision Question:
              </p>
              <p className="text-sm font-bold text-white">
                Is there something concrete you can do about this right now or soon?
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPractical(true)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isPractical === true
                      ? 'bg-tealBrand-600 text-white border-tealBrand-400 ring-2 ring-tealBrand-400 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block font-black text-sm">Yes</span>
                  <span className="text-[10px] opacity-80 block">Practical / Solvable Problem</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPractical(false)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isPractical === false
                      ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block font-black text-sm">No</span>
                  <span className="text-[10px] opacity-80 block">Hypothetical "What If" Worry</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3A: YES -> Action plan */}
          {isPractical === true && (
            <div className="space-y-3 p-4 rounded-2xl bg-tealBrand-950/30 border border-tealBrand-500/40 text-xs animate-fadeIn">
              <span className="font-bold text-tealBrand-300 block uppercase tracking-wider text-[11px]">
                Create a 1-Step Action Plan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">What is one next step you can take?</label>
                  <input
                    type="text"
                    value={nextStep}
                    onChange={(e) => setNextStep(e.target.value)}
                    placeholder="e.g. Email manager asking for a deadline extension"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">When will you do it?</label>
                  <input
                    type="text"
                    value={stepWhen}
                    onChange={(e) => setStepWhen(e.target.value)}
                    placeholder="e.g. Today at 2:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3B: NO -> Postpone to Worry Time */}
          {isPractical === false && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs animate-fadeIn">
              <span className="font-bold text-amber-300 block uppercase tracking-wider text-[11px]">
                Postpone It to Daily Worry Time:
              </span>
              <p className="text-slate-300 leading-relaxed">
                Hypothetical worries cannot be solved right now. Pick a daily 15-minute Worry Time slot to review them:
              </p>
              <div className="flex items-center gap-3">
                <label className="text-slate-400 font-medium">Select Daily Worry Time Slot:</label>
                <input
                  type="time"
                  value={worryTimeSlot}
                  onChange={(e) => setWorryTimeSlot(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-amber-200/90 italic pt-1">
                Now return to the present moment. You can practise a short slow breathing or 5-4-3-2-1 grounding exercise to settle yourself.
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {worriesList.length > 0 && (
              <button
                type="button"
                onClick={handleFinishSession}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Finish & View Summary ({worriesList.length} saved)
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveCurrentWorry}
              disabled={
                !worryInput.trim() ||
                isPractical === null ||
                (isPractical === true && (!nextStep.trim() || !stepWhen.trim()))
              }
              className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-500 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
            >
              <FaPlus className="text-[10px]" /> Add Worry & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
