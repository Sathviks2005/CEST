import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaRedo, FaUndo } from 'react-icons/fa';
import { ExerciseProgress } from './ExerciseProgress';
import { ExerciseTimer } from './ExerciseTimer';

const SYMBOL_ITEMS = [
  { id: 'circle', symbol: '●', label: 'Circle' },
  { id: 'triangle', symbol: '▲', label: 'Triangle' },
  { id: 'square', symbol: '■', label: 'Square' },
  { id: 'star', symbol: '★', label: 'Star' },
  { id: 'diamond', symbol: '◆', label: 'Diamond' },
  { id: 'heart', symbol: '♥', label: 'Heart' },
];

export const SequenceMemoryExercise = ({ onComplete, onExit }) => {
  const TOTAL_ROUNDS = 5;
  const [currentRound, setCurrentRound] = useState(1);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [targetSequence, setTargetSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'recall' | 'feedback'
  const [memorizeCountdown, setMemorizeCountdown] = useState(4);
  const [correctSequencesCount, setCorrectSequencesCount] = useState(0);
  const [incorrectSequencesCount, setIncorrectSequencesCount] = useState(0);
  const [longestSequence, setLongestSequence] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const totalDurationRef = useRef(0);

  // Generate sequence for round
  const generateSequence = (length) => {
    const seq = [];
    for (let i = 0; i < length; i++) {
      const randItem = SYMBOL_ITEMS[Math.floor(Math.random() * SYMBOL_ITEMS.length)];
      seq.push(randItem);
    }
    return seq;
  };

  // Start round
  useEffect(() => {
    const newSeq = generateSequence(sequenceLength);
    setTargetSequence(newSeq);
    setUserSequence([]);
    setPhase('memorize');
    setMemorizeCountdown(Math.max(3, sequenceLength + 1));
    setFeedbackMsg(null);
  }, [currentRound, sequenceLength]);

  // Memorize phase countdown
  useEffect(() => {
    let timer = null;
    if (phase === 'memorize' && memorizeCountdown > 0) {
      timer = setInterval(() => {
        setMemorizeCountdown((prev) => prev - 1);
        totalDurationRef.current += 1;
      }, 1000);
    } else if (phase === 'memorize' && memorizeCountdown === 0) {
      setPhase('recall');
    }
    return () => clearInterval(timer);
  }, [phase, memorizeCountdown]);

  const handleSelectItem = (item) => {
    if (phase !== 'recall') return;

    const nextUserSeq = [...userSequence, item];
    setUserSequence(nextUserSeq);

    // Check if full length selected
    if (nextUserSeq.length === targetSequence.length) {
      checkSequenceMatch(nextUserSeq);
    }
  };

  const handleUndo = () => {
    if (phase !== 'recall' || userSequence.length === 0) return;
    setUserSequence((prev) => prev.slice(0, prev.length - 1));
  };

  const checkSequenceMatch = (submitted) => {
    const isCorrect = submitted.every(
      (item, idx) => item.id === targetSequence[idx].id
    );

    setPhase('feedback');

    if (isCorrect) {
      setCorrectSequencesCount((prev) => prev + 1);
      setLongestSequence((prev) => Math.max(prev, targetSequence.length));
      setTotalScore((prev) => prev + targetSequence.length * 20);
      setFeedbackMsg({ success: true, text: 'Correct Sequence!' });

      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
          setSequenceLength((prev) => prev + 1);
          setCurrentRound((prev) => prev + 1);
        } else {
          finishExercise(correctSequencesCount + 1, incorrectSequencesCount, Math.max(longestSequence, targetSequence.length));
        }
      }, 1200);
    } else {
      setIncorrectSequencesCount((prev) => prev + 1);
      setTotalScore((prev) => Math.max(0, prev - 10));
      setFeedbackMsg({ success: false, text: 'Incorrect sequence order.' });

      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
          // Keep same length or reduce slightly
          setSequenceLength((prev) => Math.max(3, prev));
          setCurrentRound((prev) => prev + 1);
        } else {
          finishExercise(correctSequencesCount, incorrectSequencesCount + 1, longestSequence);
        }
      }, 1400);
    }
  };

  const finishExercise = (corrects, incorrects, maxSeq) => {
    const totalRoundsPlayed = corrects + incorrects;
    const calcAccuracy =
      totalRoundsPlayed > 0 ? Math.round((corrects / totalRoundsPlayed) * 100) : 0;
    const finalScore = Math.min(100, Math.round((calcAccuracy * 0.7) + (maxSeq * 6)));

    if (onComplete) {
      onComplete({
        score: finalScore,
        maxScore: 100,
        accuracy: calcAccuracy,
        timeTaken: totalDurationRef.current || 60,
        attempts,
        metrics: {
          correctSequences: corrects,
          incorrectSequences: incorrects,
          longestSequenceRemembered: maxSeq,
        },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center font-bold">
            <FaEye className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Memory Challenge</p>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Sequence Length: <span className="text-tealBrand-600 dark:text-tealBrand-400">{sequenceLength} Items</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExerciseTimer isActive={phase === 'memorize' || phase === 'recall'} />
          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Exit
          </button>
        </div>
      </div>

      <ExerciseProgress
        round={currentRound}
        totalRounds={TOTAL_ROUNDS}
        score={totalScore}
        accuracy={
          correctSequencesCount + incorrectSequencesCount > 0
            ? Math.round(
                (correctSequencesCount / (correctSequencesCount + incorrectSequencesCount)) * 100
              )
            : 100
        }
        attempts={attempts}
      />

      {/* Main Board */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 text-center">
        {/* Phase Header */}
        <div className="space-y-2">
          {phase === 'memorize' && (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                <FaEye /> MEMORIZE THE SEQUENCE
              </span>
              <p className="text-xs text-slate-500">Hiding in {memorizeCountdown} seconds…</p>
            </div>
          )}

          {phase === 'recall' && (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-bold">
                <FaQuestionCircle /> RECONSTRUCT THE SEQUENCE
              </span>
              <p className="text-xs text-slate-500">Click symbols below in the exact order shown.</p>
            </div>
          )}

          {phase === 'feedback' && feedbackMsg && (
            <div
              className={`p-3 rounded-2xl border text-sm font-bold inline-flex items-center gap-2 ${
                feedbackMsg.success
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}
            >
              {feedbackMsg.success ? <FaCheckCircle /> : <FaTimesCircle />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}
        </div>

        {/* Display Area */}
        <div className="min-h-[120px] p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto">
          {phase === 'memorize' ? (
            targetSequence.map((item, idx) => (
              <div
                key={idx}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-600 text-white font-mono font-extrabold text-2xl flex items-center justify-center shadow-lg transform transition-all animate-fade-in"
              >
                {item.symbol}
              </div>
            ))
          ) : (
            targetSequence.map((_, idx) => {
              const userItem = userSequence[idx];
              return (
                <div
                  key={idx}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-mono font-extrabold text-2xl flex items-center justify-center transition-all ${
                    userItem
                      ? 'bg-tealBrand-600 text-white shadow-md'
                      : 'bg-slate-800 border-2 border-dashed border-slate-700 text-slate-600'
                  }`}
                >
                  {userItem ? userItem.symbol : '?'}
                </div>
              );
            })
          )}
        </div>

        {/* User Selection Controls */}
        {phase === 'recall' && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-xl mx-auto">
              {SYMBOL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 hover:scale-105 font-mono font-bold text-2xl text-slate-800 dark:text-slate-100 shadow-sm transition-all"
                >
                  {item.symbol}
                </button>
              ))}
            </div>

            {userSequence.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <FaUndo /> Undo Last Step
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
