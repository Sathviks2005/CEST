import React from 'react';
import { FaTimes, FaPrint, FaClipboardList } from 'react-icons/fa';
import { getInstrument } from '../../data/clinicianInstruments';

export const PrintBlankInstrumentModal = ({ instrumentId, patient, onClose }) => {
  const instrument = getInstrument(instrumentId);
  if (!instrument) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-panel bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 print:max-h-none print:shadow-none print:border-none print:p-6 print:rounded-none print:bg-white print:text-black">
        {/* Screen Header Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <FaClipboardList className="text-tealBrand-600 dark:text-tealBrand-400 text-xl" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Printable Blank Instrument</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <FaPrint /> Print Form
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="space-y-6 text-slate-900 dark:text-slate-100 print:text-black">
          {/* Header Lines */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 print:border-slate-900">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white print:text-black">
                  {instrument.name}
                </h1>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5 print:text-slate-700">
                  Cognitive Enhancement &amp; Support Tool (CEST) • Clinical Assessment Protocol
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">{instrument.shortName}</span>
                <p>Ver: {instrument.version}</p>
              </div>
            </div>

            {/* Patient Info Fill Lines */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-300 dark:border-slate-800 text-xs font-semibold print:border-slate-400">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold print:text-slate-600">Patient Name:</span>
                <p className="border-b border-slate-400 dark:border-slate-600 pb-1 font-bold min-h-[22px] print:border-slate-400 print:text-black">
                  {patient?.name || ''}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold print:text-slate-600">Date of Birth / Age:</span>
                <p className="border-b border-slate-400 dark:border-slate-600 pb-1 min-h-[22px] print:border-slate-400 print:text-black">
                  {patient?.age ? `${patient.age} yrs` : ''}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold print:text-slate-600">Administration Date:</span>
                <p className="border-b border-slate-400 dark:border-slate-600 pb-1 min-h-[22px] print:border-slate-400 print:text-black">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold print:text-slate-600">Clinician / Evaluator:</span>
                <p className="border-b border-slate-400 dark:border-slate-600 pb-1 min-h-[22px] print:border-slate-400 print:text-black"></p>
              </div>
            </div>
          </div>

          {/* Timeframe & Instructions */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 print:bg-white print:border-slate-300 print:text-black">
            <p>
              <strong>Evaluation Time Frame:</strong> {instrument.timeFrame}
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed print:text-black">
              <strong>Instructions:</strong> {instrument.instructions}
            </p>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {instrument.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 border border-slate-300 dark:border-slate-800 rounded-xl space-y-2 text-xs break-inside-avoid print:border-slate-400 print:bg-white print:text-black"
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm print:text-black">
                      {item.id}. {item.text}
                    </p>
                    {item.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed print:text-slate-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.maxScore && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                      Max {item.maxScore}
                    </span>
                  )}
                </div>

                {/* Response Checkboxes */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(item.options || instrument.options || []).map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-[11px] bg-slate-50/50"
                    >
                      <div className="w-4 h-4 rounded border-2 border-slate-400 shrink-0 flex items-center justify-center font-bold text-[9px]">
                        {opt.value}
                      </div>
                      <span className="text-slate-700 leading-snug">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Extra Fields Section if any */}
          {instrument.extraFields && instrument.extraFields.length > 0 && (
            <div className="border border-slate-300 p-4 rounded-xl space-y-3 text-xs break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h3 className="font-bold uppercase tracking-wider text-slate-700">Additional Instrument Notes</h3>
              <div className="space-y-3">
                {instrument.extraFields.map((ef) => (
                  <div key={ef.id} className="space-y-1">
                    <span className="font-semibold text-slate-800">{ef.label}</span>
                    <div className="border-b border-dashed border-slate-400 h-6"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinician Notes Box */}
          <div className="border border-slate-300 p-4 rounded-xl space-y-2 text-xs break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <span className="font-bold uppercase text-slate-700">Clinical Observations & Scoring Notes:</span>
            <div className="h-16 border-b border-dashed border-slate-300"></div>
          </div>

          {/* Footer Citations and Copyright */}
          <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-500 space-y-1 break-inside-avoid">
            <p>
              <strong>Citation:</strong> {instrument.citation}
            </p>
            <p>
              <strong>Copyright:</strong> {instrument.copyright}
            </p>
            <p className="italic text-slate-400 pt-1">
              Rating-scale scores support clinical judgement. They are not a diagnosis. Printed via CEST Clinical System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
