import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaBullseye,
  FaLayerGroup,
  FaPuzzlePiece,
} from 'react-icons/fa';
import { EXERCISES } from '../../data/exerciseData';

/**
 * CognitiveEnhancementSection
 *
 * Renders the optional "Cognitive Enhancement exercises" section.
 * - Shown BELOW the CBT follow-up (never replacing CBT).
 * - Kept OUT of the highest (last) severity band (severe / score >= 20 / item9Positive).
 * - Displays the required disclaimer:
 *   "These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy.
 *    They are practice exercises, not a diagnosis or a replacement for professional treatment."
 * - Treats game scores strictly as practice metrics, never as clinical measures.
 */
export const CognitiveEnhancementSection = ({
  score = null,
  severity = '',
  item9Positive = false,
  assessmentId = null,
  defaultOpen = true,
  collapsible = true,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Check if user is in highest severity band or item 9 is positive
  // In PHQ-9, 20-27 is Severe (the last/highest severity band).
  const numScore = typeof score === 'number' ? score : null;
  const sevLower = (severity || '').trim().toLowerCase();
  const isHighestSeverity =
    (numScore !== null && numScore >= 20) ||
    (sevLower.includes('severe') && !sevLower.includes('moderately')) ||
    sevLower.includes('extreme') ||
    Boolean(item9Positive);

  // Requirement 3: Keep them out of the highest (last) severity band, as with CBT exercises
  if (isHighestSeverity) {
    return null;
  }

  const exerciseList = [
    {
      ...EXERCISES['attention-grid'],
      icon: FaBullseye,
      accentColor: 'from-amber-500/10 to-orange-500/5',
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      ...EXERCISES['sequence-memory'],
      icon: FaLayerGroup,
      accentColor: 'from-tealBrand-500/10 to-emerald-500/5',
      badgeColor: 'bg-tealBrand-500/15 text-tealBrand-700 dark:text-tealBrand-300 border-tealBrand-500/30',
    },
    {
      ...EXERCISES['problem-solving'],
      icon: FaPuzzlePiece,
      accentColor: 'from-purple-500/10 to-indigo-500/5',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent overflow-hidden shadow-sm transition-all">
      {/* Section Header */}
      <div
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          collapsible ? 'cursor-pointer hover:bg-purple-500/5' : ''
        } transition-colors`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-extrabold uppercase tracking-wider">
              <FaBrain className="text-purple-600 dark:text-purple-400" />
              Cognitive Enhancement exercises
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Optional practice
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Cognitive Enhancement Exercises
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            These attention, memory and problem-solving exercises are inspired by Cognitive
            Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement
            for professional treatment.
          </p>
        </div>

        {collapsible && (
          <button
            type="button"
            className="self-end sm:self-center p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 transition-all text-sm shrink-0"
            aria-label={isOpen ? 'Collapse exercises' : 'Expand exercises'}
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>

      {/* Expandable Exercise Cards */}
      {isOpen && (
        <div className="p-6 sm:p-7 pt-0 space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exerciseList.map((ex) => {
              const Icon = ex.icon;
              return (
                <div
                  key={ex.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-purple-400 dark:hover:border-purple-500 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide ${ex.badgeColor}`}
                      >
                        {ex.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {ex.estimatedDuration}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {ex.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                          {ex.domain}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ex.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/exercises/${ex.id}`, {
                          state: {
                            assessmentId: assessmentId || null,
                            assessmentScore: score,
                            assessmentSeverity: severity,
                          },
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <FaPlay className="text-[10px]" />
                      <span>Start Practice Exercise</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Non-clinical Measure Guard */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-950 dark:text-purple-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <FaShieldAlt className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 text-sm" />
            <div>
              <strong className="font-bold">Practice Metric Notice: </strong>
              Game completion and accuracy scores are practice metrics reflecting focus and task
              engagement. They are never a clinical depression measure or diagnostic indicator.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
