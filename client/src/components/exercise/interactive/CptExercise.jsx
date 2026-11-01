import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheckCircle, FaRedo, FaTrophy, FaEye, FaBullseye } from 'react-icons/fa';

// Stream designed with valid A->X pairs, standalone X distractors, and other letters
const CPT_STREAM = [
  'B', 'K', 'A', 'X', 'M', 'R', 'A', 'T', 'X', 'D', 'L', 'A', 'X', 'P', 'X', 'Q', 'A', 'X'
];

export const CptExercise = ({ onComplete }) => {
  const [stage, setStage] = useState('intro'); // 'intro' | 'running' | 'done'
  const [index, setIndex] = useState(0);
  const [showingLetter, setShowingLetter] = useState(true);
  const [respondedThisItem, setRespondedThisItem] = useState(false);
  const [stats, setStats] = useState({ hits: 0, falseAlarms: 0, misses: 0 });
  const [feedback, setFeedback] = useState(null);

  const indexRef = useRef(index);
  indexRef.current = index;
  const respondedRef = useRef(respondedThisItem);
  respondedRef.current = respondedThisItem;
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const currentLetter = CPT_STREAM[index];
  const prevLetter = index > 0 ? CPT_STREAM[index - 1] : null;
  const isTarget = currentLetter === 'X' && prevLetter === 'A';

  const runSequence = useCallback((idx) => {
    if (idx >= CPT_STREAM.length) {
      setStage('done');
      return;
    }

    setIndex(idx);
    setShowingLetter(true);
    setRespondedThisItem(false);
    setFeedback(null);

    // Letter displayed for 900ms
    setTimeout(() => {
      // Check if target was missed
      const curr = CPT_STREAM[idx];
      const prev = idx > 0 ? CPT_STREAM[idx - 1] : null;
      const target = curr === 'X' && prev === 'A';

      if (target && !respondedRef.current) {
        setStats((s) => ({ ...s, misses: s.misses + 1 }));
        setFeedback({ text: 'Missed Target [A]→[X]!', color: 'text-rose-500' });
      }

      setShowingLetter(false);

      // Blank interval for 400ms before next
      setTimeout(() => {
        runSequence(idx + 1);
      }, 400);
    }, 900);
  }, []);

  const handleStart = () => {
    setStats({ hits: 0, falseAlarms: 0, misses: 0 });
    setStage('running');
    runSequence(0);
  };

  const handleResponse = useCallback(() => {
    if (stageRef.current !== 'running' || respondedRef.current) return;
    setRespondedThisItem(true);

    const curr = CPT_STREAM[indexRef.current];
    const prev = indexRef.current > 0 ? CPT_STREAM[indexRef.current - 1] : null;
    const target = curr === 'X' && prev === 'A';

    if (target) {
      setStats((s) => ({ ...s, hits: s.hits + 1 }));
      setFeedback({ text: 'Target Hit! [A]→[X]', color: 'text-emerald-400' });
    } else {
      setStats((s) => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      setFeedback({ text: 'False Alarm! (Target only on X after A)', color: 'text-rose-500' });
    }
  }, []);

  // Keyboard Space listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleResponse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResponse]);

  if (stage === 'intro') {
    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaEye />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Continuous Performance Test (CPT)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Letters will flash rapidly. Your goal is to train sustained vigilance: respond <strong>ONLY</strong> when you see an <strong className="text-emerald-500">X</strong> that comes directly after an <strong className="text-amber-500">A</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
          <span>Target Rule:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">A</span>
          <span>→ then</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">X</span>
          <span>= Press Space or Tap!</span>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-sm shadow-xl transition-all"
        >
          Begin Attention Session
        </button>
      </div>
    );
  }

  if (stage === 'done') {
    const totalTargets = 3; // in our stream
    const hitRate = Math.round((stats.hits / totalTargets) * 100);
    const score = Math.max(100, Math.round(stats.hits * 250 - stats.falseAlarms * 80 - stats.misses * 50));

    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaTrophy />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            CPT Vigilance Test Completed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Excellent sustained focus throughout rapid visual presentation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-emerald-500">
              {stats.hits}/{totalTargets}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Targets Hit
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-rose-500">
              {stats.falseAlarms}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              False Alarms
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">
              {score}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Vigilance Score
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <FaRedo /> Try Again
          </button>
          <button
            type="button"
            onClick={() => onComplete && onComplete({ score, hitRate, falseAlarms: stats.falseAlarms })}
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
      {/* HUD Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Stimulus {index + 1} of {CPT_STREAM.length}</span>
        <span className="text-amber-500">Target = [A] followed by [X]</span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-tealBrand-500 h-full transition-all duration-300"
          style={{ width: `${((index + 1) / CPT_STREAM.length) * 100}%` }}
        />
      </div>

      {/* Flashing Stream Screen */}
      <div className="h-52 rounded-3xl bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center shadow-inner relative select-none">
        {showingLetter ? (
          <span className="text-6xl sm:text-7xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {currentLetter}
          </span>
        ) : (
          <span className="text-2xl text-slate-700">+</span>
        )}

        {feedback && (
          <div className={`absolute bottom-3 text-xs font-extrabold tracking-wide ${feedback.color} animate-bounce`}>
            {feedback.text}
          </div>
        )}
      </div>

      {/* Target Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResponse}
          disabled={!showingLetter || respondedThisItem}
          className="w-full py-5 px-6 rounded-2xl bg-tealBrand-600 hover:bg-tealBrand-500 active:bg-tealBrand-700 disabled:opacity-40 text-white font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FaBullseye /> {respondedThisItem ? 'Target Tagged!' : 'TARGET DETECTED! (Space)'}
        </button>
      </div>
    </div>
  );
};

