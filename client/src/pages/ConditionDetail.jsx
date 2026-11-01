import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { disordersData } from '../data/disordersData';
import { DisorderIcon } from '../components/common/DisorderIcon';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowLeft,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
  FaShieldAlt,
  FaInfoCircle,
  FaBrain,
} from 'react-icons/fa';

export const ConditionDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const disorder = disordersData.find((d) => d.slug === slug);

  if (!disorder) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Condition Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">The requested disorder page could not be located.</p>
        <Link to="/conditions" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
          Return to All Conditions
        </Link>
      </div>
    );
  }

  const handleStartAssessment = () => {
    if (isAuthenticated) {
      // Logged in -> continue to assessment / dashboard section
      const targetDashboard = role === 'clinician' ? '/dashboard/clinician' : '/dashboard/self';
      navigate(targetDashboard, { state: { disorder: disorder.name, action: 'start_assessment' } });
    } else {
      // Not logged in -> redirect to login with return path state
      navigate('/login', { state: { returnTo: `/conditions/${slug}`, message: 'Please log in or sign up to begin assessment.' } });
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Back Button */}
      <Link
        to="/conditions"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <FaArrowLeft className="text-xs" />
        <span>Back to All Conditions</span>
      </Link>

      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center border border-brand-200 dark:border-slate-700">
              <DisorderIcon name={disorder.iconName} className="text-3xl text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950/60 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-200">
                {disorder.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                {disorder.name}
              </h1>
            </div>
          </div>

          {/* Prominent Start Assessment CTA */}
          <button
            onClick={handleStartAssessment}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 hover:from-brand-700 hover:to-tealBrand-700 text-white font-extrabold text-base shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 shrink-0"
          >
            <FaClipboardCheck className="text-xl animate-bounce" />
            <span>Start Assessment</span>
          </button>

        </div>

        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
          {disorder.shortDescription}
        </p>
      </div>

      {/* Definition Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FaInfoCircle className="text-brand-500" />
          <span>Definition & Clinical Overview</span>
        </h2>
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed text-base">
          {disorder.definition}
        </div>
      </section>

      {/* Symptoms & Causes Dual Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Symptoms */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" />
            <span>Primary Symptoms</span>
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            {disorder.symptoms.map((symptom, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FaCheckCircle className="text-brand-500 mt-1 shrink-0" />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Causes */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaLightbulb className="text-tealBrand-500" />
            <span>Underlying Causes</span>
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            {disorder.causes.map((cause, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <FaCheckCircle className="text-tealBrand-500 mt-1 shrink-0" />
                <span>{cause}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Risk Factors & Common Warning Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Risk Factors */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaShieldAlt className="text-purple-500" />
            <span>Risk Factors</span>
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            {disorder.riskFactors.map((rf, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                <span>{rf}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Common Signs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-500" />
            <span>Common Signs to Look Out For</span>
          </h2>
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            {disorder.commonSigns.map((sign, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                <span>{sign}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Early Detection Importance */}
      <section className="glass-panel p-8 rounded-3xl border border-brand-200/80 dark:border-brand-900/60 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FaShieldAlt className="text-brand-600 dark:text-brand-400" />
          <span>Importance of Early Detection</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {disorder.importanceOfEarlyDetection}
        </p>
      </section>

      {/* Cognitive Enhancement Strategies */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FaBrain className="text-tealBrand-500" />
          <span>How Cognitive Enhancement Can Support You</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disorder.cognitiveEnhancementSupport.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-brand-600 dark:text-brand-400 text-base">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Floating/Prominent CTA */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-6 shadow-2xl">
        <h2 className="text-2xl font-extrabold">Ready to evaluate your cognitive well-being?</h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Begin standardized evaluation for {disorder.name}. Receive structured cognitive enhancement routines and track progress securely over time.
        </p>
        <button
          onClick={handleStartAssessment}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-tealBrand-500 hover:from-brand-600 hover:to-tealBrand-600 text-white font-extrabold text-base shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
        >
          <FaClipboardCheck />
          <span>Start Assessment for {disorder.name}</span>
        </button>
      </div>

    </div>
  );
};
