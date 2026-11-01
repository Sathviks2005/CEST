import React from 'react';

const SCALE_SEGMENTS = [
  { min: 0, max: 7, label: 'No clinically significant insomnia', short: '0–7', color: '#10b981' },
  { min: 8, max: 14, label: 'Subthreshold insomnia', short: '8–14', color: '#f59e0b' },
  { min: 15, max: 21, label: 'Clinical insomnia (moderate severity)', short: '15–21', color: '#f97316' },
  { min: 22, max: 28, label: 'Clinical insomnia (severe)', short: '22–28', color: '#f43f5e' },
];

const MAX_SCORE = 28;

const getSegmentForScore = (score) =>
  SCALE_SEGMENTS.find((s) => score >= s.min && score <= s.max) || SCALE_SEGMENTS[0];

export const InsomniaScoreScale = ({ score = 0, severity = '' }) => {
  const clamped = Math.max(0, Math.min(MAX_SCORE, Number(score) || 0));
  const markerPercent = (clamped / MAX_SCORE) * 100;
  const active = getSegmentForScore(clamped);

  return (
    <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Total score severity scale
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Your score sits in the{' '}
            <span style={{ color: active.color }}>{active.label.toLowerCase()}</span> range
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-extrabold text-lg shadow-md"
          style={{ backgroundColor: active.color }}
        >
          {clamped}
          <span className="text-sm font-semibold opacity-90">/ {MAX_SCORE}</span>
        </div>
      </div>

      <div className="relative pt-9 pb-1">
        <div
          className="absolute top-0 z-20 -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `clamp(1.5rem, ${markerPercent}%, calc(100% - 1.5rem))` }}
        >
          <div
            className="px-2.5 py-1 rounded-lg text-white text-xs font-extrabold shadow-lg whitespace-nowrap"
            style={{ backgroundColor: active.color }}
          >
            You · {clamped}
          </div>
          <div
            className="mx-auto w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: active.color }}
          />
        </div>

        <div className="relative flex h-6 rounded-full overflow-hidden shadow-inner ring-1 ring-black/10">
          {SCALE_SEGMENTS.map((seg, i) => {
            const isActive = clamped >= seg.min && clamped <= seg.max;
            return (
              <div
                key={seg.label}
                className={`h-full relative ${isActive ? 'brightness-110' : 'opacity-75'}`}
                style={{
                  flexGrow: seg.max - seg.min + 1,
                  backgroundColor: seg.color,
                }}
                title={`${seg.label} (${seg.short})`}
              >
                {i < SCALE_SEGMENTS.length - 1 && (
                  <span className="absolute right-0 top-0 bottom-0 w-px bg-white/50" />
                )}
              </div>
            );
          })}

          <div
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${markerPercent}%` }}
          >
            <div
              className="w-5 h-5 rounded-full border-[3px] border-white shadow-lg"
              style={{ backgroundColor: active.color }}
            />
          </div>
        </div>

        <div className="flex justify-between mt-2 text-[10px] font-semibold text-slate-500">
          <span>0</span>
          <span>8</span>
          <span>15</span>
          <span>22</span>
          <span>28</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {SCALE_SEGMENTS.map((seg) => {
          const isActive = clamped >= seg.min && clamped <= seg.max;
          return (
            <div
              key={seg.label}
              className={`rounded-xl px-2.5 py-2.5 text-center border-2 transition-all ${
                isActive ? 'scale-[1.02] shadow-md' : 'opacity-65 border-transparent'
              }`}
              style={{
                backgroundColor: `${seg.color}20`,
                borderColor: isActive ? seg.color : 'transparent',
              }}
            >
              <div
                className="w-full h-1.5 rounded-full mb-1.5"
                style={{ backgroundColor: seg.color }}
              />
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{seg.label}</p>
              <p className="text-[10px] text-slate-500">{seg.short}</p>
              {isActive && (
                <p className="text-[10px] font-extrabold mt-1" style={{ color: seg.color }}>
                  ← You are here
                </p>
              )}
            </div>
          );
        })}
      </div>

      {severity && (
        <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
          Severity Classification:{' '}
          <span style={{ color: active.color }}>{severity}</span>
        </p>
      )}
    </div>
  );
};
