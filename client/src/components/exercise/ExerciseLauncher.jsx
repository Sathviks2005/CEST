import React, { useState } from 'react';
import {
  FaTimes,
  FaPlay,
  FaCheckCircle,
  FaShieldAlt,
  FaExclamationTriangle,
  FaHeartbeat,
  FaSmile,
  FaMeh,
  FaFrown,
  FaLightbulb,
  FaInfoCircle,
  FaLock,
  FaCalendarAlt,
  FaUserMd,
} from 'react-icons/fa';

import { EXERCISE_DEFINITIONS } from '../../data/exerciseContent';
import { EXERCISES } from '../../data/exerciseData';

// CBT Interactive Exercises
import { BreathingTimer } from './interactive/BreathingTimer';
import { GroundingForm } from './interactive/GroundingForm';
import { MuscleRelaxationTimer } from './interactive/MuscleRelaxationTimer';
import { ActivityScheduler } from './interactive/ActivityScheduler';
import { ThoughtRecordForm } from './interactive/ThoughtRecordForm';
import { GratitudeMoodCheckin } from './interactive/GratitudeMoodCheckin';
import { SleepHygieneChecklist } from './interactive/SleepHygieneChecklist';
import { SleepBreathingMoon } from './interactive/SleepBreathingMoon';
import { StimulusControlGuide } from './interactive/StimulusControlGuide';
import { SleepThoughtChallenger } from './interactive/SleepThoughtChallenger';
import { SleepDiary } from './interactive/SleepDiary';
import { TraumaEducationCard } from './interactive/TraumaEducationCard';
import { BalancedThinkingCheck } from './interactive/BalancedThinkingCheck';
import { CopingSupportPlan } from './interactive/CopingSupportPlan';
import { OCDEducationCard } from './interactive/OCDEducationCard';
import { OCDWarningSignsPlan } from './interactive/OCDWarningSignsPlan';
import { WorryDecisionTree } from './interactive/WorryDecisionTree';
import { ThinkingTrapsSpotter } from './interactive/ThinkingTrapsSpotter';
import { ProblemSolvingWorksheet } from './interactive/ProblemSolvingWorksheet';
import { OCDCycleMapper } from './interactive/OCDCycleMapper';
import { UrgeSurfingTimer } from './interactive/UrgeSurfingTimer';
import { ERPHierarchyBuilder } from './interactive/ERPHierarchyBuilder';

// Depression-Specific Interactive Tools
import { SunlightWalkGuide } from './interactive/SunlightWalkGuide';
import { DailyRoutinePlanner } from './interactive/DailyRoutinePlanner';
import { SocialConnectionNudge } from './interactive/SocialConnectionNudge';
import { BodyScanMindfulness } from './interactive/BodyScanMindfulness';
import { SelfCompassionBreak } from './interactive/SelfCompassionBreak';
import { MicroTaskPlanner } from './interactive/MicroTaskPlanner';
import { BasicNeedsChecklist } from './interactive/BasicNeedsChecklist';
import { ReachOutScript } from './interactive/ReachOutScript';

// CET Interactive Games
import { AttentionGridExercise } from './AttentionGridExercise';
import { SequenceMemoryExercise } from './SequenceMemoryExercise';
import { ProblemSolvingExercise } from './ProblemSolvingExercise';

// ADHD Cognitive Interactive Tasks
import { FlankerExercise } from './interactive/FlankerExercise';
import { TrailMakingExercise } from './interactive/TrailMakingExercise';
import { StroopExercise } from './interactive/StroopExercise';
import { GoNoGoExercise } from './interactive/GoNoGoExercise';
import { NBackExercise } from './interactive/NBackExercise';
import { CptExercise } from './interactive/CptExercise';

// Intro Panel
import { ExerciseIntroPanel } from './illustrations/ExerciseIntroPanel';

