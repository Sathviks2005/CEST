import React from 'react';
import { FaPlay, FaInfoCircle, FaShieldAlt, FaLightbulb } from 'react-icons/fa';
import { DifficultyBadge } from './DifficultyBadge';

export const ExerciseInstructions = ({
  title,
  domain,
  difficulty,
  estimatedDuration,
  instructions = [],
  shortDescription,
  onStart,
}) => {
  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 max-w-3xl mx-auto">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
          <FaLightbulb className="text-purple-600 dark:text-purple-400" /> Cognitive Enhancement exercises
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {shortDescription}
        </p>
      </div>

      {/* Metadata Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Target Domain</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{domain}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Difficulty Level</p>
          <div className="mt-1">
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Est. Duration</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {estimatedDuration || '5–10 mins'}
          </p>
        </div>
      </div>

      {/* Instructions list */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FaInfoCircle className="text-brand-500" /> Instructions & Rules
        </h3>
        <ul className="space-y-3">
          {instructions.map((step, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="leading-snug pt-0.5">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mandatory Clinical/Academic Disclaimer */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs leading-relaxed flex items-start gap-3">
        <FaShieldAlt className="mt-0.5 text-purple-600 dark:text-purple-400 shrink-0 text-base" />
        <div>
          <span className="font-bold">Cognitive Enhancement Therapy Practice Notice: </span>
          These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment. Exercise performance metrics reflect focus and practice, not a clinical diagnostic measure.
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
        >
          <FaPlay className="text-xs" /> Start Exercise
        </button>
      </div>
    </div>
  );
};
