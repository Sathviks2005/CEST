import React, { useState, useEffect } from 'react';
import { FaSun, FaWalking, FaCheckCircle, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

export const SunlightWalkGuide = ({ onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes default
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setIsDone(true);
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(600);
    setIsDone(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaSun className="text-amber-400" /> Light Movement & Sunlight Walk (10–15 min)
          </h4>
          <p className="text-xs text-slate-400">
            Natural daylight exposure and gentle rhythmic pacing to regulate circadian rhythm and energy.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400 border border-amber-500/30">
          Circadian Wellness
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Guided Walk Protocol:</p>
        <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
          <li><strong>Step outside:</strong> Aim for natural morning or midday daylight without staring directly at the sun.</li>
          <li><strong>Gentle comfortable pace:</strong> This is a restoration walk, not intense cardio. Move at a conversational pace.</li>
          <li><strong>Engage outer attention:</strong> Notice 3 natural sounds (birds, breeze) and feel your feet meeting the pavement.</li>
          <li><strong>Gentle posture:</strong> Roll your shoulders back and take steady, relaxed breaths through your nose.</li>
        </ul>
      </div>

      {/* Timer Display */}
      <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-center space-y-3">
        <div className="text-4xl sm:text-5xl font-black font-mono text-amber-300">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleTimer}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md transition-all"
          >
            {isActive ? <><FaPause /> Pause</> : <><FaPlay /> {secondsLeft < 600 ? 'Resume' : 'Start Walk Timer'}</>}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <FaRedo /> Reset
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:from-tealBrand-500 hover:to-brand-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isDone ? 'Walk Completed & Recorded!' : 'Mark Walk as Completed'}
        </button>
      </div>
    </div>
  );
};