export const ExerciseLauncher = ({
  exerciseId,
  assignment = null, // If passed, runs in assignment mode with mood ratings and clinician info
  onClose,
  onComplete, // callback({ moodBefore, moodAfter, sharedResult })
  onSkip, // callback(reason)
}) => {
  const isCBT = Boolean(EXERCISE_DEFINITIONS[exerciseId]);
  const cbtDef = EXERCISE_DEFINITIONS[exerciseId];
  const cetDef = EXERCISES[exerciseId];

  const title = cbtDef?.title || cetDef?.name || exerciseId;
  const basedOn = cbtDef?.basedOn || 'Inspired by Cognitive Enhancement Therapy';
  const isCET = !isCBT && Boolean(cetDef);

  // States
  const [phase, setPhase] = useState(assignment ? 'intro' : 'playing'); // 'intro' | 'playing' | 'review' | 'skip'
  const [moodBefore, setMoodBefore] = useState(assignment?.moodBefore ?? 5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [skipReason, setSkipReason] = useState('too_hard');
  const [shareCetResult, setShareCetResult] = useState(false);
  const [cetGameMetrics, setCetGameMetrics] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety checks
  const isTrauma = exerciseId === 'trauma-education-card' || exerciseId === 'balanced-thinking-check';
  const isOCD =
    exerciseId === 'ocd-education-card' ||
    exerciseId === 'ocd-cycle-mapper' ||
    exerciseId === 'urge-surfing-timer' ||
    exerciseId === 'erp-hierarchy-builder';

  const handleStartActive = () => {
    setPhase('playing');
  };

  const handleExerciseFinished = (metrics = null) => {
    if (metrics && typeof metrics === 'object') {
      setCetGameMetrics(metrics);
    }
    if (assignment) {
      setPhase('review');
    } else if (onComplete) {
      onComplete({});
    }
  };

  const handleFinalSubmit = async () => {
    if (!assignment) {
      if (onComplete) onComplete({});
      if (onClose) onClose();
      return;
    }

    setIsSubmitting(true);
    const payload = {
      moodBefore,
      moodAfter,
      sharedResult:
        isCET && shareCetResult && cetGameMetrics
          ? {
              score: cetGameMetrics.score ?? 0,
              level: cetGameMetrics.level ?? cetGameMetrics.attempts ?? null,
            }
          : null,
    };

    try {
      if (onComplete) {
        await onComplete(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSkip = async () => {
    setIsSubmitting(true);
    try {
      if (onSkip) {
        await onSkip(skipReason);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInteractiveComponent = () => {
    if (isCET) {
      switch (exerciseId) {
        case 'attention-grid':
          return (
            <AttentionGridExercise
              onComplete={(metrics) => handleExerciseFinished(metrics)}
              onExit={() => (assignment ? setPhase('intro') : onClose && onClose())}
            />
          );
        case 'sequence-memory':
          return (
            <SequenceMemoryExercise
              onComplete={(metrics) => handleExerciseFinished(metrics)}
              onExit={() => (assignment ? setPhase('intro') : onClose && onClose())}
            />
          );
        case 'problem-solving':
          return (
            <ProblemSolvingExercise
              onComplete={(metrics) => handleExerciseFinished(metrics)}
              onExit={() => (assignment ? setPhase('intro') : onClose && onClose())}
            />
          );
        default:
          return <p className="text-sm text-slate-500">CET Game not found</p>;
      }
    }

    // CBT Component Rendering
    const componentName = cbtDef?.componentName;
    const mode = cbtDef?.mode;

    switch (componentName) {
      case 'BreathingTimer':
        return <BreathingTimer onComplete={() => handleExerciseFinished()} />;
      case 'GroundingForm':
        return <GroundingForm onComplete={() => handleExerciseFinished()} />;
      case 'WorryDecisionTree':
        return <WorryDecisionTree onComplete={() => handleExerciseFinished()} />;
      case 'MuscleRelaxationTimer':
        return <MuscleRelaxationTimer onComplete={() => handleExerciseFinished()} />;
      case 'GratitudeMoodCheckin':
        return <GratitudeMoodCheckin onComplete={() => handleExerciseFinished()} />;
      case 'ActivityScheduler':
        return <ActivityScheduler mode={mode} onComplete={() => handleExerciseFinished()} />;
      case 'ThinkingTrapsSpotter':
        return <ThinkingTrapsSpotter onComplete={() => handleExerciseFinished()} />;
      case 'ThoughtRecordForm':
        return <ThoughtRecordForm onComplete={() => handleExerciseFinished()} />;
      case 'ProblemSolvingWorksheet':
        return <ProblemSolvingWorksheet onComplete={() => handleExerciseFinished()} />;
      case 'SleepHygieneChecklist':
        return <SleepHygieneChecklist onComplete={() => handleExerciseFinished()} />;
      case 'SleepBreathingMoon':
        return <SleepBreathingMoon onComplete={() => handleExerciseFinished()} />;
      case 'StimulusControlGuide':
        return <StimulusControlGuide onComplete={() => handleExerciseFinished()} />;
      case 'SleepThoughtChallenger':
        return <SleepThoughtChallenger onComplete={() => handleExerciseFinished()} />;
      case 'SleepDiary':
        return <SleepDiary onComplete={() => handleExerciseFinished()} />;
      case 'TraumaEducationCard':
        return <TraumaEducationCard onComplete={() => handleExerciseFinished()} />;
      case 'BalancedThinkingCheck':
        return <BalancedThinkingCheck onComplete={() => handleExerciseFinished()} />;
      case 'CopingSupportPlan':
        return <CopingSupportPlan onComplete={() => handleExerciseFinished()} />;
      case 'OCDEducationCard':
        return <OCDEducationCard onComplete={() => handleExerciseFinished()} />;
      case 'OCDCycleMapper':
        return <OCDCycleMapper onComplete={() => handleExerciseFinished()} />;
      case 'UrgeSurfingTimer':
        return <UrgeSurfingTimer onComplete={() => handleExerciseFinished()} />;
      case 'ERPHierarchyBuilder':
        return <ERPHierarchyBuilder onComplete={() => handleExerciseFinished()} />;
      case 'OCDWarningSignsPlan':
        return <OCDWarningSignsPlan onComplete={() => handleExerciseFinished()} />;
      case 'FlankerExercise':
      case 'flanker':
        return <FlankerExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'TrailMakingExercise':
      case 'trail-making':
        return <TrailMakingExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'StroopExercise':
      case 'stroop':
        return <StroopExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'GoNoGoExercise':
      case 'go-no-go':
        return <GoNoGoExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'NBackExercise':
      case 'n-back':
        return <NBackExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'CptExercise':
      case 'cpt':
        return <CptExercise onComplete={(metrics) => handleExerciseFinished(metrics)} />;
      case 'SunlightWalkGuide':
      case 'sunlight-walk':
        return <SunlightWalkGuide onComplete={() => handleExerciseFinished()} />;
      case 'DailyRoutinePlanner':
      case 'daily-routine-planner':
        return <DailyRoutinePlanner onComplete={() => handleExerciseFinished()} />;
      case 'SocialConnectionNudge':
      case 'social-connection-nudge':
        return <SocialConnectionNudge onComplete={() => handleExerciseFinished()} />;
      case 'BodyScanMindfulness':
      case 'body-scan-mindfulness':
        return <BodyScanMindfulness onComplete={() => handleExerciseFinished()} />;
      case 'SelfCompassionBreak':
      case 'self-compassion-break':
        return <SelfCompassionBreak onComplete={() => handleExerciseFinished()} />;
      case 'MicroTaskPlanner':
      case 'micro-task-planner':
        return <MicroTaskPlanner onComplete={() => handleExerciseFinished()} />;
      case 'BasicNeedsChecklist':
      case 'basic-needs-checklist':
        return <BasicNeedsChecklist onComplete={() => handleExerciseFinished()} />;
      case 'ReachOutScript':
      case 'reach-out-script':
      case 'tell-someone-script':
        return <ReachOutScript onComplete={() => handleExerciseFinished()} />;
      default:
        return (
          <div className="p-6 sm:p-8 space-y-6 max-w-xl mx-auto text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-tealBrand-500/15 border border-tealBrand-500/30 flex items-center justify-center text-tealBrand-600 dark:text-tealBrand-400 text-3xl mx-auto shadow-sm">
              <FaLightbulb />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 text-xs uppercase font-extrabold tracking-wider border border-tealBrand-500/20">
                {cbtDef?.category || cetDef?.domain || 'Cognitive Training'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {cbtDef?.shortDescription || cetDef?.shortDescription}
              </p>
            </div>

            {(cbtDef?.instructions || cetDef?.instructions) && (
              <div className="text-left p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 text-[11px]">
                  Guided Protocol & Instructions:
                </p>
                <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                  {(cbtDef?.instructions || cetDef?.instructions).map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleExerciseFinished()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:from-tealBrand-500 hover:to-brand-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaCheckCircle className="text-base" /> Complete Exercise Session
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* TOP HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isCET
                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    : 'bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30'
                }`}
              >
                {isCET ? 'Cognitive Enhancement exercises' : 'CBT exercises'}
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">&bull;</span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Based on: {basedOn}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {phase === 'playing' && (
              <button
                type="button"
                onClick={() => {
                  if (assignment) {
                    setPhase('review');
                  } else {
                    onClose && onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1.5"
                title="Stop anytime if it feels like too much"
              >
                <FaShieldAlt className="text-xs" />
                <span>Stop / Finish</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* BODY AREA */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* PHASE 1: INTRO (FOR ASSIGNED EXERCISES) */}
          {phase === 'intro' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
              {/* Mandatory Clinician Pick Notice */}
              <div className="p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-900 dark:text-tealBrand-200 text-xs leading-relaxed flex items-start gap-3">
                <FaUserMd className="text-tealBrand-600 dark:text-tealBrand-400 text-base shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Your clinician picked this for you. Stop any time if it feels like too much.
                  </p>
                  {assignment?.clinicianName && (
                    <p className="text-[11px] text-tealBrand-700 dark:text-tealBrand-300">
                      Assigned by {assignment.clinicianName}
                      {assignment?.dueDate && ` • Due by ${new Date(assignment.dueDate).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Clinician Note if present */}
              {assignment?.note && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Note from your clinician:
                  </span>
                  <p className="italic">"{assignment.note}"</p>
                </div>
              )}

              {/* Mandatory CET Practice Disclaimer */}
              {isCET && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs leading-relaxed flex items-start gap-3">
                  <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Practice Exercise Notice: </span>
                    These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment.
                  </div>
                </div>
              )}

              {/* Trauma Safety Alert */}
              {isTrauma && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
                  <FaShieldAlt className="text-amber-600 dark:text-amber-400 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Trauma & Grounding Safety: </span>
                    This exercise focuses strictly on present-moment stabilisation and safety. You will never be asked to describe traumatic events. If your distress rises, use the Stop button to pause anytime.
                  </div>
                </div>
              )}

              {/* OCD Safety Alert */}
              {isOCD && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed flex items-start gap-3">
                  <FaLightbulb className="text-indigo-600 dark:text-indigo-400 text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">OCD Support Note: </span>
                    This exercise helps you recognize patterns and prepare for therapy. Practise only on manageable steps. Stop anytime if delaying compulsions feels overwhelming.
                  </div>
                </div>
              )}

              {/* Visual Intro Illustration */}
              {isCBT && cbtDef && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cbtDef.shortDescription}
                  </p>
                  {cbtDef.steps && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        What to expect:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {cbtDef.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-tealBrand-500/20 text-tealBrand-600 dark:text-tealBrand-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {isCET && cetDef && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cetDef.shortDescription}
                  </p>
                  {cetDef.instructions && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        How it works:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {cetDef.instructions.map((inst, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* BEFORE MOOD SLIDER (0 - 10) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-tealBrand-500/10 via-brand-500/10 to-transparent border border-tealBrand-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaHeartbeat className="text-tealBrand-500" />
                    <span>How are you feeling right now? (0–10)</span>
                  </label>
                  <span className="text-lg font-black text-tealBrand-600 dark:text-tealBrand-400">
                    {moodBefore} / 10
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-tealBrand-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>0: Very Low / Distressed</span>
                  <span>5: Okay / Neutral</span>
                  <span>10: Very Good / Calm</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPhase('skip')}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
                >
                  Skip this exercise
                </button>

                <button
                  type="button"
                  onClick={handleStartActive}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <FaPlay className="text-[10px]" /> Start Exercise
                </button>
              </div>
            </div>
          )}

          {/* PHASE 2: PLAYING ACTIVE EXERCISE */}
          {phase === 'playing' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Optional stop caution strip */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-tealBrand-500" />
                  <span>
                    Self-paced practice. You are in control &bull; Stop anytime if you feel unwell.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleExerciseFinished()}
                  className="text-xs font-bold text-tealBrand-600 hover:underline"
                >
                  Finish
                </button>
              </div>

              {renderInteractiveComponent()}
            </div>
          )}

          {/* PHASE 3: REVIEW / COMPLETION (FOR ASSIGNED EXERCISES) */}
          {phase === 'review' && (
            <div className="space-y-6 animate-fadeIn max-w-xl mx-auto py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center text-2xl">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Great work completing this exercise!
                </h3>
                <p className="text-xs text-slate-500">
                  Rate how you feel now to log your completion for your records and your clinician.
                </p>
              </div>

              {/* CET Game Result Summary & Sharing Consent */}
              {isCET && cetGameMetrics && (
                <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Your Game Practice Summary
                    </span>
                    <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                      Score: {cetGameMetrics.score ?? 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                    Game scores are for practice and are completely private to you by default.
                  </p>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareCetResult}
                      onChange={(e) => setShareCetResult(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                    />
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Share my result with my clinician
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        If unticked, your clinician only sees that you completed the exercise and your mood ratings.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* AFTER MOOD SLIDER (0 - 10) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-tealBrand-500/10 via-brand-500/10 to-transparent border border-tealBrand-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaHeartbeat className="text-tealBrand-500" />
                    <span>How are you feeling right now? (0–10)</span>
                  </label>
                  <span className="text-lg font-black text-tealBrand-600 dark:text-tealBrand-400">
                    {moodAfter} / 10
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-tealBrand-600"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                  <span>0: Very Low / Distressed</span>
                  <span>5: Okay / Neutral</span>
                  <span>10: Very Good / Calm</span>
                </div>

                {assignment && (
                  <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Mood before: {moodBefore}/10</span>
                    <span className="font-semibold text-tealBrand-600 dark:text-tealBrand-400">
                      Change: {moodAfter - moodBefore >= 0 ? `+${moodAfter - moodBefore}` : moodAfter - moodBefore}
                    </span>
                  </div>
                )}
              </div>

              {/* Privacy Reminder */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2.5">
                <FaLock className="text-tealBrand-500 shrink-0 text-sm" />
                <p className="text-[11px] leading-relaxed">
                  Your typed answers and private thought diary entries are never stored on the server or shown to your clinician. Only your completion status and mood numbers are shared.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> {isSubmitting ? 'Saving...' : 'Mark Complete'}
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4: SKIP REASON PICKER */}
          {phase === 'skip' && (
            <div className="space-y-6 animate-fadeIn max-w-md mx-auto py-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Skip this exercise?
                </h3>
                <p className="text-xs text-slate-500">
                  That's okay. Your clinician will see that you skipped this.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'too_hard', label: 'Too hard' },
                  { id: 'not_helpful', label: 'Not helpful' },
                  { id: 'feeling_unwell', label: 'Not feeling well' },
                  { id: 'no_time', label: 'No time' },
                  { id: 'other', label: 'Other' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      skipReason === opt.id
                        ? 'border-tealBrand-500 bg-tealBrand-500/10 font-bold text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="skipReason"
                      value={opt.id}
                      checked={skipReason === opt.id}
                      onChange={() => setSkipReason(opt.id)}
                      className="text-tealBrand-600 focus:ring-tealBrand-500"
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPhase('intro')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSkip}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Skipping...' : 'Confirm Skip'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
