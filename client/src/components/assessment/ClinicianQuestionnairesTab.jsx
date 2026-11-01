import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaUserInjured,
  FaClipboardList,
  FaClock,
  FaPlay,
  FaPrint,
  FaCheckCircle,
  FaFilter,
  FaHistory,
  FaLink,
  FaSpinner,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaTrashAlt,
  FaPlus,
  FaTimes,
  FaUserPlus,
  FaClinicMedical,
  FaMobileAlt,
} from 'react-icons/fa';
import { CLINICIAN_INSTRUMENTS } from '../../data/clinicianInstruments';
import { ClinicianInstrumentAdminister } from './ClinicianInstrumentAdminister';
import { HamDAssessment } from './HamDAssessment';
import { PrintBlankInstrumentModal } from './PrintBlankInstrumentModal';
import { clinicianAssessmentService } from '../../services/clinicianAssessmentService';
import { patientService } from '../../services/patientService';

export const ClinicianQuestionnairesTab = ({
  patients = [],
  loadingPatients = false,
  onPatientCreated,
}) => {
  // Step 1: Patient selection
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInDob, setWalkInDob] = useState('');
  const [walkInGender, setWalkInGender] = useState('prefer_not_to_say');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInConsent, setWalkInConsent] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [duplicateConflict, setDuplicateConflict] = useState(null);

  // Active administration state
  const [activeInstrumentId, setActiveInstrumentId] = useState(null);
  const [printBlankId, setPrintBlankId] = useState(null);

  // Recent administrations list state
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [recentFilterInstrument, setRecentFilterInstrument] = useState('ALL');
  const [recentFilterPatientId, setRecentFilterPatientId] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);

  // Filter patients by search term
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  // Group 1: Connected via app
  const connectedPatients = useMemo(() => {
    return filteredPatients.filter((p) => Boolean(p.linkedUser && p.linkStatus === 'accepted'));
  }, [filteredPatients]);

  // Group 2: Clinic patients (walk-ins or manual)
  const clinicPatients = useMemo(() => {
    return filteredPatients.filter((p) => !p.linkedUser || p.linkStatus !== 'accepted');
  }, [filteredPatients]);

  // Walk-in modal helpers
  const openWalkInModal = (presetName = '') => {
    setWalkInName(presetName || patientSearch.trim() || '');
    setWalkInAge('');
    setWalkInDob('');
    setWalkInGender('prefer_not_to_say');
    setWalkInPhone('');
    setWalkInEmail('');
    setWalkInConsent(false);
    setWalkInError('');
    setDuplicateConflict(null);
    setShowWalkInModal(true);
  };

  const closeWalkInModal = () => {
    setShowWalkInModal(false);
    setWalkInError('');
    setDuplicateConflict(null);
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    setWalkInDob(val);
    if (val) {
      const birth = new Date(val);
      if (!isNaN(birth.getTime())) {
        const calculated = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (calculated >= 1 && calculated <= 120) {
          setWalkInAge(String(calculated));
        }
      }
    }
  };

  const handleSaveWalkIn = async (allowDuplicate = false) => {
    setWalkInError('');

    if (!walkInName || !walkInName.trim()) {
      setWalkInError('Full name is required.');
      return;
    }

    let calculatedAge = walkInAge ? Number(walkInAge) : undefined;
    if (!calculatedAge && walkInDob) {
      const birth = new Date(walkInDob);
      if (!isNaN(birth.getTime())) {
        calculatedAge = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    if (calculatedAge === undefined || isNaN(calculatedAge) || calculatedAge < 1 || calculatedAge > 120) {
      setWalkInError('Please provide a valid Age (between 1 and 120) or Date of birth.');
      return;
    }

    if (!walkInConsent) {
      setWalkInError('The patient must agree to their details and answers being recorded to proceed.');
      return;
    }

    setWalkInSubmitting(true);
    try {
      const res = await patientService.createPatient({
        name: walkInName.trim(),
        age: calculatedAge,
        dob: walkInDob || undefined,
        gender: walkInGender,
        phone: walkInPhone ? walkInPhone.trim() : '',
        email: walkInEmail ? walkInEmail.trim() : '',
        source: 'clinic_walkin',
        consentGiven: true,
        allowDuplicate,
      });

      if (res?.data) {
        const newPatient = res.data;
        setSelectedPatient(newPatient);
        if (onPatientCreated) {
          onPatientCreated(newPatient);
        }
        closeWalkInModal();

        // Scroll to Step 2 so doctor can immediately select questionnaires
        setTimeout(() => {
          const step2 = document.getElementById('step-2-questionnaires');
          if (step2) {
            step2.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.duplicateFound) {
        setDuplicateConflict(err.response.data.existingPatient);
      } else {
        setWalkInError(err.response?.data?.message || 'Failed to save walk-in patient.');
      }
    } finally {
      setWalkInSubmitting(false);
    }
  };

  // Load recent administrations across clinician's roster
  const fetchRecentAssessments = async () => {
    if (!patients || patients.length === 0) return;
    setLoadingRecent(true);
    try {
      const targetPatients = recentFilterPatientId === 'ALL'
        ? patients
        : patients.filter((p) => String(p._id || p.id) === String(recentFilterPatientId));

      const requests = targetPatients.map((p) =>
        clinicianAssessmentService
          .getPatientAssessments(p._id || p.id, {
            instrumentId: recentFilterInstrument !== 'ALL' ? recentFilterInstrument : undefined,
          })
          .then((res) => (res?.data || []).map((r) => ({ ...r, patientName: p.name })))
          .catch(() => [])
      );

      const nested = await Promise.all(requests);
      const flattened = nested.flat();
      flattened.sort((a, b) => new Date(b.administeredAt) - new Date(a.administeredAt));
      setRecentAssessments(flattened);
    } catch (err) {
      console.error('Failed to load recent administrations:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentAssessments();
  }, [patients, recentFilterPatientId, recentFilterInstrument]);

  // Handle assessment complete
  const handleAssessmentComplete = () => {
    fetchRecentAssessments();
  };

  // If in active administration mode
  if (activeInstrumentId && selectedPatient) {
    if (activeInstrumentId === 'hamd17') {
      return (
        <HamDAssessment
          initialPatientName={selectedPatient.name}
          initialPatientId={selectedPatient._id || selectedPatient.id}
          onCancel={() => setActiveInstrumentId(null)}
          onComplete={() => {
            setActiveInstrumentId(null);
            fetchRecentAssessments();
          }}
        />
      );
    }

    return (
      <ClinicianInstrumentAdminister
        instrumentId={activeInstrumentId}
        patient={selectedPatient}
        onBack={() => setActiveInstrumentId(null)}
        onComplete={() => {
          fetchRecentAssessments();
        }}
      />
    );
  }

  const instrumentsList = Object.values(CLINICIAN_INSTRUMENTS);

  const renderPatientCard = (p, isAppGroup) => {
    const isSelected = selectedPatient?._id === p._id || selectedPatient?.id === p.id;
    const isWalkIn = p.source === 'clinic_walkin';

    return (
      <button
        key={p._id || p.id}
        type="button"
        onClick={() => setSelectedPatient(p)}
        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
          isSelected
            ? 'bg-tealBrand-600 text-white border-tealBrand-600 shadow-md ring-2 ring-tealBrand-400/50'
            : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-tealBrand-300 dark:hover:border-tealBrand-800'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <p className="font-extrabold text-xs truncate">{p.name}</p>
            {isAppGroup ? (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-tealBrand-100 dark:bg-tealBrand-900/50 text-tealBrand-700 dark:text-tealBrand-300'
                }`}
              >
                <FaLink className="text-[8px]" /> Linked
              </span>
            ) : isWalkIn ? (
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                Walk-in
              </span>
            ) : null}
          </div>
          <p className={`text-[11px] mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
            Age: {p.age ? `${p.age} yrs` : 'Unrecorded'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>
            {p.gender ? p.gender.replace('_', ' ') : ''}
          </span>
          <span className="font-bold underline">
            {isSelected ? 'Selected ✓' : 'Select'}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tab Welcome & Flow Intro */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
          <FaClipboardList />
          <span>In-Session Clinical Evaluation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Clinician-Administered Questionnaires
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Administer structured diagnostic severity rating scales in real-time with your patients. Select an app-connected patient or a clinic walk-in patient from your roster below to begin an evaluation session or print blank forms.
        </p>
      </div>

      {/* STEP 1: PATIENT SELECTOR */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-tealBrand-600 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>Step 1: Choose Patient</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an active patient from your roster or add a new walk-in patient.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openWalkInModal()}
              className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <FaPlus /> + New walk-in patient
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patients by name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {loadingPatients ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500 mb-2" />
            Loading clinical roster...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {patientSearch.trim()
                ? `No match found for "${patientSearch}".`
                : 'No patients in roster yet.'}
            </p>
            <div>
              <button
                type="button"
                onClick={() => openWalkInModal(patientSearch.trim())}
                className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5 transition-all"
              >
                <FaUserPlus />
                {patientSearch.trim()
                  ? `Add "${patientSearch.trim()}" as a new patient`
                  : '+ New walk-in patient'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* GROUP 1: CONNECTED VIA APP */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 flex items-center gap-1.5">
                  <FaMobileAlt /> Connected via app ({connectedPatients.length})
                </h4>
                <span className="text-[11px] text-slate-400">Linked CEST accounts</span>
              </div>

              {connectedPatients.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No app-connected patients found matching search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                  {connectedPatients.map((p) => renderPatientCard(p, true))}
                </div>
              )}
            </div>

            {/* GROUP 2: CLINIC PATIENTS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FaClinicMedical className="text-tealBrand-500" /> Clinic patients ({clinicPatients.length})
                </h4>
                <span className="text-[11px] text-slate-400">In-clinic &amp; manual registrations</span>
              </div>

              {clinicPatients.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic py-2">
                  No clinic patients found matching search.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                  {clinicPatients.map((p) => renderPatientCard(p, false))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* WALK-IN PATIENT QUICK MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 sm:p-7 glass-panel rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-tealBrand-500/15 text-tealBrand-600 dark:text-tealBrand-400 flex items-center justify-center text-lg">
                  <FaClinicMedical />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    New Walk-In Clinic Patient
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Register a patient attending in person without a CEST app account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeWalkInModal}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* DUPLICATE CONFLICT WARNING */}
            {duplicateConflict ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs">
                  <FaExclamationTriangle className="text-amber-600 text-sm shrink-0" />
                  <span>A patient with this name already exists. Use the existing patient?</span>
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <p className="font-bold">{duplicateConflict.name}</p>
                  <p className="text-[11px]">
                    Age: {duplicateConflict.age ? `${duplicateConflict.age} yrs` : 'Unrecorded'}
                    {duplicateConflict.phone ? ` • Phone: ${duplicateConflict.phone}` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(duplicateConflict);
                      setDuplicateConflict(null);
                      closeWalkInModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white font-bold text-xs shadow-md"
                  >
                    Use Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveWalkIn(true)}
                    disabled={walkInSubmitting}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    Create Anyway
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveWalkIn(false);
                }}
                className="space-y-4"
              >
                {walkInError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <FaExclamationTriangle className="shrink-0" />
                    <span>{walkInError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Patient's legal or preferred name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tealBrand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Age (1–120) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={walkInAge}
                      onChange={(e) => setWalkInAge(e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Date of Birth (or provide DOB)
                    </label>
                    <input
                      type="date"
                      value={walkInDob}
                      onChange={handleDobChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Gender</label>
                    <select
                      value={walkInGender}
                      onChange={(e) => setWalkInGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="prefer_not_to_say">Unspecified</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      placeholder="+1 555-0100"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={walkInEmail}
                      onChange={(e) => setWalkInEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Consent checkbox (required) */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      required
                      checked={walkInConsent}
                      onChange={(e) => setWalkInConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-tealBrand-600 focus:ring-tealBrand-500"
                    />
                    <span>
                      The patient has agreed to their details and answers being recorded. <span className="text-rose-500">*</span>
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeWalkInModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={walkInSubmitting || !walkInConsent}
                    className="px-6 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {walkInSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save and start'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: INSTRUMENT SELECTION CARDS */}
      <div id="step-2-questionnaires" className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-tealBrand-600 text-white text-xs flex items-center justify-center font-black">
              2
            </span>
            <span>Step 2: Select Questionnaire to Administer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedPatient
              ? `Ready to administer for patient ${selectedPatient.name}. Click "Start" on any instrument below.`
              : 'Please select a patient above in Step 1 to begin in-session administration.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instrumentsList.map((inst) => {
            const isHamD = inst.id === 'hamd17';

            return (
              <div
                key={inst.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950/60 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-black border border-tealBrand-200 dark:border-tealBrand-900">
                      {inst.shortName}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <FaClock className="text-slate-400" />
                      <span>~{inst.estimatedMinutes}m</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-tealBrand-600 transition-colors">
                      {inst.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {inst.instructions}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 font-medium">Items:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{inst.itemsCount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Max Score:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-300">{inst.maxScore}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-medium">Target:</span>{' '}
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">{inst.targetDisorder}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={!selectedPatient}
                    onClick={() => setActiveInstrumentId(inst.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedPatient
                        ? 'bg-tealBrand-600 hover:bg-tealBrand-700 text-white shadow-md shadow-tealBrand-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <FaPlay className="text-[10px]" />
                    <span>Start Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintBlankId(inst.id)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 shrink-0"
                    title="Print blank form"
                  >
                    <FaPrint />
                    <span className="hidden sm:inline">Blank</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ADMINISTRATIONS AUDIT LOG */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FaHistory className="text-tealBrand-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Recent Clinical Administrations
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={recentFilterPatientId}
              onChange={(e) => setRecentFilterPatientId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              <option value="ALL">All Patients</option>
              {patients.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={recentFilterInstrument}
              onChange={(e) => setRecentFilterInstrument(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              <option value="ALL">All Instruments</option>
              {instrumentsList.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingRecent ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500 mb-2" />
            Loading administration history...
          </div>
        ) : recentAssessments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No clinician-administered questionnaires found matching the filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentAssessments.slice(0, visibleCount).map((rec) => {
              const instDef = CLINICIAN_INSTRUMENTS[rec.instrumentId];
              const isSelected = selectedDetailRecord?._id === rec._id;

              return (
                <div key={rec._id || rec.id} className="py-3.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black text-xs shrink-0">
                        {instDef?.shortName || rec.instrumentId}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {rec.patientName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(rec.administeredAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })} • Respondent: {rec.respondent || 'patient'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          {rec.totalScore} <span className="text-xs text-slate-400">/ {instDef?.maxScore || 50}</span>
                        </p>
                        <p className="text-[11px] font-bold text-tealBrand-600 dark:text-tealBrand-400">
                          {rec.band}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailRecord(isSelected ? null : rec)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                      >
                        {isSelected ? <FaChevronUp /> : <FaChevronDown />} Details
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                      {rec.clinicianNote && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          <strong>Clinician Note:</strong> "{rec.clinicianNote}"
                        </p>
                      )}

                      {rec.flags && rec.flags.includes('SUICIDE_RISK_ALERT') && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                          <FaExclamationTriangle className="text-rose-600" />
                          <span>Suicide risk flagged on this record. Follow clinical safety protocol.</span>
                        </div>
                      )}

                      {/* Item level answers preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px] pt-1">
                        {(rec.answers || []).map((ans) => (
                          <div
                            key={ans.itemId}
                            className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between"
                          >
                            <span className="text-slate-400 font-bold">#{ans.itemId}:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{ans.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {recentAssessments.length > visibleCount && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Load More ({recentAssessments.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blank Print Modal */}
      {printBlankId && (
        <PrintBlankInstrumentModal
          instrumentId={printBlankId}
          patient={selectedPatient}
          onClose={() => setPrintBlankId(null)}
        />
      )}
    </div>
  );
};
