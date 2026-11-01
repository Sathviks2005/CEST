import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaRedo, FaTrophy, FaBolt } from 'react-icons/fa';

const STROOP_TRIALS = [
  { word: 'RED', inkName: 'Blue', colorClass: 'text-blue-500', isCongruent: false },
  { word: 'GREEN', inkName: 'Green', colorClass: 'text-emerald-500', isCongruent: true },
  { word: 'YELLOW', inkName: 'Red', colorClass: 'text-rose-500', isCongruent: false },
  { word: 'BLUE', inkName: 'Yellow', colorClass: 'text-amber-500', isCongruent: false },
  { word: 'RED', inkName: 'Red', colorClass: 'text-rose-500', isCongruent: true },
  { word: 'GREEN', inkName: 'Yellow', colorClass: 'text-amber-500', isCongruent: false },
  { word: 'BLUE', inkName: 'Blue', colorClass: 'text-blue-500', isCongruent: true },
  { word: 'YELLOW', inkName: 'Green', colorClass: 'text-emerald-500', isCongruent: false },
  { word: 'RED', inkName: 'Green', colorClass: 'text-emerald-500', isCongruent: false },
  { word: 'GREEN', inkName: 'Red', colorClass: 'text-rose-500', isCongruent: false },
  { word: 'BLUE', inkName: 'Red', colorClass: 'text-rose-500', isCongruent: false },
  { word: 'YELLOW', inkName: 'Yellow', colorClass: 'text-amber-500', isCongruent: true },
];

const BUTTONS = [
  { name: 'Red', bg: 'bg-rose-500 hover:bg-rose-600', text: 'text-white' },
  { name: 'Green', bg: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-white' },
  { name: 'Blue', bg: 'bg-blue-500 hover:bg-blue-600', text: 'text-white' },
  { name: 'Yellow', bg: 'bg-amber-400 hover:bg-amber-500', text: 'text-slate-900' },
];

export const StroopExercise = ({ onComplete }) => {
  const [trialIdx, setTrialIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const startTimeRef = useRef(Date.now());

  const currentTrial = STROOP_TRIALS[trialIdx];

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [trialIdx]);

  const handleSelectColor = (chosenColor) => {
    if (feedback !== null) return; // prevent spamming

    const rt = Date.now() - startTimeRef.current;
    const isCorrect = chosenColor === currentTrial.inkName;

    if (isCorrect) {
      setStreak((s) => s + 1);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setResults((prev) => [
      ...prev,
      {
        trial: trialIdx + 1,
        isCorrect,
        rt,
        isCongruent: currentTrial.isCongruent,
      },
    ]);

    setTimeout(() => {
      setFeedback(null);
      if (trialIdx + 1 < STROOP_TRIALS.length) {
        setTrialIdx((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 400);
  };

  const handleRestart = () => {
    setTrialIdx(0);
    setResults([]);
    setStreak(0);
    setIsFinished(false);
    setFeedback(null);
  };

  if (isFinished) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / results.length) * 100);
    const avgRt = Math.round(results.reduce((acc, r) => acc + r.rt, 0) / results.length);
    const score = Math.round(accuracy * 10 + Math.max(0, 1000 - avgRt));

    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaTrophy />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Stroop Challenge Finished!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Strong response inhibition and cognitive control under conflicting cues.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-tealBrand-600 dark:text-tealBrand-400">
              {accuracy}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Accuracy
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">
              {avgRt}ms
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Speed
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">
              {score}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestart}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <FaRedo /> Try Again
          </button>
          <button
            type="button"
            onClick={() => onComplete && onComplete({ score, accuracy, avgRt })}
            className="flex-1 py-3 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Save & Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Trial {trialIdx + 1} of {STROOP_TRIALS.length}</span>
        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-black animate-pulse">
            <FaBolt /> {streak} Streak!
          </span>
        )}
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-tealBrand-500 h-full transition-all duration-300"
          style={{ width: `${((trialIdx + 1) / STROOP_TRIALS.length) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
          Pick the DISPLAY COLOR of the text
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">Do NOT choose the word itself</p>
      </div>

      {/* Stimulus Card */}
      <div
        className={`h-44 rounded-3xl bg-slate-900 border-2 flex items-center justify-center shadow-xl transition-all ${
          feedback === 'correct'
            ? 'border-emerald-500 ring-4 ring-emerald-500/20'
            : feedback === 'wrong'
            ? 'border-rose-500 ring-4 ring-rose-500/20'
            : 'border-slate-800'
        }`}
      >
        <span
          className={`text-4xl sm:text-5xl font-black tracking-widest drop-shadow-md select-none ${currentTrial.colorClass}`}
        >
          {currentTrial.word}
        </span>
      </div>

      {/* Color Selection Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {BUTTONS.map((btn) => (
          <button
            key={btn.name}
            type="button"
            onClick={() => handleSelectColor(btn.name)}
            disabled={feedback !== null}
            className={`py-4 px-6 rounded-2xl font-black text-base shadow-md transition-all active:scale-95 disabled:opacity-60 ${btn.bg} ${btn.text}`}
          >
            {btn.name}
          </button>
        ))}
      </div>
    </div>
  );
};

