import React from 'react';
import { Link } from 'react-router-dom';
import { FaBrain, FaHeart, FaBullseye, FaUserCheck, FaUserMd, FaShieldAlt } from 'react-icons/fa';

export const About = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About Cognitive Enhancement Support Tool (CEST)
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Bridging the gap between mental health education, cognitive training, and professional clinical care.
        </p>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl font-bold">
            <FaBrain />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is Cognitive Enhancement?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Cognitive Enhancement refers to systematic, evidence-based practices designed to optimize human cognitive abilities—such as executive control, working memory, processing speed, and emotional self-regulation. CEST provides targeted tools to support individuals dealing with stress, mood challenges, or focus difficulties.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">
            <FaHeart />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why Mental Health is Important</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Mental health is a vital component of physical health and everyday cognitive performance. Left unmanaged, psychological strain can impair memory, decision-making, and interpersonal relationships. Proactive education and cognitive intervention help foster mental resilience.
          </p>
        </div>

      </div>

      {/* Objectives Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tealBrand-600 text-white flex items-center justify-center text-xl">
            <FaBullseye />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Objectives of this Platform</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Educate & Raise Awareness</h3>
            <p>Provide clear, standardized guides on mental health conditions to help users understand symptoms and risk factors early.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Personalized Cognitive Enhancement</h3>
            <p>Deliver tailored cognitive activities and routines to support memory, executive focus, and emotional grounding.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Empower Clinicians</h3>
            <p>Offer mental health practitioners structured patient monitoring, activity assignment, and report analytics.</p>
          </div>
        </div>
      </div>

      {/* Benefits Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="p-8 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 space-y-4">
          <div className="flex items-center gap-3">
            <FaUserCheck className="text-2xl text-brand-600 dark:text-brand-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Benefits for Individuals</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li>Self-paced education on 6 standardized conditions</li>
            <li>Actionable cognitive strategies for daily routine</li>
            <li>Progress tracking and milestone markers</li>
            <li>Empowerment through informed self-awareness</li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-tealBrand-50/50 dark:bg-tealBrand-950/30 border border-tealBrand-200 dark:border-tealBrand-900/60 space-y-4">
          <div className="flex items-center gap-3">
            <FaUserMd className="text-2xl text-tealBrand-600 dark:text-tealBrand-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Benefits for Clinicians</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li>Structured patient management ecosystem</li>
            <li>Standardized framework ready for scoring & reports</li>
            <li>Seamless assignment of cognitive routines</li>
            <li>Time-saving patient progress oversight</li>
          </ul>
        </div>

      </div>

    </div>
  );
};
