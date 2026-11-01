import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaHeartbeat, FaHandsHelping, FaUserMd, FaShieldAlt } from 'react-icons/fa';
import { useMotionSafe, accordion } from './motionPresets';
import { WindowOfTolerance } from '../illustrations/WindowOfTolerance';

const SECTIONS = [
  {
    id: 'common-reactions',
    title: 'Stress reactions after severe stress are natural human survival responses',
    icon: FaHeartbeat,
    bullets: [
      'Going through or witnessing a deeply threatening or terrifying event pushes the body and nervous system into survival mode.',
      'In the weeks following such an event, experiencing emotional distress, tension, and disruption is a natural, protective nervous system response.',
      'For many people, these acute stress reactions gradually subside over time as safety and routine are restored.',
      'Experiencing these reactions does not mean you are weak or failing; it reflects your survival biology responding to an extraordinary event.',
    ],
  },
  {
    id: 'window-of-tolerance',
    title: 'The Window of Tolerance (Teaching Model)',
    icon: FaBookOpen,
    bullets: [
      'Top Zone (Hyperarousal): Feeling jumpy, panicky, racing thoughts, or sensory overload. The body feels on high alert.',
      'Middle Zone (Optimal Window): Feeling grounded, emotionally steady, and able to think clearly and connect with others.',
      'Bottom Zone (Hypoarousal): Feeling numb, disconnected, exhausted, or emotionally shut down.',
      'Grounding skills (external sensory focus, slow breathing) help guide your nervous system back into the middle window.',
    ],
  },
  {
    id: 'what-helps',
    title: 'What helps: Steadiness & daily safety',
    icon: FaHandsHelping,
    bullets: [
      'External sensory grounding: Open-eyes 5-4-3-2-1 grounding to remind your brain you are safe in the present room.',
      'Predictable daily rhythm: Regular sleep, nutritious meals, and gentle movement anchor your body.',
      'Support from people you trust: Spending time with supportive people without any obligation to describe the event.',
      'Professional care: Trauma-focused psychological treatments (CPT, Prolonged Exposure, EMDR) are highly effective when delivered by trained clinicians.',
    ],
  },
  {
    id: 'when-to-seek-help',
    title: 'When to connect with clinical trauma support',
    icon: FaUserMd,
    bullets: [
      'The stress reactions persist for several weeks or months without easing.',
      'Reactions intensify or interfere with work, studies, and relationships.',
      'Nightmares, avoidance, or startle reactions feel overwhelming or unmanageable on your own.',
      'Trauma-focused therapy with a licensed specialist is the gold standard for full recovery.',
    ],
  },
];

export const TraumaEducationCard = ({ isSevere = false, onComplete }) => {
  const [openSectionId, setOpenSectionId] = useState('window-of-tolerance');
  const { isReduced, safeTransition } = useMotionSafe();

  const toggleSection = (id) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Top Safety Note */}
      <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3">
        <FaExclamationTriangle className="text-amber-400 text-lg shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-amber-100 leading-relaxed">
            {isSevere
              ? 'These tools are for gentle stabilization and steadiness between sessions. Trauma-focused processing (CPT, PE, EMDR) is always done with a trained therapist.'
              : 'If you start to feel overwhelmed, stop and use the grounding exercise. Work on trauma memories is best done with a trained therapist.'}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
          <FaBookOpen />
          <span>Trauma Psychoeducation</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Understanding Stress & Trauma Reactions
        </h3>
        <p className="text-xs text-slate-400">
          Neutral, evidence-based education on survival biology and the Window of Tolerance.
        </p>
      </div>

      {/* Embedded Window of Tolerance Teaching Diagram */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
        <WindowOfTolerance />
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {SECTIONS.map((sec) => {
          const isOpen = openSectionId === sec.id;
          const Icon = sec.icon;

          return (
            <div
              key={sec.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? 'bg-slate-800/90 border-tealBrand-500/50 shadow-md'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isOpen
                        ? 'bg-tealBrand-500/20 text-tealBrand-300 border border-tealBrand-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Icon />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{sec.title}</h4>
                </div>

                <div className="text-slate-400 text-sm">
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="content"
                    variants={accordion}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={safeTransition(accordion.visible.transition)}
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-slate-700/50 space-y-2.5">
                      {sec.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-tealBrand-400 shrink-0 mt-2" />
                          <p className="leading-relaxed">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
