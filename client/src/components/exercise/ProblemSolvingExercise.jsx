import React, { useState, useEffect, useRef } from 'react';
import {
  FaCompass,
  FaLightbulb,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaRedo,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaSortAmountDown,
  FaExclamationCircle,
} from 'react-icons/fa';
import { ExerciseProgress } from './ExerciseProgress';
import { ExerciseTimer } from './ExerciseTimer';

// Level 1 & 3: Goal Pathfinder Grids
// 0 = empty, 1 = obstacle, 2 = start, 3 = goal, 4 = key item
const PATHFINDER_LEVELS = [
  {
    level: 1,
    type: 'pathfinder',
    title: 'Level 1: Minimal Move Pathfinder',
    goalText: 'Reach the destination (🚩) using the minimum number of moves.',
    size: 4,
    startPos: { r: 0, c: 0 },
    goalPos: { r: 3, c: 3 },
    obstacles: [{ r: 1, c: 1 }, { r: 2, c: 2 }],
    maxMoves: 8,
    hint: 'Move around the center obstacles towards the bottom right corner.',
  },
  {
    level: 3,
    type: 'pathfinder',
    title: 'Level 3: Constraint & Key Collection Pathfinder',
    goalText: 'Collect the Key (🔑) and reach the destination (🚩) within 10 moves.',
    size: 5,
    startPos: { r: 0, c: 0 },
    keyPos: { r: 2, c: 4 },
    goalPos: { r: 4, c: 4 },
    obstacles: [{ r: 1, c: 2 }, { r: 3, c: 2 }, { r: 2, c: 2 }],
    maxMoves: 10,
    hint: 'Navigate to the right edge to get the key before moving down to the flag.',
  },
];

// Level 2 & 4: Logical Action Sequencing
const SEQUENCING_LEVELS = [
  {
    level: 2,
    type: 'sequencing',
    title: 'Level 2: Strategic Goal Decomposition',
    goalText: 'Organize the following 6 actions into the most logical sequential order.',
    correctOrder: [
      'Define Objective',
      'Gather Requirements',
      'Formulate Strategy Plan',
      'Execute Action Steps',
      'Verify Results',
      'Document Outcomes',
    ],
    hint: 'Start with objective definition and end with documentation.',
  },
  {
    level: 4,
    type: 'sequencing',
    title: 'Level 4: Distractor Exclusion & Step Optimization',
    goalText: 'Select and order ONLY the necessary valid steps. Ignore distractor actions.',
    distractors: ['Panic and act randomly', 'Delegate without instructions'],
    correctOrder: [
      'Assess Current Situation',
      'Identify Potential Risks',
      'Select Optimal Solution',
      'Implement Strategy',
      'Review Performance',
    ],
    allCards: [
      'Identify Potential Risks',
      'Panic and act randomly',
      'Assess Current Situation',
      'Implement Strategy',
      'Delegate without instructions',
      'Select Optimal Solution',
      'Review Performance',
    ],
    hint: 'Exclude actions that do not contribute to risk assessment or strategic execution.',
  },
];

