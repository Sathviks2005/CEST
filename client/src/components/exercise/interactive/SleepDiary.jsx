import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMoon, FaStar, FaChartBar, FaCheckCircle, FaCopy, FaCheck } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

const DEFAULT_DAYS = [
  { night: 'Night 1', bedtime: '22:30', lightsOutTime: '23:00', fallAsleepMins: 30, awakenings: 2, wakeTime: '06:30', outOfBedTime: '07:00', quality: 3 },
  { night: 'Night 2', bedtime: '23:00', lightsOutTime: '23:30', fallAsleepMins: 25, awakenings: 1, wakeTime: '06:45', outOfBedTime: '07:00', quality: 3 },
  { night: 'Night 3', bedtime: '22:45', lightsOutTime: '23:15', fallAsleepMins: 40, awakenings: 3, wakeTime: '06:30', outOfBedTime: '07:15', quality: 2 },
  { night: 'Night 4', bedtime: '22:30', lightsOutTime: '23:00', fallAsleepMins: 20, awakenings: 1, wakeTime: '06:30', outOfBedTime: '06:45', quality: 4 },
  { night: 'Night 5', bedtime: '23:15', lightsOutTime: '23:45', fallAsleepMins: 35, awakenings: 2, wakeTime: '07:00', outOfBedTime: '07:30', quality: 3 },
  { night: 'Night 6', bedtime: '23:30', lightsOutTime: '00:00', fallAsleepMins: 30, awakenings: 1, wakeTime: '07:30', outOfBedTime: '08:00', quality: 4 },
  { night: 'Night 7', bedtime: '22:30', lightsOutTime: '23:00', fallAsleepMins: 25, awakenings: 1, wakeTime: '06:30', outOfBedTime: '07:00', quality: 4 },
];

const QUALITY_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Very Good',
};

