import React, { useState } from 'react';
import { FaEdit, FaCheckCircle, FaLightbulb, FaArrowRight, FaArrowLeft, FaRedo, FaCopy, FaCheck } from 'react-icons/fa';
import { MoodThermometer } from '../illustrations/MoodThermometer';

export const ThoughtRecordForm = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    situation: '',
    mood: '',
    moodIntensityBefore: 80,
    automaticThought: '',
    beliefBefore: 85,
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',
    beliefAfter: 40,
    moodIntensityAfter: 35,
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const STEPS = [
    {
      title: 'Step 1: The Situation',
      prompt: 'Describe the specific event, trigger, or situation that led to distress (Who, what, when, where?).',
      key: 'situation',
      type: 'text',
      placeholder: 'e.g. Received an urgent email from my manager requesting a project review...',
    },
    {
      title: 'Step 2: Mood & Initial Intensity',
      prompt: 'What emotion(s) did you feel, and how intense was it (0–100%)?',
      key: 'mood',
      type: 'mood',
      placeholder: 'e.g. Anxious, overwhelmed, discouraged...',
    },
    {
      title: 'Step 3: Automatic Thought & Belief',
      prompt: 'What negative automatic thought went through your mind? How strongly did you believe it (0–100%)?',
      key: 'automaticThought',
      type: 'thought',
      placeholder: 'e.g. "I am definitely going to get fired and fail everyone"...',
    },
    {
      title: 'Step 4: Evidence FOR the Thought',
      prompt: 'What objective facts support this thought? (Focus strictly on concrete evidence, not feelings).',
      key: 'evidenceFor',
      type: 'text',
      placeholder: 'e.g. The project was submitted 2 hours late...',
    },
    {
      title: 'Step 5: Evidence AGAINST the Thought',
      prompt: 'What factual evidence contradicts or weakens this thought? What would an objective observer see?',
      key: 'evidenceAgainst',
      type: 'text',
      placeholder: 'e.g. My previous performance review was positive; my manager often asks for reviews as standard procedure...',
    },
    {
      title: 'Step 6: Balanced Thought & Belief',
      prompt: 'Formulate a realistic, balanced perspective based on all the facts. How much do you believe it (0–100%)?',
      key: 'balancedThought',
      type: 'balanced',
      placeholder: 'e.g. A review is a routine step to improve work, not an indicator of failure. I can address feedback constructively...',
    },
    {
      title: 'Step 7: Re-Rate Your Mood',
      prompt: 'Reflect on the situation now with the balanced thought in mind. How intense is your distress now (0–100%)?',
      key: 'moodIntensityAfter',
      type: 'rerate',
    },
  ];

  const stepDef = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const resetForm = () => {
    setFormData({
      situation: '',
      mood: '',
      moodIntensityBefore: 80,
      automaticThought: '',
      beliefBefore: 85,
      evidenceFor: '',
      evidenceAgainst: '',
      balancedThought: '',
      beliefAfter: 40,
      moodIntensityAfter: 35,
    });
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const handleCopy = async () => {
    const summaryText = `=== 7-COLUMN CBT THOUGHT RECORD ===
1. Situation:
${formData.situation || '(None)'}

2. Initial Mood:
${formData.mood || 'Distressed'} (${formData.moodIntensityBefore}%)

3. Automatic Thought:
"${formData.automaticThought}" (Belief: ${formData.beliefBefore}%)

4. Evidence FOR:
${formData.evidenceFor || '(None)'}

5. Evidence AGAINST:
${formData.evidenceAgainst || '(None)'}

6. Balanced Thought:
"${formData.balancedThought}" (Belief: ${formData.beliefAfter}%)

7. Re-rated Mood Intensity:
${formData.moodIntensityAfter}% (Shift from ${formData.moodIntensityBefore}% to ${formData.moodIntensityAfter}%)
`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write error', err);
    }
  };

  const isCurrentStepValid = () => {
    if (stepDef.type === 'text') return Boolean(formData[stepDef.key]?.trim());
    if (stepDef.type === 'mood') return Boolean(formData.mood?.trim());
    if (stepDef.type === 'thought') return Boolean(formData.automaticThought?.trim());
    if (stepDef.type === 'balanced') return Boolean(formData.balancedThought?.trim());
    return true;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaEdit className="text-tealBrand-400" /> 7-Column Thought Record
          </h4>
          <p className="text-xs text-slate-400">
            Beck & Greenberger-Padesky standard format for systematic cognitive restructuring.
          </p>
        </div>
        <span className="text-xs font-bold text-tealBrand-400 bg-tealBrand-500/10 px-3 py-1 rounded-full border border-tealBrand-500/30 self-start sm:self-auto">
          Step {currentStep + 1} of 7
        </span>
      </div>

      {isCompleted ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-xl font-bold text-white">Thought Record Completed</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Weighing factual evidence weakens distorted automatic thoughts and restores emotional equilibrium.
            </p>
          </div>

          {/* Before / After Mood Thermometer Visual */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <MoodThermometer
              before={formData.moodIntensityBefore}
              after={formData.moodIntensityAfter}
              label={`Distress shifted from ${formData.moodIntensityBefore}% to ${formData.moodIntensityAfter}%`}
            />
          </div>

          {/* Columns Summary */}
          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                1. Situation:
              </span>
              <p className="text-slate-200">{formData.situation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50">
              <span className="font-bold text-rose-400 uppercase tracking-wide text-[10px] block mb-1">
                2 & 3. Automatic Thought ({formData.mood} · Belief: {formData.beliefBefore}%):
              </span>
              <p className="text-rose-200 italic font-semibold">"{formData.automaticThought}"</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block mb-1">
                  4. Evidence For:
                </span>
                <p className="text-slate-300">{formData.evidenceFor || 'None noted'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="font-bold text-tealBrand-400 uppercase tracking-wide text-[10px] block mb-1">
                  5. Evidence Against:
                </span>
                <p className="text-slate-300">{formData.evidenceAgainst || 'None noted'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span className="font-bold text-emerald-400 uppercase tracking-wide text-[10px] block mb-1">
                6. Balanced Thought (Belief: {formData.beliefAfter}%):
              </span>
              <p className="text-emerald-200 font-bold">{formData.balancedThought}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Record to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
            >
              <FaRedo /> New Thought Record
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-tealBrand-300">{stepDef.title}</h5>
            <p className="text-xs text-slate-300 leading-relaxed">{stepDef.prompt}</p>
          </div>

          {stepDef.type === 'text' && (
            <textarea
              rows={3}
              value={formData[stepDef.key]}
              onChange={(e) => setFormData({ ...formData, [stepDef.key]: e.target.value })}
              placeholder={stepDef.placeholder}
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 transition-all resize-none"
            />
          )}

          {stepDef.type === 'mood' && (
            <div className="space-y-4">
              <input
                type="text"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                placeholder={stepDef.placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                  <span>Initial Mood Intensity:</span>
                  <span className="text-rose-400 font-bold">{formData.moodIntensityBefore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.moodIntensityBefore}
                  onChange={(e) => setFormData({ ...formData, moodIntensityBefore: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          )}

          {stepDef.type === 'thought' && (
            <div className="space-y-4">
              <textarea
                rows={3}
                value={formData.automaticThought}
                onChange={(e) => setFormData({ ...formData, automaticThought: e.target.value })}
                placeholder={stepDef.placeholder}
                className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
              />
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                  <span>How much do you believe this thought?</span>
                  <span className="text-brand-400 font-bold">{formData.beliefBefore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.beliefBefore}
                  onChange={(e) => setFormData({ ...formData, beliefBefore: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          )}

          {stepDef.type === 'balanced' && (
            <div className="space-y-4">
              <textarea
                rows={3}
                value={formData.balancedThought}
                onChange={(e) => setFormData({ ...formData, balancedThought: e.target.value })}
                placeholder={stepDef.placeholder}
                className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
              />
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                  <span>How much do you believe this balanced thought?</span>
                  <span className="text-tealBrand-400 font-bold">{formData.beliefAfter}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.beliefAfter}
                  onChange={(e) => setFormData({ ...formData, beliefAfter: Number(e.target.value) })}
                  className="w-full accent-tealBrand-500"
                />
              </div>
            </div>
          )}

          {stepDef.type === 'rerate' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-center">
              <p className="text-xs text-slate-300">
                Notice how weighing the evidence altered the emotional intensity:
              </p>
              <div className="space-y-2 max-w-sm mx-auto">
                <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                  <span>Re-rated Mood Distress:</span>
                  <span className="text-tealBrand-400 font-bold text-base">{formData.moodIntensityAfter}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.moodIntensityAfter}
                  onChange={(e) => setFormData({ ...formData, moodIntensityAfter: Number(e.target.value) })}
                  className="w-full accent-tealBrand-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:text-white disabled:opacity-30 inline-flex items-center gap-1.5"
            >
              <FaArrowLeft className="text-[10px]" /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-500 to-brand-600 hover:from-tealBrand-600 hover:to-brand-700 text-white font-bold text-xs shadow-md disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
            >
              {currentStep === STEPS.length - 1 ? (
                <>
                  <FaLightbulb /> Complete Record
                </>
              ) : (
                <>
                  Next Step <FaArrowRight className="text-[10px]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
