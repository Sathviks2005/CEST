import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCheckCircle, FaRedo, FaTrophy, FaHandPaper } from 'react-icons/fa';

const GO_NO_GO_SEQUENCE = [
  'go', 'go', 'nogo', 'go', 'go', 'go', 'nogo', 'go',
  'go', 'nogo', 'go', 'go', 'go', 'nogo', 'go', 'go'
];

export const GoNoGoExercise = ({ onComplete }) => {
  const [trialIdx, setTrialIdx] = useState(0);
  const [stage, setStage] = useState('ready'); // 'ready' | 'isi' | 'cue' | 'feedback' | 'done'
  const [responded, setResponded] = useState(false);
  const [stats, setStats] = useState({ hits: 0, falseAlarms: 0, omissions: 0, correctRejections: 0 });
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const trialRef = useRef(trialIdx);
  trialRef.current = trialIdx;
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const respondedRef = useRef(responded);
  respondedRef.current = responded;

  const currentType = GO_NO_GO_SEQUENCE[trialIdx];

  // Start trial routine
  const startNextTrial = useCallback((idx) => {
    if (idx >= GO_NO_GO_SEQUENCE.length) {
      setStage('done');
      return;
    }

    setTrialIdx(idx);
    setResponded(false);
    setFeedbackMsg(null);
    setStage('isi');

    // ISI (jitter 600 - 900ms)
    const isiTime = 600 + Math.floor(Math.random() * 300);
    setTimeout(() => {
      setStage('cue');

      // Cue display window (950ms)
      setTimeout(() => {
        // Evaluate window expiry
        const wasResponded = respondedRef.current;
        const type = GO_NO_GO_SEQUENCE[idx];

        if (type === 'go') {
          if (!wasResponded) {
            // Omission error
            setStats((s) => ({ ...s, omissions: s.omissions + 1 }));
            setFeedbackMsg({ text: 'Missed Go!', color: 'text-rose-500' });
          }
        } else {
          // nogo
          if (!wasResponded) {
            // Correct rejection
            setStats((s) => ({ ...s, correctRejections: s.correctRejections + 1 }));
            setFeedbackMsg({ text: 'Good Restraint! (+Hold)', color: 'text-emerald-400' });
          }
        }

        setStage('feedback');
        setTimeout(() => {
          startNextTrial(idx + 1);
        }, 500);
      }, 950);
    }, isiTime);
  }, []);

  // Initial trigger when user clicks "Start"
  const handleStartTask = () => {
    setStats({ hits: 0, falseAlarms: 0, omissions: 0, correctRejections: 0 });
    startNextTrial(0);
  };

  const handleUserTap = useCallback(() => {
    if (stageRef.current !== 'cue' || respondedRef.current) return;

    setResponded(true);
    const type = GO_NO_GO_SEQUENCE[trialRef.current];

    if (type === 'go') {
      setStats((s) => ({ ...s, hits: s.hits + 1 }));
      setFeedbackMsg({ text: 'Target Hit!', color: 'text-emerald-400' });
    } else {
      // commission error on nogo
      setStats((s) => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      setFeedbackMsg({ text: 'False Alarm! (Hold on red)', color: 'text-rose-500' });
    }
  }, []);

  // Keyboard Space listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserTap]);

  if (stage === 'ready') {
    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaHandPaper />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Go / No-Go Focus Challenge
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Train motor impulse control. When you see a <strong className="text-emerald-500">GREEN circle</strong>, tap immediately. When you see a <strong className="text-rose-500">RED circle</strong>, hold back and do nothing!
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Green = TAP (Spacebar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" /> Red = HOLD BACK
          </span>
        </div>

        <button
          type="button"
          onClick={handleStartTask}
          className="w-full py-4 px-6 rounded-2xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-sm shadow-xl transition-all"
        >
          Begin Session
        </button>
      </div>
    );
  }

  if (stage === 'done') {
    const totalGo = GO_NO_GO_SEQUENCE.filter((t) => t === 'go').length;
    const totalNoGo = GO_NO_GO_SEQUENCE.filter((t) => t === 'nogo').length;
    const hitRate = Math.round((stats.hits / totalGo) * 100);
    const restraintRate = Math.round((stats.correctRejections / totalNoGo) * 100);
    const score = Math.max(100, Math.round(stats.hits * 50 + stats.correctRejections * 100 - stats.falseAlarms * 60));

    return (
      <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
          <FaTrophy />
        </div>

        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Go / No-Go Completed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Excellent session training inhibitory motor restraint and vigilance.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-emerald-500">
              {hitRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Go Hit Rate
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="block text-2xl font-black text-tealBrand-600 dark:text-tealBrand-400">
              {restraintRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Restraint
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
            onClick={handleStartTask}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <FaRedo /> Try Again
          </button>
          <button
            type="button"
            onClick={() => onComplete && onComplete({ score, hitRate, restraintRate, falseAlarms: stats.falseAlarms })}
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
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>Trial {trialIdx + 1} of {GO_NO_GO_SEQUENCE.length}</span>
        <span>Spacebar or Tap Button</span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-tealBrand-500 h-full transition-all duration-300"
          style={{ width: `${((trialIdx + 1) / GO_NO_GO_SEQUENCE.length) * 100}%` }}
        />
      </div>

      {/* Cue Stage Canvas */}
      <div className="h-52 rounded-3xl bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center shadow-inner relative select-none">
        {stage === 'isi' && (
          <span className="text-3xl font-bold text-slate-600 animate-pulse">●</span>
        )}

        {stage === 'cue' && (
          <div className="flex flex-col items-center justify-center animate-scaleIn">
            {currentType === 'go' ? (
              <div className="w-32 h-32 rounded-full bg-emerald-500 border-4 border-emerald-400 flex flex-col items-center justify-center text-white shadow-2xl ring-8 ring-emerald-500/20">
                <span className="text-3xl font-black tracking-wider">GO!</span>
                <span className="text-[10px] font-bold tracking-widest mt-1 opacity-90">TAP NOW</span>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-rose-500 border-4 border-rose-400 flex flex-col items-center justify-center text-white shadow-2xl ring-8 ring-rose-500/20">
                <span className="text-2xl font-black tracking-wider">STOP!</span>
                <span className="text-[10px] font-bold tracking-widest mt-1 opacity-90">HOLD BACK</span>
              </div>
            )}
          </div>
        )}

        {stage === 'feedback' && feedbackMsg && (
          <div className={`text-base font-black tracking-wide ${feedbackMsg.color} animate-bounce`}>
            {feedbackMsg.text}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleUserTap}
          disabled={stage !== 'cue' || responded}
          className="w-full py-5 px-6 rounded-2xl bg-tealBrand-600 hover:bg-tealBrand-500 active:bg-tealBrand-700 disabled:opacity-40 text-white font-black text-lg shadow-xl transition-all active:scale-95"
        >
          {responded ? 'Recorded!' : 'TAP / PRESS (Space)'}
        </button>
      </div>
    </div>
  );
};

