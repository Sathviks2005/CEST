import React, { useState, useMemo, useEffect } from 'react';
import {
  FaStethoscope,
  FaUserInjured,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaHistory,
  FaListOl,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaPrint,
} from 'react-icons/fa';
import { hamdService } from '../../services/hamdService';
import {
  HAMD_QUESTIONS,
  getHamdSeverityFromScore,
  getHamdSeverityColor,
  scoreHamdLocally,
} from '../../data/hamdQuestions';
import { HamDScoreScale } from './HamDScoreScale';

export const HamDAssessment = ({
  initialPatientName = '',
  initialPatientId = '',
  onComplete,
  onCancel,
}) => {
  const [patientName, setPatientName] = useState(initialPatientName || 'Alexander Wright');
  const [patientId, setPatientId] = useState(initialPatientId || 'p1');
  const [itemScores, setItemScores] = useState(Array(17).fill(null));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('form'); // 'form' | 'result' | 'history'
  const [submittedResult, setSubmittedResult] = useState(null);

  const isScopedToPatient = Boolean(initialPatientId || initialPatientName);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    if (initialPatientName) setPatientName(initialPatientName);
    if (initialPatientId) setPatientId(initialPatientId);
  }, [initialPatientName, initialPatientId]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await hamdService.getMyHamdAssessments();
      if (res?.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load HAM-D assessment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const answeredCount = useMemo(
    () => itemScores.filter((s) => s !== null).length,
    [itemScores]
  );

  const liveTotalScore = useMemo(
    () => itemScores.reduce((sum, s) => sum + (s === null ? 0 : s), 0),
    [itemScores]
  );

  const liveSeverity = useMemo(
    () => getHamdSeverityFromScore(liveTotalScore),
    [liveTotalScore]
  );

  const setScore = (itemIndex, value) => {
    setItemScores((prev) => {
      const next = [...prev];
      next[itemIndex] = value;
      return next;
    });
    setError('');
  };

  const handlePatientSelect = (p) => {
    setPatientName(p.name);
    setPatientId(p.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please specify a patient name for this assessment session.');
      return;
    }

    if (itemScores.some((s) => s === null)) {
      setError(`Please complete scoring for all 17 items. (${answeredCount}/17 completed)`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await hamdService.submitHamD({
        patientName,
        patientId,
        itemScores,
        notes,
      });
      setSubmittedResult(res.data);
      setActiveView('result');
      fetchHistory();
      if (onComplete) onComplete(res.data);
    } catch (err) {
      // Local fallback for offline mode
      const localRes = scoreHamdLocally(itemScores, patientName, notes);
      setSubmittedResult(localRes);
      setActiveView('result');
      fetchHistory();
      if (onComplete) onComplete(localRes);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemScores(Array(17).fill(null));
    setNotes('');
    setSubmittedResult(null);
    setActiveView('form');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab switcher */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaStethoscope />
              <span>Clinician-Administered Assessment • Depression Only</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Hamilton Depression Rating Scale (HAM-D-17)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              17-item clinician-rated structured interview tool for quantifying depression severity in clinical sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200"
              >
                <FaArrowLeft /> Back to Profile
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'result' ? 'result' : 'form')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'form' || activeView === 'result'
                  ? 'bg-tealBrand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FaListOl /> Administer Assessment
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'history'
                  ? 'bg-tealBrand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FaHistory /> Submission History ({history.length})
            </button>
          </div>
        </div>

        {/* Clinical Note Banner */}
        <div className="p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3">
          <FaInfoCircle className="text-tealBrand-600 text-base shrink-0 mt-0.5" />
          <span>
            <strong>Clinical Guidance:</strong> HAM-D scoring is completed by a clinician based on information gathered during a structured interview. Items are scored on a 3-point or 5-point scale depending on the symptom; for most items 0 indicates absence and the top score indicates high severity.
          </span>
        </div>
      </div>

      {/* VIEW: RESULT SUMMARY */}
      {activeView === 'result' && submittedResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white print:bg-white print:text-black print:p-0 print:border-none print:shadow-none animate-fadeIn">
          {/* Printable Official Header (Paper-friendly, clean on print) */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4 text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase text-slate-900">Hamilton Depression Rating Scale (HAM-D-17)</h1>
                <p className="text-xs text-slate-700">
                  Cognitive Enhancement &amp; Support Tool (CEST) • Clinical Assessment Result
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">HAM-D-17</p>
                <p>Date: {new Date(submittedResult.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-300 text-xs">
              <div><span className="font-bold">Patient:</span> {submittedResult.patientName || patientName}</div>
              <div><span className="font-bold">Age:</span> {submittedResult.age ? `${submittedResult.age} yrs` : 'N/A'}</div>
              <div><span className="font-bold">Date:</span> {new Date(submittedResult.createdAt || Date.now()).toLocaleDateString()}</div>
              <div><span className="font-bold">Clinician:</span> Attending Clinician</div>
            </div>
          </div>

          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-tealBrand-500/15 flex items-center justify-center">
                <FaCheckCircle className="text-2xl text-tealBrand-600 dark:text-tealBrand-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  HAM-D-17 Assessment Completed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Patient: <strong className="text-slate-800 dark:text-slate-200">{submittedResult.patientName}</strong> • Logged by Clinician
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all"
              >
                <FaPrint /> Print Result
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white text-xs font-bold shadow-md transition-all"
              >
                New Assessment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Total HAM-D Score
              </p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {submittedResult.totalScore}
                <span className="text-base font-semibold text-slate-400"> / 52</span>
              </p>
            </div>
            <div className={`p-5 rounded-2xl border text-center sm:col-span-2 ${getHamdSeverityColor(submittedResult.severity)}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                Diagnostic Severity Classification
              </p>
              <p className="text-2xl font-extrabold mt-1">{submittedResult.severity}</p>
            </div>
          </div>

          <HamDScoreScale score={submittedResult.totalScore} severity={submittedResult.severity} />

          {/* Suicide Risk Alerts in Result View */}
          {submittedResult.itemScores && submittedResult.itemScores[2] === 1 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500 shrink-0 text-base" />
              <span>
                <strong>Clinical Notice (Suicide Ideation):</strong> Patient reported feelings that life is not worth living (Item 3 score: 1). Ongoing safety monitoring recommended.
              </span>
            </div>
          )}

          {submittedResult.itemScores && submittedResult.itemScores[2] >= 2 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-100 text-xs font-bold flex items-center gap-3">
              <FaExclamationTriangle className="text-rose-600 text-xl shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300">Follow your clinical safety protocol</p>
                <p className="text-xs font-normal mt-0.5">
                  Item 3 (Suicide) is elevated at score {submittedResult.itemScores[2]}. Immediate clinical safety protocol, crisis risk assessment, and protective planning are required.
                </p>
              </div>
            </div>
          )}

          {submittedResult.notes && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Clinician Session Notes</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">{submittedResult.notes}</p>
            </div>
          )}

          {/* Item breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Detailed 17-Item Response Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {HAMD_QUESTIONS.map((item, idx) => {
                const score = submittedResult.itemScores[idx];
                const selectedOpt = item.options.find((o) => o.score === score);
                return (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.id}. {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedOpt ? selectedOpt.label : `Score ${score}`}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-tealBrand-100 dark:bg-tealBrand-900/60 text-tealBrand-800 dark:text-tealBrand-300 font-extrabold shrink-0">
                      {score} / {item.maxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: HISTORY */}
      {activeView === 'history' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Clinician Submitted HAM-D Records
            </h3>

            {loadingHistory ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-500" />
                <p className="text-xs">Loading HAM-D history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No HAM-D assessments have been logged yet. Click "Administer Assessment" above to record a new session.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {history.map((record) => (
                  <div key={record._id || record.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{record.patientName}</span>
                          <span className="text-[10px] text-slate-400">
                            ({new Date(record.createdAt).toLocaleString()})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Disorder: {record.disorderSlug}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {record.totalScore} / 52
                          </p>
                          <p className="text-[11px] font-semibold text-tealBrand-600 dark:text-tealBrand-400">
                            {record.severity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedHistoryItem(
                              selectedHistoryItem?._id === record._id ? null : record
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          {selectedHistoryItem?._id === record._id ? <FaChevronUp /> : <FaChevronDown />} Details
                        </button>
                      </div>
                    </div>

                    {selectedHistoryItem?._id === record._id && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                        {record.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            Notes: "{record.notes}"
                          </p>
                        )}
                        <HamDScoreScale score={record.totalScore} severity={record.severity} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: FORM QUESTIONNAIRE */}
      {activeView === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection bar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
              <FaUserInjured className="text-tealBrand-500" />
              <span>Select or Enter Patient Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  readOnly={isScopedToPatient}
                  placeholder="e.g. Alexander Wright"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                    isScopedToPatient
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>

              {isScopedToPatient ? (
                <div className="flex items-center">
                  <div className="px-4 py-2.5 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950/60 border border-tealBrand-200 dark:border-tealBrand-900 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-bold">
                    ✓ Patient Linked Session ({patientName})
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Clinical Session Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observations, interview context, or patient feedback during evaluation..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Real-time score ticker */}
          <div className="sticky top-4 z-30 glass-panel p-4 rounded-2xl border border-tealBrand-300 dark:border-tealBrand-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-tealBrand-500 animate-pulse" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Interview Scoring Progress
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Answered <strong>{answeredCount} / 17</strong> items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Live Score</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {liveTotalScore} <span className="text-xs text-slate-400">/ 52</span>
                </p>
              </div>
              <div className="hidden sm:block px-3 py-1 rounded-lg bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-extrabold border border-tealBrand-200">
                {liveSeverity}
              </div>
            </div>
          </div>

          {/* 17 Item Cards */}
          <div className="space-y-4">
            {HAMD_QUESTIONS.map((item, idx) => {
              const currentScore = itemScores[idx];
              const isAnswered = currentScore !== null;

              return (
                <div
                  key={item.id}
                  className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all ${
                    isAnswered
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-tealBrand-100 dark:bg-tealBrand-900/60 text-tealBrand-700 dark:text-tealBrand-300 text-xs flex items-center justify-center font-extrabold">
                          {item.id}
                        </span>
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      Max score: {item.maxScore}
                    </span>
                  </div>

                  {/* Option Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                    {item.options.map((opt) => {
                      const selected = currentScore === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => setScore(idx, opt.score)}
                          className={`text-left px-3.5 py-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-2.5 ${
                            selected
                              ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md font-semibold'
                              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-tealBrand-400'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              selected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {opt.score}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Suicide Safety Notices for Item 3 */}
                  {item.id === 3 && currentScore === 1 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                      <FaExclamationTriangle className="text-amber-500 shrink-0 text-sm" />
                      <span>
                        <strong>Clinical Notice:</strong> Patient reports feelings that life is not worth living (Score 1). Monitor ideation carefully.
                      </span>
                    </div>
                  )}

                  {item.id === 3 && currentScore >= 2 && (
                    <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-100 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
                      <FaExclamationTriangle className="text-rose-600 text-lg shrink-0" />
                      <span>
                        <strong>Follow your clinical safety protocol.</strong> Suicidal ideation or gesture reported (Item 3 score: {currentScore}). Immediate clinical risk evaluation required.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              {answeredCount === 17 ? (
                <span className="text-tealBrand-600 dark:text-tealBrand-400 font-bold flex items-center gap-1">
                  <FaCheckCircle /> All 17 items scored cleanly
                </span>
              ) : (
                <span>{17 - answeredCount} items remaining</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || answeredCount < 17}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Submitting Assessment…
                </>
              ) : (
                <>
                  <FaSave /> Complete & Save HAM-D Evaluation
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
