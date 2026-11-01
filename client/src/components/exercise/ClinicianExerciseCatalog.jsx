import React, { useState, useEffect } from 'react';
import {
  FaTasks,
  FaBrain,
  FaHeartbeat,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaShieldAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaUserInjured,
  FaTimes,
  FaPaperPlane,
  FaSpinner,
  FaBan,
} from 'react-icons/fa';
import { assignedExerciseService } from '../../services/assignedExerciseService';
import { clinicianLinkService } from '../../services/clinicianLinkService';

export const ClinicianExerciseCatalog = ({
  patients = [],
  initialSelectedPatientId = '',
  onAssignmentCreated,
}) => {
  // Step 1: Patient Selection
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientUserId, setSelectedPatientUserId] = useState('');

  // Step 2: Catalog & Suggestions
  const [catalogData, setCatalogData] = useState(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState('suggested'); // 'suggested' | 'cbt' | 'cet'

  // Step 3: Assignment details
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Assignments Table
  const [allAssignments, setAllAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'open' | 'overdue' | 'completed' | 'skipped'
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Load accepted patients for Step 1
  useEffect(() => {
    const fetchAcceptedPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await clinicianLinkService.getClinicianRequests('accepted');
        const acceptedLinks = res?.data || [];

        // Build list of unique accepted patients
        const map = new Map();
        for (const link of acceptedLinks) {
          const pId = link.patientUserId || link.patientUser?._id || link.patientUser;
          if (pId && !map.has(String(pId))) {
            map.set(String(pId), {
              patientUserId: String(pId),
              name: link.patientName || link.patientUser?.name || 'Linked Patient',
              shareScope: link.shareScope || 'selected',
            });
          }
        }

        // Also merge any patients from props that have linkedUser
        for (const p of patients) {
          if (p.linkedUser) {
            const pId = String(p.linkedUser);
            if (!map.has(pId)) {
              map.set(pId, {
                patientUserId: pId,
                name: p.name || 'Linked Patient',
                shareScope: 'all',
              });
            }
          }
        }

        const patientList = Array.from(map.values());
        setAcceptedPatients(patientList);

        if (initialSelectedPatientId && map.has(String(initialSelectedPatientId))) {
          setSelectedPatientUserId(String(initialSelectedPatientId));
        } else if (patientList.length > 0 && !selectedPatientUserId) {
          setSelectedPatientUserId(patientList[0].patientUserId);
        }
      } catch (err) {
        console.error('Failed to load accepted patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchAcceptedPatients();
  }, [patients, initialSelectedPatientId]);

  // Load Catalog and Suggestions whenever selected patient changes
  useEffect(() => {
    if (!selectedPatientUserId) {
      setCatalogData(null);
      return;
    }

    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const res = await assignedExerciseService.getCatalog(selectedPatientUserId);
        if (res?.data) {
          setCatalogData(res.data);
          if (res.data.suggestions && res.data.suggestions.length > 0) {
            setActiveCatalogTab('suggested');
          } else {
            setActiveCatalogTab('cbt');
          }
        }
      } catch (err) {
        console.error('Failed to load catalog with patient suggestions:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };

    fetchCatalog();
    setSelectedExerciseIds([]);
  }, [selectedPatientUserId]);

  // Load All Assignments Table
  const loadAllAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await assignedExerciseService.getAllClinicianAssignments();
      setAllAssignments(res.data || []);
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      console.error('Failed to load clinician assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAllAssignments();
  }, []);

  // Exercise selection toggle (max 5)
  const toggleExerciseSelection = (exerciseId) => {
    setSelectedExerciseIds((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      if (prev.length >= 5) {
        setFeedback({
          type: 'warning',
          message: 'You can assign a maximum of 5 exercises in a single batch.',
        });
        return prev;
      }
      setFeedback({ type: '', message: '' });
      return [...prev, exerciseId];
    });
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientUserId) {
      setFeedback({ type: 'error', message: 'Please select a linked patient.' });
      return;
    }
    if (selectedExerciseIds.length === 0) {
      setFeedback({ type: 'error', message: 'Please choose at least one exercise to assign.' });
      return;
    }

    setSubmittingAssignment(true);
    setFeedback({ type: '', message: '' });

    try {
      await assignedExerciseService.createAssignments({
        patientUserId: selectedPatientUserId,
        exerciseIds: selectedExerciseIds,
        note: note.trim(),
        dueDate: dueDate || undefined,
      });

      setFeedback({
        type: 'success',
        message: `Successfully assigned ${selectedExerciseIds.length} exercise(s) to the patient.`,
      });
      setSelectedExerciseIds([]);
      setNote('');
      setDueDate('');
      loadAllAssignments();
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to assign exercises.',
      });
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Cancel Assignment
  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to cancel this assignment?')) {
      return;
    }
    setCancellingId(assignmentId);
    try {
      await assignedExerciseService.cancelAssignment(assignmentId);
      loadAllAssignments();
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel assignment.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filtered Assignments for table
  const filteredAssignments = allAssignments.filter((a) => {
    if (tableFilter === 'open' && a.status !== 'assigned' && a.status !== 'in_progress') {
      return false;
    }
    if (tableFilter === 'overdue' && !a.isOverdue) {
      return false;
    }
    if (tableFilter === 'completed' && a.status !== 'completed') {
      return false;
    }
    if (tableFilter === 'skipped' && a.status !== 'skipped') {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patientMatch = (a.patientName || '').toLowerCase().includes(q);
      const titleMatch = (a.title || '').toLowerCase().includes(q);
      if (!patientMatch && !titleMatch) return false;
    }

    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: ASSIGNMENT CREATION WIZARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaTasks />
            <span>Assign Evidence-Based &amp; Cognitive Exercises</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Exercise Assignment Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select a linked patient, pick recommended or catalog exercises, add clinical instructions and a due date.
          </p>
        </div>

        {feedback.message && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : feedback.type === 'warning'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <FaCheckCircle className="text-emerald-500 shrink-0 text-base" />
              ) : (
                <FaExclamationTriangle className="shrink-0 text-base" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ type: '', message: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form onSubmit={handleAssignSubmit} className="space-y-6">
          {/* STEP 1: CHOOSE LINKED PATIENT */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Step 1: Choose Linked Patient <span className="text-rose-500">*</span>
            </label>

            {loadingPatients ? (
              <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                <FaSpinner className="animate-spin text-tealBrand-500" />
                <span>Loading accepted patient links...</span>
              </div>
            ) : acceptedPatients.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                No patients with an active accepted link found. Connect with patients in the Overview tab to assign exercises.
              </div>
            ) : (
              <select
                value={selectedPatientUserId}
                onChange={(e) => setSelectedPatientUserId(e.target.value)}
                className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-tealBrand-500"
              >
                {acceptedPatients.map((p) => (
                  <option key={p.patientUserId} value={p.patientUserId}>
                    {p.name} (ID: {p.patientUserId.slice(-6)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* HIGHEST-BAND CLINICAL CAUTION */}
          {catalogData?.hasHighestBandCaution && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Clinical Care Note:</strong>
                {catalogData.cautionMessage ||
                  'This patient\'s latest result is in the highest band. Consider whether self-guided exercises are appropriate right now.'}
              </div>
            </div>
          )}

          {/* STEP 2: EXERCISE PICKER FROM CATALOG */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Step 2: Select Exercises from Catalog (Max 5)
              </label>
              <span className="text-xs font-extrabold text-tealBrand-600 dark:text-tealBrand-400">
                {selectedExerciseIds.length} / 5 selected
              </span>
            </div>

            {/* Catalog Group Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
              {catalogData?.suggestions?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('suggested')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeCatalogTab === 'suggested'
                      ? 'bg-tealBrand-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FaBrain className="text-[11px]" />
                  <span>Suggested for this patient ({catalogData.suggestions.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveCatalogTab('cbt')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCatalogTab === 'cbt'
                    ? 'bg-tealBrand-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                CBT Exercises ({catalogData?.groups?.cbt?.length || 24})
              </button>

              <button
                type="button"
                onClick={() => setActiveCatalogTab('cet')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCatalogTab === 'cet'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Cognitive Enhancement exercises (3)</span>
              </button>
            </div>

            {/* CET Disclaimer notice if CET group is active */}
            {activeCatalogTab === 'cet' && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs leading-relaxed flex items-start gap-2.5">
                <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-sm shrink-0 mt-0.5" />
                <p>
                  These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment.
                </p>
              </div>
            )}

            {/* Exercise List */}
            {loadingCatalog ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <FaSpinner className="animate-spin text-lg mx-auto text-tealBrand-500 mb-2" />
                Loading exercise library...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {(activeCatalogTab === 'suggested'
                  ? catalogData?.suggestions || []
                  : activeCatalogTab === 'cet'
                  ? catalogData?.groups?.cet || []
                  : catalogData?.groups?.cbt || []
                ).map((ex) => {
                  const isSelected = selectedExerciseIds.includes(ex.id);
                  const isCET = ex.group === 'cet';

                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleExerciseSelection(ex.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected
                          ? isCET
                            ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-400/40'
                            : 'border-tealBrand-500 bg-tealBrand-500/10 ring-2 ring-tealBrand-400/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className={`mt-1 w-4 h-4 rounded cursor-pointer ${
                          isCET ? 'text-purple-600' : 'text-tealBrand-600'
                        }`}
                      />

                      <div className="space-y-1 flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {ex.title}
                          </span>
                          {ex.reason && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              {ex.reason}
                            </span>
                          )}
                        </div>

                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                          Based on: {ex.technique}
                        </span>

                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                          {ex.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: DUE DATE & NOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                min={todayStr}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-tealBrand-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Leave blank if no strict completion deadline is required.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Clinician Note (Max 300 chars)
                </label>
                <span className="text-[10px] text-slate-400">
                  {300 - note.length} left
                </span>
              </div>
              <textarea
                maxLength={300}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Try this slow breathing exercise for 5 minutes when feeling tension."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tealBrand-500"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submittingAssignment || selectedExerciseIds.length === 0 || !selectedPatientUserId}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingAssignment ? (
                <>
                  <FaSpinner className="animate-spin" /> Assigning...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Assign {selectedExerciseIds.length} Selected Exercise(s)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: ALL ASSIGNMENTS MONITORING TABLE */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FaTasks className="text-tealBrand-500" />
              <span>All Patient Assignments</span>
            </h3>
            <p className="text-xs text-slate-500">
              Longitudinal tracking of assigned CBT and Cognitive Enhancement exercises across your roster
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search patient or exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-tealBrand-500 w-48 sm:w-56"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
              {[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Open' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'completed', label: 'Completed' },
                { id: 'skipped', label: 'Skipped' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTableFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    tableFilter === f.id
                      ? 'bg-white dark:bg-slate-900 text-tealBrand-600 dark:text-tealBrand-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        {loadingAssignments ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <FaSpinner className="animate-spin text-2xl mx-auto text-tealBrand-500" />
            <p>Loading patient assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-10 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 text-xs text-slate-500">
            <FaTasks className="text-2xl text-slate-400 mx-auto mb-1" />
            <p className="font-bold">No assignments matching this view</p>
            <p>Assign exercises above to track completion and mood trajectory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Exercise</th>
                  <th className="py-3 px-3">Group</th>
                  <th className="py-3 px-3">Assigned / Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Mood Before &rarr; After</th>
                  <th className="py-3 px-3">CET Result</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.map((a) => {
                  const isCET = a.group === 'cet';
                  const isCompleted = a.status === 'completed';

                  return (
                    <tr
                      key={a._id || a.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {a.patientName}
                        </span>
                        {a.patientEmail && (
                          <span className="text-[10px] text-slate-400 block">{a.patientEmail}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {a.title}
                        </span>
                        {a.technique && (
                          <span className="text-[10px] text-slate-400 block">
                            Based on: {a.technique}
                          </span>
                        )}
                        {a.note && (
                          <span className="text-[10px] text-slate-500 italic block mt-0.5">
                            "{a.note}"
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCET
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                              : 'bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30'
                          }`}
                        >
                          {isCET ? 'Cognitive Enhancement' : 'CBT'}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                        {a.dueDate ? (
                          <span className="block text-[10px] text-slate-400">
                            Due: {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-slate-400">No due date</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {a.isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <FaExclamationTriangle />
                            <span>Overdue</span>
                          </span>
                        ) : a.status === 'completed' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <FaCheckCircle />
                            <span>Completed</span>
                          </span>
                        ) : a.status === 'in_progress' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <FaClock />
                            <span>In progress</span>
                          </span>
                        ) : a.status === 'skipped' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <span>Skipped ({a.skipReason || 'other'})</span>
                          </span>
                        ) : a.status === 'cancelled' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-[10px] w-fit">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <FaClock />
                            <span>Assigned</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-semibold">
                        {isCompleted && a.moodBefore !== null && a.moodAfter !== null ? (
                          <div className="flex items-center gap-1.5 text-tealBrand-700 dark:text-tealBrand-300">
                            <FaHeartbeat className="text-tealBrand-500 text-xs" />
                            <span>
                              {a.moodBefore} &rarr; {a.moodAfter}
                            </span>
                            <span className="text-[10px] opacity-75">
                              ({a.moodAfter - a.moodBefore >= 0 ? `+${a.moodAfter - a.moodBefore}` : a.moodAfter - a.moodBefore})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isCompleted && isCET ? (
                          a.sharedResult?.score !== undefined && a.sharedResult?.score !== null ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                              Score: {a.sharedResult.score}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic flex items-center gap-1">
                              <FaLock className="text-[9px]" /> Private to patient
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">&mdash;</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {a.status !== 'completed' && a.status !== 'cancelled' && (
                          <button
                            type="button"
                            disabled={cancellingId === a._id}
                            onClick={() => handleCancelAssignment(a._id || a.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-all disabled:opacity-50"
                          >
                            {cancellingId === a._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
