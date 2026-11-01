import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrint,
  FaRedo,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaShieldAlt,
  FaSave,
  FaEdit,
  FaListOl,
} from 'react-icons/fa';
import { getInstrument } from '../../data/clinicianInstruments';
import { clinicianAssessmentService } from '../../services/clinicianAssessmentService';

export const ClinicianInstrumentAdminister = ({
  instrumentId,
  patient,
  onBack,
  onComplete,
}) => {
  const instrument = useMemo(() => getInstrument(instrumentId), [instrumentId]);

  // Assessment flow states: 'administer' | 'extras' | 'review' | 'result'
  const [currentStep, setCurrentStep] = useState('administer');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Answers map: { [itemId]: value }
  const [answers, setAnswers] = useState({});

  // Patient age handling (prompt clinician to input if missing)
  const [patientAge, setPatientAge] = useState(
    patient?.age || (patient?.dob ? calculateAgeFromDob(patient.dob) : '')
  );

  // Extras state
  const [extras, setExtras] = useState({
    respondent: 'patient',
    firstNoticed: '',
    impairsTwoSettings: true,
    settings: ['Home', 'School'],
    traumaticEvent: '',
    traumaticEventDate: '',
    age: patient?.age || '',
  });

  // Administered date/time and clinician note
  const [administeredAt, setAdministeredAt] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local input
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [clinicianNote, setClinicianNote] = useState('');

  // Result & submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedResult, setSubmittedResult] = useState(null);

  function calculateAgeFromDob(dob) {
    try {
      const birth = new Date(dob);
      const diff = Date.now() - birth.getTime();
      return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    } catch {
      return '';
    }
  }

  const items = instrument?.items || [];
  const currentItem = items[currentItemIndex] || null;

  // Keyboard shortcut handler for 0-4
  const handleKeyDown = useCallback(
    (e) => {
      if (currentStep !== 'administer' || !currentItem) return;
      // Do not trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key;
      const opt = currentItem.options?.find((o) => String(o.value) === key);
      if (opt !== undefined) {
        setAnswers((prev) => ({ ...prev, [currentItem.id]: opt.value }));
        // Automatically move to next item after small visual feedback if not last item
        if (currentItemIndex < items.length - 1) {
          setTimeout(() => {
            setCurrentItemIndex((idx) => idx + 1);
          }, 180);
        }
      } else if (key === 'ArrowRight' && currentItemIndex < items.length - 1) {
        setCurrentItemIndex((idx) => idx + 1);
      } else if (key === 'ArrowLeft' && currentItemIndex > 0) {
        setCurrentItemIndex((idx) => idx - 1);
      }
    },
    [currentStep, currentItem, currentItemIndex, items.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectOption = (val) => {
    if (!currentItem) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: val }));
    if (currentItemIndex < items.length - 1) {
      setTimeout(() => {
        setCurrentItemIndex((idx) => idx + 1);
      }, 160);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else {
      // If instrument has extra fields, go to extras step, otherwise go to review
      if (instrument?.extraFields && instrument.extraFields.length > 0) {
        setCurrentStep('extras');
      } else {
        setCurrentStep('review');
      }
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
    }
  };

  // Check unanswered items for NSESSS or general
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== null && answers[k] !== ''
  ).length;

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const answersArray = items.map((it) => ({
        itemId: it.id,
        value: answers[it.id] !== undefined ? answers[it.id] : null,
      }));

      // Extra fields payload
      const extrasPayload = {
        ...extras,
        age: patientAge ? Number(patientAge) : undefined,
      };

      const res = await clinicianAssessmentService.createAssessment({
        patientId: patient._id || patient.id,
        instrumentId: instrument.id,
        answers: answersArray,
        extras: extrasPayload,
        respondent: extras.respondent || 'patient',
        administeredAt: new Date(administeredAt).toISOString(),
        clinicianNote: clinicianNote.trim(),
      });

      setSubmittedResult(res.data);
      setCurrentStep('result');
      if (onComplete) onComplete(res.data);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!instrument) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Instrument not found ({instrumentId}).</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Banner: Patient and Instrument Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-tealBrand-200 dark:border-tealBrand-900/60 bg-gradient-to-r from-tealBrand-500/10 via-transparent to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaShieldAlt />
            <span>Clinician Administration Mode • {instrument.shortName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {instrument.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              <FaUser className="text-tealBrand-500" /> Patient: {patient?.name || 'Unnamed Patient'}
            </span>
            <span>
              Age: {patientAge ? `${patientAge} yrs` : (
                <span className="text-amber-600 font-bold">Age unrecorded</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-slate-400" /> ~{instrument.estimatedMinutes} mins
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm"
        >
          <FaArrowLeft /> Exit Administration
        </button>
      </div>

      {/* STEP 1: ITEM-BY-ITEM ADMINISTRATION */}
      {currentStep === 'administer' && currentItem && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                Item {currentItemIndex + 1} of {items.length}
              </span>
              <span>
                {Math.round(((currentItemIndex + 1) / items.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tealBrand-500 to-tealBrand-600 transition-all duration-300"
                style={{ width: `${((currentItemIndex + 1) / items.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Time frame notice */}
          <div className="p-3.5 rounded-2xl bg-tealBrand-50/60 dark:bg-tealBrand-950/40 border border-tealBrand-200/80 dark:border-tealBrand-900/60 text-xs text-tealBrand-900 dark:text-tealBrand-200 flex items-center gap-2.5">
            <FaClock className="text-tealBrand-600 shrink-0 text-sm" />
            <span>
              <strong>Assessment Time Frame:</strong> {instrument.timeFrame}
            </span>
          </div>

          {/* Main Question Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-tealBrand-100 dark:bg-tealBrand-900/60 text-tealBrand-800 dark:text-tealBrand-300 text-xs font-black">
                  Item #{currentItem.id}
                </span>
                {currentItem.domain && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold capitalize">
                    {currentItem.domain.replace('_', ' ')}
                  </span>
                )}
                {currentItem.section && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold capitalize">
                    {currentItem.section}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {currentItem.text}
              </h3>
              {currentItem.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {currentItem.description}
                </p>
              )}
            </div>

            {/* Large Option Buttons */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select clinician rating (or press keys 0–4 on keyboard):
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {(currentItem.options || instrument.options || []).map((opt) => {
                  const isSelected = answers[currentItem.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => selectOption(opt.value)}
                      className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-lg shadow-tealBrand-600/20 ring-2 ring-tealBrand-400/50'
                          : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-tealBrand-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt.value}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{opt.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suicide safety alert if instrument is HAM-D and on suicide item */}
            {instrument.id === 'hamd17' && currentItem.id === 3 && (
              <div className="pt-2">
                {answers[3] === 1 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-500 shrink-0 text-base" />
                    <span>
                      <strong>Clinical Notice:</strong> Patient reports feelings that life is not worth living (Score 1). Monitor closely.
                    </span>
                  </div>
                )}
                {answers[3] >= 2 && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-100 text-xs font-semibold flex items-center gap-3 animate-pulse">
                    <FaExclamationTriangle className="text-rose-600 text-xl shrink-0" />
                    <span>
                      <strong>Follow your clinical safety protocol.</strong> Suicidal ideation or gesture reported (Score {answers[3]}). Immediate clinical safety protocol is indicated.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentItemIndex === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                currentItemIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <FaArrowLeft /> Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-tealBrand-600 text-white hover:bg-tealBrand-700 shadow-md flex items-center gap-2"
            >
              <span>{currentItemIndex === items.length - 1 ? 'Proceed to Review' : 'Next Item'}</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EXTRA FIELDS STEP (ADHD, NSESSS) */}
      {currentStep === 'extras' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Supplemental Clinical Details ({instrument.shortName})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide context details required by the instrument documentation before scoring.
            </p>
          </div>

          {/* If ADHD: Age check, respondent, onset age, settings impairment */}
          {instrument.id === 'adhd_dsm5' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Age (Threshold: 6 symptoms for age &lt; 17; 5 for age &ge; 17)
                </label>
                <input
                  type="number"
                  min="3"
                  max="120"
                  value={patientAge}
                  onChange={(e) => {
                    setPatientAge(e.target.value);
                    setExtras((prev) => ({ ...prev, age: e.target.value }));
                  }}
                  placeholder="Enter patient age in years"
                  className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Completed by (Respondent)
                </label>
                <select
                  value={extras.respondent || 'patient'}
                  onChange={(e) => setExtras((prev) => ({ ...prev, respondent: e.target.value }))}
                  className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  <option value="patient">Patient / Individual</option>
                  <option value="parent_caregiver">Parent / Caregiver</option>
                  <option value="other">Other informant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Approximately when did you first notice the behaviors that occur often or very often?
                </label>
                <input
                  type="text"
                  value={extras.firstNoticed || ''}
                  onChange={(e) => setExtras((prev) => ({ ...prev, firstNoticed: e.target.value }))}
                  placeholder="e.g. Early elementary school, age 7..."
                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Do these symptoms impair the person's functioning in two or more settings?
                </label>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="impairsTwoSettings"
                      checked={extras.impairsTwoSettings === true}
                      onChange={() => setExtras((prev) => ({ ...prev, impairsTwoSettings: true }))}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="impairsTwoSettings"
                      checked={extras.impairsTwoSettings === false}
                      onChange={() => setExtras((prev) => ({ ...prev, impairsTwoSettings: false }))}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Where is there impairment? (Select all that apply)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {['Home', 'School', 'Socially'].map((setting) => {
                    const checked = extras.settings?.includes(setting);
                    return (
                      <label
                        key={setting}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          checked
                            ? 'bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 border-tealBrand-300 dark:border-tealBrand-800'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => {
                            const cur = extras.settings || [];
                            const next = checked ? cur.filter((s) => s !== setting) : [...cur, setting];
                            setExtras((prev) => ({ ...prev, settings: next }));
                          }}
                        />
                        {setting}
                      </label>
                    );
                  })}
                </div>
              </div>

              {instrument.caveat && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                  <strong>Clinical Caveat:</strong> {instrument.caveat}
                </div>
              )}
            </div>
          )}

          {/* If NSESSS: Traumatic event description and date */}
          {instrument.id === 'nsesss_ptsd' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong>Clinician Privacy Note:</strong> Traumatic event details are confidential, clinician-only, and will never appear in patient reports unless explicitly toggled on by you during report printing.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Please list the traumatic event that the patient experienced (Optional):
                </label>
                <textarea
                  value={extras.traumaticEvent || ''}
                  onChange={(e) => setExtras((prev) => ({ ...prev, traumaticEvent: e.target.value }))}
                  placeholder="Traumatic event description..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of traumatic event (Optional):
                </label>
                <input
                  type="date"
                  value={extras.traumaticEventDate || ''}
                  onChange={(e) => setExtras((prev) => ({ ...prev, traumaticEventDate: e.target.value }))}
                  className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setCurrentItemIndex(items.length - 1);
                setCurrentStep('administer');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <FaArrowLeft /> Back to Items
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('review')}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-tealBrand-600 text-white hover:bg-tealBrand-700 shadow-md flex items-center gap-2"
            >
              <span>Review All Answers</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & CONFIRMATION SCREEN */}
      {currentStep === 'review' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Review Administration Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm all item ratings, session timestamps, and clinical notes before saving.
              </p>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-200 dark:border-tealBrand-900 shrink-0">
              {answeredCount} of {items.length} Answered
            </div>
          </div>

          {/* NSESSS Missing Item Alert */}
          {instrument.id === 'nsesss_ptsd' && items.length - answeredCount >= 3 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-bold">
              <FaExclamationTriangle className="text-rose-600 text-base shrink-0" />
              <span>
                Cannot score or save NSESSS: {items.length - answeredCount} items are unanswered. A minimum of 7 answered items is required to prorate the score.
              </span>
            </div>
          )}

          {instrument.id === 'nsesss_ptsd' && items.length - answeredCount > 0 && items.length - answeredCount < 3 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <FaInfoCircle className="text-amber-600 text-base shrink-0" />
              <span>
                {items.length - answeredCount} item(s) unanswered. The total score will be prorated according to APA DSM-5 guidelines.
              </span>
            </div>
          )}

          {/* Administration Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FaCalendarAlt className="text-tealBrand-500" /> Administration Date & Time
              </label>
              <input
                type="datetime-local"
                value={administeredAt}
                onChange={(e) => setAdministeredAt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Respondent
              </label>
              <select
                value={extras.respondent || 'patient'}
                onChange={(e) => setExtras((prev) => ({ ...prev, respondent: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="patient">Patient in session</option>
                <option value="parent_caregiver">Parent / Caregiver</option>
                <option value="other">Other collateral informant</option>
              </select>
            </div>
          </div>

          {/* Clinician Note (max 500 chars) */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Clinician Session Note (Optional, Max 500 chars)</span>
              <span className="text-slate-400 font-normal">{clinicianNote.length} / 500</span>
            </div>
            <textarea
              value={clinicianNote}
              maxLength={500}
              onChange={(e) => setClinicianNote(e.target.value)}
              placeholder="Clinical observations, mental status notes, or interview highlights..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>

          {/* Item Review Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Item Answer Audit
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              {items.map((item, idx) => {
                const val = answers[item.id];
                const isAnswered = val !== undefined && val !== null && val !== '';
                const optObj = (item.options || instrument.options || []).find((o) => o.value === val);

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:px-4 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {item.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.text}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {isAnswered ? optObj?.label || `Score ${val}` : <span className="text-rose-500 italic">Unanswered</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${
                        isAnswered ? 'bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}>
                        {isAnswered ? val : '-'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentItemIndex(idx);
                          setCurrentStep('administer');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-tealBrand-600 dark:hover:text-tealBrand-400 text-[11px] font-bold flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (instrument?.extraFields && instrument.extraFields.length > 0) {
                  setCurrentStep('extras');
                } else {
                  setCurrentItemIndex(items.length - 1);
                  setCurrentStep('administer');
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <FaArrowLeft /> Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || (instrument.id === 'nsesss_ptsd' && items.length - answeredCount >= 3)}
              className={`px-7 py-3 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-2 ${
                isSubmitting || (instrument.id === 'nsesss_ptsd' && items.length - answeredCount >= 3)
                  ? 'opacity-50 cursor-not-allowed bg-slate-500'
                  : 'bg-tealBrand-600 hover:bg-tealBrand-700 shadow-tealBrand-600/30'
              }`}
            >
              <FaSave />
              <span>{isSubmitting ? 'Calculating & Saving...' : 'Save & Compute Results'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT SCREEN */}
      {currentStep === 'result' && submittedResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white space-y-6 shadow-2xl animate-fadeIn print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
          {/* Printable Official Header (Paper-friendly, clean on print) */}
          <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4 text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase text-slate-900">{instrument.name}</h1>
                <p className="text-xs text-slate-700">
                  Cognitive Enhancement &amp; Support Tool (CEST) • Clinical Assessment Result
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">{instrument.shortName}</p>
                <p>Date: {new Date(submittedResult.administeredAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-300 text-xs">
              <div><span className="font-bold">Patient:</span> {patient?.name}</div>
              <div><span className="font-bold">Age:</span> {patientAge ? `${patientAge} yrs` : (patient?.age ? `${patient?.age} yrs` : 'N/A')}</div>
              <div><span className="font-bold">Date:</span> {new Date(submittedResult.administeredAt).toLocaleDateString()}</div>
              <div><span className="font-bold">Clinician:</span> {submittedResult.clinicianName || 'Attending Clinician'}</div>
            </div>
          </div>

          {/* Screen Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-tealBrand-500/15 flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-2xl text-tealBrand-600 dark:text-tealBrand-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {instrument.name} Completed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Patient: <strong className="text-slate-800 dark:text-slate-200">{patient?.name}</strong> •{' '}
                  Age: <strong className="text-slate-800 dark:text-slate-200">{patientAge || patient?.age || 'N/A'} yrs</strong> •{' '}
                  {new Date(submittedResult.administeredAt).toLocaleString()}
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
            </div>
          </div>

          {/* Primary Result Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center print:bg-white print:border-slate-300">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-black">
                Total Score
              </p>
              <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 print:text-black">
                {submittedResult.totalScore}
                <span className="text-base font-semibold text-slate-400 print:text-slate-600"> / {instrument.maxScore}</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-tealBrand-500/10 dark:bg-tealBrand-950/60 border border-tealBrand-200 dark:border-tealBrand-800 text-center sm:col-span-2 flex flex-col justify-center print:bg-white print:border-slate-300">
              <p className="text-[11px] font-bold uppercase tracking-wider text-tealBrand-700 dark:text-tealBrand-300 print:text-black">
                Classification / Screening Band
              </p>
              <p className="text-2xl font-black text-tealBrand-900 dark:text-tealBrand-100 mt-1 print:text-black">
                {submittedResult.band}
              </p>
            </div>
          </div>

          {/* Subscores / Specific Instrument Metrics */}
          {submittedResult.subscores && Object.keys(submittedResult.subscores).length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 print:bg-white print:border-slate-300">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-black">
                Detailed Subscale Analysis
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {instrument.id === 'hama' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Psychic Anxiety</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.psychicSubscore} / 28
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Somatic Anxiety</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.somaticSubscore} / 28
                      </p>
                    </div>
                  </>
                )}

                {instrument.id === 'adhd_dsm5' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Inattention Symptoms</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.inattentionCount} / 9
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Hyperactive-Impulsive</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.hyperactiveImpulsiveCount} / 9
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Screening Presentation</p>
                      <p className="text-xs font-bold text-tealBrand-600 dark:text-tealBrand-300 mt-1 print:text-black">
                        {submittedResult.subscores.presentation}
                      </p>
                    </div>
                  </>
                )}

                {instrument.id === 'ybocs_part2' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Obsessions Subtotal</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.obsessionSubtotal} / 20
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Compulsions Subtotal</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.compulsionSubtotal} / 20
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Item 11 Insight Rating</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 print:text-black">
                        Score {submittedResult.subscores.insightScore} / 4 (Recorded separately, not added to total)
                      </p>
                    </div>
                  </>
                )}

                {instrument.id === 'nsesss_ptsd' && (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Average Total Score</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.subscores.averageScore} / 4.00
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Severity Category</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1 print:text-black">
                        {submittedResult.band}
                      </p>
                    </div>
                    {submittedResult.subscores.isProrated && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 col-span-2 text-amber-900 dark:text-amber-200 text-xs print:bg-white print:text-black">
                        Prorated raw score: {submittedResult.totalScore} (Calculated from {submittedResult.subscores.answeredCount}/9 answered items; raw sum: {submittedResult.subscores.rawSum}).
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Safety Flags (Suicide Risk) */}
          {submittedResult.flags && submittedResult.flags.includes('SUICIDE_RISK_ALERT') && (
            <div className="p-5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-100 space-y-1 print:bg-white print:text-black print:border-black">
              <div className="flex items-center gap-2 text-sm font-black text-rose-700 dark:text-rose-300 print:text-black">
                <FaExclamationTriangle className="text-lg" />
                <span>Follow your clinical safety protocol</span>
              </div>
              <p className="text-xs">
                Elevated suicidal ideation or behavior was endorsed during this session. Immediate clinical safety assessment, protocol initiation, and protective intervention are indicated.
              </p>
            </div>
          )}

          {/* Clinician note */}
          {submittedResult.clinicianNote && (
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 print:text-black">
                Clinician Session Notes
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic print:text-black">
                "{submittedResult.clinicianNote}"
              </p>
            </div>
          )}

          {/* Mandatory Clinical Disclaimer */}
          <div className="p-4 rounded-2xl bg-tealBrand-500/10 dark:bg-tealBrand-950/30 border border-tealBrand-500/30 text-center print:bg-white print:border-slate-300">
            <p className="text-xs font-bold text-tealBrand-800 dark:text-tealBrand-300 print:text-black">
              Rating-scale scores support clinical judgement. They are not a diagnosis.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
            >
              <FaArrowLeft /> Back to Patient Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmittedResult(null);
                setCurrentItemIndex(0);
                setCurrentStep('administer');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-tealBrand-600 text-white hover:bg-tealBrand-700 shadow-md flex items-center gap-2 transition-all"
            >
              <FaRedo /> Administer Another Questionnaire
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
