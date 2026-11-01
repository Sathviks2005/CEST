import React, { useState } from 'react';
import { FaSmile, FaMeh, FaFrown, FaGrinStars, FaCheckCircle, FaHeart, FaCopy, FaCheck } from 'react-icons/fa';

export const GratitudeMoodCheckin = ({ onComplete }) => {
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [copied, setCopied] = useState(false);

  const MOODS = [
    { label: 'Great', icon: FaGrinStars, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { label: 'Good / Okay', icon: FaSmile, color: 'text-tealBrand-400 border-tealBrand-500/40 bg-tealBrand-500/10' },
    { label: 'Neutral', icon: FaMeh, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { label: 'Low', icon: FaFrown, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  ];

  const handleGratitudeChange = (index, value) => {
    setGratitudeItems((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleLog = () => {
    setIsLogged(true);
    if (onComplete) onComplete();
  };

  const handleCopy = async () => {
    const textToCopy = `=== THREE GOOD THINGS + MOOD CHECK-IN ===\nCurrent Mood: ${selectedMood || 'Not specified'}\n\nThree Good Things:\n1. ${gratitudeItems[0] || '(None)'}\n2. ${gratitudeItems[1] || '(None)'}\n3. ${gratitudeItems[2] || '(None)'}\n\nNotice: This is positive psychology wellness reflection, not CBT.`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaHeart className="text-tealBrand-400" /> Three Good Things + Mood Check-in
          </h4>
          <p className="text-xs text-slate-400">
            Positive psychology wellness practice to build daily appreciation (not CBT).
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700 self-start sm:self-auto">
          Positive Psychology
        </span>
      </div>

      {isLogged ? (
        <div className="space-y-6 text-center py-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">Three Good Things Saved!</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Thank you for checking in with yourself today. Keeping a light daily awareness of small positive events supports emotional resilience.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="text-slate-400 font-semibold">Mood: <span className="text-white font-bold">{selectedMood}</span></div>
            <div className="space-y-1">
              {gratitudeItems.map((item, idx) => item.trim() && (
                <p key={idx} className="text-slate-200">
                  <span className="text-tealBrand-400 font-bold mr-1.5">{idx + 1}.</span> {item}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Reflection!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLogged(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
            >
              Update Check-in
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-300">1. How are you feeling right now?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOODS.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMood === m.label;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m.label)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? `${m.color} ring-2 ring-tealBrand-400 font-bold scale-[1.02]`
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="text-2xl" />
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-300">
              2. Three Good Things: Name 3 small things that went okay, felt comforting, or brought a smile today:
            </p>
            <div className="space-y-2">
              {gratitudeItems.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={val}
                  onChange={(e) => handleGratitudeChange(idx, e.target.value)}
                  placeholder={`Good thing #${idx + 1}...`}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 transition-all"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLog}
              disabled={!selectedMood}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-500 to-brand-600 text-white font-extrabold text-xs shadow-md disabled:opacity-40 transition-all"
            >
              Log Three Good Things
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
