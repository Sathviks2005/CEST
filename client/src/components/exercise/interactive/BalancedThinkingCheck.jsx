import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaExclamationTriangle, FaArrowRight, FaArrowLeft, FaCheckCircle, FaRedo, FaShieldAlt } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

const PATTERNS = [
  { id: 'overgeneralizing', label: 'Overgeneralizing a bad outcome', desc: 'Assuming one difficult situation means everything will always go wrong.' },
  { id: 'ignoring-good', label: 'Ignoring the good and focusing on the bad', desc: 'Filtering out positive or neutral events and focusing entirely on negatives.' },
  { id: 'catastrophizing', label: 'Always expecting the worst', desc: 'Predicting the most extreme negative outcome as a certainty.' },
  { id: 'none', label: 'None of these', desc: 'A general stressful or unhelpful everyday worry.' },
];

export const BalancedThinkingCheck = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: Thought & Pattern, 2: Evidence, 3: Advice to friend, 4: Balanced view, 5: Summary
  const [thought, setThought] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0].id);
  const [evidence, setEvidence] = useState('');
  const [adviceToFriend, setAdviceToFriend] = useState('');
  const [balancedView, setBalancedView] = useState('');

  const { isReduced, safeTransition } = useMotionSafe();

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => {
        const next = prev + 1;
        if (next === 5 && onComplete) onComplete();
        return next;
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const resetAll = () => {
    setStep(1);
    setThought('');
    setSelectedPattern(PATTERNS[0].id);
    setEvidence('');
    setAdviceToFriend('');
    setBalancedView('');
  };

  const stepVariants = {
    initial: { opacity: 0, x: isReduced ? 0 : 20 },
    animate: { opacity: 1, x: 0, transition: safeTransition({ duration: 0.3, ease: 'easeOut' }) },
    exit: { opacity: 0, x: isReduced ? 0 : -20, transition: safeTransition({ duration: 0.2, ease: 'easeIn' }) },
  };

  const currentPatternObj = PATTERNS.find((p) => p.id === selectedPattern) || PATTERNS[0];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Top Mandatory Safety Note */}
      <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3">
        <FaExclamationTriangle className="text-amber-400 text-lg shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-amber-100 leading-relaxed">
            If you start to feel overwhelmed, stop and use the grounding exercise. Work on trauma memories is best done with a trained therapist.
          </p>
        </div>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-300 text-xs flex items-center gap-2.5">
        <FaShieldAlt className="text-tealBrand-400 shrink-0 text-sm" />
        <span className="font-bold">
          Use this for everyday worries, not for details of the traumatic event.
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaBrain />
            <span>Everyday Cognitive Skills</span>
          </div>
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step ? 'w-6 bg-tealBrand-400' : s < step ? 'bg-tealBrand-600' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Everyday Balanced Thinking Check
        </h3>
        <p className="text-xs text-slate-400">
          Recognize unhelpful cognitive patterns in everyday situations and formulate balanced alternatives.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Everyday Thought & Pattern */}
        {step === 1 && (
          <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-200">
                1. What everyday stressful thought are you having right now?
              </label>
              <input
                type="text"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="e.g. If I make a small mistake on this task, everything will fall apart..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Which thinking pattern does this thought fit best?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PATTERNS.map((pattern) => {
                  const isSelected = selectedPattern === pattern.id;
                  return (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setSelectedPattern(pattern.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-tealBrand-950/40 border-tealBrand-500 text-white font-semibold shadow-sm'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{pattern.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pattern.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Evidence */}
        {step === 2 && (
          <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{thought || 'My current worry'}"</span>
              <span className="block text-slate-400 mt-1">Pattern: {currentPatternObj.label}</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                What is the evidence for and against this everyday thought?
              </label>
              <p className="text-xs text-slate-400">
                Look at the objective facts. What parts are confirmed reality vs anxious assumptions?
              </p>
              <textarea
                rows={3}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g. For: I am under a deadline. Against: Mistakes can be corrected and usually do not ruin the entire project..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: Advice to Friend */}
        {step === 3 && (
          <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{thought || 'My current worry'}"</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                What would you say to a friend who expressed this worry?
              </label>
              <p className="text-xs text-slate-400">
                How would you support them with kindness and realistic grounding?
              </p>
              <textarea
                rows={3}
                value={adviceToFriend}
                onChange={(e) => setAdviceToFriend(e.target.value)}
                placeholder="e.g. I would tell them: Take a breath. One step at a time. You don't have to be perfect to do a good job..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: Balanced View */}
        {step === 4 && (
          <motion.div key="step-4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{thought || 'My current worry'}"</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                Formulate a more balanced, grounded view
              </label>
              <p className="text-xs text-slate-400">
                Write an alternative statement that is factual, realistic, and fair to yourself.
              </p>
              <textarea
                rows={3}
                value={balancedView}
                onChange={(e) => setBalancedView(e.target.value)}
                placeholder="e.g. This is a challenging moment, but I can handle it step by step. A minor flaw does not define my capability."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 5: Summary Card */}
        {step === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, scale: isReduced ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: safeTransition({ duration: 0.4 }) }}
            className="space-y-5"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-tealBrand-950/60 via-slate-800/90 to-slate-900 border border-tealBrand-500/40 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-tealBrand-400">
                  Balanced Perspective Summary
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {currentPatternObj.label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs">
                  <span className="text-rose-400 font-bold uppercase text-[10px] block mb-0.5">Initial Worry:</span>
                  <p className="text-slate-300 italic">"{thought || 'Everyday stressor'}"</p>
                </div>

                <div className="p-4 rounded-xl bg-tealBrand-900/30 border border-tealBrand-500/40 space-y-1">
                  <span className="text-tealBrand-300 font-extrabold uppercase text-[10px] tracking-wider">
                    Your Grounded Balanced View:
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    "{balancedView || 'This situation is manageable one step at a time, and I can respond with patience and care.'}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const summaryText = `=== BALANCED THINKING CHECK ===\nInitial Worry: "${thought}"\nPattern: ${currentPatternObj.label}\nEvidence Examined: ${evidence}\nAdvice to Friend: ${adviceToFriend}\nBalanced View: "${balancedView}"\n`;
                  if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(summaryText);
                    alert('Copied balanced thought to clipboard!');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-xs font-bold text-white transition-all"
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700"
              >
                <FaRedo className="text-[10px]" /> Check Another Thought
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 5 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700"
            >
              <FaArrowLeft className="text-[10px]" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-xs font-extrabold text-white shadow-md transition-all"
          >
            {step === 4 ? 'View Summary' : 'Next Step'} <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
};
