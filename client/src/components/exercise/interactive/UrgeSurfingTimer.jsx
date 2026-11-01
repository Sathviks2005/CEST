import React, { useState, useEffect } from 'react';
import { FaWater, FaCheckCircle, FaPlay, FaPause, FaRedo, FaPlus, FaCopy, FaCheck, FaShieldAlt } from 'react-icons/fa';
import { WaveSurf } from '../illustrations/WaveSurf';

export const UrgeSurfingTimer = ({ onComplete }) => {
  const [urgeName, setUrgeName] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(5); // 5, 10, or 15
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Ratings history: array of { minute: number, rating: number }
  const [currentRating, setCurrentRating] = useState(70);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Record initial rating when starting
  const handleStartTimer = () => {
    if (!urgeName.trim()) return;
    if (ratingHistory.length === 0) {
      setRatingHistory([{ minute: 0, rating: Number(currentRating) }]);
    }
    setIsActive(true);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsFinished(true);
            if (onComplete) onComplete();
            return 0;
          }

          // Check if a minute just elapsed (e.g. at 240, 180, 120, 60s)
          const elapsed = targetMinutes * 60 - (prev - 1);
          if (elapsed > 0 && elapsed % 60 === 0) {
            const currentMin = elapsed / 60;
            setRatingHistory((h) => {
              if (h.some((item) => item.minute === currentMin)) return h;
              return [...h, { minute: currentMin, rating: Number(currentRating) }];
            });
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished, targetMinutes, currentRating, onComplete]);

  const handleAddMinutes = (mins) => {
    const newTotal = targetMinutes + mins;
    setTargetMinutes(newTotal);
    setSecondsRemaining((prev) => prev + mins * 60);
  };

  const resetSession = () => {
    setIsActive(false);
    setIsFinished(false);
    setSecondsRemaining(targetMinutes * 60);
    setRatingHistory([]);
  };

  const minsLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;
  const formattedTime = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;

  const handleCopy = async () => {
    const textLines = [
      '=== URGE SURFING & RESPONSE DELAY LOG ===',
      `Target Urge / Ritual: ${urgeName}`,
      `Total Delay Practiced: ${targetMinutes} minutes`,
      '',
      'Discomfort Ratings (0–100):',
      ...ratingHistory.map((item) => `  Minute ${item.minute}: ${item.rating}% discomfort`),
      '',
      'Insight: Urges rise, peak, and fall. You do not have to act on them.',
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textLines);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write error', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaWater className="text-tealBrand-400" /> Urge Surfing & Response Delay Timer
          </h4>
          <p className="text-xs text-slate-400">
            Ride out intrusive urges: delay rituals minute by minute and observe how sensations naturally crest and fall.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-tealBrand-500/10 text-tealBrand-400 border border-tealBrand-500/30 text-xs font-bold self-start sm:self-auto">
          {targetMinutes}-Minute Delay
        </span>
      </div>

      {/* Safety Note */}
      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <FaShieldAlt />
          <span>Safety & Clinical Guidelines</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Practise on small, manageable triggers first. Stop if overwhelmed. If delaying a ritual feels unsafe or causes acute distress, contact your clinician. This exercise is not a substitute for therapist-led ERP.
        </p>
      </div>

      {isFinished ? (
        <div className="space-y-6 text-center py-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">Delay Period Completed!</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            "Urges rise, peak, and fall. You don't have to act on them." You successfully surfed the urge without immediately performing the compulsion.
          </p>

          {/* Simple Chart / Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto space-y-3 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Urge: <span className="text-white">{urgeName}</span>
            </span>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-tealBrand-400 block uppercase">
                Discomfort Ratings Over Time:
              </span>
              <div className="flex items-end justify-between gap-1 h-24 pt-2 border-b border-slate-800">
                {ratingHistory.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold">{item.rating}%</span>
                    <div
                      style={{ height: `${Math.max(6, item.rating * 0.7)}px` }}
                      className="w-full max-w-[20px] bg-tealBrand-500 rounded-t-sm"
                    />
                    <span className="text-[8px] text-slate-500">{item.minute}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Log!' : 'Copy Summary to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={resetSession}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
            >
              <FaRedo /> Practice Again
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Urge Definition */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              1. Name the urge or compulsion you want to delay:
            </label>
            <input
              type="text"
              disabled={isActive}
              value={urgeName}
              onChange={(e) => setUrgeName(e.target.value)}
              placeholder="e.g. Urge to wash hands again, urge to check the lock..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500 disabled:opacity-60"
            />
          </div>

          {/* Wave Illustration */}
          <div className="p-2 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
            <WaveSurf />
          </div>

          {/* Timer Display */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
            <p className="text-4xl sm:text-5xl font-black text-white tracking-tight" aria-live="polite">
              {formattedTime}
            </p>
            <p className="text-xs text-slate-400">
              Notice the urge cresting. Breathe normally and allow the sensation to exist without fighting it.
            </p>

            {isActive && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddMinutes(5)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold inline-flex items-center gap-1"
                >
                  <FaPlus className="text-[9px]" /> +5 Mins (Extend to 10m)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(10)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold inline-flex items-center gap-1"
                >
                  <FaPlus className="text-[9px]" /> +10 Mins (Extend to 15m)
                </button>
              </div>
            )}
          </div>

          {/* Current Discomfort Re-rating */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Rate Discomfort Right Now (0–100%):</span>
              <span className="text-tealBrand-400 font-extrabold text-sm">{currentRating}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentRating}
              onChange={(e) => setCurrentRating(Number(e.target.value))}
              className="w-full accent-tealBrand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Mild / Passing)</span>
              <span>50 (Moderate Urge)</span>
              <span>100 (Intense Urge Peak)</span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartTimer}
              disabled={!urgeName.trim()}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-tealBrand-500 to-brand-600 hover:opacity-95 text-white font-extrabold text-sm shadow-md disabled:opacity-40 inline-flex items-center gap-2 transition-all"
            >
              {isActive ? (
                <>
                  <FaPause /> Pause Delay
                </>
              ) : (
                <>
                  <FaPlay /> {ratingHistory.length > 0 ? 'Resume Timer' : 'Start 5-Min Urge Delay'}
                </>
              )}
            </button>

            {isActive && (
              <button
                type="button"
                onClick={resetSession}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                title="Reset"
              >
                <FaRedo />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
