import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaChevronDown, FaChevronUp, FaHandsHelping, FaHeartbeat, FaUserMd, FaSmile } from 'react-icons/fa';
import { useMotionSafe, accordion } from './motionPresets';

import { CycleLoop } from '../illustrations/CycleLoop';

const SECTIONS = [
  {
    id: 'what-are-obsessions-compulsions',
    title: 'What are obsessions and compulsions?',
    icon: FaBookOpen,
    bullets: [
      'Obsessions are unwanted, intrusive, and distressing thoughts, images, or urges that repeatedly enter your mind and cause significant anxiety.',
      'Compulsions are repetitive behaviors (like washing, checking, arranging) or mental acts (like counting, repeating phrases) you feel driven to perform to ease distress or prevent a feared event, even when you know they are excessive.',
      'Obsessions differ fundamentally from everyday worries: they are intrusive, feel out of character, and cause intense distress rather than representing real-life problem solving.',
    ],
  },
  {
    id: 'common-and-treatable',
    title: 'OCD is common and treatable',
    icon: FaHeartbeat,
    bullets: [
      'Obsessive-Compulsive Disorder affects millions of people across all backgrounds and age groups.',
      'You are not alone, and experiencing these symptoms is not a flaw or weakness.',
      'While treatment may not eliminate every intrusive thought permanently, evidence-based care can bring symptoms under effective, manageable control and dramatically improve quality of life.',
    ],
  },
  {
    id: 'what-helps',
    title: 'What helps',
    icon: FaUserMd,
    bullets: [
      'Specialized psychotherapy: Cognitive Behavioral Therapy (CBT), specifically Exposure and Response Prevention (ERP), conducted with a trained mental health professional is the gold-standard psychological treatment.',
      'Medication options: Certain prescribed medications can help balance brain chemistry to reduce symptom severity; if you take medication, never stop or alter doses without consulting your doctor.',
      'Healthy lifestyle habits: Consistent relaxation, regular physical activity, balanced meals, adequate sleep, and joining peer support groups foster resilience.',
    ],
  },
  {
    id: 'keep-doing-what-matters',
    title: 'Keep doing what matters',
    icon: FaSmile,
    bullets: [
      'OCD often pushes individuals to withdraw from places, people, or hobbies to avoid triggering intrusive thoughts.',
      'Try not to avoid meaningful activities that bring value and joy to your life.',
      'Maintain quality time with family and trusted friends, staying engaged in your daily routines and personal goals.',
    ],
  },
];

export const OCDEducationCard = ({ onComplete }) => {
  const [openSectionId, setOpenSectionId] = useState('what-are-obsessions-compulsions');
  const { isReduced, safeTransition } = useMotionSafe();

  const toggleSection = (id) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
          <FaBookOpen />
          <span>Psychoeducation</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Understanding Obsessions & Compulsions
        </h3>
        <p className="text-xs text-slate-400">
          Learn about the cycle of OCD, evidence-based clinical treatments, and healthy day-to-day strategies.
        </p>
      </div>

      {/* Embedded OCD Cycle Diagram */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
        <CycleLoop variant="ocd" />
      </div>

      {/* 4 Expandable Sections (One open at a time) */}
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
