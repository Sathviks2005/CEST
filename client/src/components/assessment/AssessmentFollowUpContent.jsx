import React, { useState } from 'react';
import {
  FaBrain,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaCheckCircle,
  FaHeartbeat,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt,
} from 'react-icons/fa';
import {
  CBT_EXERCISE_CONTENT,
  EXERCISE_DEFINITIONS,
  CRISIS_RESOURCES,
} from '../../data/exerciseContent';

import { ClinicianContactCard } from '../exercise/interactive/ClinicianContactCard';
import { ClinicianNudge } from '../exercise/interactive/ClinicianNudge';
import { ExerciseIntroPanel } from '../exercise/illustrations/ExerciseIntroPanel';
import { ExerciseLauncher } from '../exercise/ExerciseLauncher';

export const AssessmentFollowUpContent = ({
  instrument = 'gad7',
  score = 0,
  severity = '',
  item9Positive = false,
  assessmentId = null,
}) => {
  const [optInOpen, setOptInOpen] = useState(true);
  const [introExerciseId, setIntroExerciseId] = useState(null);
  const [activeExerciseId, setActiveExerciseId] = useState(null);

  const instLower = (instrument || '').toLowerCase();
  let instrumentKey = 'gad7';
  if (instLower.includes('insomnia') || instLower.includes('isi')) {
    instrumentKey = 'insomnia';
  } else if (instLower.includes('ptsd') || instLower.includes('pcl')) {
    instrumentKey = 'ptsd';
  } else if (instLower.includes('ocd') || instLower.includes('y-bocs') || instLower.includes('ybocs')) {
    instrumentKey = 'ocd';
  } else if (instLower.includes('phq') || instLower.includes('depression')) {
    instrumentKey = 'phq9';
  } else if (instLower.includes('adhd') || instLower.includes('asrs')) {
    instrumentKey = 'adhd';
  } else if (instLower.includes('gad') || instLower.includes('anxiety')) {
    instrumentKey = 'gad7';
  }

  const instrumentConfig = CBT_EXERCISE_CONTENT[instrumentKey];

  // Helper to map severity string to key (null-safe for all instruments with robust score fallback)
  const getSeverityBandKey = () => {
    const sevLower = (severity || '').toLowerCase().trim();

    if (instrumentKey === 'insomnia') {
      if (sevLower.includes('severe')) return 'severe';
      if (sevLower.includes('moderate')) return 'moderate';
      if (sevLower.includes('subthreshold') || sevLower.includes('mild')) return 'mild';
      if (sevLower.includes('no clinically') || sevLower.includes('none') || sevLower.includes('minimal')) return 'minimal';
      if (typeof score === 'number') {
        if (score <= 7) return 'minimal';
        if (score <= 14) return 'mild';
        if (score <= 21) return 'moderate';
        return 'severe';
      }
      return null;
    }

    if (instrumentKey === 'ptsd') {
      if (sevLower.includes('extreme')) return 'extreme';
      if (sevLower.includes('severe')) return 'severe';
      if (sevLower.includes('moderate')) return 'moderate';
      if (sevLower.includes('mild')) return 'mild';
      if (sevLower.includes('absent') || sevLower.includes('minimal') || sevLower.includes('none')) return 'minimal';
      if (typeof score === 'number') {
        if (score <= 10) return 'minimal';
        if (score <= 32) return 'mild';
        if (score <= 48) return 'moderate';
        if (score <= 64) return 'severe';
        return 'extreme';
      }
      return null;
    }

    if (instrumentKey === 'ocd') {
      if (sevLower.includes('extreme')) return 'extreme';
      if (sevLower.includes('severe')) return 'severe';
      if (sevLower.includes('moderate')) return 'moderate';
      if (sevLower.includes('mild')) return 'mild';
      if (sevLower.includes('subclinical') || sevLower.includes('minimal') || sevLower.includes('none')) return 'minimal';
      if (typeof score === 'number') {
        if (score <= 7) return 'minimal';
        if (score <= 15) return 'mild';
        if (score <= 23) return 'moderate';
        if (score <= 31) return 'severe';
        return 'extreme';
      }
      return null;
    }

    if (instrumentKey === 'phq9') {
      if (sevLower.includes('moderately severe') || sevLower.includes('moderately_severe') || sevLower.includes('moderately-severe')) {
        return 'moderately_severe';
      }
      if (!sevLower.includes('moderately') && sevLower.includes('severe')) {
        return 'severe';
      }
      if (sevLower.includes('moderate')) {
        return 'moderate';
      }
      if (sevLower.includes('mild')) {
        return 'mild';
      }
      if (sevLower.includes('minimal') || sevLower.includes('none') || sevLower.includes('subclinical')) {
        return 'minimal';
      }
      if (typeof score === 'number') {
        if (score <= 4) return 'minimal';
        if (score <= 9) return 'mild';
        if (score <= 14) return 'moderate';
        if (score <= 19) return 'moderately_severe';
        return 'severe';
      }
      return null;
    }

    if (instrumentKey === 'gad7') {
      if (sevLower.includes('severe')) return 'severe';
      if (sevLower.includes('moderate')) return 'moderate';
      if (sevLower.includes('mild')) return 'mild';
      if (sevLower.includes('minimal') || sevLower.includes('none')) return 'minimal';
      if (typeof score === 'number') {
        if (score <= 4) return 'minimal';
        if (score <= 9) return 'mild';
        if (score <= 14) return 'moderate';
        return 'severe';
      }
      return null;
    }

    if (instrumentKey === 'adhd') {
      if (sevLower.includes('high') || sevLower.includes('severe')) return 'severe';
      if (sevLower.includes('moderate')) return 'moderate';
      if (sevLower.includes('low') || sevLower.includes('minimal') || sevLower.includes('none')) return 'minimal';
      if (typeof score === 'number') {
        if (score <= 18) return 'minimal';
        if (score <= 35) return 'moderate';
        return 'severe';
      }
      return null;
    }

    return null;
  };

  const bandKey = getSeverityBandKey();

  // If instrumentConfig is missing or bandKey is invalid, return null and render nothing (never fallback to minimal!)
  if (!instrumentConfig || !bandKey || !instrumentConfig[bandKey]) {
    return null;
  }

  const bandConfig = instrumentConfig[bandKey];
  if (!bandConfig) return null;

  // For non-phq9 instruments, single last (most severe) band -> Show ClinicianContactCard ONLY, NO exercises!
  if (instrumentKey !== 'phq9' && bandConfig.redirect) {
    let displayInstrumentName = 'Assessment';
    if (instrumentKey === 'insomnia') displayInstrumentName = 'ISI Insomnia';
    else if (instrumentKey === 'ptsd') displayInstrumentName = 'PCL-5 PTSD';
    else if (instrumentKey === 'ocd') displayInstrumentName = 'Y-BOCS OCD';
    else if (instrumentKey === 'gad7') displayInstrumentName = 'GAD-7 Anxiety';
    else if (instrumentKey === 'adhd') displayInstrumentName = 'ASRS ADHD';

    return (
      <div className="pt-2 space-y-4">
        <ClinicianContactCard
          instrumentKey={instrumentKey}
          instrumentName={displayInstrumentName}
          severityLabel={severity}
          score={score}
          assessmentId={assessmentId}
          item9Positive={false}
        />
      </div>
    );
  }

  // Handle launching exercise: show intro panel first
  const handleLaunchExercise = (id) => {
    if (activeExerciseId === id || introExerciseId === id) {
      setActiveExerciseId(null);
      setIntroExerciseId(null);
    } else {
      setActiveExerciseId(null);
      setIntroExerciseId(id);
    }
  };



  const exerciseIds = bandConfig.exerciseIds || [];
  const exerciseDefs = exerciseIds.map((id) => EXERCISE_DEFINITIONS[id]).filter(Boolean);

  // Minimal case -> Reassurance + Optional Collapsed opt-in section
  if (bandKey === 'minimal') {
    return (
      <div className="space-y-4 pt-2">
        {/* Clinician Contact Card if PHQ-9 Item 9 is positive */}
        {instrumentKey === 'phq9' && item9Positive && (
          <ClinicianContactCard
            instrumentKey="phq9"
            instrumentName="PHQ-9 Depression"
            severityLabel={severity}
            score={score}
            assessmentId={assessmentId}
            item9Positive={true}
          />
        )}

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-sm">
          <FaCheckCircle className="text-emerald-500 text-xl shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <strong className="block font-bold text-slate-900 dark:text-white">
              Minimal Symptoms Detected
            </strong>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {bandConfig.reassurance}
            </p>
          </div>
        </div>

        {/* Optional Collapsed Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setOptInOpen(!optInOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          >
            <div className="flex items-center gap-2">
              <FaHeartbeat className="text-tealBrand-500 text-base" />
              <div>
                <span>{bandConfig.optInHeading}</span>
                <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {bandConfig.optInSubheading}
                </p>
              </div>
            </div>
            {optInOpen ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
          </button>

          {optInOpen && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exerciseDefs.map((ex) => {
                  const isCurrentActive = activeExerciseId === ex.id || introExerciseId === ex.id;
                  return (
                    <div
                      key={ex.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-tealBrand-400 transition-all flex flex-col justify-between"
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
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{ex.title}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {ex.shortDescription}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleLaunchExercise(ex.id)}
                          className="w-full py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                        >
                          {isCurrentActive ? (
                            <>
                              <FaTimes /> Close Exercise
                            </>
                          ) : (
                            <>
                              <FaPlay className="text-[10px]" /> Try Optional Exercise
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Intro panel if open */}
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

              {/* Active Exercise if launched */}
              {activeExerciseId && (
                <ExerciseLauncher
                  exerciseId={activeExerciseId}
                  onClose={() => setActiveExerciseId(null)}
                  onComplete={() => setActiveExerciseId(null)}
                />
              )}

              {/* Global self-help disclaimer shown on all follow-up views */}
              <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center pt-2">
                These are general self-help techniques, not medical treatment or a substitute for professional care.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mild, Moderate, Moderately Severe, and Severe cases -> Render CBT exercises
  return (
    <div className="space-y-6 pt-2">
      {/* Clinician Contact Card if PHQ-9 Item 9 is positive OR Severe Band */}
      {instrumentKey === 'phq9' && (item9Positive || bandKey === 'severe') && (
        <ClinicianContactCard
          instrumentKey="phq9"
          instrumentName="PHQ-9 Depression"
          severityLabel={severity}
          score={score}
          assessmentId={assessmentId}
          item9Positive={item9Positive}
        />
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600/10 via-tealBrand-500/10 to-transparent border border-brand-500/30 dark:border-brand-800/50 space-y-6 shadow-sm">
        {/* Clinician Nudge banner whenever bandConfig.showClinicianNudge is true and NOT already showing ClinicianContactCard */}
        {bandConfig.showClinicianNudge && (!item9Positive && bandKey !== 'severe') && <ClinicianNudge />}

      {/* Trauma Severe Stabilisation Banner */}
      {instrumentKey === 'ptsd' && bandKey === 'severe' && (
        <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm flex items-start gap-3">
          <FaShieldAlt className="text-indigo-500 text-lg shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">
            Trauma-focused therapies such as CPT, Prolonged Exposure and EMDR are delivered by a trained clinician. These tools are for steadiness and safety between sessions.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 mb-1">
          <FaBrain />
          <span>Evidence-Based CBT Follow-up Exercises</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {bandConfig.heading}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
          {bandConfig.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exerciseDefs.map((ex) => {
          const isCurrentActive = activeExerciseId === ex.id || introExerciseId === ex.id;
          return (
            <div
              key={ex.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 flex flex-col justify-between ${
                isCurrentActive
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
                  onClick={() => handleLaunchExercise(ex.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrentActive
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white shadow hover:opacity-95'
                  }`}
                >
                  {isCurrentActive ? (
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

      {/* Intro Panel before exercise starts */}
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

      {/* Active Exercise */}
      {activeExerciseId && (
        <ExerciseLauncher
          exerciseId={activeExerciseId}
          onClose={() => setActiveExerciseId(null)}
          onComplete={() => setActiveExerciseId(null)}
        />
      )}

      {/* Global self-help disclaimer shown on all follow-up views */}
      <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center pt-1">
        These are general self-help techniques, not medical treatment or a substitute for professional care.
      </p>
    </div>
  </div>
);
};
