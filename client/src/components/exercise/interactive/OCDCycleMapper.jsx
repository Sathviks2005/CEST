import React, { useState } from 'react';
import { FaSyncAlt, FaCheckCircle, FaCopy, FaCheck, FaArrowRight, FaRedo, FaInfoCircle } from 'react-icons/fa';
import { HabituationCurve } from '../illustrations/HabituationCurve';

export const OCDCycleMapper = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState('cycle'); // 'cycle' | 'habituation'

  const [trigger, setTrigger] = useState('Touching a public doorknob / handrail');
  const [obsession, setObsession] = useState('“My hands are contaminated and I will get severely ill”');
  const [anxiety, setAnxiety] = useState('Racing heartbeat, acute disgust, feeling unclean');
  const [compulsion, setCompulsion] = useState('Washing hands 4 times with scalding water');
  const [relief, setRelief] = useState('Brief sense of safety lasting 5 minutes before doubt returns');

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `=== OCD CYCLE FUNCTIONAL ANALYSIS ===
1. Trigger: ${trigger}
2. Obsession (Intrusive Thought): ${obsession}
3. Anxiety / Discomfort: ${anxiety}
4. Compulsion (Behavior / Mental Ritual): ${compulsion}
5. Short-Term Relief: ${relief}

Clinical Insight:
Performing compulsions grants temporary relief, but it reinforces the belief that the obsession was dangerous. Resisting the ritual allows anxiety to habituate naturally without reinforcing the cycle.
`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        if (onComplete) onComplete();
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
            <FaSyncAlt className="text-tealBrand-400" /> OCD Cycle Mapper & Habituation
          </h4>
          <p className="text-xs text-slate-400">
            Cognitive-behavioral functional analysis: understand how short-term relief maintains the cycle.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cycle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cycle'
                ? 'bg-tealBrand-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            1. The 5-Node Cycle
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('habituation');
              if (onComplete) onComplete();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'habituation'
                ? 'bg-tealBrand-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            2. Natural Habituation
          </button>
        </div>
      </div>

      {activeTab === 'cycle' ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <FaInfoCircle className="text-amber-400 text-base shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Fill in your own example into the 5 stages. Notice how Step 5 (brief relief) feeds right back into Step 1.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Node 1: Trigger */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-tealBrand-400 block">
                1. External Trigger or Internal Sensation:
              </span>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            {/* Node 2: Obsession */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">
                2. Intrusive Thought / Obsession ("What if?"):
              </span>
              <input
                type="text"
                value={obsession}
                onChange={(e) => setObsession(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Node 3: Anxiety */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                3. Physical Anxiety / Urge / Discomfort:
              </span>
              <input
                type="text"
                value={anxiety}
                onChange={(e) => setAnxiety(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Node 4: Compulsion */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                4. Compulsion / Ritual (Physical action or mental checking):
              </span>
              <input
                type="text"
                value={compulsion}
                onChange={(e) => setCompulsion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Node 5: Short-term relief */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                5. Temporary Relief:
              </span>
              <input
                type="text"
                value={relief}
                onChange={(e) => setRelief(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Loop feedback banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
            <span className="text-xl">🔁</span>
            <p className="text-xs font-bold text-rose-300">
              "Because relief is temporary, the brain falsely credits the compulsion for safety—strengthening the loop."
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Analysis!' : 'Copy Functional Analysis'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('habituation');
                if (onComplete) onComplete();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-1.5"
            >
              View Natural Habituation Diagram <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <HabituationCurve />
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-3 leading-relaxed">
            <h5 className="text-sm font-bold text-tealBrand-300">
              What Happens When the Compulsion is Delayed or Resisted?
            </h5>
            <p className="text-slate-300">
              When you delay or resist performing the ritual, anxiety and distress initially rise sharply (the "peak crest").
            </p>
            <p className="text-slate-300">
              However, human physiology cannot maintain acute distress indefinitely. Over time, your nervous system naturally habituates—discomfort peaks and falls back down on its own without needing the ritual.
            </p>
            <p className="text-slate-400 italic">
              This natural decay is the scientific mechanism behind Exposure and Response Prevention (ERP).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('cycle')}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold"
            >
              Back to 5-Node Cycle
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Analysis!' : 'Copy Summary to Clipboard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
