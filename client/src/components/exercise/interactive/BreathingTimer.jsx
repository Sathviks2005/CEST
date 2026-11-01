import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaCheckCircle, FaHeartbeat } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

export const BreathingTimer = ({ onComplete }) => {
  const { isReduced } = useMotionSafe();
  const PHASES = [
    { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', color: 'text-tealBrand-400 border-tealBrand-400 bg-tealBrand-500/10' },
    { name: 'Exhale', duration: 6, instruction: 'Breathe out slowly and gently through your mouth...', color: 'text-brand-400 border-brand-400 bg-brand-500/10' },
  ];

  const TARGET_CYCLES = 6;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isActive && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
            if (nextPhaseIndex === 0) {
              const newCycleCount = completedCycles + 1;
              setCompletedCycles(newCycleCount);
              if (newCycleCount >= TARGET_CYCLES) {
                setIsActive(false);
                setIsFinished(true);
                if (onComplete) onComplete();
                return 0;
              }
            }
            setPhaseIndex(nextPhaseIndex);
            return PHASES[nextPhaseIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phaseIndex, completedCycles, isFinished, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setPhaseIndex(0);
    setCompletedCycles(0);
    setTimeLeft(PHASES[0].duration);
  };

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-tealBrand-400">
          <FaHeartbeat /> Slow Breathing
        </span>
        <span aria-live="polite">
          Cycle {completedCycles} / {TARGET_CYCLES}
        </span>
      </div>

      {isFinished ? (
        <div className="py-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">Breathing Session Completed</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Great job! Take a moment to notice how your body and mind feel after paced breathing. Notice relaxed shoulders and softened facial muscles.
          </p>
          <button
            type="button"
            onClick={resetTimer}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
          >
            <FaRedo /> Practice Again
          </button>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          {/* Animated Circle Orb */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ease-in-out ${currentPhase.color}`}
              style={{
                transform: isReduced
                  ? 'scale(1)'
                  : currentPhase.name === 'Inhale'
                  ? 'scale(1.15)'
                  : 'scale(0.88)',
                opacity: isActive ? 0.95 : 0.4,
              }}
            />
            <div className="relative z-10 space-y-1">
              <p className="text-xs uppercase font-extrabold text-slate-400">{currentPhase.name}</p>
              <p className="text-5xl font-black tracking-tight text-white" aria-live="polite">{timeLeft}s</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-200 font-medium h-6">{currentPhase.instruction}</p>
            <p className="text-xs text-slate-400">
              Stop anytime. If you feel dizzy, breathe normally.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-tealBrand-500 to-brand-600 hover:from-tealBrand-600 hover:to-brand-700 text-white font-extrabold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              {isActive ? (
                <>
                  <FaPause /> Pause
                </>
              ) : (
                <>
                  <FaPlay /> {completedCycles > 0 || phaseIndex > 0 ? 'Resume' : 'Start Slow Breathing'}
                </>
              )}
            </button>

            {(isActive || phaseIndex > 0 || completedCycles > 0) && (
              <button
                type="button"
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all border border-slate-700"
                title="Reset Timer"
              >
                <FaRedo />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
