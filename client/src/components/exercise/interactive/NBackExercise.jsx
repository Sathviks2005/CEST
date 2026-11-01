import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaRedo, FaTrophy, FaEquals, FaNotEqual } from 'react-icons/fa';

// Predetermined stream with 2-Back matches at index 2, 5, 8, 11
const NBACK_STREAM = ['M', 'R', 'M', 'T', 'K', 'T', 'B', 'P', 'B', 'Q', 'X', 'Q', 'D', 'L'];

export const NBackExercise = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [userChoice, setUserChoice] = useState(null); // 'match' | 'different'
  const [scoreData, setScoreData] = useState({ hits: 0, correctRejections: 0, misses: 0, falseAlarms: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  const currentItem = NBACK_STREAM[index];
  const is2BackPossible = index >= 2;
  const isActualMatch = is2BackPossible && NBACK_STREAM[index] === NBACK_STREAM[index - 2];

  const handleChoice = (choice) => {
    if (userChoice !== null || !is2BackPossible) return;

    setUserChoice(choice);
    if (choice === 'match') {
      if (isActualMatch) {
        setScoreData((s) => ({ ...s, hits: s.hits + 1 }));
      } else {
        setScoreData((s) => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      }
    } else {
      // choice === 'different'
      if (!isActualMatch) {
        setScoreData((s) => ({ ...s, correctRejections: s.correctRejections + 1 }));
      } else {
        setScoreData((s) => ({ ...s, misses: s.misses + 1 }));
      }
    }
  };

  const advanceStep = () => {
    setUserChoice(null);
    setHistory((prev) => [...prev, currentItem]);

    if (index + 1 < NBACK_STREAM.length) {
      setIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setHistory([]);
    setUserChoice(null);
    setScoreData({ hits: 0, correctRejections: 0, misses: 0, falseAlarms: 0 });
    setIsFinished(false);
  };

  if (isFinished) {
    const totalDecisions = scoreData.hits + scoreData.correctRejections + scoreData.misses + scoreData.falseAlarms;
    const correctCount = scoreData.hits + scoreData.correctRejections;
    const accuracy = totalDecisions > 0 ? Math.round((correctCount / totalDecisions) * 100) : 100;
    const score = Math.max(100, Math.round(accuracy * 8 + scoreData.hits * 50 - scoreData.falseAlarms * 40));

    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaTrophy />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Dual N-Back Challenge Finished!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Superb exercise holding, updating, and comparing working memory representations.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">
              {accuracy}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Accuracy
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-emerald-500">
              {scoreData.hits}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Matches Hit
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-tealBrand-600 dark:text-tealBrand-400">
              {score}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Memory Score
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
            onClick={() => onComplete && onComplete({ score, accuracy, hits: scoreData.hits })}
            className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Save & Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Progress & Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Item {index + 1} of {NBACK_STREAM.length}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30">
          Mode: 2-Back
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-purple-600 h-full transition-all duration-300"
          style={{ width: `${((index + 1) / NBACK_STREAM.length) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Does this match the item from 2 steps ago?
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          {index < 2
            ? `Priming memory buffer (Step ${index + 1} of 2)`
            : 'Compare with the item 2 steps back'}
        </p>
      </div>

      {/* Main Item Display Card */}
      <div className="h-44 rounded-3xl bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center shadow-xl relative">
        <span className="text-6xl font-black font-mono text-purple-300 tracking-widest drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          {currentItem}
        </span>

        {userChoice && (
          <span className="absolute bottom-3 text-xs font-bold text-slate-400">
            Selected: <strong className="uppercase text-white">{userChoice}</strong>
          </span>
        )}
      </div>

      {/* Interaction Controls */}
      {is2BackPossible ? (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChoice('match')}
              disabled={userChoice !== null}
              className={`py-4 px-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                userChoice === 'match'
                  ? 'bg-purple-600 text-white border-purple-500 ring-4 ring-purple-400/30'
                  : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30'
              }`}
            >
              <FaEquals /> 2-Back Match
            </button>

            <button
              type="button"
              onClick={() => handleChoice('different')}
              disabled={userChoice !== null}
              className={`py-4 px-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                userChoice === 'different'
                  ? 'bg-slate-700 text-white border-slate-600 ring-4 ring-slate-400/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <FaNotEqual /> Different
            </button>
          </div>

          <button
            type="button"
            onClick={advanceStep}
            disabled={userChoice === null}
            className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-md transition-all"
          >
            Next Item →
          </button>
        </div>
      ) : (
        <div className="pt-2">
          <button
            type="button"
            onClick={advanceStep}
            className="w-full py-4 px-6 rounded-2xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-sm shadow-md transition-all"
          >
            Memorize & Continue ({index + 1}/2) →
          </button>
        </div>
      )}
    </div>
  );
};

