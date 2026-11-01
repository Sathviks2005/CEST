import React, { useMemo, useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaBolt,
} from 'react-icons/fa';
import { assessmentService } from '../../services/assessmentService';
import {
  ASRS_PART_A_QUESTIONS,
  ASRS_PART_B_QUESTIONS,
  ASRS_QUESTIONS,
  ASRS_OPTIONS,
  ASRS_INTRO,
  ASRS_DISORDER_SLUG,
  ASRS_PART_A_MAX,
  ASRS_PART_B_MAX,
  ASRS_TOTAL_MAX,
} from '../../data/adhd';
import {
  getSeverityColor,
  getSeverityExplanation,
  isASRSComplete,
  scoreASRSLocally,
  isShadedHit,
  ASRS_DISCLAIMER,
} from '../../utils/adhdScoring';
import { ADHDScoreScale } from './ADHDScoreScale';
import { AssessmentFollowUpContent } from './AssessmentFollowUpContent';

export const ADHDAssessment = ({ onComplete, onCancel }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cooldownData, setCooldownData] = useState(null);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  const fetchCooldown = async () => {
    setLoadingCooldown(true);
    try {
      const res = await assessmentService.getCooldownStatus(ASRS_DISORDER_SLUG);
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
    () => ASRS_QUESTIONS.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length,
    [answers]
  );

  const liveScore = useMemo(
    () =>
      ASRS_QUESTIONS.reduce((sum, q) => {
        const val = answers[q.id];
        return sum + (val === undefined || val === null ? 0 : val);
      }, 0),
    [answers]
  );

  const allAnswered = isASRSComplete(answers);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) {
      const firstUnanswered = ASRS_QUESTIONS.find(
        (q) => answers[q.id] === undefined || answers[q.id] === null
      );
      setError('Please answer all 18 questions before submitting.');
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
      const res = await assessmentService.submitADHD({ answers });
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
      const localResult = scoreASRSLocally(answers);
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
        <FaSpinner className="text-4xl text-brand-600 dark:text-brand-400 animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifying Assessment Availability…</h3>
        <p className="text-xs text-slate-500">Checking 7-day cooldown status from secure server...</p>
      </div>
    );
  }

  if (result) {
    const displayTotalScore = result.totalScore ?? result.score ?? 0;
    const displayPartAScore = result.partAScore ?? 0;
    const displayPartBScore = result.partBScore ?? 0;
    const displayShadedHits = result.shadedHitCount ?? 0;
    const displayScreenResult = result.screenResult || (displayShadedHits >= 4 ? 'Positive Screen' : 'Negative Screen');
    const displayExplanation =
      result.explanation || getSeverityExplanation(displayScreenResult);

    const screenBadgeClass = getSeverityColor(displayScreenResult);

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
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <FaCheckCircle className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">ASRS-v1.1 Results</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adult ADHD Self-Report Scale (18 Items)
              </p>
            </div>
          </div>

          {/* 3 Stat Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border text-center ${screenBadgeClass}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Part A Shaded Hits
              </p>
              <p className="text-3xl font-extrabold mt-1">
                {displayShadedHits}
                <span className="text-base font-semibold opacity-75"> / 6</span>
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 dark:bg-black/20">
                {displayScreenResult}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Part B Score
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {displayPartBScore}
                <span className="text-base font-semibold text-slate-400"> / {ASRS_PART_B_MAX}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2">Additional Frequency Scale</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Combined Total Score
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {displayTotalScore}
                <span className="text-base font-semibold text-slate-400"> / {ASRS_TOTAL_MAX}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2">{result.severity || 'Likelihood Index'}</p>
            </div>
          </div>

          <ADHDScoreScale score={displayTotalScore} severity={result.severity} />

          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/50 space-y-1">
            <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
              Screening Interpretation
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{displayExplanation}</p>
          </div>

          <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>{ASRS_DISCLAIMER}</span>
          </div>

          <AssessmentFollowUpContent
            instrument="adhd"
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
      {/* Sticky Header with Answered Count & Live Score Progress */}
      <div className="sticky top-4 z-20 glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <FaBolt />
              <span>ASRS-v1.1 · Adult ADHD Scale</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Adult ADHD Self-Report Scale
            </h2>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Answered {answeredCount}/18
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
            className="h-full bg-gradient-to-r from-amber-500 to-brand-600 transition-all duration-300"
            style={{ width: `${(answeredCount / 18) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 tracking-wider">
          Instructions & Guidance
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ASRS_INTRO}</p>
      </div>

      {/* Part A Section */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-xs font-extrabold">Part A</span>
            Primary Symptom Screening (Questions 1–6)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Four or more shaded responses in Part A indicate a positive screen for adult ADHD.
          </p>
        </div>

        <div className="space-y-4">
          {ASRS_PART_A_QUESTIONS.map((q) => {
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
                <div className="flex items-start justify-between gap-3 mb-4">
                  <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    <span className="text-amber-600 dark:text-amber-400 font-bold mr-2">{q.id}.</span>
                    {q.text}
                  </p>
                  {isShadedHit(q.id, currentVal) && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Shaded Criterion Hit
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {ASRS_OPTIONS.map((opt) => {
                    const selected = currentVal === opt.value;
                    const isShadedOption = isShadedHit(q.id, opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`text-center px-3 py-3 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                            : isShadedOption
                              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-300/60 dark:border-amber-800/60 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
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

      {/* Part B Section */}
      <div className="space-y-4 pt-4">
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-brand-600 text-white text-xs font-extrabold">Part B</span>
            Additional Symptom Scale (Questions 7–18)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Provides additional frequency detail regarding executive functioning and symptom severity.
          </p>
        </div>

        <div className="space-y-4">
          {ASRS_PART_B_QUESTIONS.map((q) => {
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
                <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
                  <span className="text-brand-600 dark:text-brand-400 font-bold mr-2">{q.id}.</span>
                  {q.text}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {ASRS_OPTIONS.map((opt) => {
                    const selected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`text-center px-3 py-3 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
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
            {allAnswered ? 'All 18 items completed!' : `Answered ${answeredCount} of 18 questions`}
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
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
        >
          {submitting ? (
            <>
              <FaSpinner className="animate-spin" /> Calculating Score…
            </>
          ) : (
            <>
              <FaClipboardCheck /> Submit & View ASRS Score
            </>
          )}
        </button>
      </div>
    </form>
  );
};
