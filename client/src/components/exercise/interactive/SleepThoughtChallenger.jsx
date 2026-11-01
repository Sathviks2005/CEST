import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaArrowRight, FaArrowLeft, FaCheckCircle, FaRedo, FaLightbulb, FaCommentAlt } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

const PRESET_THOUGHTS = [
  'I must get 8 hours or tomorrow will be a disaster',
  "If I don't sleep soon I won't cope",
  "I'll never sleep normally again",
  "My body can't sleep without help",
];

export const SleepThoughtChallenger = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: Choose/Enter thought, 2: Evidence, 3: Advice to friend, 4: Balanced thought, 5: Summary
  const [selectedThought, setSelectedThought] = useState(PRESET_THOUGHTS[0]);
  const [customThought, setCustomThought] = useState('');
  const [evidenceForAgainst, setEvidenceForAgainst] = useState('');
  const [adviceToFriend, setAdviceToFriend] = useState('');
  const [balancedThought, setBalancedThought] = useState('');

  const { isReduced, safeTransition } = useMotionSafe();

  const activeThought = customThought.trim() ? customThought.trim() : selectedThought;

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
    setSelectedThought(PRESET_THOUGHTS[0]);
    setCustomThought('');
    setEvidenceForAgainst('');
    setAdviceToFriend('');
    setBalancedThought('');
  };

  const stepVariants = {
    initial: { opacity: 0, x: isReduced ? 0 : 20 },
    animate: { opacity: 1, x: 0, transition: safeTransition({ duration: 0.3, ease: 'easeOut' }) },
    exit: { opacity: 0, x: isReduced ? 0 : -20, transition: safeTransition({ duration: 0.2, ease: 'easeIn' }) },
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaBrain />
            <span>CBT-I Cognitive Restructuring</span>
          </div>
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-tealBrand-400'
                    : s < step
                    ? 'bg-tealBrand-600'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Sleep Thought Challenger
        </h3>
        <p className="text-xs text-slate-400">
          Reframe catastrophic assumptions about lost sleep into realistic, calming thoughts.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Select or Write Thought */}
        {step === 1 && (
          <motion.div key="step-1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200">
              Step 1: Pick an unhelpful thought you often have when struggling to sleep
            </h4>
            <div className="space-y-2">
              {PRESET_THOUGHTS.map((thought) => (
                <button
                  key={thought}
                  type="button"
                  onClick={() => {
                    setSelectedThought(thought);
                    setCustomThought('');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${
                    selectedThought === thought && !customThought
                      ? 'bg-tealBrand-950/40 border-tealBrand-500 text-white shadow-sm font-semibold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <span>"{thought}"</span>
                  {selectedThought === thought && !customThought && (
                    <FaCheckCircle className="text-tealBrand-400 text-sm shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-xs font-semibold text-slate-400">
                Or write your own sleep thought:
              </label>
              <input
                type="text"
                value={customThought}
                onChange={(e) => setCustomThought(e.target.value)}
                placeholder="e.g. If I'm awake right now, my whole week is ruined..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 2: Evidence For & Against */}
        {step === 2 && (
          <motion.div key="step-2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{activeThought}"</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                Step 2: What is the real evidence for and against this thought?
              </label>
              <p className="text-xs text-slate-400">
                Have there been days where you slept poorly but still managed your essential tasks? Is the outcome truly guaranteed?
              </p>
              <textarea
                rows={3}
                value={evidenceForAgainst}
                onChange={(e) => setEvidenceForAgainst(e.target.value)}
                placeholder="e.g. Against: I've had rough nights before and I still got through my day. My body knows how to function even when tired..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: What would you say to a friend? */}
        {step === 3 && (
          <motion.div key="step-3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{activeThought}"</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                Step 3: What would you say to a close friend having this exact thought?
              </label>
              <p className="text-xs text-slate-400">
                We are usually kinder and more realistic with others than with ourselves in the middle of the night.
              </p>
              <textarea
                rows={3}
                value={adviceToFriend}
                onChange={(e) => setAdviceToFriend(e.target.value)}
                placeholder="e.g. I would tell them: Resting quietly in bed still restores energy. Don't put pressure on yourself to force sleep..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: A more balanced thought */}
        {step === 4 && (
          <motion.div key="step-4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold block uppercase mb-0.5">Examining Thought:</span>
              <span className="text-tealBrand-300 font-semibold italic">"{activeThought}"</span>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-200">
                Step 4: Now, draft a more balanced, supportive thought
              </label>
              <p className="text-xs text-slate-400">
                Combine the facts and your supportive advice into a realistic reframe you can repeat when you feel anxious at bedtime.
              </p>
              <textarea
                rows={3}
                value={balancedThought}
                onChange={(e) => setBalancedThought(e.target.value)}
                placeholder="e.g. Even if I sleep less tonight, my body will cope tomorrow. Resting quietly is helpful, and sleep will come when I relax."
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
              <div className="flex items-center gap-2 text-tealBrand-400 font-bold text-xs uppercase tracking-wider">
                <FaLightbulb />
                <span>Balanced Sleep Reframe Summary</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs space-y-0.5">
                  <span className="text-rose-400 font-bold uppercase text-[10px]">Unhelpful Automatic Thought:</span>
                  <p className="text-slate-300 italic">"{activeThought}"</p>
                </div>

                <div className="p-4 rounded-xl bg-tealBrand-900/30 border border-tealBrand-500/40 space-y-1">
                  <span className="text-tealBrand-300 font-extrabold uppercase text-[10px] tracking-wider">
                    Your Balanced & Realistic Reframe:
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    "{balancedThought || 'Even if I sleep less tonight, my body will cope. Resting quietly restores energy, and sleep comes naturally when I ease pressure.'}"
                  </p>
                </div>

                {(evidenceForAgainst || adviceToFriend) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {evidenceForAgainst && (
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                        <strong className="text-slate-400 block mb-0.5">Evidence Considered:</strong>
                        <p className="text-slate-300">{evidenceForAgainst}</p>
                      </div>
                    )}
                    {adviceToFriend && (
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                        <strong className="text-slate-400 block mb-0.5">Compassionate Perspective:</strong>
                        <p className="text-slate-300">{adviceToFriend}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const summaryText = `=== SLEEP THOUGHT CHALLENGER ===\nAutomatic Sleep Belief: "${activeThought}"\nEvidence Examined: ${evidenceForAgainst}\nAdvice to Friend: ${adviceToFriend}\nBalanced Reframe: "${balancedThought}"\n`;
                  if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(summaryText);
                    alert('Copied sleep reframe to clipboard!');
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
                <FaRedo className="text-[10px]" /> Challenge Another Thought
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
