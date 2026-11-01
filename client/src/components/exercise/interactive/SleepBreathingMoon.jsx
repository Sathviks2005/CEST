import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaCheckCircle, FaMoon, FaStar } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

const TOTAL_CYCLES = 12; // 12 cycles of 10s (4s in + 6s out) = 120s (2 minutes)
const INHALE_DURATION = 4;
const EXHALE_DURATION = 6;

export const SleepBreathingMoon = ({ onComplete }) => {
  const [phase, setPhase] = useState('Inhale'); // 'Inhale' | 'Exhale'
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(INHALE_DURATION);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { isReduced } = useMotionSafe();

  useEffect(() => {
    let timer = null;
    if (isActive && !isFinished) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            // Switch phase
            if (phase === 'Inhale') {
              setPhase('Exhale');
              return EXHALE_DURATION;
            } else {
              // Completed an exhale -> cycle finished
              const nextCycles = completedCycles + 1;
              setCompletedCycles(nextCycles);
              if (nextCycles >= TOTAL_CYCLES) {
                setIsActive(false);
                setIsFinished(true);
                if (onComplete) onComplete();
                return 0;
              }
              setPhase('Inhale');
              return INHALE_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, completedCycles, isFinished, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setPhase('Inhale');
    setPhaseSecondsLeft(INHALE_DURATION);
    setCompletedCycles(0);
  };

  const totalSecondsElapsed = completedCycles * (INHALE_DURATION + EXHALE_DURATION) +
    (phase === 'Inhale' ? (INHALE_DURATION - phaseSecondsLeft) : (INHALE_DURATION + (EXHALE_DURATION - phaseSecondsLeft)));
  const totalPercent = Math.min(100, Math.round((totalSecondsElapsed / 120) * 100));

  // Current phase styling and cue
  const isInhale = phase === 'Inhale';
  const instructionCue = isInhale ? 'Breathe in slowly...' : 'Breathe out gently...';

  // Scale: expand on inhale, contract on exhale (disabled in reduced motion)
  const orbScale = isReduced ? 1 : isInhale ? 1.25 : 0.85;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 text-center relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-900/30 rounded-full blur-3xl pointer-events-none" />

      {/* Twinkling ambient stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <FaStar className={`absolute top-6 left-12 text-xs text-amber-200 ${isReduced ? '' : 'animate-pulse'}`} />
        <FaStar className={`absolute top-16 right-16 text-[10px] text-indigo-300 ${isReduced ? '' : 'animate-pulse'}`} style={{ animationDelay: '700ms' }} />
        <FaStar className={`absolute bottom-20 left-20 text-[9px] text-amber-100 ${isReduced ? '' : 'animate-pulse'}`} style={{ animationDelay: '1200ms' }} />
        <FaStar className={`absolute bottom-10 right-28 text-xs text-indigo-200 ${isReduced ? '' : 'animate-pulse'}`} style={{ animationDelay: '500ms' }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider relative z-10">
        <span className="flex items-center gap-1.5 text-indigo-400">
          <FaMoon /> Bedtime Moon Breathing
        </span>
        <span aria-live="polite">
          Cycle {completedCycles} / {TOTAL_CYCLES} · {Math.floor(totalSecondsElapsed / 60)}:{(totalSecondsElapsed % 60).toString().padStart(2, '0')} / 2:00
        </span>
      </div>

      {isFinished ? (
        <div className="py-8 space-y-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">2-Minute Breathing Complete</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Notice the slower heart rate and eased tension in your shoulders and jaw. Allow this calm feeling to carry into your sleep routine.
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
        <div className="space-y-6 py-4 relative z-10">
          {/* Animated Moon Orb with Circular Progress Ring */}
          <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-indigo-400 transition-all duration-500"
                strokeWidth="4"
                fill="none"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * totalPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Glowing Moon Orb that scales */}
            <motion.div
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-colors duration-1000 ${
                isInhale
                  ? 'bg-gradient-to-tr from-indigo-700 to-indigo-400 shadow-indigo-500/40'
                  : 'bg-gradient-to-tr from-slate-700 to-indigo-900 shadow-slate-700/30'
              }`}
              animate={{
                scale: orbScale,
              }}
              transition={{
                duration: isInhale ? INHALE_DURATION : EXHALE_DURATION,
                ease: 'easeInOut',
              }}
            >
              <FaMoon className="text-2xl text-amber-200/80 mb-1" />
              <p className="text-xs uppercase font-extrabold text-indigo-100 tracking-wider" aria-live="polite">
                {phase}
              </p>
              <p className="text-3xl font-black text-white" aria-live="polite">
                {phaseSecondsLeft}s
              </p>
            </motion.div>
          </div>

          {/* Text Cues */}
          <div className="space-y-1">
            <p className="text-lg font-bold text-white" aria-live="polite">
              {instructionCue}
            </p>
            <p className="text-xs text-slate-400">
              4 seconds gentle inhale through your nose · 6 seconds slow, relaxed exhale through your mouth
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={toggleTimer}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-tealBrand-600 hover:from-indigo-600 hover:to-tealBrand-700 text-white font-extrabold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              {isActive ? (
                <>
                  <FaPause /> Pause
                </>
              ) : (
                <>
                  <FaPlay /> {completedCycles > 0 ? 'Resume' : 'Start 2-Min Moon Breathing'}
                </>
              )}
            </button>

            {(isActive || completedCycles > 0 || phaseSecondsLeft < INHALE_DURATION) && (
              <button
                type="button"
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all border border-slate-700"
                title="Reset Session"
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
