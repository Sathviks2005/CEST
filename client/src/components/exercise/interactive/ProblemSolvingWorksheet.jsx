import React, { useState } from 'react';
import { FaTasks, FaCheckCircle, FaArrowRight, FaArrowLeft, FaCopy, FaCheck, FaRedo, FaPlus, FaTrash } from 'react-icons/fa';

export const ProblemSolvingWorksheet = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [problem, setProblem] = useState('');
  const [goal, setGoal] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [chosenOptionIndex, setChosenOptionIndex] = useState(0);
  const [prosCons, setProsCons] = useState({ pro: '', con: '' });
  const [actionPlan, setActionPlan] = useState({ what: '', when: '', who: '', block: '' });
  const [reviewDate, setReviewDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const STEPS = [
    { title: 'Step 1: Define One Specific Problem', prompt: 'State one practical, specific challenge you are facing right now. Keep it narrow and concrete rather than broad.' },
    { title: 'Step 2: Set a Realistic Goal', prompt: 'What is a realistic, achievable outcome you want to reach? (e.g. "Take one step toward paying this bill", "Reach out to one friend").' },
    { title: 'Step 3: Brainstorm at Least 3 Options', prompt: 'Write down at least 3 possible ways to approach this goal without judging or filtering them yet.' },
    { title: 'Step 4: Pros & Cons & Select One', prompt: 'Evaluate your ideas and select the single most realistic option to test first.' },
    { title: 'Step 5: Make a Concrete Action Plan', prompt: 'Detail what exact step you will take, when you will do it, who could support you, and what obstacle might arise.' },
    { title: 'Step 6: Pick a Review Date', prompt: 'Choose a specific date and time to check in and see how the plan went.' },
  ];

  const handleOptionChange = (idx, val) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, '']);
  };

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

  const isCurrentStepValid = () => {
    if (currentStep === 0) return Boolean(problem.trim());
    if (currentStep === 1) return Boolean(goal.trim());
    if (currentStep === 2) return options.filter((o) => o.trim()).length >= 3;
    if (currentStep === 3) return Boolean(options[chosenOptionIndex]?.trim());
    if (currentStep === 4) return Boolean(actionPlan.what.trim() && actionPlan.when.trim());
    if (currentStep === 5) return Boolean(reviewDate);
    return true;
  };

  const handleCopy = async () => {
    const summary = `=== PROBLEM-SOLVING THERAPY WORKSHEET ===
1. Specific Problem:
${problem}

2. Realistic Goal:
${goal}

3. Brainstormed Options:
${options.map((o, i) => `  ${i + 1}. ${o}`).join('\n')}

4. Chosen Option:
${options[chosenOptionIndex] || '(None)'}
Pros: ${prosCons.pro || 'None specified'}
Cons: ${prosCons.con || 'None specified'}

5. Action Plan:
- What: ${actionPlan.what}
- When: ${actionPlan.when}
- Who could help: ${actionPlan.who || 'Self'}
- Possible obstacle & workaround: ${actionPlan.block || 'None anticipated'}

6. Review Date:
${reviewDate}
`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
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
            <FaTasks className="text-tealBrand-400" /> Problem-Solving Therapy Worksheet
          </h4>
          <p className="text-xs text-slate-400">
            Based on D'Zurilla & Nezu Problem-Solving Therapy: 6 structured steps from definition to review.
          </p>
        </div>
        <span className="text-xs font-bold text-tealBrand-400 bg-tealBrand-500/10 px-3 py-1 rounded-full border border-tealBrand-500/30 self-start sm:self-auto">
          Step {currentStep + 1} of 6
        </span>
      </div>

      {isCompleted ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-xl font-bold text-white">Action Plan Ready!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Breaking problems down and testing one solution reduces cognitive overwhelm.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-lg mx-auto space-y-3 text-xs text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Problem:</span>
              <p className="text-white font-medium">{problem}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-tealBrand-400 block">Goal:</span>
              <p className="text-white font-medium">{goal}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Chosen Strategy:</span>
              <p className="text-emerald-200 font-bold">{options[chosenOptionIndex]}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Action Details:</span>
              <p className="text-slate-300"><strong>What:</strong> {actionPlan.what}</p>
              <p className="text-slate-300"><strong>When:</strong> {actionPlan.when}</p>
              {actionPlan.who && <p className="text-slate-300"><strong>Who:</strong> {actionPlan.who}</p>}
              {actionPlan.block && <p className="text-slate-300"><strong>Backup fix:</strong> {actionPlan.block}</p>}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Scheduled Review Date:</span>
              <p className="text-amber-200 font-bold">{reviewDate}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Plan!' : 'Copy Plan to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(0);
                setIsCompleted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 inline-flex items-center gap-2"
            >
              <FaRedo /> New Problem Worksheet
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-tealBrand-300">{STEPS[currentStep].title}</h5>
            <p className="text-xs text-slate-300 leading-relaxed">{STEPS[currentStep].prompt}</p>
          </div>

          {/* STEP 1 */}
          {currentStep === 0 && (
            <textarea
              rows={3}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. I have not responded to 3 important financial letters because I feel overwhelmed..."
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
            />
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Open one letter and find out the balance due by Thursday..."
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 resize-none"
            />
          )}

          {/* STEP 3 */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Aim for quantity over perfection:</p>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-slate-500">{idx + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option #${idx + 1} (e.g. Ask a trusted friend to sit with me)`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-tealBrand-400 font-bold hover:underline inline-flex items-center gap-1 pt-1"
              >
                <FaPlus className="text-[10px]" /> Add Another Option
              </button>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-300">Select which option to try first:</p>
              <div className="space-y-2">
                {options.map((opt, idx) => opt.trim() && (
                  <div
                    key={idx}
                    onClick={() => setChosenOptionIndex(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      chosenOptionIndex === idx
                        ? 'bg-tealBrand-500/20 border-tealBrand-400 text-tealBrand-200 font-bold ring-2 ring-tealBrand-400/40'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{idx + 1}. {opt}</span>
                    <span className="text-[10px]">{chosenOptionIndex === idx ? '✓ Selected' : 'Choose'}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-emerald-400">Pros of this option:</label>
                  <input
                    type="text"
                    value={prosCons.pro}
                    onChange={(e) => setProsCons({ ...prosCons, pro: e.target.value })}
                    placeholder="e.g. Low effort, gets me unstuck..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-rose-400">Potential cons/difficulties:</label>
                  <input
                    type="text"
                    value={prosCons.con}
                    onChange={(e) => setProsCons({ ...prosCons, con: e.target.value })}
                    placeholder="e.g. May still feel anxious while opening..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 4 && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">What exact action step will you take?</label>
                <input
                  type="text"
                  value={actionPlan.what}
                  onChange={(e) => setActionPlan({ ...actionPlan, what: e.target.value })}
                  placeholder="e.g. Sit at desk, open envelope #1, write down due date..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">When will you do this?</label>
                <input
                  type="text"
                  value={actionPlan.when}
                  onChange={(e) => setActionPlan({ ...actionPlan, when: e.target.value })}
                  placeholder="e.g. Tomorrow at 10:30 AM right after morning tea..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Who could help or provide encouragement? (Optional)</label>
                <input
                  type="text"
                  value={actionPlan.who}
                  onChange={(e) => setActionPlan({ ...actionPlan, who: e.target.value })}
                  placeholder="e.g. Call partner or text sister to confirm it's done..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">What could get in the way, and what is your small fix?</label>
                <input
                  type="text"
                  value={actionPlan.block}
                  onChange={(e) => setActionPlan({ ...actionPlan, block: e.target.value })}
                  placeholder="e.g. Heart starts racing -> do 3 slow breaths and open just 1 corner..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {currentStep === 5 && (
            <div className="space-y-3 text-xs">
              <label className="text-slate-300 font-semibold block">
                Pick a specific date and time to review how it went:
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
              />
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Reviewing outcomes lets you celebrate success or adjust the strategy without self-criticism.
              </p>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-500 to-brand-600 text-white font-bold text-xs shadow-md disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
            >
              {currentStep === STEPS.length - 1 ? 'Finish Action Plan' : 'Next Step'} <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
