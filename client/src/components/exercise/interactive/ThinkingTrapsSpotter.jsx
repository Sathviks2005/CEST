import React, { useState } from 'react';
import { FaBrain, FaCheckCircle, FaArrowRight, FaArrowLeft, FaCopy, FaCheck, FaRedo, FaInfoCircle } from 'react-icons/fa';

const TRAPS = [
  { id: 'all-or-nothing', name: 'All-or-Nothing Thinking', icon: '⚖️', def: 'Viewing situations in black-and-white extremes with no middle ground.', eg: '"If I\'m not totally successful, I\'m a complete failure."' },
  { id: 'catastrophizing', name: 'Catastrophizing', icon: '🔮', def: 'Expecting the absolute worst-case scenario to happen.', eg: '"My headache means I have a critical illness."' },
  { id: 'mind-reading', name: 'Mind Reading', icon: '💭', def: 'Assuming you know what other people are thinking, usually negatively toward you.', eg: '"She didn\'t wave back because she secretly dislikes me."' },
  { id: 'emotional-reasoning', name: 'Emotional Reasoning', icon: '❤️‍🔥', def: 'Believing that because you feel a negative emotion, reality must match it.', eg: '"I feel like an idiot, therefore I must be incompetent."' },
  { id: 'should-statements', name: '"Should" Statements', icon: '📜', def: 'Using rigid rules ("should", "must", "ought") that create pressure and guilt.', eg: '"I should always be productive and never feel tired."' },
  { id: 'overgeneralizing', name: 'Overgeneralizing', icon: '🔄', def: 'Taking one isolated negative event and applying it as a universal law.', eg: '"I stumbled in this interview; I will never get any job."' },
];

const SAMPLE_THOUGHTS = [
  {
    thought: '“I made a minor typo in the report. The entire project is ruined and my team will never trust me.”',
    matchingTraps: ['all-or-nothing', 'catastrophizing', 'overgeneralizing'],
    explanation: 'This thought blends All-or-Nothing thinking (“the entire project is ruined”), Catastrophizing (“never trust me”), and Overgeneralizing.',
  },
  {
    thought: '“My colleague seemed quiet during lunch today. She must be angry with me for something I did.”',
    matchingTraps: ['mind-reading', 'emotional-reasoning'],
    explanation: 'This thought demonstrates Mind Reading (assuming her silence is about you) without checking objective facts.',
  },
  {
    thought: '“I feel so anxious and tense right now, so something terrible is definitely about to happen.”',
    matchingTraps: ['emotional-reasoning', 'catastrophizing'],
    explanation: 'This is Emotional Reasoning: confusing an internal physical feeling of anxiety with external danger.',
  },
  {
    thought: '“I should never feel stressed or overwhelmed. Other people manage everything easily.”',
    matchingTraps: ['should-statements', 'all-or-nothing'],
    explanation: 'This thought sets an inflexible rule (“should never feel stressed”), creating self-criticism.',
  },
];

