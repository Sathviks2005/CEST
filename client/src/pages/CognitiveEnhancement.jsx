import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaRunning, FaLightbulb, FaChartLine, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export const CognitiveEnhancement = () => {
  const modules = [
    {
      title: 'Working Memory Stamina',
      category: 'Memory & Speed',
      description: 'Exercises designed to increase active memory holding capacity, dual-n-back retention, and information retrieval under time constraints.',
    },
    {
      title: 'Executive Focus & Response Control',
      category: 'Attention Control',
      description: 'Tasks aimed at enhancing response inhibition, suppressing distracting cues, and sustaining long-duration attention spans.',
    },
    {
      title: 'Cognitive Flexibility & Set-Shifting',
      category: 'Problem Solving',
      description: 'Pattern switching games that train adaptive mental pivots between complex rules and changing problem demands.',
    },
    {
      title: 'Emotional Grounding & Stress Reframing',
      category: 'Resilience Protocol',
      description: 'Evidence-aligned cognitive restructuring routines to reduce autonomic hyperarousal and catastrophic thought loops.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cognitive Enhancement Programs
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Targeted cognitive exercises, neuroplasticity tasks, and structured wellness routines engineered to strengthen focus, memory, and psychological resilience.
        </p>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modules.map((mod, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200">
              {mod.category}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{mod.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{mod.description}</p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Standardized Cognitive Protocol</span>
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1">
                <span>Unlock Full Suite</span> <FaArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* How it Works Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-tealBrand-200/80 dark:border-tealBrand-900/60 space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <FaBrain className="text-tealBrand-600" />
          <span>The Science Behind Cognitive Enhancement</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Cognitive enhancement utilizes principles of neuroplasticity—the brain’s ability to re-wire and adapt in response to repetitive, challenging tasks. By combining regular self-assessments with structured cognitive exercises, users build measurable cognitive reserve over time.
        </p>
      </div>

    </div>
  );
};
