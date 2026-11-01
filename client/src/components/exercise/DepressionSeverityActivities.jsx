import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain,
  FaPlay,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClipboardList,
  FaUserMd,
  FaTimes,
  FaHeartbeat,
} from 'react-icons/fa';
import { EXERCISE_DEFINITIONS, CBT_EXERCISE_CONTENT, CRISIS_RESOURCES } from '../../data/exerciseContent';
import { EXERCISES, getExerciseRecommendation, CET_ACADEMIC_NOTICE } from '../../data/exerciseData';
import { ExerciseIntroPanel } from './illustrations/ExerciseIntroPanel';
import { ExerciseLauncher } from './ExerciseLauncher';
import { ClinicianContactCard } from './interactive/ClinicianContactCard';

const SEVERITY_TIERS = [
  { id: 'minimal', label: 'Minimal', range: '0–4', color: 'emerald' },
  { id: 'mild', label: 'Mild', range: '5–9', color: 'tealBrand' },
  { id: 'moderate', label: 'Moderate', range: '10–14', color: 'brand' },
  { id: 'moderately_severe', label: 'Moderately Severe', range: '15–19', color: 'amber' },
  { id: 'severe', label: 'Severe', range: '20–27', color: 'rose' },
];

export const DepressionSeverityActivities = ({
  latestAssessment = null,
  onStartAssessment = null,
}) => {
  const navigate = useNavigate();

  // Determine user's assigned severity tier if assessment exists
  const getAssignedTierId = () => {
    if (!latestAssessment) return null;
    const score = Number(latestAssessment.totalScore ?? latestAssessment.score ?? 0);
    const sev = (latestAssessment.severity || '').toLowerCase();

    if (sev.includes('moderately severe') || sev.includes('moderately_severe') || (score >= 15 && score <= 19)) {
      return 'moderately_severe';
    }
    if ((!sev.includes('moderately') && sev.includes('severe')) || score >= 20) {
      return 'severe';
    }
    if (sev.includes('moderate') || (score >= 10 && score <= 14)) {
      return 'moderate';
    }
    if (sev.includes('mild') || (score >= 5 && score <= 9)) {
      return 'mild';
    }
    return 'minimal';
  };

  const assignedTier = getAssignedTierId();
  const [selectedTier, setSelectedTier] = useState(assignedTier || 'mild');
  const [introExerciseId, setIntroExerciseId] = useState(null);
  const [activeExerciseId, setActiveExerciseId] = useState(null);

  // Sync selected tier when assessment loads
  useEffect(() => {
    if (assignedTier) {
      setSelectedTier(assignedTier);
    }
  }, [assignedTier]);

  const currentScore = latestAssessment ? Number(latestAssessment.totalScore ?? latestAssessment.score ?? 0) : null;
  const isItem9Positive = latestAssessment && Number(latestAssessment.answers?.[8]) > 0;

  // Determine which CBT exercises to show for selected tier
  const getCbtExerciseIdsForTier = (tier) => {
    if (CBT_EXERCISE_CONTENT.phq9 && CBT_EXERCISE_CONTENT.phq9[tier]?.exerciseIds) {
      return CBT_EXERCISE_CONTENT.phq9[tier].exerciseIds;
    }
    switch (tier) {
      case 'minimal':
        return ['gratitude-mood-checkin', 'sleep-hygiene-checklist', 'sunlight-walk', 'breathing-timer'];
      case 'mild':
        return ['activity-scheduler-mild', 'thought-record', 'breathing-timer', 'daily-routine-planner', 'social-connection-nudge'];
      case 'moderate':
        return ['activity-scheduler-moderate', 'thinking-traps-spotter', 'problem-solving-worksheet', 'body-scan-mindfulness', 'self-compassion-break'];
      case 'moderately_severe':
        return ['micro-task-planner', 'basic-needs-checklist', 'grounding-54321', 'activity-scheduler-graded', 'reach-out-script'];
      case 'severe':
        return ['coping-support-plan', 'grounding-54321', 'breathing-timer', 'reach-out-script'];
      default:
        return ['gratitude-mood-checkin'];
    }
  };

  // Determine Cognitive Training game for selected tier
  const getCetGameForTier = (tier) => {
    switch (tier) {
      case 'mild':
        return EXERCISES['attention-grid'];
      case 'moderate':
        return EXERCISES['sequence-memory'];
      case 'moderately_severe':
        return EXERCISES['problem-solving'];
      default:
        return null;
    }
  };

  const cbtExerciseIds = getCbtExerciseIdsForTier(selectedTier);
  const cbtExercises = cbtExerciseIds.map((id) => EXERCISE_DEFINITIONS[id]).filter(Boolean);
  const cetGame = getCetGameForTier(selectedTier);

  const handleLaunchCbt = (exId) => {
    if (introExerciseId === exId || activeExerciseId === exId) {
      setIntroExerciseId(null);
      setActiveExerciseId(null);
    } else {
      setActiveExerciseId(null);
      setIntroExerciseId(exId);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase tracking-wider border border-brand-500/20 flex items-center gap-1.5">
              <FaBrain /> Depression Activities & Exercises
            </span>
            {latestAssessment && (
              <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 text-[11px] font-bold border border-tealBrand-500/20">
                Assigned by PHQ-9 (Score: {currentScore}/27)
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Evidence-Based Activities Tailored to Severity
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {latestAssessment
              ? `Your latest screening indicates ${latestAssessment.severity}. Below are recommended evidence-based behavioral activation, cognitive restructuring, and attention exercises.`
              : 'Complete your PHQ-9 assessment to automatically match exercises to your score, or choose a severity tier below to explore targeted activities.'}
          </p>
        </div>

        {!latestAssessment && onStartAssessment && (
          <button
            type="button"
            onClick={onStartAssessment}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <FaClipboardList /> Take PHQ-9 Screening
          </button>
        )}
      </div>

      {/* Item 9 Safety Alert if positive on user's assessment */}
      {isItem9Positive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-950 dark:text-rose-100 space-y-2">
          <div className="flex items-center gap-2 font-black text-rose-600 dark:text-rose-400 text-sm">
            <FaExclamationTriangle />
            <span>Safety & Crisis Support Reminder</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
            {CRISIS_RESOURCES.notice}
          </p>
          <div className="pt-1 text-xs space-y-1">
            {CRISIS_RESOURCES.helplines.map((h, i) => (
              <p key={i} className="text-slate-700 dark:text-slate-300">
                <strong className="text-rose-700 dark:text-rose-300">{h.country}:</strong> {h.details}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Severity Band Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            Severity Tiers & Assigned Activity Protocols:
          </span>
          {assignedTier && selectedTier !== assignedTier && (
            <button
              type="button"
              onClick={() => setSelectedTier(assignedTier)}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Back to My Assigned ({SEVERITY_TIERS.find((t) => t.id === assignedTier)?.label})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SEVERITY_TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id;
            const isUsersCurrent = assignedTier === tier.id;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  setSelectedTier(tier.id);
                  setIntroExerciseId(null);
                  setActiveExerciseId(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <span>{tier.label}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/15 dark:bg-white/20 font-mono">
                  {tier.range}
                </span>
                {isUsersCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Your Current Score Band" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Severity Description */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
        <p className="font-bold text-slate-900 dark:text-white">
          {selectedTier === 'minimal' && 'Minimal Severity Protocol: Positive reflection, nervous system steadying, and sensory grounding.'}
          {selectedTier === 'mild' && 'Mild Severity Protocol: Early behavioral activation planning, cognitive distortion spotter, and selective attention training.'}
          {selectedTier === 'moderate' && 'Moderate Severity Protocol: Multi-day activity scheduling, 7-column thought restructuring, and sequence memory challenges.'}
          {selectedTier === 'moderately_severe' && 'Moderately Severe Protocol: Graded micro-activation, problem-solving sequencing, safety coping planning, and executive planning.'}
          {selectedTier === 'severe' && 'Severe Severity Clinical Safety Notice: Professional clinician guidance is the primary evidence-based recommendation. Self-guided cognitive strain is withheld.'}
        </p>
      </div>

      {/* Severe Tier: Clinician Support Card */}
      {selectedTier === 'severe' && (
        <div className="space-y-4 pt-1">
          <ClinicianContactCard
            instrumentKey="phq9"
            instrumentName="PHQ-9 Depression"
            severityLabel={latestAssessment?.severity || 'Severe depression'}
            score={currentScore ?? 21}
            assessmentId={latestAssessment?._id || latestAssessment?.id}
            item9Positive={isItem9Positive}
          />
        </div>
      )}

      {/* Evidence-Based CBT Activities Grid */}
      {selectedTier !== 'severe' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaCheckCircle />
            <span>Assigned Evidence-Based CBT Exercises ({cbtExercises.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cbtExercises.map((ex) => {
              const isIntro = introExerciseId === ex.id;
              const isActive = activeExerciseId === ex.id;

              return (
                <div
                  key={ex.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 flex flex-col justify-between ${
                    isIntro || isActive
                      ? 'border-tealBrand-500 ring-2 ring-tealBrand-400 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-tealBrand-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 text-[10px] uppercase font-bold">
                        {ex.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">interactive</span>
                    </div>

                    {ex.basedOn && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                        Based on: {ex.basedOn}
                      </span>
                    )}

                    <h4 className="font-bold text-base text-slate-900 dark:text-white">{ex.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ex.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchCbt(ex.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isIntro || isActive
                          ? 'bg-slate-800 text-white hover:bg-slate-700'
                          : 'bg-gradient-to-r from-brand-600 to-tealBrand-600 hover:from-brand-500 hover:to-tealBrand-500 text-white shadow hover:opacity-95'
                      }`}
                    >
                      {isIntro || isActive ? (
                        <>
                          <FaTimes /> Close Exercise
                        </>
                      ) : (
                        <>
                          <FaPlay className="text-[10px]" /> Start Interactive Exercise
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Exercise Intro Panel if open */}
          {introExerciseId && EXERCISE_DEFINITIONS[introExerciseId] && (
            <div className="pt-2 animate-fadeIn">
              <ExerciseIntroPanel
                exerciseDef={EXERCISE_DEFINITIONS[introExerciseId]}
                onStart={() => {
                  setActiveExerciseId(introExerciseId);
                  setIntroExerciseId(null);
                }}
                onSkip={() => {
                  setActiveExerciseId(introExerciseId);
                  setIntroExerciseId(null);
                }}
                onClose={() => setIntroExerciseId(null)}
              />
            </div>
          )}

          {/* Active Exercise Modal */}
          {activeExerciseId && (
            <ExerciseLauncher
              exerciseId={activeExerciseId}
              onClose={() => setActiveExerciseId(null)}
              onComplete={() => setActiveExerciseId(null)}
            />
          )}
        </div>
      )}

      {/* Recommended Cognitive Training Card for non-severe tiers */}
      {selectedTier !== 'severe' && cetGame && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-extrabold uppercase">
                <FaBrain /> Recommended Cognitive Training (CET-Inspired)
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{cetGame.name}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold">
                {cetGame.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{cetGame.estimatedDuration}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-purple-600 dark:text-purple-400 uppercase text-[11px]">
              Domain: {cetGame.domain}
            </p>
            <p>{cetGame.shortDescription}</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <FaShieldAlt className="text-amber-500 mt-0.5 shrink-0" />
            <span>{CET_ACADEMIC_NOTICE}</span>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/exercises/${cetGame.id}`, {
                  state: {
                    assessmentId: latestAssessment?._id || latestAssessment?.id || null,
                    assessmentScore: currentScore,
                    assessmentSeverity: latestAssessment?.severity || selectedTier,
                  },
                })
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <FaPlay className="text-[10px]" />
              <span>Start Cognitive Exercise</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