export const SleepDiary = ({ onComplete }) => {
  const [entries, setEntries] = useState(DEFAULT_DAYS);
  const [activeNightIdx, setActiveNightIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const { isReduced, safeTransition } = useMotionSafe();

  const updateEntry = (field, value) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[activeNightIdx] = { ...copy[activeNightIdx], [field]: value };
      return copy;
    });
  };

  const getEntryHours = (entry) => {
    const [bH, bM] = (entry.bedtime || '23:00').split(':').map(Number);
    const [oH, oM] = (entry.outOfBedTime || '07:00').split(':').map(Number);
    let bedMins = bH * 60 + bM;
    let outMins = oH * 60 + oM;
    if (outMins <= bedMins) {
      outMins += 24 * 60;
    }
    const timeInBedHours = (outMins - bedMins) / 60;
    const awakeHours = ((Number(entry.fallAsleepMins) || 0) + (Number(entry.awakenings) || 0) * 15) / 60;
    const sleptHours = Math.max(0, timeInBedHours - awakeHours);
    return {
      timeInBedHours,
      sleptHours: Math.round(sleptHours * 10) / 10,
      efficiency: timeInBedHours > 0 ? Math.min(100, Math.round((sleptHours / timeInBedHours) * 100)) : 0,
    };
  };

  const calculatedStats = entries.map(getEntryHours);
  const avgSleptHours =
    Math.round((calculatedStats.reduce((sum, item) => sum + item.sleptHours, 0) / entries.length) * 10) / 10;
  const avgEfficiency = Math.round(
    calculatedStats.reduce((sum, item) => sum + item.efficiency, 0) / entries.length
  );

  const currentNight = entries[activeNightIdx];
  const maxSleptForChart = Math.max(...calculatedStats.map((s) => s.sleptHours), 8);

  const handleCopySummary = async () => {
    const textLines = [
      '=== CONSENSUS SLEEP DIARY (7 NIGHTS) ===',
      `Average Sleep Duration: ${avgSleptHours} hours / night`,
      `Average Sleep Efficiency: ${avgEfficiency}%`,
      '',
      ...entries.map((e, idx) => {
        const stats = calculatedStats[idx];
        return `${e.night}: Bed ${e.bedtime} | Lights-out ${e.lightsOutTime} | Latency ${e.fallAsleepMins}m | Awakenings ${e.awakenings} | Wake ${e.wakeTime} | Out of bed ${e.outOfBedTime} | Quality: ${QUALITY_LABELS[e.quality] || e.quality} (${stats.sleptHours}h slept, ${stats.efficiency}% eff)`;
      }),
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textLines);
        setCopied(true);
        if (onComplete) onComplete();
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write error', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <FaCalendarAlt />
            <span>Consensus Sleep Diary</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            7-Night Consensus Sleep Diary
          </h3>
          <p className="text-xs text-slate-400">
            Standard Consensus Sleep Diary metrics: bed time, lights-out, sleep latency, awakenings, wake time, out-of-bed time, and quality.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          {copied ? <FaCheck /> : <FaCopy />}
          <span>{copied ? 'Copied Summary!' : 'Copy 7-Night Summary'}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
            <FaMoon />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Average Sleep Duration
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {avgSleptHours} <span className="text-sm font-semibold text-slate-400">hours / night</span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tealBrand-500/20 text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-xl shrink-0">
            <FaChartBar />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Approximate Sleep Efficiency
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {avgEfficiency}% <span className="text-xs font-semibold text-slate-400">(hours slept ÷ hours in bed)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart of Hours Slept */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Hours Slept Per Night
          </span>
          <span>Click a night below to view or edit</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2 border-b border-slate-800">
          {calculatedStats.map((stat, idx) => {
            const heightPercent = Math.max(8, Math.min(100, Math.round((stat.sleptHours / maxSleptForChart) * 100)));
            const isSelected = activeNightIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveNightIdx(idx)}
                className="flex-1 flex flex-col items-center gap-1 group focus:outline-none"
              >
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                  {stat.sleptHours}h
                </span>
                <div className="w-full max-w-[28px] h-28 bg-slate-800/80 rounded-t-lg flex items-end overflow-hidden p-0.5">
                  <motion.div
                    className={`w-full rounded-t-md transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-t from-indigo-600 to-tealBrand-400 shadow-md'
                        : 'bg-indigo-500/60 group-hover:bg-indigo-400/80'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={safeTransition({ duration: 0.5, ease: 'easeOut' })}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isSelected ? 'text-tealBrand-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  N{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor for Active Night with Consensus Sleep Diary fields */}
      <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Editing {currentNight.night} (Consensus Fields)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {calculatedStats[activeNightIdx].sleptHours}h slept · {calculatedStats[activeNightIdx].efficiency}% efficiency
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">1. Bed Time (In bed)</label>
            <input
              type="time"
              value={currentNight.bedtime}
              onChange={(e) => updateEntry('bedtime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">2. Lights-Out Time</label>
            <input
              type="time"
              value={currentNight.lightsOutTime}
              onChange={(e) => updateEntry('lightsOutTime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">3. Minutes to Fall Asleep</label>
            <input
              type="number"
              min="0"
              max="240"
              value={currentNight.fallAsleepMins}
              onChange={(e) => updateEntry('fallAsleepMins', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">4. Night Awakenings (Count)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={currentNight.awakenings}
              onChange={(e) => updateEntry('awakenings', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">5. Final Wake-up Time</label>
            <input
              type="time"
              value={currentNight.wakeTime}
              onChange={(e) => updateEntry('wakeTime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">6. Out-of-Bed Time</label>
            <input
              type="time"
              value={currentNight.outOfBedTime}
              onChange={(e) => updateEntry('outOfBedTime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-slate-400 font-medium">7. Sleep Quality (1–5)</label>
            <select
              value={currentNight.quality}
              onChange={(e) => updateEntry('quality', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>1 - Very Poor</option>
              <option value={2}>2 - Poor</option>
              <option value={3}>3 - Fair</option>
              <option value={4}>4 - Good</option>
              <option value={5}>5 - Very Good</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
