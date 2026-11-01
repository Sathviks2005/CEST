import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaRedo, FaTrophy } from 'react-icons/fa';

const TRIALS = [
  { flankers: 'left', target: 'left', display: ['←', '←', '←', '←', '←'], congruent: true },
  { flankers: 'right', target: 'right', display: ['→', '→', '→', '→', '→'], congruent: true },
  { flankers: 'left', target: 'right', display: ['←', '←', '→', '←', '←'], congruent: false },
  { flankers: 'right', target: 'left', display: ['→', '→', '←', '→', '→'], congruent: false },
  { flankers: 'left', target: 'left', display: ['←', '←', '←', '←', '←'], congruent: true },
  { flankers: 'right', target: 'right', display: ['→', '→', '→', '→', '→'], congruent: true },
  { flankers: 'right', target: 'left', display: ['→', '→', '←', '→', '→'], congruent: false },
  { flankers: 'left', target: 'right', display: ['←', '←', '→', '←', '←'], congruent: false },
  { flankers: 'right', target: 'right', display: ['→', '→', '→', '→', '→'], congruent: true },
  { flankers: 'left', target: 'left', display: ['←', '←', '←', '←', '←'], congruent: true },
  { flankers: 'left', target: 'right', display: ['←', '←', '→', '←', '←'], congruent: false },
  { flankers: 'right', target: 'left', display: ['→', '→', '←', '→', '→'], congruent: false },
];

export const FlankerExercise = ({ onComplete }) => {
  const [trialIndex, setTrialIndex] = useState(0);
  const [phase, setPhase] = useState('fixation'); // 'fixation' | 'stimulus' | 'feedback' | 'done'
  const [feedback, setFeedback] = useState(null); // { isCorrect, rt }
  const [results, setResults] = useState([]);
  const startTimeRef = useRef(0);

  const currentTrial = TRIALS[trialIndex];

  // Fixation cross timer
  useEffect(() => {
    if (phase === 'fixation') {
      const timer = setTimeout(() => {
        startTimeRef.current = Date.now();
        setPhase('stimulus');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, trialIndex]);

  const handleResponse = useCallback(
    (direction) => {
      if (phase !== 'stimulus') return;
      const rt = Date.now() - startTimeRef.current;
      const isCorrect = direction === currentTrial.target;

      const record = {
        trial: trialIndex + 1,
        congruent: currentTrial.congruent,
        target: currentTrial.target,
        response: direction,
        isCorrect,
        rt,
      };

      setFeedback({ isCorrect, rt });
      setResults((prev) => [...prev, record]);
      setPhase('feedback');

      setTimeout(() => {
        if (trialIndex + 1 < TRIALS.length) {
          setTrialIndex((prev) => prev + 1);
          setPhase('fixation');
        } else {
          setPhase('done');
        }
      }, 500);
    },
    [phase, currentTrial, trialIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase !== 'stimulus') return;
      if (e.key === 'ArrowLeft') {
        handleResponse('left');
      } else if (e.key === 'ArrowRight') {
        handleResponse('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleResponse]);

  const restartTask = () => {
    setTrialIndex(0);
    setResults([]);
    setFeedback(null);
    setPhase('fixation');
  };

  if (phase === 'done') {
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
            Flanker Task Completed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Excellent work sustaining interference control under distraction.
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
              Focus Score
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={restartTask}
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
      {/* Header & Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Trial {trialIndex + 1} of {TRIALS.length}</span>
        <span>Keyboard: Left / Right Arrows</span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-tealBrand-500 h-full transition-all duration-300"
          style={{ width: `${((trialIndex + 1) / TRIALS.length) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
          Identify the CENTER arrow direction
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">Ignore all flanking arrows</p>
      </div>

      {/* Stimulus Area */}
      <div className="h-44 rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-inner relative">
        {phase === 'fixation' && (
          <span className="text-4xl font-bold text-tealBrand-400 animate-ping">+</span>
        )}

        {phase === 'stimulus' && (
          <div className="flex items-center gap-2 sm:gap-4">
            {currentTrial.display.map((arrow, idx) => {
              const isCenter = idx === 2;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black ${
                    isCenter
                      ? 'bg-tealBrand-500 text-white ring-4 ring-tealBrand-300 shadow-xl scale-110 z-10'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {arrow}
                </div>
              );
            })}
          </div>
        )}

        {phase === 'feedback' && feedback && (
          <div className="flex flex-col items-center gap-1">
            {feedback.isCorrect ? (
              <FaCheckCircle className="text-4xl text-emerald-400 animate-bounce" />
            ) : (
              <FaTimesCircle className="text-4xl text-rose-500 animate-shake" />
            )}
            <span className="text-xs font-bold text-slate-400">{feedback.rt} ms</span>
          </div>
        )}
      </div>

      {/* Response Controls */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => handleResponse('left')}
          disabled={phase !== 'stimulus'}
          className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 disabled:opacity-40 font-black text-base text-slate-800 dark:text-slate-100 shadow transition-all flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> LEFT (←)
        </button>

        <button
          type="button"
          onClick={() => handleResponse('right')}
          disabled={phase !== 'stimulus'}
          className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 disabled:opacity-40 font-black text-base text-slate-800 dark:text-slate-100 shadow transition-all flex items-center justify-center gap-2"
        >
          RIGHT (→) <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

