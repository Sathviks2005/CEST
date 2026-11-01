import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBed, FaClock, FaCheck, FaPlay, FaPause, FaRedo, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import { useMotionSafe, staggerList, fadeSlideUp } from './motionPresets';

const RULES = [
  {
    id: 'bed-for-sleep',
    title: 'Use the bed only for sleep & intimacy',
    desc: 'Do not work, eat, watch TV, or scroll on screens in bed. Reconnect the bed with sleep only.',
  },
  {
    id: 'fifteen-twenty-min-rule',
    title: 'If you feel awake for about 15–20 minutes, get up. Don\'t watch the clock.',
    desc: 'Notice when you feel restless or alert. Step out of bed without looking at clocks or timers.',
  },
  {
    id: 'return-when-sleepy',
    title: 'Return to bed only when truly sleepy',
    desc: 'Sit in a quiet room under dim light. Only go back to bed when your eyelids are heavy. Repeat getting up if needed.',
  },
  {
    id: 'same-alarm',
    title: 'Same wake-up time 7 days a week',
    desc: 'Get out of bed at the exact same hour every morning, including weekends, regardless of sleep duration.',
  },
  {
    id: 'no-naps',
    title: 'Avoid daytime naps',
    desc: 'Protect your natural sleep drive and pressure so you are primed for sleep when night arrives.',
  },
];

const PRACTICE_TIMER_SECONDS = 900; // 15 minutes practice timer

export const StimulusControlGuide = ({ onComplete }) => {
  const [committedRules, setCommittedRules] = useState([]);
  const [timeLeft, setTimeLeft] = useState(PRACTICE_TIMER_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  const { isReduced } = useMotionSafe();

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setTimerFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const toggleRule = (id) => {
    setCommittedRules((prev) => {
      const next = prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id];
      if (next.length === RULES.length && onComplete) {
        onComplete();
      }
      return next;
    });
  };

  const startPauseTimer = () => {
    if (timerFinished) {
      setTimeLeft(PRACTICE_TIMER_SECONDS);
      setTimerFinished(false);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(!isTimerActive);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(PRACTICE_TIMER_SECONDS);
    setTimerFinished(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const ringCircumference = 2 * Math.PI * 40;
  const strokeOffset = ringCircumference - (ringCircumference * (PRACTICE_TIMER_SECONDS - timeLeft)) / PRACTICE_TIMER_SECONDS;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-8 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
          <FaBed />
          <span>CBT-I Stimulus Control</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Stimulus Control Bed & Wake Guide
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Bootzin CBT-I protocol to break conditioned frustration between your bed and wakefulness.
        </p>

        {/* Clinical Note on Sleep Restriction */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
          <FaShieldAlt className="text-tealBrand-400 mt-0.5 shrink-0" />
          <span>
            <strong>Clinical Note:</strong> Sleep restriction is a stronger CBT-I technique that should be done with a clinician, so it is not included here.
          </span>
        </div>
      </div>

      {/* 5 Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            5 Core Rules of Stimulus Control
          </h4>
          <span className="text-xs text-tealBrand-400 font-semibold" aria-live="polite">
            {committedRules.length} of 5 committed
          </span>
        </div>

        <motion.div
          variants={staggerList}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3"
        >
          {RULES.map((rule, idx) => {
            const isCommitted = committedRules.includes(rule.id);
            return (
              <motion.div
                key={rule.id}
                variants={fadeSlideUp}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCommitted
                    ? 'bg-tealBrand-950/40 border-tealBrand-500/50'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-extrabold text-slate-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">{rule.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto ${
                    isCommitted
                      ? 'bg-tealBrand-500 text-white shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <FaCheck className={`text-[10px] ${isCommitted ? 'opacity-100' : 'opacity-30'}`} />
                  {isCommitted ? 'Committed' : "I'll follow this"}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 15-Minute Practice Timer */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
              <FaClock />
              <span>15-Minute Daytime Practice Timer</span>
            </div>
            <h5 className="text-base font-bold text-white">
              for practice only — at night, don't clock-watch
            </h5>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Use this timer during the day to rehearse what a 15-minute quiet resting interval feels like. At bedtime, do not look at clocks or count minutes—get up whenever you estimate you have been awake roughly 15–20 minutes.
            </p>
          </div>

          {/* SVG Countdown Ring */}
          <div className="flex items-center gap-4 self-center sm:self-auto">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-amber-400 transition-all duration-1000"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white" aria-live="polite">
                  {timeFormatted}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  {timeLeft === 0 ? 'Done' : 'Practice'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={startPauseTimer}
                className="w-full px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
              >
                {isTimerActive ? (
                  <>
                    <FaPause className="text-[10px]" /> Pause
                  </>
                ) : (
                  <>
                    <FaPlay className="text-[10px]" /> {timeLeft === PRACTICE_TIMER_SECONDS ? 'Start' : 'Resume'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="w-full px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <FaRedo className="text-[9px]" /> Reset
              </button>
            </div>
          </div>
        </div>

        {timerFinished && (
          <div
            className={`p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3 ${
              isReduced ? '' : 'animate-pulse'
            }`}
            aria-live="polite"
          >
            <FaInfoCircle className="text-amber-400 text-lg shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <strong className="block font-bold text-white">
                15-Minute Practice Rehearsal Finished
              </strong>
              <p className="text-amber-200/90 leading-relaxed">
                Notice what a 15-minute period feels like in your body without a clock. At night, remember: don't watch the clock, just get up quietly when you sense you've been awake about this long.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
