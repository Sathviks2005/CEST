import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { disordersData } from '../data/disordersData';
import { DisorderCard } from '../components/disorder/DisorderCard';
import { useAuth } from '../context/AuthContext';
import {
  FaBrain,
  FaUserMd,
  FaUserCheck,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaLightbulb,
  FaHeartbeat,
} from 'react-icons/fa';

export const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else {
      navigate(role === 'clinician' ? '/dashboard/clinician' : '/dashboard/self');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent dark:from-brand-500/20"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold">
              <FaBrain className="text-brand-500 animate-pulse" />
              <span>Evidence-Aligned Mental Health & Cognitive Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Cognitive Enhancement <br />
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-tealBrand-500 bg-clip-text text-transparent">
                Support Tool
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Empowering Mental Wellness Through Assessment, Cognitive Enhancement, and Professional Support. Designed for individuals and healthcare clinicians.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Get Started Now</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-base border border-slate-200 dark:border-slate-700 transition-colors text-center"
              >
                Learn More
              </Link>
            </div>

            {/* Quick Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-tealBrand-500" /> Standardized Protocols
              </span>
              <span className="flex items-center gap-1.5">
                <FaUserCheck className="text-brand-500" /> Dual Role Engine
              </span>
            </div>
          </div>

          {/* Modern Healthcare Illustration */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-lg aspect-square rounded-3xl bg-gradient-to-tr from-brand-600/20 via-tealBrand-500/20 to-blue-400/10 p-6 sm:p-10 backdrop-blur-3xl border border-white/40 dark:border-slate-800 shadow-2xl relative">
              
              {/* Floating Cards Mockup Illustration */}
              <div className="absolute top-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 shadow-lg border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center text-xl shrink-0">
                  <FaBrain />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cognitive Stamina Score</h4>
                  <p className="text-xs text-slate-500">Working Memory & Focus Tracking</p>
                </div>
              </div>

              <div className="absolute top-32 left-10 right-10 bg-white/95 dark:bg-slate-900/95 rounded-2xl p-5 shadow-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Executive Focus Index</span>
                  <span className="text-tealBrand-600 dark:text-tealBrand-400 font-bold">+18% Progress</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-tealBrand-500 h-full w-[82%] rounded-full"></div>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl flex items-center justify-between border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tealBrand-500 flex items-center justify-center text-white text-lg">
                    <FaUserMd />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Clinician Monitoring</h5>
                    <p className="text-[11px] text-slate-400">Real-time Patient Insights</p>
                  </div>
                </div>
                <span className="text-xs bg-tealBrand-950 text-tealBrand-300 font-semibold px-2.5 py-1 rounded-full border border-tealBrand-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Overview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Educating Visitors Before Assessment
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Understanding Mental Health & Cognitive Enhancement
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
            Mental health is a fundamental pillar of overall human well-being. Cognitive enhancement involves evidence-based cognitive strategies, exercises, and structured routines to strengthen attention, memory, and executive function.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl font-bold">
              <FaLightbulb />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">What is Cognitive Enhancement?</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Targeted cognitive practices designed to improve executive functioning, mental clarity, processing speed, and neuroplasticity under daily stress.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950/60 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center text-2xl font-bold">
              <FaHeartbeat />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Why Mental Health Matters</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Proactive mental well-being directly shapes decision quality, physical immunity, workplace performance, and meaningful personal relationships.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl font-bold">
              <FaChartLine />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Continuous Tracking</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Regular cognitive measurement enables individuals and clinicians to detect subtle changes early and fine-tune enhancement interventions.
            </p>
          </div>
        </div>
      </section>

      {/* Mental Health Conditions Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-tealBrand-600 dark:text-tealBrand-400">
              Disorder Guides
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Mental Health Conditions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Select any condition to view definitions, symptoms, causes, risk factors, and cognitive enhancement strategies.
            </p>
          </div>

          <Link
            to="/conditions"
            className="inline-flex items-center gap-2 font-semibold text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700"
          >
            <span>View All 6 Conditions</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disordersData.slice(0, 6).map((disorder) => (
            <DisorderCard key={disorder.slug} disorder={disorder} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/conditions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-sm text-slate-800 dark:text-white transition-colors"
          >
            <span>Browse Complete Disorder Library</span>
            <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Benefits for Self Users vs Clinicians */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-16 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Tailored Dual Support
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Who Benefits From CEST?
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Self Users */}
            <div className="glass-panel p-8 rounded-2xl border border-brand-200/80 dark:border-brand-900/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center text-lg">
                  <FaUserCheck />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">For Self Users</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-brand-500 mt-1 shrink-0" />
                  <span>Comprehensive educational guides for 6 core mental health conditions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-brand-500 mt-1 shrink-0" />
                  <span>Access to standardized self-assessment frameworks and cognitive routines.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-brand-500 mt-1 shrink-0" />
                  <span>Personalized cognitive enhancement modules for focus, memory, and resilience.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-brand-500 mt-1 shrink-0" />
                  <span>Private dashboard to log personal insights and track wellness over time.</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-block px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Join as Self User
              </Link>
            </div>

            {/* Clinicians */}
            <div className="glass-panel p-8 rounded-2xl border border-tealBrand-200/80 dark:border-tealBrand-900/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tealBrand-600 text-white flex items-center justify-center text-lg">
                  <FaUserMd />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">For Clinicians</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-tealBrand-500 mt-1 shrink-0" />
                  <span>Centralized patient monitoring and assessment oversight tools.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-tealBrand-500 mt-1 shrink-0" />
                  <span>Ability to assign specialized cognitive enhancement tasks to patients.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-tealBrand-500 mt-1 shrink-0" />
                  <span>Standardized data structure ready for clinical reports & severity metrics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-tealBrand-500 mt-1 shrink-0" />
                  <span>Streamlined workflow for psychologists, psychiatrists, and counselors.</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-block px-6 py-3 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Join as Clinician
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
