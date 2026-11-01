import React, { useState } from 'react';
import { FaEye, FaHandPaper, FaVolumeUp, FaSmog, FaUtensils, FaCheckCircle, FaArrowRight, FaArrowLeft, FaCopy, FaCheck } from 'react-icons/fa';

export const GroundingForm = ({ onComplete }) => {
  const STEPS = [
    { count: 5, sense: 'See', icon: FaEye, prompt: 'Notice 5 things you can see around you right now with your eyes open (e.g. lamp, desk, window):', placeholder: 'Thing ' },
    { count: 4, sense: 'Touch', icon: FaHandPaper, prompt: 'Notice 4 things you can physically touch or feel (e.g. chair fabric, feet on floor, cool air):', placeholder: 'Sensation ' },
    { count: 3, sense: 'Hear', icon: FaVolumeUp, prompt: 'Notice 3 distinct sounds in your environment (e.g. computer hum, birds, distant traffic):', placeholder: 'Sound ' },
    { count: 2, sense: 'Smell', icon: FaSmog, prompt: 'Notice 2 scents or smells you can detect right now (e.g. soap, coffee, fresh air):', placeholder: 'Scent ' },
    { count: 1, sense: 'Taste', icon: FaUtensils, prompt: 'Notice 1 taste present in your mouth (or a comforting taste you recall):', placeholder: 'Taste ' },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    0: ['', '', '', '', ''],
    1: ['', '', '', ''],
    2: ['', '', ''],
    3: ['', ''],
    4: [''],
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const step = STEPS[currentStepIndex];

  const handleInputChange = (itemIdx, value) => {
    setFormData((prev) => {
      const stepItems = [...prev[currentStepIndex]];
      stepItems[itemIdx] = value;
      return { ...prev, [currentStepIndex]: stepItems };
    });
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCopy = async () => {
    const summaryLines = [
      '=== 5-4-3-2-1 GROUNDING SUMMARY ===',
      '',
      ...STEPS.map((s, idx) => {
        const items = formData[idx].filter((v) => v.trim().length > 0);
        return `${s.count} Things You ${s.sense}: ${items.length > 0 ? items.join(', ') : '(Noticed in mind/out loud)'}`;
      }),
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryLines);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  };

  const StepIcon = step.icon;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-tealBrand-400 uppercase tracking-wider">
          <StepIcon className="text-base" />
          <span>Step {currentStepIndex + 1} of 5: {step.count} Things You {step.sense}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-5 h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-tealBrand-400 w-8'
                  : idx < currentStepIndex
                  ? 'bg-brand-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {isCompleted ? (
        <div className="py-8 text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">5-4-3-2-1 Grounding Completed!</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            You walked through all 5 senses with eyes open. Notice how your body is physically present in this room right now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Summary!' : 'Copy Summary to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCompleted(false);
                setCurrentStepIndex(0);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
            >
              Practice Again
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-200 font-semibold">{step.prompt}</p>
            <p className="text-xs text-tealBrand-400 font-medium">
              You can say answers out loud or in your head (typing is optional).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData[currentStepIndex].map((val, idx) => (
              <div key={idx} className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-500">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  placeholder={`${step.placeholder} #${idx + 1} (optional)`}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:text-white disabled:opacity-30 inline-flex items-center gap-1.5"
            >
              <FaArrowLeft className="text-[10px]" /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-500 to-brand-600 hover:from-tealBrand-600 hover:to-brand-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5 transition-all"
            >
              {currentStepIndex === STEPS.length - 1 ? 'Finish Grounding' : 'Next Sense'} <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
