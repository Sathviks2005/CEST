import React, { useState, useEffect } from 'react';
import { FaSpa, FaCheckCircle, FaChevronRight, FaChevronLeft, FaRedo } from 'react-icons/fa';

const BODY_SCAN_STEPS = [
  { area: 'Posture & Breath', prompt: 'Settle into a comfortable seated or reclining position. Let your eyes soften or close. Take two slow, natural breaths without trying to force relaxation.' },
  { area: 'Feet & Grounding', prompt: 'Bring attention to the soles of your feet. Notice sensations of pressure, warmth, or coolness against the floor or surface. Just feel without judging.' },
  { area: 'Legs & Pelvis', prompt: 'Notice the weight of your legs and hips resting on the chair or bed. Observe any tightness or resting softness. Allow gravity to support your weight.' },
  { area: 'Belly & Chest', prompt: 'Rest your awareness on the gentle expansion and release of your abdomen with each in-breath and out-breath. You don’t need to change anything.' },
  { area: 'Shoulders & Neck', prompt: 'Notice your shoulders. They often hold quiet tension. Gently invite them to drop 1-2 millimeters away from your ears with your next out-breath.' },
  { area: 'Face & Jaw', prompt: 'Unclench your jaw. Allow your tongue to rest away from the roof of your mouth. Soften the muscles around your eyes and forehead.' },
  { area: 'Whole Body Presence', prompt: 'Expand your awareness to feel the body as a whole, breathing in this moment. Acknowledge yourself for taking these minutes for your well-being.' },
];

export const BodyScanMindfulness = ({ onComplete }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const current = BODY_SCAN_STEPS[stepIdx];

  const handleNext = () => {
    if (stepIdx + 1 < BODY_SCAN_STEPS.length) {
      setStepIdx((s) => s + 1);
    } else {
      setIsDone(true);
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    setStepIdx((s) => Math.max(0, s - 1));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaSpa className="text-purple-400" /> Guided Mindfulness Body Scan (5–10 min)
          </h4>
          <p className="text-xs text-slate-400">
            Somatic mindfulness: step through areas of the body to cultivate non-judgmental present-moment awareness.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-400 border border-purple-500/30">
          Mindfulness
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Step {stepIdx + 1} of {BODY_SCAN_STEPS.length}</span>
        <span className="font-bold text-purple-400">{current.area}</span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-purple-500 h-full transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / BODY_SCAN_STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700 min-h-[140px] flex flex-col justify-center text-center space-y-3">
        <h5 className="text-sm font-bold text-purple-300 uppercase tracking-wider">{current.area}</h5>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg mx-auto">
          {current.prompt}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={stepIdx === 0}
          className="py-3 px-4 rounded-xl border border-slate-700 disabled:opacity-30 hover:bg-slate-800 font-bold text-xs text-slate-300 transition-all flex items-center justify-center gap-1.5"
        >
          <FaChevronLeft /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {stepIdx + 1 < BODY_SCAN_STEPS.length ? (
            <>Next Focus Area <FaChevronRight /></>
          ) : (
            <><FaCheckCircle /> {isDone ? 'Session Finished!' : 'Complete Body Scan'}</>
          )}
        </button>
      </div>
    </div>
  );
};

