import React, { useState } from 'react';
import { FaPlay, FaForward, FaTimes, FaChevronLeft, FaChevronRight, FaBrain } from 'react-icons/fa';
import { useMotionSafe } from '../interactive/motionPresets';

import { BreathingOrb } from './BreathingOrb';
import { SenseIcons } from './SenseIcons';
import { BodyMap } from './BodyMap';
import { WorryTreeDiagram } from './WorryTreeDiagram';
import { TrapCards } from './TrapCards';
import { ThoughtRecordSteps } from './ThoughtRecordSteps';
import { MoodThermometer } from './MoodThermometer';
import { CycleLoop } from './CycleLoop';
import { StaircaseSteps } from './StaircaseSteps';
import { BedroomFlow } from './BedroomFlow';
import { ClockMoon } from './ClockMoon';
import { WindowOfTolerance } from './WindowOfTolerance';
import { HabituationCurve } from './HabituationCurve';
import { WaveSurf } from './WaveSurf';
import { ExposureLadder } from './ExposureLadder';
import { FlankerVisual } from './FlankerVisual';
import { TrailMakingVisual } from './TrailMakingVisual';
import { StroopVisual } from './StroopVisual';
import { GoNoGoVisual } from './GoNoGoVisual';
import { NBackVisual } from './NBackVisual';
import { CptVisual } from './CptVisual';
import { CognitiveTaskVisual } from './CognitiveTaskVisual';

const VISUAL_COMPONENTS = {
  BreathingOrb,
  SenseIcons,
  BodyMap,
  WorryTreeDiagram,
  TrapCards,
  ThoughtRecordSteps,
  MoodThermometer,
  CycleLoop,
  StaircaseSteps,
  BedroomFlow,
  ClockMoon,
  WindowOfTolerance,
  HabituationCurve,
  WaveSurf,
  ExposureLadder,
  FlankerVisual,
  TrailMakingVisual,
  StroopVisual,
  GoNoGoVisual,
  NBackVisual,
  CptVisual,
  CognitiveTaskVisual,
};

export const ExerciseIntroPanel = ({ exerciseDef, onStart, onSkip, onClose }) => {
  const { isReduced } = useMotionSafe();
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  if (!exerciseDef) return null;

  const { title, shortDescription, visual, steps = [], basedOn } = exerciseDef;
  const isRelaxationOrBreathing =
    exerciseDef?.id?.includes('breath') ||
    exerciseDef?.title?.toLowerCase().includes('breath') ||
    exerciseDef?.category?.toLowerCase().includes('relaxation');

  const FallbackComponent = isRelaxationOrBreathing ? BreathingOrb : CognitiveTaskVisual;
  const VisualComponent = VISUAL_COMPONENTS[visual] || FallbackComponent;

  const handlePrevFrame = () => {
    setCurrentFrameIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextFrame = () => {
    setCurrentFrameIdx((prev) => Math.min(steps.length - 1, prev + 1));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 text-tealBrand-700 dark:text-tealBrand-300 text-[10px] uppercase font-black">
              Exercise Introduction
            </span>
            {basedOn && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                Based on: {basedOn}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {shortDescription}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Main Two-Column Layout (Visual Left/Top, Steps Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: Visual or Steppable Frame */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 min-h-[220px]">
          {isReduced ? (
            <div className="w-full space-y-3 text-center">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
                <span>Step {currentFrameIdx + 1} of {steps.length}</span>
                <span className="text-[10px] uppercase tracking-wide">Static Preview</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-h-[100px] flex items-center justify-center">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {steps[currentFrameIdx] || 'Follow the step instructions to complete this exercise.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevFrame}
                  disabled={currentFrameIdx === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-30 inline-flex items-center gap-1"
                >
                  <FaChevronLeft className="text-[10px]" /> Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextFrame}
                  disabled={currentFrameIdx >= steps.length - 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold disabled:opacity-30 inline-flex items-center gap-1"
                >
                  Next <FaChevronRight className="text-[10px]" />
                </button>
              </div>
            </div>
          ) : (
            <VisualComponent isBedtime={exerciseDef.id === 'sleep-breathing-moon'} />
          )}
        </div>

        {/* Right Column: Numbered Step Captions */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            How It Works:
          </h4>
          <div className="space-y-2.5">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <FaForward className="text-[10px]" /> Skip Intro
        </button>

        <button
          type="button"
          onClick={onStart}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-2 transition-all"
        >
          <FaPlay className="text-[10px]" /> Start Exercise
        </button>
      </div>
    </div>
  );
};
