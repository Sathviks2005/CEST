import React, { useState } from 'react';
import { FaPaperPlane, FaCheckCircle, FaCopy, FaShieldAlt } from 'react-icons/fa';

const SCRIPTS = [
  {
    title: 'To a close friend or family member',
    text: 'Hey. I’m having a really hard day with depression and feeling weighed down. You don’t need to fix anything or give advice, but could we chat or just hang out for a little bit? It would help to not feel alone right now.',
  },
  {
    title: 'Low-energy quick signal',
    text: 'Hey, sending a quick signal that my depression has been pretty heavy this week. Just letting someone know. Sending love.',
  },
  {
    title: 'To a coworker or teammate (Work boundaries)',
    text: 'Hi there, I’m managing a personal health flare-up today and my energy is limited. I will focus strictly on priority tasks, but may take longer to respond to non-urgent messages. Thank you for understanding.',
  },
  {
    title: 'Tell Someone Today (Safety & Honesty)',
    text: 'Hi, I need to be honest and tell you that I am really struggling right now and don’t feel safe being completely alone with my thoughts. Could you stay with me, jump on a call, or help me contact my doctor or a helpline?',
  },
];

export const ReachOutScript = ({ onComplete }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const current = SCRIPTS[selectedIdx];

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(current.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaPaperPlane className="text-tealBrand-400" /> Pre-Written Reach-Out & "Tell Someone" Scripts
          </h4>
          <p className="text-xs text-slate-400">
            Finding words when depressed is exhausting. Use or copy these pre-written messages to reach someone you trust.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-[10px] font-bold text-tealBrand-400 border border-tealBrand-500/30">
          Support Scripts
        </span>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SCRIPTS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedIdx === idx
                ? 'bg-tealBrand-500 text-slate-950 border-tealBrand-400 font-extrabold shadow'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Current Script Text Card */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-tealBrand-400">
          {current.title}:
        </span>
        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 select-all">
          "{current.text}"
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs text-white transition-all flex items-center justify-center gap-2"
        >
          <FaCopy /> {copied ? 'Copied to Clipboard!' : 'One-Tap Copy Script'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }}
          className="flex-1 py-3 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isDone ? 'Marked as Sent!' : 'Mark as Done'}
        </button>
      </div>
    </div>
  );
};

