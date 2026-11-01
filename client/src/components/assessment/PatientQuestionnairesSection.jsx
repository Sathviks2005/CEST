import React, { useState, useEffect, useMemo } from 'react';
import {
  FaClipboardList,
  FaPlay,
  FaPrint,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaInfoCircle,
} from 'react-icons/fa';
import { CLINICIAN_INSTRUMENTS } from '../../data/clinicianInstruments';
import { clinicianAssessmentService } from '../../services/clinicianAssessmentService';
import { ClinicianInstrumentAdminister } from './ClinicianInstrumentAdminister';
import { HamDAssessment } from './HamDAssessment';
import { PrintBlankInstrumentModal } from './PrintBlankInstrumentModal';

/**
 * Inline SVG Trend Chart with Shaded Severity Bands for Clinician Questionnaires
 */
const QuestionnaireTrendChart = ({ records = [], instrument }) => {
  if (!records || records.length < 2) return null;

  const width = 500;
  const height = 140;
  const padding = { top: 16, right: 24, bottom: 26, left: 36 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxVal = instrument?.maxScore || 50;

  // Chronological sort
  const sorted = [...records].sort(
    (a, b) => new Date(a.administeredAt) - new Date(b.administeredAt)
  );

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(Number(val) || 0, maxVal));
    return padding.top + plotHeight - (clamped / maxVal) * plotHeight;
  };

  const getX = (idx, total) => {
    if (total <= 1) return padding.left + plotWidth / 2;
    return padding.left + (idx / (total - 1)) * plotWidth;
  };

  const points = sorted.map((r, i) => ({
    x: getX(i, sorted.length),
    y: getY(r.totalScore),
    score: r.totalScore,
    band: r.band,
    date: new Date(r.administeredAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FaChartLine className="text-tealBrand-500" /> Longitudinal Trend ({sorted.length} Sessions)
        </span>
        <span className="text-[11px] text-slate-400">Score Range: 0 to {maxVal}</span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[500px] h-auto select-none block">
          {/* Shaded Bands */}
          {instrument?.bands?.map((b, idx) => {
            const yTop = getY(b.max);
            const yBottom = getY(b.min);
            const bandHeight = Math.max(0, yBottom - yTop);
            return (
              <rect
                key={idx}
                x={padding.left}
                y={yTop}
                width={plotWidth}
                height={bandHeight}
                fill={b.color || '#0d9488'}
                fillOpacity="0.10"
              />
            );
          })}

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1"
          />

          {/* Min and Max labels */}
          <text
            x={padding.left - 6}
            y={padding.top + 4}
            textAnchor="end"
            fontSize="9"
            className="fill-slate-500 font-bold"
          >
            {maxVal}
          </text>
          <text
            x={padding.left - 6}
            y={height - padding.bottom}
            textAnchor="end"
            fontSize="9"
            className="fill-slate-500 font-bold"
          >
            0
          </text>

          {/* Trend Polyline */}
          <path
            d={pathD}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Trend Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#0d9488"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                className="fill-slate-800 dark:fill-slate-200"
              >
                {p.score}
              </text>
              <text
                x={p.x}
                y={height - padding.bottom + 14}
                textAnchor="middle"
                fontSize="8"
                className="fill-slate-400"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export const PatientQuestionnairesSection = ({ patient }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAdministerId, setActiveAdministerId] = useState(null);
  const [printBlankId, setPrintBlankId] = useState(null);
  const [selectedInstrumentFilter, setSelectedInstrumentFilter] = useState('ALL');
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const patientId = patient?._id || patient?.id;

  const fetchAssessments = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await clinicianAssessmentService.getPatientAssessments(patientId);
      setAssessments(res?.data || []);
    } catch (err) {
      console.error('Failed to load patient assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [patientId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinical assessment record? This action will remove it from the patient history.')) {
      return;
    }

    setDeletingId(id);
    setDeleteError('');
    try {
      await clinicianAssessmentService.deleteAssessment(id);
      fetchAssessments();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete assessment record.');
    } finally {
      setDeletingId(null);
    }
  };

  const instrumentsList = Object.values(CLINICIAN_INSTRUMENTS);

  // Filtered by instrument for grouped history
  const filteredRecords = useMemo(() => {
    if (selectedInstrumentFilter === 'ALL') return assessments;
    return assessments.filter((a) => a.instrumentId === selectedInstrumentFilter);
  }, [assessments, selectedInstrumentFilter]);

  // Group assessments by instrument
  const groupedByInstrument = useMemo(() => {
    const map = {};
    instrumentsList.forEach((inst) => {
      map[inst.id] = assessments.filter((a) => a.instrumentId === inst.id);
    });
    return map;
  }, [assessments, instrumentsList]);

  // If in active administration mode
  if (activeAdministerId) {
    if (activeAdministerId === 'hamd17') {
      return (
        <HamDAssessment
          initialPatientName={patient.name}
          initialPatientId={patientId}
          onCancel={() => setActiveAdministerId(null)}
          onComplete={() => {
            setActiveAdministerId(null);
            fetchAssessments();
          }}
        />
      );
    }

    return (
      <ClinicianInstrumentAdminister
        instrumentId={activeAdministerId}
        patient={patient}
        onBack={() => setActiveAdministerId(null)}
        onComplete={() => {
          fetchAssessments();
        }}
      />
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <FaClipboardList className="text-tealBrand-600" />
            <span>Clinical Questionnaires & Diagnostic Severity</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer rating scales in-session, track longitudinal trends, and print verified diagnostic reports.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-bold self-start sm:self-auto">
          {assessments.length} Total Sessions Logged
        </span>
      </div>

      {/* ADMINISTER BUTTON BAR (ONE BUTTON PER INSTRUMENT) */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Administer Questionnaire to {patient.name}:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {instrumentsList.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => setActiveAdministerId(inst.id)}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-tealBrand-500 hover:shadow-md transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400 block mb-0.5">
                  {inst.shortName}
                </span>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-tealBrand-600">
                  {inst.name}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-tealBrand-600">
                <span className="text-slate-400 font-normal">{inst.itemsCount} items</span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <FaPlay className="text-[9px]" /> Start
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LONGITUDINAL HISTORY & TRENDS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-tealBrand-600" />
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Administration History &amp; Trends
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedInstrumentFilter('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                selectedInstrumentFilter === 'ALL'
                  ? 'bg-tealBrand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({assessments.length})
            </button>
            {instrumentsList.map((inst) => {
              const count = groupedByInstrument[inst.id]?.length || 0;
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedInstrumentFilter(inst.id)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    selectedInstrumentFilter === inst.id
                      ? 'bg-tealBrand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {inst.shortName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {deleteError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {deleteError}
          </div>
        )}

        {/* Shaded Band Trend Chart if specific instrument selected with >=2 records */}
        {selectedInstrumentFilter !== 'ALL' && (
          <QuestionnaireTrendChart
            records={groupedByInstrument[selectedInstrumentFilter] || []}
            instrument={CLINICIAN_INSTRUMENTS[selectedInstrumentFilter]}
          />
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500 mb-2" />
            Loading questionnaire records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No clinical questionnaire records logged for this filter yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredRecords.map((rec) => {
              const instDef = CLINICIAN_INSTRUMENTS[rec.instrumentId];
              const isExpanded = expandedRecordId === rec._id;

              return (
                <div key={rec._id || rec.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 rounded-xl bg-tealBrand-50 dark:bg-tealBrand-950 text-tealBrand-700 dark:text-tealBrand-300 font-black text-xs shrink-0 mt-0.5">
                        {instDef?.shortName || rec.instrumentId}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {instDef?.name || rec.instrumentId}
                          </p>
                          {rec.isAdaptedFromHamD && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
                              Adapted HAM-D
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(rec.administeredAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })} &bull; Respondent: {rec.respondent || 'patient'}
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedRecordId(isExpanded ? null : rec._id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1"
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />} Details
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 text-xs"
                          title="Print Result"
                        >
                          <FaPrint />
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === rec._id}
                          onClick={() => handleDelete(rec._id || rec.id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs disabled:opacity-50"
                          title="Delete Record (Creator only)"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                      {rec.clinicianNote && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          <strong>Clinician Session Note:</strong> "{rec.clinicianNote}"
                        </p>
                      )}

                      {rec.flags && rec.flags.includes('SUICIDE_RISK_ALERT') && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                          <FaExclamationTriangle className="text-rose-600" />
                          <span>Follow your clinical safety protocol. Suicidal ideation flagged on this assessment.</span>
                        </div>
                      )}

                      {/* Subscores details */}
                      {rec.subscores && Object.keys(rec.subscores).length > 0 && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <strong>Subscores:</strong>{' '}
                          {Object.entries(rec.subscores)
                            .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`)
                            .join(' • ')}
                        </div>
                      )}

                      {/* Item level answers */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Individual Item Scores:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[11px]">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blank Print Modal */}
      {printBlankId && (
        <PrintBlankInstrumentModal
          instrumentId={printBlankId}
          patient={patient}
          onClose={() => setPrintBlankId(null)}
        />
      )}
    </div>
  );
};
