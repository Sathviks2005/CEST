import React, { useState } from 'react';
import { FaHeart, FaCheckCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const STEPS = [
  { title: 'Step 1: Mindfulness (Acknowledge)', subtitle: 'This is a moment of suffering / difficulty', explanation: 'Instead of suppressing distress or getting swept into catastrophizing, acknowledge what is happening plainly without harsh criticism: "This is really hard right now," or "I am feeling deep stress."' },
  { title: 'Step 2: Common Humanity', subtitle: 'Suffering is a part of shared human life', explanation: 'Depression often convinces us we are uniquely flawed or alone in struggling. Remember: difficulty, tiredness, and heavy moods are part of being human. Many people feel exactly like this today.' },
  { title: 'Step 3: Self-Kindness', subtitle: 'May I be kind to myself right now', explanation: 'Put a gentle hand over your heart or on your arm. What compassionate words would you say to a friend who felt this low? Offer those exact words to yourself: "May I be patient with myself," or "May I give myself the grace to rest today."' },
];

export const SelfCompassionBreak = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [personalPhrase, setPersonalPhrase] = useState('May I give myself patience and kindness today.');
  const [isDone, setIsDone] = useState(false);

  const current = STEPS[stepIdx];

  const handleNext = () => {
    if (stepIdx + 1 < STEPS.length) {
      setStepIdx((s) => s + 1);
    } else {
      setIsDone(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaHeart className="text-rose-400" /> Self-Compassion Break (Dr. Kristin Neff 3-Step)
          </h4>
          <p className="text-xs text-slate-400">
            Counter inner harshness and self-blame with evidence-based mindfulness, common humanity, and self-kindness.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-[10px] font-bold text-rose-400 border border-rose-500/30">
          Self-Compassion
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Step {stepIdx + 1} of {STEPS.length}</span>
        <span className="font-bold text-rose-400">{current.title}</span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-rose-500 h-full transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-7 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
        <h5 className="text-sm font-bold text-rose-300">{current.subtitle}</h5>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {current.explanation}
        </p>

        {stepIdx === 2 && (
          <div className="pt-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-400">My personal kindness phrase:</label>
            <input
              type="text"
              value={personalPhrase}
              onChange={(e) => setPersonalPhrase(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
          disabled={stepIdx === 0}
          className="py-3 px-4 rounded-xl border border-slate-700 disabled:opacity-30 hover:bg-slate-800 font-bold text-xs text-slate-300 transition-all flex items-center justify-center gap-1.5"
        >
          <FaChevronLeft /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {stepIdx + 1 < STEPS.length ? (
            <>Next Step <FaChevronRight /></>
          ) : (
            <><FaCheckCircle /> {isDone ? 'Completed!' : 'Finish Self-Compassion Break'}</>
          )}
        </button>
      </div>
    </div>
  );
};

