import React, { useMemo, useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaMoon,
} from 'react-icons/fa';
import { assessmentService } from '../../services/assessmentService';
import {
  ISI_ITEM_KEYS,
  ISI_Q1_OPTIONS,
  ISI_Q1_SUBITEMS,
  ISI_QUESTIONS,
  ISI_INTRO,
  ISI_DISORDER_SLUG,
  ISI_TOTAL_MAX,
} from '../../data/isi';
import {
  getSeverityColor,
  getSeverityExplanation,
  isISIComplete,
  scoreISILocally,
  ISI_DISCLAIMER,
} from '../../utils/isiScoring';
import { InsomniaScoreScale } from './InsomniaScoreScale';
import { AssessmentFollowUpContent } from './AssessmentFollowUpContent';

export const InsomniaAssessment = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  const fetchCooldown = async () => {
    setLoadingCooldown(true);
    try {
      const res = await assessmentService.getCooldownStatus(ISI_DISORDER_SLUG);
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
    () => ISI_ITEM_KEYS.filter((key) => answers[key] !== undefined && answers[key] !== null).length,
    [answers]
  );

  const liveScore = useMemo(
    () =>
      ISI_ITEM_KEYS.reduce((sum, key) => {
        const val = answers[key];
        return sum + (val === undefined || val === null ? 0 : val);
      }, 0),
    [answers]
  );

  const allAnswered = isISIComplete(answers);

  const setAnswer = (itemKey, value) => {
    setAnswers((prev) => ({ ...prev, [itemKey]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) {
      const firstUnansweredKey = ISI_ITEM_KEYS.find(
        (key) => answers[key] === undefined || answers[key] === null
      );
      setError('Please answer all 7 items before submitting.');
      if (firstUnansweredKey) {
        const targetId = firstUnansweredKey.startsWith('1')
          ? `subitem-card-${firstUnansweredKey}`
          : `question-card-${firstUnansweredKey}`;
        const elem = document.getElementById(targetId) || document.getElementById('question-card-1');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await assessmentService.submitInsomnia({ answers });
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
      const localResult = scoreISILocally(answers);
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

  if (loadingCooldown) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
        <FaSpinner className="text-4xl text-tealBrand-600 dark:text-tealBrand-400 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifying Assessment Availability…</h3>
        <p className="text-xs text-slate-500">Checking 7-day cooldown status from secure server...</p>
      </div>
    );
  }

  if (result) {
    const displayTotalScore = result.totalScore ?? result.score ?? 0;
    const displayExplanation =
      result.explanation || getSeverityExplanation(result.severity || 'No clinically significant insomnia');
    const severityBadgeClass = getSeverityColor(result.severity || 'No clinically significant insomnia');

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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">ISI Results</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Insomnia Severity Index (7 Scored Items)
              </p>
            </div>
          </div>

          {/* Stat Card */}
          <div className="max-w-md mx-auto">
            <div className={`p-6 rounded-2xl border text-center ${severityBadgeClass}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                Total Severity Score
              </p>
              <p className="text-4xl font-extrabold mt-1">
                {displayTotalScore}
                <span className="text-lg font-semibold opacity-75"> / {ISI_TOTAL_MAX}</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 dark:bg-black/20">
                {result.severity || 'No clinically significant insomnia'}
              </span>
            </div>
          </div>

          <InsomniaScoreScale score={displayTotalScore} severity={result.severity} />

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/50 space-y-1">
            <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
              Clinical Interpretation
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayExplanation}</p>
          </div>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>{ISI_DISCLAIMER}</span>
          </div>

          <AssessmentFollowUpContent
            instrument="insomnia"
            score={displayTotalScore}
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
                className="px-5 py-2.5 rounded-xl bg-tealBrand-600 text-white text-sm font-bold shadow-md hover:bg-tealBrand-700 transition-all"
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
      {/* Sticky Header with Answered Count & Live Score Progress */}
      <div className="sticky top-4 z-20 glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaMoon />
              <span>ISI · Insomnia Severity Index</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Insomnia Severity Index
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Answered {answeredCount}/7
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Live Score: {liveScore} / {ISI_TOTAL_MAX}
              </p>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-tealBrand-600"
              >
                <FaArrowLeft className="text-[10px]" /> Cancel
              </button>
            )}
          </div>
        </div>

        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tealBrand-500 to-brand-600 transition-all duration-300"
            style={{ width: `${(answeredCount / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-xs font-bold uppercase text-tealBrand-600 dark:text-tealBrand-400 tracking-wider">
          Instructions & Guidance
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ISI_INTRO}</p>
      </div>

      {/* Question 1: Rendered as ONE card with 3 sub-rows (1a, 1b, 1c) */}
      <div id="question-card-1" className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-tealBrand-600 text-white text-xs font-extrabold">Question 1</span>
            <span className="text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">Current Insomnia Severity</span>
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
            Please rate the current (i.e., last 2 weeks) SEVERITY of your insomnia problem(s).
          </p>
        </div>

        <div className="space-y-5">
          {ISI_Q1_SUBITEMS.map((sub) => {
            const currentVal = answers[sub.id];
            const isAnswered = currentVal !== undefined && currentVal !== null;
            return (
              <div
                key={sub.id}
                id={`subitem-card-${sub.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isAnswered
                    ? 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900/40 border-slate-300 dark:border-slate-700'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  {sub.label}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ISI_Q1_OPTIONS.map((opt) => {
                    const selected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(sub.id, opt.value)}
                        className={`text-center px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                        }`}
                      >
                        <span className="block font-bold mb-0.5 text-sm">{opt.value}</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions 2 to 5 */}
      {ISI_QUESTIONS.filter((q) => !q.isCompound).map((q) => {
        const currentVal = answers[q.id];
        const isAnswered = currentVal !== undefined && currentVal !== null;
        return (
          <div
            key={q.id}
            id={`question-card-${q.id}`}
            className={`glass-panel p-6 sm:p-8 rounded-3xl border transition-all ${
              isAnswered
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            <div className="mb-4">
              <span className="px-2.5 py-0.5 rounded-lg bg-tealBrand-600 text-white text-xs font-extrabold inline-block mb-2">
                Question {q.id}
              </span>
              <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {q.text}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {q.options.map((opt) => {
                const selected = currentVal === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(q.id, opt.value)}
                    className={`text-center px-3 py-3 rounded-xl border text-xs font-medium transition-all ${
                      selected
                        ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                    }`}
                  >
                    <span className="block font-bold mb-0.5 text-sm">{opt.value}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Bottom Submit Row */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {allAnswered ? 'All 7 items completed!' : `Answered ${answeredCount} of 7 items`}
          </p>
          <p className="text-xs text-slate-500">
            {allAnswered
              ? 'Ready for instant ISI clinical scoring.'
              : 'Please answer all items above before submitting.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin" /> Calculating Score…
            </>
          ) : (
            <>
              <FaClipboardCheck /> Submit & View ISI Score
            </>
          )}
        </button>
      </div>
    </form>
  );
};
