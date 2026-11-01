import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaExclamationTriangle, FaCopy, FaCheck, FaHeart, FaUserFriends, FaUserMd, FaPhoneAlt } from 'react-icons/fa';
import { useMotionSafe, staggerList, fadeSlideUp } from './motionPresets';

const PREFILLED_CRISIS_REMINDER =
  'If I feel unsafe or in crisis, I will contact my local emergency number or a crisis helpline right now.';

export const CopingSupportPlan = ({ variant = 'ptsd', onComplete }) => {
  const isDepression = variant === 'depression';

  const [warningSigns, setWarningSigns] = useState('');
  const [calmingStrategies, setCalmingStrategies] = useState('');
  const [supportPeople, setSupportPeople] = useState('');
  const [professionalContact, setProfessionalContact] = useState('');
  const [copied, setCopied] = useState(false);

  const { isReduced } = useMotionSafe();

  const handleCopy = async () => {
    const textToCopy = `=== MY COPING & SUPPORT PLAN (${isDepression ? 'DEPRESSION' : 'PTSD'} VARIANT) ===

1. Early Warning Signs:
${warningSigns.trim() || '(None specified)'}

2. Things That Help Me Calm Down & Re-anchor:
${calmingStrategies.trim() || '(None specified)'}

3. Trusted People I Can Contact:
${supportPeople.trim() || '(None specified)'}

4. Professional or Clinic Contact:
${professionalContact.trim() || '(None specified)'}

5. Safety Reminder:
${PREFILLED_CRISIS_REMINDER}
`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      if (onComplete) onComplete();
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const warningPlaceholder = isDepression
    ? 'e.g. Staying in bed all morning, skipping meals, withdrawing from messages, feeling heavy fatigue, thoughts of being a burden...'
    : 'e.g. Muscle tightness in neck, jumpiness, startle reaction to sudden noises, withdrawing from crowds, restless sleep...';

  const calmingPlaceholder = isDepression
    ? 'e.g. Stepping outside for 5 min of daylight, drinking warm tea, listening to an upbeat playlist, gentle 5-min walk...'
    : 'e.g. 5-4-3-2-1 sensory grounding, 4/6 slow breathing, washing hands with cool water, wrapping in a heavy blanket...';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Top Mandatory Safety Note */}
      <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3">
        <FaExclamationTriangle className="text-amber-400 text-lg shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-amber-100 leading-relaxed">
            {isDepression
              ? 'A personalized coping plan helps you identify low-momentum signs early and take low-demand steps toward safety.'
              : 'If you start to feel overwhelmed, stop and use the grounding exercise. Work on trauma memories is best done with a trained therapist.'}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaShieldAlt />
            <span>{isDepression ? 'Depression Coping & Wellness Plan' : 'Personal Coping & Support Plan'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {isDepression ? 'Depression Coping & Support Plan' : 'Personal Coping & Support Plan'}
          </h3>
          <p className="text-xs text-slate-400">
            Based on Stanley–Brown safety and coping planning: document warning signs, calming steps, and trusted support.
          </p>
        </div>

        {/* Copy Plan Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <FaCheck className="text-emerald-300" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <FaCopy />
              <span>Copy Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Fill-in Plan Fields */}
      <motion.div
        variants={staggerList}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Section 1: Warning signs */}
        <motion.div variants={fadeSlideUp} className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <FaExclamationTriangle />
            <span>1. Early Warning Signs ({isDepression ? 'Depression' : 'Trauma/Stress'})</span>
          </div>
          <p className="text-xs text-slate-400">
            {isDepression
              ? 'Subtle shifts in energy, withdrawal, or thoughts that indicate low mood is worsening.'
              : 'Physical sensations, jumpiness, or emotional shifts that signal trauma stress is building up.'}
          </p>
          <textarea
            rows={2}
            value={warningSigns}
            onChange={(e) => setWarningSigns(e.target.value)}
            placeholder={warningPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-1"
          />
        </motion.div>

        {/* Section 2: Calming strategies */}
        <motion.div variants={fadeSlideUp} className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaHeart />
            <span>2. Things That Help Me Calm Down & Re-Anchor</span>
          </div>
          <p className="text-xs text-slate-400">
            Grounding exercises, sensory comforts, soothing activities, or calming spaces.
          </p>
          <textarea
            rows={2}
            value={calmingStrategies}
            onChange={(e) => setCalmingStrategies(e.target.value)}
            placeholder={calmingPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-1"
          />
        </motion.div>

        {/* Section 3: People I can contact */}
        <motion.div variants={fadeSlideUp} className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <FaUserFriends />
            <span>3. People I Can Contact (Name + How to Reach)</span>
          </div>
          <p className="text-xs text-slate-400">
            Friends, family members, or peers who listen without judgment.
          </p>
          <textarea
            rows={2}
            value={supportPeople}
            onChange={(e) => setSupportPeople(e.target.value)}
            placeholder="e.g. Maya (Partner) - phone/text; Alex (Friend) - phone..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-1"
          />
        </motion.div>

        {/* Section 4: Professional or clinic */}
        <motion.div variants={fadeSlideUp} className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaUserMd />
            <span>4. Professional or Clinic I Can Contact</span>
          </div>
          <p className="text-xs text-slate-400">
            Your therapist, psychiatrist, primary care doctor, or local clinic.
          </p>
          <textarea
            rows={2}
            value={professionalContact}
            onChange={(e) => setProfessionalContact(e.target.value)}
            placeholder="e.g. Dr. Patel (Therapist) or Community Mental Health Clinic..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500 mt-1"
          />
        </motion.div>

        {/* Section 5: Prefilled Crisis Reminder */}
        <motion.div variants={fadeSlideUp} className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <FaPhoneAlt />
            <span>5. Emergency & Crisis Reminder</span>
          </div>
          <p className="text-sm font-bold text-rose-100 leading-relaxed">
            {PREFILLED_CRISIS_REMINDER}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Save local crisis and emergency numbers in your phone contacts for rapid access whenever needed.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
