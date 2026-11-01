import React, { useMemo, useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaSyncAlt,
} from 'react-icons/fa';
import { assessmentService } from '../../services/assessmentService';
import {
  YBOCS_OBSESSION_QUESTIONS,
  YBOCS_COMPULSION_QUESTIONS,
  YBOCS_INSIGHT_QUESTIONS,
  YBOCS_QUESTIONS,
  YBOCS_INTRO,
  YBOCS_DISORDER_SLUG,
  YBOCS_OBSESSION_MAX,
  YBOCS_COMPULSION_MAX,
  YBOCS_TOTAL_MAX,
} from '../../data/ocd';
import {
  getSeverityColor,
  getSeverityExplanation,
  isYBOCSComplete,
  scoreYBOCSLocally,
  YBOCS_DISCLAIMER,
} from '../../utils/ybocsScoring';
import { OCDScoreScale } from './OCDScoreScale';
import { AssessmentFollowUpContent } from './AssessmentFollowUpContent';

export const OCDAssessment = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  const fetchCooldown = async () => {
    setLoadingCooldown(true);
    try {
      const res = await assessmentService.getCooldownStatus(YBOCS_DISORDER_SLUG);
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
    () => YBOCS_QUESTIONS.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length,
    [answers]
  );

  // Live total sum: questions 1–10 (item 11 is excluded from total)
  const liveScore = useMemo(
    () =>
      YBOCS_QUESTIONS.filter((q) => q.id <= 10).reduce((sum, q) => {
        const val = answers[q.id];
        return sum + (val === undefined || val === null ? 0 : val);
      }, 0),
    [answers]
  );

  const allAnswered = isYBOCSComplete(answers);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) {
      const firstUnanswered = YBOCS_QUESTIONS.find(
        (q) => answers[q.id] === undefined || answers[q.id] === null
      );
      setError('Please answer all 11 questions before submitting.');
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
      const res = await assessmentService.submitOCD({ answers });
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
      const localResult = scoreYBOCSLocally(answers);
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
    const displayObsessionSubtotal =
      result.obsessionSubtotal ??
      (Array.isArray(result.answers)
        ? result.answers.slice(0, 5).reduce((s, n) => s + Number(n), 0)
        : 0);
    const displayCompulsionSubtotal =
      result.compulsionSubtotal ??
      (Array.isArray(result.answers)
        ? result.answers.slice(5, 10).reduce((s, n) => s + Number(n), 0)
        : 0);

    const displayExplanation =
      result.explanation || getSeverityExplanation(result.severity || 'Subclinical');
    const severityBadgeClass = getSeverityColor(result.severity || 'Subclinical');

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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Y-BOCS Results</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yale-Brown Obsessive Compulsive Scale (Part 2)
              </p>
            </div>
          </div>

          {/* 3 Stat Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Obsession Subtotal
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {displayObsessionSubtotal}
                <span className="text-base font-semibold text-slate-400"> / {YBOCS_OBSESSION_MAX}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Questions 1–5</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Compulsive Subtotal
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {displayCompulsionSubtotal}
                <span className="text-base font-semibold text-slate-400"> / {YBOCS_COMPULSION_MAX}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Questions 6–10</p>
            </div>

            <div className={`p-5 rounded-2xl border text-center ${severityBadgeClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Total Severity Score
              </p>
              <p className="text-3xl font-extrabold mt-1">
                {displayTotalScore}
                <span className="text-base font-semibold opacity-75"> / {YBOCS_TOTAL_MAX}</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 dark:bg-black/20">
                {result.severity || 'Subclinical'}
              </span>
            </div>
          </div>

          <OCDScoreScale score={displayTotalScore} severity={result.severity} />

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/50 space-y-1">
            <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
              Clinical Interpretation
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayExplanation}</p>
          </div>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>{YBOCS_DISCLAIMER}</span>
          </div>

          <AssessmentFollowUpContent
            instrument="ocd"
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
              <FaSyncAlt />
              <span>Y-BOCS · Yale-Brown Obsessive Compulsive Scale</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Obsessive-Compulsive Scale (Part 2)
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Answered {answeredCount}/11
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Live Total Score: {liveScore} / {YBOCS_TOTAL_MAX}
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
            style={{ width: `${(answeredCount / 11) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-xs font-bold uppercase text-tealBrand-600 dark:text-tealBrand-400 tracking-wider">
          Instructions & Guidance
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{YBOCS_INTRO}</p>
      </div>

      {/* Section 1: Obsessive Thoughts */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-tealBrand-900 dark:text-tealBrand-200 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-tealBrand-600 text-white text-xs font-extrabold">Section 1</span>
            Obsessive Thoughts (Questions 1–5)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assesses time occupied, interference, distress, resistance, and control over obsessions.
          </p>
        </div>

        <div className="space-y-4">
          {YBOCS_OBSESSION_QUESTIONS.map((q) => {
            const currentVal = answers[q.id];
            const isAnswered = currentVal !== undefined && currentVal !== null;
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isAnswered
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 mb-1">
                    Question {q.id} · {q.title}
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {q.options.map((opt) => {
                    const selected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`text-left sm:text-center p-3.5 rounded-xl border text-xs font-medium transition-all flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-1 ${
                          selected
                            ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                        }`}
                      >
                        <span className="font-extrabold text-sm sm:mb-1 shrink-0 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                          {opt.value}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Compulsions */}
      <div className="space-y-4 pt-4">
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-brand-600 text-white text-xs font-extrabold">Section 2</span>
            Compulsions (Questions 6–10)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assesses time spent, interference, distress, resistance, and control over compulsive rituals.
          </p>
        </div>

        <div className="space-y-4">
          {YBOCS_COMPULSION_QUESTIONS.map((q) => {
            const currentVal = answers[q.id];
            const isAnswered = currentVal !== undefined && currentVal !== null;
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isAnswered
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
                    Question {q.id} · {q.title}
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {q.options.map((opt) => {
                    const selected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`text-left sm:text-center p-3.5 rounded-xl border text-xs font-medium transition-all flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-1 ${
                          selected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                        }`}
                      >
                        <span className="font-extrabold text-sm sm:mb-1 shrink-0 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                          {opt.value}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Additional Question 11 */}
      <div className="space-y-4 pt-4">
        <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/30 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-600 text-white text-xs font-extrabold">Section 3</span>
            Additional question (not included in your total)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Assesses insight into the rationality of obsessions and compulsions. Required for clinical completeness.
          </p>
        </div>

        <div className="space-y-4">
          {YBOCS_INSIGHT_QUESTIONS.map((q) => {
            const currentVal = answers[q.id];
            const isAnswered = currentVal !== undefined && currentVal !== null;
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isAnswered
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Question {q.id} · Insight Evaluation (Unscored)
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {q.options.map((opt) => {
                    const selected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`text-left sm:text-center p-3.5 rounded-xl border text-xs font-medium transition-all flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-1 ${
                          selected
                            ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                        }`}
                      >
                        <span className="font-extrabold text-sm sm:mb-1 shrink-0 px-2 py-0.5 rounded bg-black/5 dark:bg-white/10">
                          {opt.value}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
            {allAnswered ? 'All 11 items completed!' : `Answered ${answeredCount} of 11 questions`}
          </p>
          <p className="text-xs text-slate-500">
            {allAnswered
              ? 'Ready for instant Y-BOCS severity scoring.'
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
              <FaClipboardCheck /> Submit & View Y-BOCS Score
            </>
          )}
        </button>
      </div>
    </form>
  );
};
