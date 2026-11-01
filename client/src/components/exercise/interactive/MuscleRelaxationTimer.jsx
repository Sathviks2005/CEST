import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaCheckCircle, FaFeather, FaStepForward, FaShieldAlt } from 'react-icons/fa';

const MUSCLE_GROUPS = [
  { group: 'Hands & Arms', tensePrompt: 'Make gentle fists (~70% tension) and tighten your forearms for 5s.', releasePrompt: 'Release completely and feel softness and warmth flowing into hands for 12s.' },
  { group: 'Shoulders & Neck', tensePrompt: 'Shrug shoulders lightly toward your ears without straining for 5s.', releasePrompt: 'Drop shoulders down completely, feeling the heavy relaxation for 12s.' },
  { group: 'Face & Jaw', tensePrompt: 'Gently squeeze eyes shut and softly clench teeth together for 5s.', releasePrompt: 'Smooth out your forehead, unclench jaw, and let the tongue rest for 12s.' },
  { group: 'Stomach & Core', tensePrompt: 'Tighten your abdominal core gently (~70%) for 5s.', releasePrompt: 'Let your stomach go soft and breathe easily into your belly for 12s.' },
  { group: 'Feet & Legs', tensePrompt: 'Point toes lightly and tighten calf muscles without cramping for 5s.', releasePrompt: 'Release toes and calves, letting legs feel heavy and warm for 12s.' },
];

export const MuscleRelaxationTimer = ({ onComplete }) => {
  const [groupIndex, setGroupIndex] = useState(0);
  const [phase, setPhase] = useState('tense'); // 'tense' (5s) | 'release' (12s)
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentGroup = MUSCLE_GROUPS[groupIndex];

  useEffect(() => {
    let timer = null;
    if (isActive && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'tense') {
              setPhase('release');
              return 12;
            } else {
              if (groupIndex < MUSCLE_GROUPS.length - 1) {
                setGroupIndex((g) => g + 1);
                setPhase('tense');
                return 5;
              } else {
                setIsActive(false);
                setIsFinished(true);
                if (onComplete) onComplete();
                return 0;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, groupIndex, isFinished, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetSession = () => {
    setIsActive(false);
    setIsFinished(false);
    setGroupIndex(0);
    setPhase('tense');
    setTimeLeft(5);
  };

  const skipThisArea = () => {
    if (groupIndex < MUSCLE_GROUPS.length - 1) {
      setGroupIndex((g) => g + 1);
      setPhase('tense');
      setTimeLeft(5);
    } else {
      setIsActive(false);
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  const isTensePhase = phase === 'tense';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 text-center">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-tealBrand-400">
          <FaFeather /> Progressive Muscle Relaxation
        </span>
        <span aria-live="polite">
          Group {groupIndex + 1} / {MUSCLE_GROUPS.length}
        </span>
      </div>

      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-center gap-2">
        <FaShieldAlt className="text-tealBrand-400 shrink-0" />
        <span>Skip any area that hurts, is injured, or feels uncomfortable.</span>
      </div>

      {isFinished ? (
        <div className="py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">Full Body Relaxation Complete</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You completed the progressive relaxation sequence. Notice the difference between active tension and somatic calm.
          </p>
          <button
            type="button"
            onClick={resetSession}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
          >
            <FaRedo /> Practice Again
          </button>
        </div>
      ) : (
        <div className="space-y-6 py-2">
          <div>
            <h4 className="text-2xl font-black text-white">{currentGroup.group}</h4>

            {/* Colour-independent tense/release indicator (Icon + Text Label + Pattern) */}
            <div
              className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${
                isTensePhase
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 ring-2 ring-amber-400/40'
                  : 'bg-tealBrand-500/20 text-tealBrand-200 border-tealBrand-400 ring-2 ring-tealBrand-400/40'
              }`}
            >
              <span className="text-sm" aria-hidden="true">
                {isTensePhase ? '⚡' : '🌿'}
              </span>
              <span>
                {isTensePhase ? 'PHASE 1: TENSE (~70% Effort, 5s)' : 'PHASE 2: RELEASE & RELAX (12s)'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-md mx-auto">
            <p className="text-sm text-slate-200 font-medium">
              {isTensePhase ? currentGroup.tensePrompt : currentGroup.releasePrompt}
            </p>
          </div>

          <div className="text-5xl font-black text-white tracking-tight" aria-live="polite">
            {timeLeft}s
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2"
            >
              {isActive ? (
                <>
                  <FaPause /> Pause
                </>
              ) : (
                <>
                  <FaPlay /> {groupIndex > 0 || !isTensePhase ? 'Resume' : 'Start Sequence'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={skipThisArea}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-1.5"
              title="Skip this muscle group"
            >
              <FaStepForward className="text-[10px]" /> Skip This Area
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
