import React, { useState } from 'react';
import { FaUserFriends, FaCheckCircle, FaCopy, FaPaperPlane } from 'react-icons/fa';

const SAMPLE_SCRIPTS = [
  { label: 'Low key / No pressure', text: 'Hey, thinking of you! Hope your week is going well. No need to reply right away, just wanted to say hello.' },
  { label: 'Quick casual check-in', text: 'Hey! Got 5 mins today or this week to catch up on a quick call?' },
  { label: 'Honest & gentle', text: 'Hey, I’ve been a bit low on energy recently, but I was thinking of you and wanted to check in and see how you’re doing.' },
  { label: 'Shared small activity', text: 'Hey! Free for a quick coffee, tea, or walk around the block sometime this week?' },
];

export const SocialConnectionNudge = ({ onComplete }) => {
  const [selectedScript, setSelectedScript] = useState(SAMPLE_SCRIPTS[0].text);
  const [customMessage, setCustomMessage] = useState(SAMPLE_SCRIPTS[0].text);
  const [personName, setPersonName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSelectScript = (txt) => {
    setSelectedScript(txt);
    setCustomMessage(txt);
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(customMessage);
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
            <FaUserFriends className="text-tealBrand-400" /> Social Connection Nudge (Reach Out to One Person)
          </h4>
          <p className="text-xs text-slate-400">
            Depression naturally prompts withdrawal. Reaching out with a tiny, low-pressure message helps reverse isolation.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-[10px] font-bold text-tealBrand-400 border border-tealBrand-500/30">
          Anti-Isolation
        </span>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300">Who would you like to reach out to?</label>
        <input
          type="text"
          placeholder="e.g. Maya, Sam, my brother Alex..."
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300">Choose a low-effort message template:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_SCRIPTS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectScript(s.text)}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                selectedScript === s.text
                  ? 'bg-tealBrand-500/20 border-tealBrand-400 text-white font-semibold'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-tealBrand-400 text-[11px] mb-1">{s.label}</div>
              <p className="line-clamp-2">{s.text}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300">Message to copy & send:</label>
        <textarea
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 font-bold text-xs text-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <FaCopy /> {copied ? 'Copied Message!' : 'Copy to Clipboard'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }}
          className="flex-1 py-3 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isDone ? 'Sent & Marked Done!' : 'Mark as Done'}
        </button>
      </div>
    </div>
  );
};

