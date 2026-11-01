import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaPlay,
  FaBrain,
  FaShieldAlt,
  FaPrint,
} from 'react-icons/fa';
import { assessmentService } from '../../services/assessmentService';
import {
  PHQ9_QUESTIONS,
  PHQ9_OPTIONS,
  PHQ9_FUNCTIONAL_QUESTION,
  PHQ9_FUNCTIONAL_OPTIONS,
  getSeverityColor,
  scorePHQ9Locally,
} from '../../data/phq9Questions';
import { PHQ9ScoreScale } from './PHQ9ScoreScale';
import {
  getExerciseRecommendation,
  CET_ACADEMIC_NOTICE,
} from '../../data/exerciseData';
import { AssessmentFollowUpContent } from './AssessmentFollowUpContent';

export const PHQ9Assessment = ({ onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [assessmentMode, setAssessmentMode] = useState('phq9'); // 'phq9' | 'phq2'
  const [answers, setAnswers] = useState(Array(9).fill(null));
  const [functionalResponse, setFunctionalResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  const fetchCooldown = async () => {
    setLoadingCooldown(true);
    try {
      const res = await assessmentService.getCooldownStatus('depression');
      if (res?.data) {
        setCooldownData(res.data);
        if (res.data.isLocked && res.data.latestAssessment) {
          setResult(res.data.latestAssessment);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cooldown status:', err);
    } finally {
      setLoadingCooldown(false);
    }
  };

  useEffect(() => {
    fetchCooldown();
  }, []);

  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length + (functionalResponse ? 1 : 0),
    [answers, functionalResponse]
  );

  const liveScore = useMemo(
    () => answers.reduce((sum, a) => sum + (a === null ? 0 : a), 0),
    [answers]
  );

  const allAnswered = answers.every((a) => a !== null) && Boolean(functionalResponse);

  const setAnswer = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) {
      const firstUnansweredIndex = answers.findIndex((a) => a === null);
      if (firstUnansweredIndex !== -1) {
        setError('Please answer all 9 depression screening questions before submitting.');
        const elem = document.getElementById(`question-card-${firstUnansweredIndex + 1}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (!functionalResponse) {
        setError('Please answer the functional difficulty question before submitting.');
        const elem = document.getElementById('question-card-10');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await assessmentService.submitPHQ9({
        answers,
        functionalResponse,
      });
      setResult(res.data);
      fetchCooldown();
      if (onComplete) onComplete(res.data);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 403 || err.response?.data?.isLocked) {
        setError(serverMsg || 'This assessment can only be completed once every 7 days.');
        fetchCooldown();
        return;
      }
      const localResult = scorePHQ9Locally(answers, functionalResponse);
      setResult(localResult);
      if (onComplete) onComplete(localResult);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (cooldownData?.isLocked) return;
    setResult(null);
    setAnswers(Array(9).fill(null));
    setFunctionalResponse('');
    setError('');
  };

  if (loadingCooldown) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
        <FaSpinner className="text-4xl text-brand-600 dark:text-brand-400 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifying Assessment Availability…</h3>
        <p className="text-xs text-slate-500">Checking 7-day cooldown status from secure server...</p>
      </div>
    );
  }

  if (result) {
    const severityClass = getSeverityColor(result.severity);
    const item9Positive = Number(result.answers?.[8]) > 0;
    const currentScore = Number(result.totalScore ?? result.score ?? 0);
    const isHighestSeverity = currentScore >= 20;
    const recommendation = getExerciseRecommendation(currentScore, result.severity);

    return (
      <div className="space-y-6">
        {cooldownData?.isLocked && (
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 text-left shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-amber-800 dark:text-amber-300">
              <FaExclamationTriangle className="text-amber-500 text-lg shrink-0" />
              <span>Assessment Completed Recently — 7-Day Cooldown Active</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              You completed this assessment on{' '}
              <strong className="text-slate-900 dark:text-white">
                {cooldownData.lastCompletedAt
                  ? new Date(cooldownData.lastCompletedAt).toLocaleString()
                  : 'recently'}
              </strong>
              . To ensure clinical validity, questionnaires can only be completed once every 7 days per user.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold shadow-sm">
                Available again on:{' '}
                {cooldownData.nextAvailableAt
                  ? new Date(cooldownData.nextAvailableAt).toLocaleString()
                  : 'in 7 days'}
              </span>
              <span className="text-amber-800 dark:text-amber-300 font-bold">
                ({cooldownData.daysRemaining} {cooldownData.daysRemaining === 1 ? 'day' : 'days'} remaining)
              </span>
            </div>
          </div>
        )}

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-tealBrand-500/15 flex items-center justify-center">
              <FaCheckCircle className="text-2xl text-tealBrand-600 dark:text-tealBrand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">PHQ-9 Results</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient Health Questionnaire — Depression Screening
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total Score
              </p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {currentScore}
                <span className="text-base font-semibold text-slate-400"> / 27</span>
              </p>
            </div>
            <div className={`p-5 rounded-2xl border text-center sm:col-span-2 ${severityClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Depression Severity
              </p>
              <p className="text-2xl font-extrabold mt-1">{result.severity}</p>
            </div>
          </div>

          <PHQ9ScoreScale score={currentScore} severity={result.severity} />

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/50">
            <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300 mb-1">
              Clinical Consideration
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {result.diagnosticConsideration}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase text-slate-500 mb-1">
              Functional Difficulty
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {result.functionalResponse}
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>
              This score is a screening result, not a diagnosis. Please consult a qualified
              clinician for interpretation and care planning.
              {item9Positive &&
                ' If you are having thoughts of harming yourself, seek immediate help from a crisis line or emergency services.'}
            </span>
          </div>

          {/* Evidence-Based Follow-Up Section: Contact Clinician on last band / item 9; CBT exercises on every non-last band */}
          <AssessmentFollowUpContent
            instrument="phq9"
            score={currentScore}
            severity={result.severity}
            assessmentId={result._id || result.id}
            item9Positive={item9Positive}
          />

          {/* Recommended Cognitive Training Card (Driven by getExerciseRecommendation for scores 5-9, 10-14, 15-19; hidden for 0-4 and 20-27) */}
          {!isHighestSeverity && !item9Positive && recommendation?.recommend && recommendation?.exercise && (
            <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent p-6 sm:p-7 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                    <FaBrain className="text-purple-600 dark:text-purple-400" />
                    Recommended Cognitive Training
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {recommendation.exercise.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    {recommendation.exercise.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {recommendation.exercise.estimatedDuration}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 tracking-wide">
                  Cognitive Domain: {recommendation.exercise.domain}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {recommendation.exercise.shortDescription}
                </p>
              </div>

              {/* CET Academic Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
                <FaShieldAlt className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 text-base" />
                <div>
                  <strong className="block mb-0.5 font-bold">CET Academic Notice:</strong>
                  {recommendation.disclaimer || CET_ACADEMIC_NOTICE}
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  id="start-recommended-exercise-btn"
                  onClick={() =>
                    navigate(`/exercises/${recommendation.exercise.id}`, {
                      state: {
                        assessmentId: result._id || result.id || null,
                        assessmentScore: currentScore,
                        assessmentSeverity: result.severity,
                      },
                    })
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <FaPlay className="text-xs" />
                  <span>Start Exercise</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {cooldownData?.isLocked ? (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700"
              >
                Assessment Locked (Available in {cooldownData.daysRemaining}{' '}
                {cooldownData.daysRemaining === 1 ? 'day' : 'days'})
              </button>
            ) : (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700 transition-all"
              >
                Retake Assessment
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              <FaPrint className="text-xs" />
              <span>Save My Results</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Back to Assessments
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sticky Top Header */}
      <div className="sticky top-4 z-20 glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <FaClipboardCheck />
              <span>{assessmentMode === 'phq2' ? 'PHQ-2 · Quick Depression Screen' : 'PHQ-9 · Comprehensive Depression Screening'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {assessmentMode === 'phq2' ? 'Patient Health Questionnaire-2 (PHQ-2)' : 'Patient Health Questionnaire-9 (PHQ-9)'}
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {assessmentMode === 'phq2'
                  ? `Answered ${answers.slice(0, 2).filter((a) => a !== null).length}/2`
                  : `Answered ${answeredCount}/10`}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                {assessmentMode === 'phq2'
                  ? `Screen Score: ${(answers[0] ?? 0) + (answers[1] ?? 0)} / 6`
                  : `Live Score: ${liveScore}`}
              </p>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600"
              >
                <FaArrowLeft className="text-[10px]" /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setAssessmentMode('phq9')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              assessmentMode === 'phq9'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PHQ-9 Standard Assessment (9 Items)
          </button>
          <button
            type="button"
            onClick={() => setAssessmentMode('phq2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              assessmentMode === 'phq2'
                ? 'bg-tealBrand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PHQ-2 Quick Screen (2 Items)
          </button>
        </div>

        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-tealBrand-500 transition-all duration-300"
            style={{
              width: assessmentMode === 'phq2'
                ? `${(answers.slice(0, 2).filter((a) => a !== null).length / 2) * 100}%`
                : `${(answeredCount / 10) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
          Instructions
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Over the last 2 weeks, how often have you been bothered by any of the following problems?
        </p>
      </div>

      {/* Symptom Questions (2 for PHQ-2, 9 for PHQ-9) */}
      <div className="space-y-4">
        {(assessmentMode === 'phq2' ? PHQ9_QUESTIONS.slice(0, 2) : PHQ9_QUESTIONS).map((questionText, idx) => {
          const currentVal = answers[idx];
          const isAnswered = currentVal !== null;
          const qId = idx + 1;
          return (
            <div
              key={qId}
              id={`question-card-${qId}`}
              className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all ${
                isAnswered
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                <span className="text-brand-600 dark:text-brand-400 font-bold mr-2">{qId}.</span>
                {questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PHQ9_OPTIONS.map((opt) => {
                  const selected = currentVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswer(idx, opt.value)}
                      className={`text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                        selected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                      }`}
                    >
                      <span className="block font-bold text-xs mb-0.5">{opt.value}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* PHQ-2 Quick Screen Result & Recommendation Card */}
      {assessmentMode === 'phq2' && answers[0] !== null && answers[1] !== null && (
        <div
          className={`p-6 sm:p-7 rounded-3xl border space-y-4 transition-all ${
            (answers[0] + answers[1]) >= 3
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-base sm:text-lg">
              {(answers[0] + answers[1]) >= 3 ? (
                <FaExclamationTriangle className="text-amber-500 text-xl" />
              ) : (
                <FaCheckCircle className="text-emerald-500 text-xl" />
              )}
              <span>
                {(answers[0] + answers[1]) >= 3
                  ? 'Positive PHQ-2 Screen (Cut-off ≥ 3)'
                  : 'Negative PHQ-2 Screen (Cut-off < 3)'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
              Score: {(answers[0] + answers[1])} / 6
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {(answers[0] + answers[1]) >= 3
              ? 'Your score is 3 or higher, which indicates significant depressive symptoms (sensitivity ~83%, specificity ~92%). Clinical guidelines strongly recommend continuing with the full 9-item PHQ-9 for a comprehensive assessment.'
              : 'Your score is below 3, indicating a lower likelihood of major depression. Continue your healthy routines and positive self-care habits. You may continue to the full PHQ-9 at any time.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAssessmentMode('phq9')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FaClipboardCheck />
              <span>
                {(answers[0] + answers[1]) >= 3
                  ? 'Continue with Full PHQ-9 (First 2 Answers Saved)'
                  : 'Take Full PHQ-9 Anyway'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all"
            >
              Explore Self-Care Activities
            </button>
          </div>
        </div>
      )}

      {/* Question 10: Functional Health Assessment (Shown only in PHQ-9 mode) */}
      {assessmentMode === 'phq9' && (
        <div className="pt-4 space-y-4">
          <div className="p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-tealBrand-600 text-white text-xs font-extrabold">Item 10</span>
              Functional Impact Assessment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This item evaluates daily life impact and is not included in the numerical total score (0–27).
            </p>
          </div>

          <div
            id="question-card-10"
            className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all ${
              functionalResponse
                ? 'border-tealBrand-200 dark:border-tealBrand-900'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
              <span className="text-tealBrand-600 dark:text-tealBrand-400 font-bold mr-2">10.</span>
              {PHQ9_FUNCTIONAL_QUESTION}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PHQ9_FUNCTIONAL_OPTIONS.map((opt) => {
                const selected = functionalResponse === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setFunctionalResponse(opt);
                      setError('');
                    }}
                    className={`text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Section (Shown only in PHQ-9 mode) */}
      {assessmentMode === 'phq9' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {allAnswered ? 'All 10 items completed!' : `Answered ${answeredCount} of 10 items`}
            </p>
            <p className="text-xs text-slate-500">
              {allAnswered
                ? 'Ready for instant scoring evaluation.'
                : 'Please complete all items above before submitting.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" /> Calculating Score…
              </>
            ) : (
              <>
                <FaClipboardCheck /> Submit & See Score
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};
