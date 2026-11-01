import React, { useState, useEffect, useRef } from 'react';
import { FaBullseye, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import { ExerciseProgress } from './ExerciseProgress';
import { ExerciseTimer } from './ExerciseTimer';

const ROUND_CONFIGS = [
  { round: 1, size: 4, targetCount: 4, target: '7', pool: ['1', '2', '3', '4', '5', '6', '8', '9'], timeLimit: 35 },
  { round: 2, size: 5, targetCount: 6, target: '7', pool: ['1', '4', '9', '2', '3', '8'], timeLimit: 30 },
  { round: 3, size: 6, targetCount: 8, target: '★', pool: ['☆', '✦', '✧', '▲', '◆', '●'], timeLimit: 30 },
  { round: 4, size: 7, targetCount: 10, target: 'E', pool: ['F', 'B', 'P', 'R', 'K', 'H'], timeLimit: 25 },
  { round: 5, size: 8, targetCount: 12, target: '9', pool: ['6', '8', '0', '3', '5', '2'], timeLimit: 25 },
];

export const AttentionGridExercise = ({ onComplete, onExit }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [grid, setGrid] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [wrongIndices, setWrongIndices] = useState(new Set());
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [totalTargetsFound, setTotalTargetsFound] = useState(0);
  const [totalTargetsPossible, setTotalTargetsPossible] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [roundTimeLeft, setRoundTimeLeft] = useState(35);
  const totalDurationRef = useRef(0);

  const currentConfig = ROUND_CONFIGS[currentRoundIdx];

  // Initialize round grid
  useEffect(() => {
    if (!currentConfig) return;
    const totalCells = currentConfig.size * currentConfig.size;
    const arr = Array(totalCells).fill(null);

    // Place target items randomly
    const targetPositions = new Set();
    while (targetPositions.size < currentConfig.targetCount) {
      const pos = Math.floor(Math.random() * totalCells);
      targetPositions.add(pos);
    }

    targetPositions.forEach((pos) => {
      arr[pos] = currentConfig.target;
    });

    // Fill remaining with distractor items
    for (let i = 0; i < totalCells; i++) {
      if (arr[i] === null) {
        const randDistractor =
          currentConfig.pool[Math.floor(Math.random() * currentConfig.pool.length)];
        arr[i] = randDistractor;
      }
    }

    setGrid(arr);
    setSelectedIndices(new Set());
    setWrongIndices(new Set());
    setRoundTimeLeft(currentConfig.timeLimit);
    setIsRoundActive(true);
    setTotalTargetsPossible((prev) => prev + currentConfig.targetCount);
  }, [currentRoundIdx]);

  // Round countdown timer
  useEffect(() => {
    let timer = null;
    if (isRoundActive && roundTimeLeft > 0) {
      timer = setInterval(() => {
        setRoundTimeLeft((prev) => prev - 1);
        totalDurationRef.current += 1;
      }, 1000);
    } else if (isRoundActive && roundTimeLeft === 0) {
      // Round time expired
      handleNextRound();
    }
    return () => clearInterval(timer);
  }, [isRoundActive, roundTimeLeft]);

  const handleCellClick = (index) => {
    if (!isRoundActive || selectedIndices.has(index) || wrongIndices.has(index)) return;

    const val = grid[index];
    if (val === currentConfig.target) {
      const nextSel = new Set(selectedIndices).add(index);
      setSelectedIndices(nextSel);
      setCorrectHits((prev) => prev + 1);
      setTotalScore((prev) => prev + 10);
      setTotalTargetsFound((prev) => prev + 1);

      // Check if all targets in this round found
      if (nextSel.size === currentConfig.targetCount) {
        setTimeout(() => handleNextRound(), 400);
      }
    } else {
      setWrongIndices((prev) => new Set(prev).add(index));
      setWrongHits((prev) => prev + 1);
      setTotalScore((prev) => Math.max(0, prev - 2));
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < ROUND_CONFIGS.length - 1) {
      setCurrentRoundIdx((prev) => prev + 1);
    } else {
      setIsRoundActive(false);
      finishExercise();
    }
  };

  const finishExercise = () => {
    const missedTargets = Math.max(0, totalTargetsPossible - totalTargetsFound);
    const totalClicks = correctHits + wrongHits + missedTargets;
    const calcAccuracy =
      totalClicks > 0 ? Math.min(100, Math.round((correctHits / totalClicks) * 100)) : 0;
    const finalScore = Math.min(100, Math.round((calcAccuracy * 0.7) + (totalTargetsFound * 2.5)));

    if (onComplete) {
      onComplete({
        score: finalScore,
        maxScore: 100,
        accuracy: calcAccuracy,
        timeTaken: totalDurationRef.current || 45,
        attempts,
        metrics: {
          correctSelections: correctHits,
          incorrectSelections: wrongHits,
          missedTargets,
        },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <FaBullseye className="text-xl animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Object</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Find all instances of: <span className="px-3 py-1 rounded-xl bg-brand-600 text-white font-mono text-xl">{currentConfig?.target}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExerciseTimer isActive={isRoundActive} />
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
        round={currentRoundIdx + 1}
        totalRounds={ROUND_CONFIGS.length}
        score={totalScore}
        accuracy={
          correctHits + wrongHits > 0
            ? Math.round((correctHits / (correctHits + wrongHits)) * 100)
            : 100
        }
        attempts={attempts}
      />

      {/* Interactive Grid Board */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-6">
        <div className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
          <span>Targets Found: {selectedIndices.size} / {currentConfig?.targetCount}</span>
          <span className="text-amber-500">Round Time Remaining: {roundTimeLeft}s</span>
        </div>

        <div
          className="grid gap-2 sm:gap-3 justify-center w-full max-w-lg mx-auto"
          style={{
            gridTemplateColumns: `repeat(${currentConfig?.size || 4}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((symbol, idx) => {
            const isCorrect = selectedIndices.has(idx);
            const isWrong = wrongIndices.has(idx);

            let btnStyle =
              'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:scale-105 hover:bg-brand-50 dark:hover:bg-brand-950/40';

            if (isCorrect) {
              btnStyle =
                'bg-emerald-600 text-white border-emerald-500 shadow-md scale-95 cursor-default';
            } else if (isWrong) {
              btnStyle =
                'bg-rose-600 text-white border-rose-500 shadow-sm animate-bounce cursor-default';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                className={`aspect-square rounded-2xl border font-mono font-bold text-lg sm:text-2xl flex items-center justify-center transition-all duration-200 select-none ${btnStyle}`}
              >
                {isCorrect ? <FaCheck className="text-sm" /> : isWrong ? <FaTimes className="text-sm" /> : symbol}
              </button>
            );
          })}
        </div>

        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={handleNextRound}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow hover:opacity-90 transition-all"
          >
            {currentRoundIdx < ROUND_CONFIGS.length - 1 ? 'Skip to Next Round' : 'Finish Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
};
