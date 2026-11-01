import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaStar, FaCheck, FaRedo, FaCheckCircle, FaBed } from 'react-icons/fa';
import { useMotionSafe, popIn } from './motionPresets';

const HABITS = [
  { id: 'wake-time', label: 'Same wake-up time every day including weekends', tip: 'Anchors your body clock and strengthens your natural sleep drive.' },
  { id: 'caffeine', label: 'No caffeine late in the day', tip: 'Caffeine has a half-life of 5-7 hours; avoid it from mid-afternoon.' },
  { id: 'meals-alcohol', label: 'Avoid alcohol and heavy meals close to bedtime', tip: 'Both disrupt deep sleep cycles and increase nighttime awakenings.' },
  { id: 'daytime-activity', label: 'Some daytime activity or exercise', tip: 'Regular movement deepens restorative slow-wave sleep; finish vigorous workouts 2-3 hours before bed.' },
  { id: 'screen-curfew', label: 'Switch off screens early', tip: 'Blue light suppresses melatonin release. Dim screens or switch to audio/books 1 hour before sleep.' },
  { id: 'wind-down', label: 'A relaxing wind-down routine', tip: 'Engage in 20-30 minutes of calming activities: reading, warm bath, stretching, or gentle music.' },
  { id: 'bedroom-environment', label: 'A cool, dark, quiet bedroom', tip: 'Keep the room cool (approx. 18°C/65°F), block outside light, and use white noise if helpful.' },
  { id: 'avoid-naps', label: 'Avoid daytime naps', tip: 'Napping decreases nighttime sleep pressure. If exhausted, keep naps under 20 minutes before 3 PM.' },
];

export const SleepHygieneChecklist = ({ onComplete }) => {
  const [checkedIds, setCheckedIds] = useState([]);
  const { isReduced, safeTransition } = useMotionSafe();

  const toggleHabit = (id) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length === HABITS.length && onComplete) {
        onComplete();
      }
      return next;
    });
  };

  const resetChecklist = () => setCheckedIds([]);

  const count = checkedIds.length;
  const progressPercent = Math.round((count / HABITS.length) * 100);
  const starCount = Math.floor(count / 2); // 0 to 4 stars

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background ambient glow that strengthens as habits are checked */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: count > 0 ? `rgba(99, 102, 241, ${0.1 + count * 0.04})` : 'rgba(99, 102, 241, 0.05)',
        }}
      />

      {/* Header with Glowing Moon & Stars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <FaBed />
            <span>Sleep Hygiene Checklist</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Daily Habits for Restorative Sleep
          </h3>
          <p className="text-xs text-slate-400">
            Check off the sleep-supportive habits you currently follow or want to commit to today.
          </p>
        </div>

        {/* Animated Moon and Star Badge */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 self-start sm:self-auto">
          <div className="relative">
            <FaMoon
              className={`text-2xl transition-all duration-500 ${
                count >= 6
                  ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.8)]'
                  : count >= 3
                  ? 'text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.6)]'
                  : 'text-slate-400'
              }`}
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <span className="font-bold text-white" aria-live="polite">
                {count} of 8 done
              </span>
              <div className="flex items-center gap-0.5 ml-1 text-amber-400">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <FaStar
                    key={idx}
                    className={`text-[10px] transition-all duration-300 ${
                      idx < starCount ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              {count === 8 ? 'All habits checked!' : `${8 - count} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Overall Progress</span>
          <span className="font-bold text-indigo-300">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-tealBrand-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={safeTransition({ duration: 0.4, ease: 'easeOut' })}
          />
        </div>
      </div>

      {/* Habit List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {HABITS.map((habit, index) => {
          const isChecked = checkedIds.includes(habit.id);
          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                isChecked
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isChecked
                    ? 'bg-indigo-600 text-white shadow'
                    : 'border border-slate-600 bg-slate-900/60 text-transparent'
                }`}
              >
                <AnimatePresence>
                  {isChecked && (
                    <motion.div
                      variants={popIn}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={safeTransition(popIn.visible.transition)}
                    >
                      <FaCheck className="text-xs" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug ${isChecked ? 'text-white' : 'text-slate-200'}`}>
                  {habit.label}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {habit.tip}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Completion Message & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Tip: Pick 1 or 2 new habits to focus on this week rather than trying to change everything at once.
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={resetChecklist}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700 shrink-0 self-start sm:self-auto"
          >
            <FaRedo className="text-[10px]" /> Reset Checklist
          </button>
        )}
      </div>
    </div>
  );
};
