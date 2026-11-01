import React, { useState, useEffect, useMemo } from 'react';
import {
  FaPrint,
  FaFileAlt,
  FaCalendarAlt,
  FaUserInjured,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaClipboardList,
  FaTasks,
} from 'react-icons/fa';
import { clinicianReportService } from '../../services/clinicianReportService';

/**
 * Inline SVG Trend Chart with Shaded Severity Bands
 * ONLY rendered when records >= 2
 */
const ReportTrendChart = ({ records, maxScore = 30, bands = [] }) => {
  if (!records || records.length < 2) return null;

  const width = 500;
  const height = 120;
  const padding = { top: 14, right: 24, bottom: 22, left: 32 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const validMax = maxScore || 30;

  const getY = (score) => {
    const clamped = Math.max(0, Math.min(Number(score) || 0, validMax));
    return padding.top + plotHeight - (clamped / validMax) * plotHeight;
  };

  const getX = (index, total) => {
    if (total <= 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (total - 1)) * plotWidth;
  };

  const points = records.map((r, i) => ({
    x: getX(i, records.length),
    y: getY(r.score),
    score: r.score,
    date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    band: r.band || r.severity,
  }));

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  return (
    <div className="w-full my-3 print:my-2 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[500px] h-auto text-xs select-none block print:max-w-full"
      >
        {/* Shaded bands */}
        {bands &&
          bands.map((band, idx) => {
            const yTop = getY(band.max);
            const yBottom = getY(band.min);
            const bandH = Math.max(0, yBottom - yTop);
            return (
              <rect
                key={idx}
                x={padding.left}
                y={yTop}
                width={plotWidth}
                height={bandH}
                fill={band.color || '#0d9488'}
                fillOpacity="0.12"
              />
            );
          })}

        {/* Axis Grid lines */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700 print:text-slate-400"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700 print:text-slate-400"
          strokeWidth="1"
        />

        {/* Min/Max Y labels */}
        <text
          x={padding.left - 4}
          y={padding.top + 4}
          textAnchor="end"
          className="fill-slate-600 dark:fill-slate-300 print:fill-slate-700 font-bold"
          fontSize="9"
        >
          {validMax}
        </text>
        <text
          x={padding.left - 4}
          y={height - padding.bottom}
          textAnchor="end"
          className="fill-slate-600 dark:fill-slate-300 print:fill-slate-700 font-bold"
          fontSize="9"
        >
          0
        </text>

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#0d9488"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 print:fill-black font-extrabold"
              fontSize="9"
            >
              {p.score}
            </text>
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-500 print:fill-slate-600 font-medium"
              fontSize="8"
            >
              {p.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const PatientReportView = ({
  patients = [],
  initialPatientId = '',
  defaultRange = 90,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatientId || (patients[0]?._id || patients[0]?.id || '')
  );
  const [range, setRange] = useState(String(defaultRange || 90));
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Available data from endpoint
  const [availableData, setAvailableData] = useState(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Dynamic selection states
  const [selectedClinicianInstruments, setSelectedClinicianInstruments] = useState([]);
  const [selectedSelfReported, setSelectedSelfReported] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState(false);
  const [itemLevelAnswers, setItemLevelAnswers] = useState({}); // { [instId]: boolean }
  const [includeNsesssEvent, setIncludeNsesssEvent] = useState(false);

  // Report payload state
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');

  // UI state
  const [showNotIncluded, setShowNotIncluded] = useState(false);

  // Synchronize when initialPatientId changes
  useEffect(() => {
    if (initialPatientId) setSelectedPatientId(initialPatientId);
  }, [initialPatientId]);

  // Step 1: Query available data whenever patient or date range changes
  const fetchAvailableData = async () => {
    if (!selectedPatientId) return;
    setLoadingAvailable(true);
    try {
      const params = {};
      if (range === 'custom') {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      } else {
        params.range = range;
      }

      const res = await clinicianReportService.getAvailableData(selectedPatientId, params);
      const data = res?.data || {
        clinicianQuestionnaires: [],
        selfReported: [],
        exercises: [],
        notes: { count: 0 },
      };
      setAvailableData(data);

      // Default all data-bearing items to checked, except item-level answers, NSESSS event text, and notes (default off)
      setSelectedClinicianInstruments(data.clinicianQuestionnaires.map((c) => c.id));
      setSelectedSelfReported(data.selfReported.map((s) => s.key));
      setSelectedExercises(data.exercises.length > 0);
      setSelectedNotes(false);
      setItemLevelAnswers({});
      setIncludeNsesssEvent(false);
    } catch (err) {
      console.error('Failed to query available report data:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    fetchAvailableData();
  }, [selectedPatientId, range, customFrom, customTo]);

  // Step 2: Fetch report with current dynamic selections
  const generateReport = async () => {
    if (!selectedPatientId) return;
    setLoadingReport(true);
    setError('');

    try {
      const params = {};
      if (range === 'custom') {
        if (customFrom) params.startDate = customFrom;
        if (customTo) params.endDate = customTo;
      } else {
        params.range = range;
      }

      params.includeClinician = selectedClinicianInstruments.join(',');
      params.includeSelf = selectedSelfReported.join(',');
      params.includeExercises = selectedExercises;
      params.includeNotes = selectedNotes;
      params.includeNsesssEvent = includeNsesssEvent;

      const itemsSelected = Object.keys(itemLevelAnswers).filter((k) => itemLevelAnswers[k]);
      if (itemsSelected.length > 0) {
        params.includeItems = itemsSelected.join(',');
      }

      const res = await clinicianReportService.getPatientReport(selectedPatientId, params);
      setReportData(res?.data || null);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Re-generate report when selections change or available data updates
  useEffect(() => {
    if (availableData) {
      generateReport();
    }
  }, [
    availableData,
    selectedClinicianInstruments,
    selectedSelfReported,
    selectedExercises,
    selectedNotes,
    itemLevelAnswers,
    includeNsesssEvent,
  ]);

  // Total attended count check
  const totalAttendedCount = useMemo(() => {
    if (!availableData) return 0;
    return (
      availableData.clinicianQuestionnaires.length +
      availableData.selfReported.length +
      availableData.exercises.length +
      (availableData.notes?.count > 0 ? 1 : 0)
    );
  }, [availableData]);

  const hasSelectedData = useMemo(() => {
    return (
      selectedClinicianInstruments.length > 0 ||
      selectedSelfReported.length > 0 ||
      selectedExercises ||
      selectedNotes
    );
  }, [selectedClinicianInstruments, selectedSelfReported, selectedExercises, selectedNotes]);

  // Unattended instruments calculation for the collapsed "Not included" section
  const notIncludedInstruments = useMemo(() => {
    if (!availableData) return [];
    const allKnownClinician = [
      { id: 'hama', name: 'Hamilton Anxiety Rating Scale (HAM-A)' },
      { id: 'hamd17', name: 'Hamilton Depression Rating Scale (HAM-D)' },
      { id: 'adhd_dsm5', name: 'DSM-5 ADHD Symptom Checklist' },
      { id: 'nsesss_ptsd', name: 'NSESSS PTSD Short Scale' },
      { id: 'isi_clinician', name: 'Insomnia Severity Index (Clinician)' },
      { id: 'ybocs_part2', name: 'Y-BOCS Part 2 Obsessive-Compulsive Scale' },
    ];
    const availableIds = new Set(availableData.clinicianQuestionnaires.map((c) => c.id));
    return allKnownClinician.filter((c) => !availableIds.has(c.id));
  }, [availableData]);

  const selectedPatientObj = patients.find(
    (p) => String(p._id || p.id) === String(selectedPatientId)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* SCREEN-ONLY CONTROLS & DYNAMIC CHECKBOX FILTER PANEL */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
              <FaFileAlt />
              <span>Smart Clinical Reporting Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Patient Clinical Summary Report
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Prints ONLY instruments and sessions the patient actually attended or completed in the chosen date range. Empty sections are strictly omitted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasSelectedData || !reportData || totalAttendedCount === 0}
              onClick={() => window.print()}
              className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
                !hasSelectedData || !reportData || totalAttendedCount === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-tealBrand-600 hover:bg-tealBrand-700 text-white shadow-lg shadow-tealBrand-600/30'
              }`}
              title={
                totalAttendedCount === 0
                  ? 'Print disabled: Patient has no attended sessions in this date range.'
                  : !hasSelectedData
                  ? 'Print disabled: Please select at least one section to include.'
                  : 'Print summary report'
              }
            >
              <FaPrint /> Print Clinical Report
            </button>
          </div>
        </div>

        {/* Step 1: Select Patient and Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FaUserInjured className="text-tealBrand-500" /> Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {patients.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} {p.age ? `(${p.age}y)` : ''} {p.linkedUser ? '• Linked' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FaCalendarAlt className="text-tealBrand-500" /> Evaluation Window
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days (Quarter)</option>
              <option value="180">Last 180 days (6 Months)</option>
              <option value="all">All-time record</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-2 sm:col-span-1">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Dynamic Category Checkbox Selector */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FaFilter className="text-tealBrand-500" /> Dynamic Content Inclusion (Only Attended Data Shown)
            </span>
            {loadingAvailable && (
              <span className="text-[11px] text-tealBrand-600 flex items-center gap-1">
                <FaSpinner className="animate-spin" /> Scanning attended sessions...
              </span>
            )}
          </div>

          {availableData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Category A: Clinician Questionnaires */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Clinician Questionnaires</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black">
                    {availableData.clinicianQuestionnaires.length}
                  </span>
                </p>

                {availableData.clinicianQuestionnaires.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No clinician-administered forms in range.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {availableData.clinicianQuestionnaires.map((item) => {
                      const isChecked = selectedClinicianInstruments.includes(item.id);
                      return (
                        <div key={item.id} className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClinicianInstruments((prev) => [...prev, item.id]);
                                } else {
                                  setSelectedClinicianInstruments((prev) =>
                                    prev.filter((id) => id !== item.id)
                                  );
                                }
                              }}
                            />
                            <span>{item.shortName} ({item.count} sessions)</span>
                          </label>

                          {/* Item level answers toggle */}
                          {isChecked && (
                            <label className="flex items-center gap-2 pl-5 text-[11px] text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(itemLevelAnswers[item.id])}
                                onChange={(e) =>
                                  setItemLevelAnswers((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.checked,
                                  }))
                                }
                              />
                              <span>Include item-level answers (latest)</span>
                            </label>
                          )}

                          {/* NSESSS Traumatic Event Text Toggle */}
                          {isChecked && item.id === 'nsesss_ptsd' && (
                            <label className="flex items-center gap-2 pl-5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeNsesssEvent}
                                onChange={(e) => setIncludeNsesssEvent(e.target.checked)}
                              />
                              <span>Include traumatic event description</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category B: Self-Reported Assessments */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Self-Reported Scales</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black">
                    {availableData.selfReported.length}
                  </span>
                </p>

                {availableData.selfReported.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No self-assessments shared in range.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {availableData.selfReported.map((item) => {
                      const isChecked = selectedSelfReported.includes(item.key);
                      return (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSelfReported((prev) => [...prev, item.key]);
                              } else {
                                setSelectedSelfReported((prev) =>
                                  prev.filter((k) => k !== item.key)
                                );
                              }
                            }}
                          />
                          <span>{item.shortName} ({item.count} taken)</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category C: Exercises (Assigned/Completed) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Exercises &amp; Activities</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black">
                    {availableData.exercises.length}
                  </span>
                </p>

                {availableData.exercises.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No exercises logged in range.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedExercises}
                        onChange={(e) => setSelectedExercises(e.target.checked)}
                      />
                      <span>Include Activities ({availableData.exercises.reduce((a, c) => a + c.count, 0)} items)</span>
                    </label>
                    <ul className="pl-5 space-y-1 text-[11px] text-slate-500 list-disc">
                      {availableData.exercises.map((ex) => (
                        <li key={ex.key}>
                          {ex.title}: {ex.completedCount}/{ex.count} completed
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Category D: Clinician Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Clinician Notes</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black">
                    {availableData.notes?.count || 0}
                  </span>
                </p>

                {(!availableData.notes || availableData.notes.count === 0) ? (
                  <p className="text-[11px] text-slate-400 italic">No private notes in this range.</p>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedNotes}
                      onChange={(e) => setSelectedNotes(e.target.checked)}
                    />
                    <span>Include Session Notes ({availableData.notes.count} on file)</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* On-Screen Collapsed: Not Included Instruments (hidden on print) */}
          {notIncludedInstruments.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowNotIncluded((prev) => !prev)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1.5"
              >
                {showNotIncluded ? <FaChevronUp /> : <FaChevronDown />}
                <span>Not included ({notIncludedInstruments.length} instruments have no data in this range)</span>
              </button>

              {showNotIncluded && (
                <div className="mt-2 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <p className="font-bold mb-1">Omitted from report (never attended or administered in this range):</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {notIncludedInstruments.map((inst) => (
                      <li key={inst.id}>{inst.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ERROR OR EMPTY STATE EXPLANATION */}
      {totalAttendedCount === 0 && (
        <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-2 print:hidden">
          <FaExclamationTriangle className="text-3xl text-amber-500 mx-auto" />
          <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
            No Attended Data in this Range
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
            Patient <strong>{selectedPatientObj?.name}</strong> has not attended any clinician questionnaires, shared assessments, or exercises during the selected evaluation window. To print a report, choose a broader date range or administer an instrument first.
          </p>
        </div>
      )}

      {totalAttendedCount > 0 && !hasSelectedData && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 print:hidden">
          Please select at least one checkbox above to render the report preview.
        </div>
      )}

      {/* =========================================================================
          PRINTABLE REPORT DOCUMENT (LIGHT BACKGROUND IN ALL MODES, NO BUTTONS)
          ========================================================================= */}
      {reportData && hasSelectedData && (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black">
          {/* 1. DOCUMENT HEADER */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5 space-y-4 print:border-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">
                  Cognitive Enhancement &amp; Support Tool (CEST)
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 mt-1 print:text-teal-800">
                  Confidential Clinical Evaluation Summary Report
                </p>
              </div>

              <div className="text-left sm:text-right text-xs">
                <p className="font-black text-slate-900 dark:text-white print:text-black">{reportData.header.clinicianName}</p>
                <p className="text-slate-600 dark:text-slate-300 print:text-slate-600">{reportData.header.clinicianSpecialization}</p>
                <p className="text-slate-500 dark:text-slate-400 print:text-slate-500">{reportData.header.clinicianInstitution}</p>
              </div>
            </div>

            {/* Patient Header Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-300 dark:border-slate-800 text-xs print:border-slate-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Patient Name</span>
                <p className="font-black text-sm text-slate-900 dark:text-white print:text-black">{reportData.header.patientName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Age / Gender</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  {reportData.header.age ? `${reportData.header.age} yrs` : 'N/A'} • {reportData.header.gender || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Report Date</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  {new Date(reportData.header.reportDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Evaluation Window</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black">
                  {reportData.header.dateRange
                    ? `${new Date(reportData.header.dateRange.from).toLocaleDateString()} – ${new Date(reportData.header.dateRange.to).toLocaleDateString()}`
                    : 'All records on file'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. ATTENDED ASSESSMENTS SUMMARY TABLE (ALWAYS FIRST) */}
          {reportData.attendedSummary && reportData.attendedSummary.length > 0 && (
            <div className="space-y-3 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white print:text-black flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tealBrand-600 print:bg-black"></span>
                  <span>Assessments Attended in this Period</span>
                </h2>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 print:text-slate-600">
                  {reportData.attendedSummary.length} Scales Attended
                </span>
              </div>

              <div className="border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200 border-b border-slate-300 dark:border-slate-800 font-extrabold text-slate-800 dark:text-slate-200 print:text-black">
                    <tr>
                      <th className="py-2.5 px-3">Instrument</th>
                      <th className="py-2.5 px-3">Administration Source</th>
                      <th className="py-2.5 px-3 text-center">Sessions</th>
                      <th className="py-2.5 px-3">First Date</th>
                      <th className="py-2.5 px-3">Latest Date</th>
                      <th className="py-2.5 px-3 text-right">Latest Score &amp; Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:text-black">
                    {reportData.attendedSummary.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white print:text-black">
                          {item.shortName} <span className="font-normal text-slate-500 dark:text-slate-400 hidden sm:inline">({item.instrument})</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {item.source}
                        </td>
                        <td className="py-2.5 px-3 text-center font-black">
                          {item.count}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 print:text-black">
                          {new Date(item.firstDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 print:text-black">
                          {new Date(item.latestDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-black text-slate-900 dark:text-white mr-1.5 print:text-black">
                            {item.latestScore}/{item.maxScore}
                          </span>
                          <span className="font-bold text-tealBrand-700 dark:text-tealBrand-300 print:text-black">
                            ({item.latestBand})
                          </span>
                          {item.hasSuicideFlag && (
                            <span className="block text-[10px] font-black text-rose-600 print:text-black">
                              ⚠ Safety Protocol Flagged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CLINICIAN-ADMINISTERED INSTRUMENTS SECTIONS (ONLY ATTENDED) */}
          {reportData.clinicianSections && reportData.clinicianSections.length > 0 && (
            <div className="space-y-8">
              {reportData.clinicianSections.map((sec) => (
                <div
                  key={sec.id}
                  className="space-y-3 p-5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 break-inside-avoid print:bg-white print:border-slate-400"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white print:text-black">
                        {sec.name} ({sec.shortName})
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Source: <strong>{sec.source}</strong> &bull; Time Frame: {sec.timeFrame}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 print:text-slate-600">
                      {sec.records.length} Administration{sec.records.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Trend chart only when >= 2 administrations */}
                  {sec.hasTrend && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-slate-600">
                        Longitudinal Progress Trend:
                      </p>
                      <ReportTrendChart
                        records={sec.records}
                        maxScore={sec.maxScore}
                        bands={sec.bands}
                      />
                    </div>
                  )}

                  {/* Administrations Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800 print:text-black">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Total Score</th>
                          <th className="py-2 px-3">Severity Band</th>
                          <th className="py-2 px-3">Instrument-Specific Subscores / Summary</th>
                          <th className="py-2 px-3">Clinician Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 print:text-black">
                        {sec.records.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 print:hover:bg-transparent">
                            <td className="py-2 px-3 font-semibold whitespace-nowrap">
                              {new Date(r.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 font-black text-slate-900 dark:text-white print:text-black">
                              {r.score} / {sec.maxScore}
                            </td>
                            <td className="py-2 px-3 font-bold text-tealBrand-700 dark:text-tealBrand-300 print:text-black">
                              {r.band}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-700 dark:text-slate-300 print:text-black">
                              {sec.id === 'adhd_dsm5' && r.subscores && (
                                <div>
                                  <p>Inattention: <strong>{r.subscores.inattentionCount}/9</strong> • Hyperactive-Impulsive: <strong>{r.subscores.hyperactiveImpulsiveCount}/9</strong></p>
                                  <p className="font-bold text-tealBrand-800 dark:text-tealBrand-200 print:text-black">{r.subscores.presentation}</p>
                                </div>
                              )}
                              {sec.id === 'ybocs_part2' && r.subscores && (
                                <div>
                                  <p>Obsessions: <strong>{r.subscores.obsessionSubtotal}/20</strong> • Compulsions: <strong>{r.subscores.compulsionSubtotal}/20</strong></p>
                                  <p>Insight Score: <strong>{r.subscores.insightScore}/4</strong></p>
                                </div>
                              )}
                              {sec.id === 'nsesss_ptsd' && r.subscores && (
                                <div>
                                  <p>Raw Sum: <strong>{r.subscores.rawSum}</strong> • Average Score: <strong>{r.subscores.averageScore}/4.00</strong> ({r.band})</p>
                                  {r.subscores.isProrated && <p className="text-amber-700 italic">Prorated total: {r.score}</p>}
                                  {r.traumaticEvent && (
                                    <p className="mt-1 p-1.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                                      Traumatic Event: {r.traumaticEvent} {r.traumaticEventDate ? `(${new Date(r.traumaticEventDate).toLocaleDateString()})` : ''}
                                    </p>
                                  )}
                                </div>
                              )}
                              {sec.id === 'hama' && r.subscores && (
                                <p>Psychic: <strong>{r.subscores.psychicSubscore}/28</strong> • Somatic: <strong>{r.subscores.somaticSubscore}/28</strong></p>
                              )}
                              {sec.id === 'hamd17' && (
                                <div>
                                  {r.flags && r.flags.includes('SUICIDE_RISK_ALERT') ? (
                                    <span className="font-black text-rose-600 print:text-black">
                                      ⚠ Suicide Risk Flagged (Score {r.subscores?.suicideItemScore}). Follow safety protocol.
                                    </span>
                                  ) : (
                                    <span>Suicide Item Score: {r.subscores?.suicideItemScore || 0}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-3 italic text-slate-600 text-[11px]">
                              {r.clinicianNote || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ADHD Caveat Line */}
                  {sec.id === 'adhd_dsm5' && sec.caveat && (
                    <div className="p-2.5 rounded-xl bg-slate-100 text-[10px] text-slate-700 leading-snug">
                      <strong>Clinical Criteria Caveat:</strong> {sec.caveat}
                    </div>
                  )}

                  {/* Optional Item-Level Answers for Latest Administration */}
                  {sec.latestItemAnswers && (
                    <div className="pt-2 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Item-Level Answers (Latest Session):
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5 text-center text-xs">
                        {sec.latestItemAnswers.map((ans) => (
                          <div key={ans.itemId} className="p-1.5 border border-slate-300 rounded-lg">
                            <span className="block text-[9px] text-slate-500 font-bold">#{ans.itemId}</span>
                            <span className="font-black text-slate-900">{ans.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 4. SELF-REPORTED ASSESSMENTS (ONLY ATTENDED & SHARED) */}
          {reportData.selfSections && reportData.selfSections.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 print:bg-black"></span>
                <span>Self-Reported Assessments (Patient-Completed)</span>
              </h2>

              {reportData.selfSections.map((sec) => (
                <div
                  key={sec.key}
                  className="space-y-3 p-5 rounded-2xl border border-slate-300 break-inside-avoid"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                      <p className="text-[11px] text-slate-500">Source: Patient Self-Report</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{sec.records.length} Entries</span>
                  </div>

                  {sec.hasTrend && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Trend over time:
                      </p>
                      <ReportTrendChart records={sec.records} maxScore={sec.maxScore} bands={sec.bands} />
                    </div>
                  )}

                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 font-bold">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Total Score</th>
                        <th className="py-2 px-3">Severity Classification</th>
                        <th className="py-2 px-3">Risk Indicators</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sec.records.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2 px-3">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="py-2 px-3 font-bold">{r.score} / {sec.maxScore}</td>
                          <td className="py-2 px-3">{r.severity}</td>
                          <td className="py-2 px-3">
                            {r.itemNineFlag ? (
                              <span className="font-bold text-rose-600 print:text-black">
                                Elevated safety response on Item 9
                              </span>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* 5. EXERCISES (ONLY IF ATTENDED/ASSIGNED IN RANGE, OMIT EMPTY SUB-LISTS) */}
          {reportData.exercises && (reportData.exercises.cbt || reportData.exercises.cet) && (
            <div className="space-y-4 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 print:bg-black"></span>
                <span>Therapeutic Exercises &amp; Cognitive Practice</span>
              </h2>

              {reportData.exercises.cbt && (
                <div className="space-y-2 border border-slate-300 p-4 rounded-2xl">
                  <h4 className="font-black text-xs uppercase text-slate-800">
                    Cognitive Behavioral Therapy (CBT) Assignments ({reportData.exercises.cbt.length})
                  </h4>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-600">
                        <th className="py-1 px-2">Exercise</th>
                        <th className="py-1 px-2">Status</th>
                        <th className="py-1 px-2">Assigned Date</th>
                        <th className="py-1 px-2">Completed Date</th>
                        <th className="py-1 px-2">Mood Shift</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.exercises.cbt.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-1.5 px-2 font-bold">{ex.title}</td>
                          <td className="py-1.5 px-2 capitalize">{ex.status}</td>
                          <td className="py-1.5 px-2">{new Date(ex.createdAt).toLocaleDateString()}</td>
                          <td className="py-1.5 px-2">{ex.completedAt ? new Date(ex.completedAt).toLocaleDateString() : '—'}</td>
                          <td className="py-1.5 px-2">
                            {ex.moodBefore !== null && ex.moodAfter !== null
                              ? `${ex.moodBefore}/10 → ${ex.moodAfter}/10`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.exercises.cet && (
                <div className="space-y-2 border border-slate-300 p-4 rounded-2xl">
                  <h4 className="font-black text-xs uppercase text-slate-800">
                    Cognitive Enhancement Therapy (CET) Practice ({reportData.exercises.cet.length})
                  </h4>
                  <p className="text-[10px] text-slate-500 italic">
                    CET exercises are cognitive training exercises, not a diagnosis or medical treatment.
                  </p>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 font-bold text-slate-600">
                        <th className="py-1 px-2">Exercise</th>
                        <th className="py-1 px-2">Status</th>
                        <th className="py-1 px-2">Assigned</th>
                        <th className="py-1 px-2">Completed</th>
                        <th className="py-1 px-2">Mood Shift</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.exercises.cet.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-1.5 px-2 font-bold">{ex.title}</td>
                          <td className="py-1.5 px-2 capitalize">{ex.status}</td>
                          <td className="py-1.5 px-2">{new Date(ex.createdAt).toLocaleDateString()}</td>
                          <td className="py-1.5 px-2">{ex.completedAt ? new Date(ex.completedAt).toLocaleDateString() : '—'}</td>
                          <td className="py-1.5 px-2">
                            {ex.moodBefore !== null && ex.moodAfter !== null
                              ? `${ex.moodBefore}/10 → ${ex.moodAfter}/10`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 6. CLINICIAN NOTES (ONLY IF SELECTED AND PRESENT) */}
          {reportData.notes && reportData.notes.length > 0 && (
            <div className="space-y-3 p-5 rounded-2xl border border-slate-300 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 print:bg-black"></span>
                <span>Session Notes ({reportData.notes.length})</span>
              </h2>
              <div className="space-y-3 text-xs">
                {reportData.notes.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. FOOTER: CITATION LINES & DIAGNOSTIC DISCLAIMER */}
          <div className="pt-6 border-t-2 border-slate-300 text-[10px] text-slate-600 space-y-2 break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-slate-700">Source Citations &amp; Instrument Attribution:</span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-500">
                {reportData.citations?.map((cit, idx) => (
                  <li key={idx}>{cit}</li>
                ))}
              </ul>
            </div>

            <p className="font-bold text-slate-900 text-center pt-2">
              {reportData.footer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