export const ThinkingTrapsSpotter = ({ onComplete }) => {
  const [phase, setPhase] = useState('learn'); // 'learn' | 'practice' | 'ownThought' | 'summary'
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedTraps, setSelectedTraps] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Own thought
  const [ownThought, setOwnThought] = useState('');
  const [ownSelectedTraps, setOwnSelectedTraps] = useState([]);
  const [ownBalancedReframe, setOwnBalancedReframe] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleSelectTrap = (trapId) => {
    setSelectedTraps((prev) =>
      prev.includes(trapId) ? prev.filter((id) => id !== trapId) : [...prev, trapId]
    );
  };

  const toggleSelectOwnTrap = (trapId) => {
    setOwnSelectedTraps((prev) =>
      prev.includes(trapId) ? prev.filter((id) => id !== trapId) : [...prev, trapId]
    );
  };

  const handlePracticeNext = () => {
    setShowExplanation(false);
    setSelectedTraps([]);
    if (practiceIdx < SAMPLE_THOUGHTS.length - 1) {
      setPracticeIdx((prev) => prev + 1);
    } else {
      setPhase('ownThought');
    }
  };

  const handleFinish = () => {
    setPhase('summary');
    if (onComplete) onComplete();
  };

  const handleCopy = async () => {
    const textToCopy = `=== THINKING TRAPS SPOTTER SUMMARY ===
Identified Traps for Own Thought:
Thought: "${ownThought || '(Not specified)'}"
Traps: ${ownSelectedTraps.map((id) => TRAPS.find((t) => t.id === id)?.name).join(', ') || 'None selected'}
Balanced Reframe: "${ownBalancedReframe || '(None)'}"
`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
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
            <FaBrain className="text-tealBrand-400" /> Thinking Traps Spotter
          </h4>
          <p className="text-xs text-slate-400">
            Identify common cognitive distortions and practice testing them with realistic, gentle reframes.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[10px] font-bold">
          <span className={`px-2.5 py-1 rounded-full ${phase === 'learn' ? 'bg-tealBrand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Learn</span>
          <span className={`px-2.5 py-1 rounded-full ${phase === 'practice' ? 'bg-tealBrand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Practice</span>
          <span className={`px-2.5 py-1 rounded-full ${phase === 'ownThought' || phase === 'summary' ? 'bg-tealBrand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Your Thought</span>
        </div>
      </div>

      {/* PHASE 1: LEARN THE 6 TRAPS */}
      {phase === 'learn' && (
        <div className="space-y-5 animate-fadeIn">
          <p className="text-xs text-slate-300">
            Our brains often use shortcuts during stress that distort reality. Here are 6 common patterns:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRAPS.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-tealBrand-300">
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{t.def}</p>
                <p className="text-[11px] text-slate-400 italic">Example: {t.eg}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPhase('practice')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-1.5"
            >
              Start Practice Rounds <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: PRACTICE SPOTTER */}
      {phase === 'practice' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-tealBrand-400 uppercase tracking-wider">
              Sample Thought {practiceIdx + 1} of {SAMPLE_THOUGHTS.length}
            </span>
            <span>Tap which trap(s) fit</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed italic">
              {SAMPLE_THOUGHTS[practiceIdx].thought}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TRAPS.map((t) => {
              const isSelected = selectedTraps.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleSelectTrap(t.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-tealBrand-500/20 border-tealBrand-400 text-tealBrand-200 ring-2 ring-tealBrand-400/50 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation reveal */}
          {showExplanation ? (
            <div className="p-4 rounded-2xl bg-tealBrand-950/40 border border-tealBrand-500/40 space-y-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-tealBrand-300 font-bold">
                <FaInfoCircle />
                <span>Perspective & Explanation</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {SAMPLE_THOUGHTS[practiceIdx].explanation}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePracticeNext}
                  className="px-5 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs"
                >
                  {practiceIdx < SAMPLE_THOUGHTS.length - 1 ? 'Next Sample Thought' : 'Try on Your Own Thought'}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExplanation(true)}
                disabled={selectedTraps.length === 0}
                className="px-6 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow disabled:opacity-40"
              >
                Check Traps & See Explanation
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: APPLY TO OWN THOUGHT */}
      {phase === 'ownThought' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-tealBrand-300">
              Now Try It on One of Your Own Thoughts
            </h5>
            <p className="text-xs text-slate-400">
              Type a recurring or recent automatic thought that caused you distress:
            </p>
          </div>

          <textarea
            rows={3}
            value={ownThought}
            onChange={(e) => setOwnThought(e.target.value)}
            placeholder='e.g. "If I make one mistake during my presentation, everyone will think I am incompetent..."'
            className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
          />

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-300">Which thinking trap(s) might be at play here?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TRAPS.map((t) => {
                const isSelected = ownSelectedTraps.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleSelectOwnTrap(t.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-tealBrand-500/20 border-tealBrand-400 text-tealBrand-200 ring-2 ring-tealBrand-400/50 font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-300">
              Draft a gentle, balanced reframe for this thought:
            </label>
            <textarea
              rows={2}
              value={ownBalancedReframe}
              onChange={(e) => setOwnBalancedReframe(e.target.value)}
              placeholder="e.g. Making a small stumble is normal human communication. People focus on the overall message..."
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleFinish}
              disabled={!ownThought.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-xs shadow-md disabled:opacity-40"
            >
              Complete Exercise & View Summary
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: SUMMARY */}
      {phase === 'summary' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-xl font-bold text-white">Thinking Traps Exercise Complete!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Spotting cognitive distortions is like turning on a light in a dark room. With practice, you can catch them in real time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-md mx-auto space-y-3 text-xs text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Thought:</span>
              <p className="text-rose-200 italic font-semibold">"{ownThought}"</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Traps:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ownSelectedTraps.map((id) => (
                  <span key={id} className="px-2 py-0.5 rounded-full bg-tealBrand-500/20 text-tealBrand-300 text-[10px] font-bold">
                    {TRAPS.find((t) => t.id === id)?.name}
                  </span>
                ))}
              </div>
            </div>
            {ownBalancedReframe && (
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Balanced Reframe:</span>
                <p className="text-emerald-200 font-semibold">{ownBalancedReframe}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Summary!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhase('learn');
                setPracticeIdx(0);
                setOwnThought('');
                setOwnSelectedTraps([]);
                setOwnBalancedReframe('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
            >
              <FaRedo /> Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
