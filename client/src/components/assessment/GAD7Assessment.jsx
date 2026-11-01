import React, { useMemo, useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import { assessmentService } from '../../services/assessmentService';
import {
  GAD7_QUESTIONS,
  GAD7_OPTIONS,
  GAD7_INTRO,
  GAD7_DISORDER_SLUG,
  GAD7_MAX_SCORE,
} from '../../data/gad7';
import {
  getSeverityColor,
  getSeverityExplanation,
  isGAD7Complete,
  scoreGAD7Locally,
} from '../../utils/gad7Scoring';
import { GAD7ScoreScale } from './GAD7ScoreScale';
import { AssessmentFollowUpContent } from './AssessmentFollowUpContent';

export const GAD7Assessment = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  const fetchCooldown = async () => {
    setLoadingCooldown(true);
    try {
      const res = await assessmentService.getCooldownStatus(GAD7_DISORDER_SLUG);
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
    () => GAD7_QUESTIONS.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length,
    [answers]
  );

  const liveScore = useMemo(
    () =>
      GAD7_QUESTIONS.reduce((sum, q) => {
        const val = answers[q.id];
        return sum + (val === undefined || val === null ? 0 : val);
      }, 0),
    [answers]
  );

  const allAnswered = isGAD7Complete(answers);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) {
      const firstUnanswered = GAD7_QUESTIONS.find(
        (q) => answers[q.id] === undefined || answers[q.id] === null
      );
      setError('Please answer all 7 questions before submitting.');
      if (firstUnanswered) {
        const elem = document.getElementById(`question-card-${firstUnanswered.id}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await assessmentService.submitGAD7({ answers });
      const data = res.data;
      setResult(data);
      fetchCooldown();
      if (onComplete) onComplete(data);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 403 || err.response?.data?.isLocked) {
        setError(serverMsg || 'This assessment can only be completed once every 7 days.');
        fetchCooldown();
        return;
      }
      const localResult = scoreGAD7Locally(answers);
      setResult(localResult);
      if (onComplete) onComplete(localResult);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (cooldownData?.isLocked) return;
    setResult(null);
    setAnswers({});
    setError('');
  };

  const displayScore = result?.score ?? result?.totalScore ?? 0;
  const displayExplanation =
    result?.explanation || getSeverityExplanation(result?.severity || 'Minimal Anxiety');

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
                ({cooldownData.daysRemaining}{' '}
                {cooldownData.daysRemaining === 1 ? 'day' : 'days'} remaining)
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">GAD-7 Results</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generalized Anxiety Disorder — 7-Item Scale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total Score
              </p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {displayScore}
                <span className="text-base font-semibold text-slate-400"> / {GAD7_MAX_SCORE}</span>
              </p>
            </div>
            <div className={`p-5 rounded-2xl border text-center sm:col-span-2 ${severityClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Anxiety Severity
              </p>
              <p className="text-2xl font-extrabold mt-1">{result.severity}</p>
            </div>
          </div>

          <GAD7ScoreScale score={displayScore} severity={result.severity} />

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/50">
            <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300 mb-1">
              What This Means
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{displayExplanation}</p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>
              This score is a screening result, not a diagnosis. Please consult a qualified
              clinician for interpretation and care planning.
            </span>
          </div>

          <AssessmentFollowUpContent
            instrument="gad7"
            score={displayScore}
            severity={result.severity}
            assessmentId={result._id || result.id}
          />

          <div className="flex flex-wrap gap-3">
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
              <span>GAD-7 · Anxiety</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Generalized Anxiety Disorder Scale
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Answered {answeredCount}/7
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Live Score: {liveScore}
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

        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-tealBrand-500 transition-all duration-300"
            style={{ width: `${(answeredCount / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
          Instructions
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{GAD7_INTRO}</p>
      </div>

      {/* All 7 Questions rendered in single scrollable page */}
      <div className="space-y-4">
        {GAD7_QUESTIONS.map((q) => {
          const currentVal = answers[q.id];
          const isAnswered = currentVal !== undefined && currentVal !== null;
          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`glass-panel p-6 sm:p-8 rounded-2xl border transition-all ${
                isAnswered
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                <span className="text-brand-600 dark:text-brand-400 font-bold mr-2">{q.id}.</span>
                {q.text}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {GAD7_OPTIONS.map((opt) => {
                  const selected = currentVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswer(q.id, opt.value)}
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

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Section */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {allAnswered ? 'All 7 items completed!' : `Answered ${answeredCount} of 7 questions`}
          </p>
          <p className="text-xs text-slate-500">
            {allAnswered
              ? 'Ready for instant scoring evaluation.'
              : 'Please answer all items above before submitting.'}
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
    </form>
  );
};