export const ProblemSolvingExercise = ({ onComplete, onExit }) => {
  const TOTAL_LEVELS = 4;
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isLevelActive, setIsLevelActive] = useState(true);
  const [successfulSolutions, setSuccessfulSolutions] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [totalMovesCount, setTotalMovesCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const totalDurationRef = useRef(0);

  // Pathfinder state
  const [plannedMoves, setPlannedMoves] = useState([]);
  const [currentPos, setCurrentPos] = useState({ r: 0, c: 0 });
  const [hasKey, setHasKey] = useState(false);

  // Sequencing state
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);

  // Active level data
  const levelData =
    currentLevelIdx === 0
      ? PATHFINDER_LEVELS[0]
      : currentLevelIdx === 1
      ? SEQUENCING_LEVELS[0]
      : currentLevelIdx === 2
      ? PATHFINDER_LEVELS[1]
      : SEQUENCING_LEVELS[1];

  // Initialize level
  useEffect(() => {
    setShowHint(false);
    setFeedback(null);
    setIsLevelActive(true);

    if (levelData.type === 'pathfinder') {
      setPlannedMoves([]);
      setCurrentPos(levelData.startPos);
      setHasKey(false);
    } else if (levelData.type === 'sequencing') {
      let cards = [];
      if (levelData.allCards) {
        cards = [...levelData.allCards].sort(() => Math.random() - 0.5);
      } else {
        cards = [...levelData.correctOrder].sort(() => Math.random() - 0.5);
      }
      setAvailableCards(cards);
      setSelectedCards([]);
    }
  }, [currentLevelIdx]);

  // Pathfinder move add
  const handleAddMove = (direction) => {
    if (!isLevelActive || plannedMoves.length >= (levelData.maxMoves || 12)) return;
    setPlannedMoves((prev) => [...prev, direction]);
  };

  const handleClearMoves = () => {
    setPlannedMoves([]);
  };

  const handleExecutePathfinder = () => {
    if (plannedMoves.length === 0) return;

    let r = levelData.startPos.r;
    let c = levelData.startPos.c;
    let keyCollected = false;
    let hitObstacle = false;

    setTotalMovesCount((prev) => prev + plannedMoves.length);

    for (const dir of plannedMoves) {
      if (dir === 'UP') r -= 1;
      if (dir === 'DOWN') r += 1;
      if (dir === 'LEFT') c -= 1;
      if (dir === 'RIGHT') c += 1;

      // Check boundaries
      if (r < 0 || r >= levelData.size || c < 0 || c >= levelData.size) {
        hitObstacle = true;
        break;
      }

      // Check obstacle
      if (levelData.obstacles.some((obs) => obs.r === r && obs.c === c)) {
        hitObstacle = true;
        break;
      }

      // Check key
      if (levelData.keyPos && levelData.keyPos.r === r && levelData.keyPos.c === c) {
        keyCollected = true;
      }
    }

    setCurrentPos({ r, c });

    const reachedGoal =
      r === levelData.goalPos.r &&
      c === levelData.goalPos.c &&
      (!levelData.keyPos || keyCollected || hasKey);

    if (!hitObstacle && reachedGoal) {
      handleSuccessLevel();
    } else {
      handleFailLevel(
        hitObstacle
          ? 'Plan hit a boundary or obstacle block.'
          : levelData.keyPos && !keyCollected
          ? 'Destination reached without collecting the required key.'
          : 'Plan did not reach the destination.'
      );
    }
  };

  // Sequencing card select
  const handleCardClick = (card) => {
    setAvailableCards((prev) => prev.filter((c) => c !== card));
    setSelectedCards((prev) => [...prev, card]);
  };

  const handleRemoveCard = (card) => {
    setSelectedCards((prev) => prev.filter((c) => c !== card));
    setAvailableCards((prev) => [...prev, card]);
  };

  const handleVerifySequencing = () => {
    const isExactMatch =
      selectedCards.length === levelData.correctOrder.length &&
      selectedCards.every((card, idx) => card === levelData.correctOrder[idx]);

    setTotalMovesCount((prev) => prev + selectedCards.length);

    if (isExactMatch) {
      handleSuccessLevel();
    } else {
      handleFailLevel('Step order is incorrect or contains distractor actions.');
    }
  };

  const handleSuccessLevel = () => {
    setSuccessfulSolutions((prev) => prev + 1);
    setScore((prev) => prev + 25);
    setFeedback({ success: true, text: 'Goal Achieved! Outstanding strategy.' });

    setTimeout(() => {
      if (currentLevelIdx < TOTAL_LEVELS - 1) {
        setCurrentLevelIdx((prev) => prev + 1);
      } else {
        finishExercise(successfulSolutions + 1, incorrectAttempts);
      }
    }, 1400);
  };

  const handleFailLevel = (msg) => {
    setIncorrectAttempts((prev) => prev + 1);
    setFeedback({ success: false, text: msg });

    setTimeout(() => {
      if (levelData.type === 'pathfinder') {
        setPlannedMoves([]);
        setCurrentPos(levelData.startPos);
      }
      setFeedback(null);
    }, 1600);
  };

  const finishExercise = (succeeded, failed) => {
    const totalAttemptsMade = succeeded + failed;
    const calcAccuracy =
      totalAttemptsMade > 0 ? Math.round((succeeded / totalAttemptsMade) * 100) : 0;
    const finalScore = Math.min(100, Math.round((calcAccuracy * 0.7) + (succeeded * 7.5)));

    if (onComplete) {
      onComplete({
        score: finalScore,
        maxScore: 100,
        accuracy: calcAccuracy,
        timeTaken: totalDurationRef.current || 90,
        attempts,
        hintsUsed,
        metrics: {
          successfulSolutions: succeeded,
          incorrectAttempts: failed,
          totalMovesCount,
        },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <FaCompass className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Executive Function Challenge
            </p>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {levelData.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExerciseTimer isActive={isLevelActive} />
          <button
            type="button"
            onClick={() => {
              setHintsUsed((p) => p + 1);
              setShowHint(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
          >
            <FaLightbulb /> Hint
          </button>
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
        round={currentLevelIdx + 1}
        totalRounds={TOTAL_LEVELS}
        score={score}
        accuracy={
          successfulSolutions + incorrectAttempts > 0
            ? Math.round(
                (successfulSolutions / (successfulSolutions + incorrectAttempts)) * 100
              )
            : 100
        }
        attempts={attempts}
      />

      {showHint && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-fade-in">
          <FaLightbulb className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Strategy Hint: </span> {levelData.hint}
          </div>
        </div>
      )}

      {/* Main Board */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
          <span className="text-brand-600 dark:text-brand-400 font-extrabold uppercase text-xs">
            Objective:
          </span>
          <span>{levelData.goalText}</span>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 ${
              feedback.success
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
            }`}
          >
            {feedback.success ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* PATHFINDER PUZZLE */}
        {levelData.type === 'pathfinder' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Grid */}
              <div
                className="grid gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner"
                style={{
                  gridTemplateColumns: `repeat(${levelData.size}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: levelData.size * levelData.size }).map((_, idx) => {
                  const r = Math.floor(idx / levelData.size);
                  const c = idx % levelData.size;

                  const isStart = levelData.startPos.r === r && levelData.startPos.c === c;
                  const isGoal = levelData.goalPos.r === r && levelData.goalPos.c === c;
                  const isObstacle = levelData.obstacles.some(
                    (obs) => obs.r === r && obs.c === c
                  );
                  const isKey =
                    levelData.keyPos && levelData.keyPos.r === r && levelData.keyPos.c === c;
                  const isCurrent = currentPos.r === r && currentPos.c === c;

                  let cellContent = '';
                  let cellStyle = 'bg-slate-800 border-slate-700 text-slate-400';

                  if (isObstacle) {
                    cellContent = '⬛';
                    cellStyle = 'bg-slate-950 border-slate-800 opacity-60';
                  } else if (isCurrent) {
                    cellContent = '🤖';
                    cellStyle = 'bg-brand-600 text-white font-bold border-brand-400 scale-105';
                  } else if (isGoal) {
                    cellContent = '🚩';
                    cellStyle = 'bg-emerald-600/30 border-emerald-500';
                  } else if (isKey) {
                    cellContent = '🔑';
                    cellStyle = 'bg-amber-600/30 border-amber-500';
                  } else if (isStart) {
                    cellContent = '▶';
                    cellStyle = 'bg-blue-600/30 border-blue-500';
                  }

                  return (
                    <div
                      key={idx}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center text-xl select-none font-bold ${cellStyle}`}
                    >
                      {cellContent}
                    </div>
                  );
                })}
              </div>

              {/* Action Selector */}
              <div className="space-y-4 max-w-xs w-full">
                <p className="text-xs font-bold uppercase text-slate-400">Plan Moves Sequence</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['UP', FaArrowUp],
                    ['DOWN', FaArrowDown],
                    ['LEFT', FaArrowLeft],
                    ['RIGHT', FaArrowRight],
                  ].map(([dir, Icon]) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => handleAddMove(dir)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Icon className="text-brand-500" /> {dir}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold">
                    <span>Planned ({plannedMoves.length}/{levelData.maxMoves})</span>
                    {plannedMoves.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearMoves}
                        className="text-rose-500 hover:underline text-[11px]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="font-mono text-slate-600 dark:text-slate-400 break-words">
                    {plannedMoves.join(' → ') || 'No moves added yet.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={plannedMoves.length === 0}
                  onClick={handleExecutePathfinder}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaPlay className="text-[10px]" /> Execute Strategy Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEQUENCING PUZZLE */}
        {levelData.type === 'sequencing' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Target Ordered Slot Area */}
            <div className="space-y-2 text-left">
              <p className="text-xs font-bold uppercase text-slate-400">Selected Action Sequence</p>
              <div className="min-h-[140px] p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                {selectedCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center pt-8">
                    Click steps from available pool below to place them in sequential order.
                  </p>
                ) : (
                  selectedCards.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRemoveCard(card)}
                      className="p-3 rounded-xl bg-tealBrand-600 text-white font-bold text-xs flex items-center justify-between cursor-pointer hover:bg-tealBrand-700 shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/20 text-white font-extrabold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {card}
                      </span>
                      <span className="text-[10px] opacity-70">Click to remove</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Cards Pool */}
            <div className="space-y-2 text-left">
              <p className="text-xs font-bold uppercase text-slate-400">Available Steps Pool</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableCards.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(card)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left hover:scale-[1.01] transition-all"
                  >
                    + {card}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={selectedCards.length === 0}
                onClick={handleVerifySequencing}
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                Verify Sequence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
