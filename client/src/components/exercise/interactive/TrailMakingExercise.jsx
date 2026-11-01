import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaRedo, FaTrophy, FaStopwatch, FaExclamationTriangle } from 'react-icons/fa';

const TRAIL_SEQUENCE = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];

// Pre-defined spatial layout (x, y in percent) so nodes are well-spaced and don't overlap
const BASE_LAYOUT = [
  { id: '1', x: 18, y: 22 },
  { id: 'A', x: 48, y: 14 },
  { id: '2', x: 80, y: 26 },
  { id: 'B', x: 74, y: 55 },
  { id: '3', x: 50, y: 44 },
  { id: 'C', x: 22, y: 58 },
  { id: '4', x: 15, y: 84 },
  { id: 'D', x: 45, y: 82 },
  { id: '5', x: 82, y: 85 },
  { id: 'E', x: 60, y: 70 },
];

export const TrailMakingExercise = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0); // index in TRAIL_SEQUENCE
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [errors, setErrors] = useState(0);
  const [lastErrorNode, setLastErrorNode] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  // Start timer on mount
  useEffect(() => {
    const start = Date.now();
    setStartTime(start);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleNodeClick = (nodeId) => {
    if (isFinished) return;

    const expectedId = TRAIL_SEQUENCE[currentIdx];

    if (nodeId === expectedId) {
      const nextIdx = currentIdx + 1;
      setVisitedNodes((prev) => [...prev, nodeId]);
      setCurrentIdx(nextIdx);
      setLastErrorNode(null);

      if (nextIdx >= TRAIL_SEQUENCE.length) {
        clearInterval(timerRef.current);
        setIsFinished(true);
      }
    } else {
      setErrors((prev) => prev + 1);
      setLastErrorNode(nodeId);
      setTimeout(() => setLastErrorNode(null), 600);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setVisitedNodes([]);
    setErrors(0);
    setLastErrorNode(null);
    setIsFinished(false);
    const start = Date.now();
    setStartTime(start);
    setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
  };

  const expectedTarget = TRAIL_SEQUENCE[currentIdx];

  if (isFinished) {
    const baseScore = 1000;
    const timePenalty = elapsed * 15;
    const errorPenalty = errors * 50;
    const score = Math.max(100, baseScore - timePenalty - errorPenalty);

    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaTrophy />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Trail Challenge Completed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Great task-switching and visual scanning performance.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-tealBrand-600 dark:text-tealBrand-400">
              {elapsed}s
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Time
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-rose-500">
              {errors}
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mistakes
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
            onClick={() => onComplete && onComplete({ score, timeElapsed: elapsed, errors })}
            className="flex-1 py-3 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Save & Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 animate-fadeIn">
      {/* HUD Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-tealBrand-600 dark:text-tealBrand-400">
            <FaStopwatch /> {elapsed}s
          </span>
          {errors > 0 && (
            <span className="flex items-center gap-1 text-rose-500">
              <FaExclamationTriangle /> {errors} misclick{errors > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-tealBrand-500 text-white font-black text-sm shadow">
            {expectedTarget}
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-tealBrand-500 h-full transition-all duration-300"
          style={{ width: `${(visitedNodes.length / TRAIL_SEQUENCE.length) * 100}%` }}
        />
      </div>

      {/* Trail Canvas */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-inner overflow-hidden select-none">
        {/* SVG connection lines between visited nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {visitedNodes.map((nodeId, idx) => {
            if (idx === 0) return null;
            const prevId = visitedNodes[idx - 1];
            const prevPos = BASE_LAYOUT.find((n) => n.id === prevId);
            const currPos = BASE_LAYOUT.find((n) => n.id === nodeId);
            if (!prevPos || !currPos) return null;

            return (
              <line
                key={`line-${idx}`}
                x1={`${prevPos.x}%`}
                y1={`${prevPos.y}%`}
                x2={`${currPos.x}%`}
                y2={`${currPos.y}%`}
                stroke="rgb(20 184 166)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Target Nodes */}
        {BASE_LAYOUT.map((node) => {
          const isVisited = visitedNodes.includes(node.id);
          const isCurrentTarget = node.id === expectedTarget;
          const isError = node.id === lastErrorNode;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleNodeClick(node.id)}
              disabled={isVisited}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full font-black text-base sm:text-lg transition-all flex items-center justify-center shadow-lg ${
                isVisited
                  ? 'bg-tealBrand-500 text-white ring-2 ring-tealBrand-300 opacity-90 cursor-default'
                  : isError
                  ? 'bg-rose-500 text-white ring-4 ring-rose-300 scale-110 animate-shake'
                  : isCurrentTarget
                  ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-300 scale-110 animate-pulse hover:bg-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 hover:border-slate-500'
              }`}
            >
              {node.id}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Click in alternating order: <span className="font-mono font-bold text-tealBrand-600 dark:text-tealBrand-400">1 → A → 2 → B → 3 → C → 4 → D → 5 → E</span>
      </p>
    </div>
  );
};

