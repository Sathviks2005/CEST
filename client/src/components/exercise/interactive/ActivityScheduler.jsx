import React, { useState } from 'react';
import { FaCalendarAlt, FaPlus, FaCheckCircle, FaCheck, FaTrash, FaCopy, FaShieldAlt } from 'react-icons/fa';

const SEEDED_GRADED_ITEMS = [
  { id: 'g1', text: 'Step outside for 5 minutes of fresh air', tinyVersion: 'Open the door and look outside for 1 minute', barrier: 'Feeling too tired', fix: 'Leave shoes right by the door', day: 'Day 1', pleasure: 6, mastery: 5, completed: false },
  { id: 'g2', text: 'Take a gentle warm shower', tinyVersion: 'Wash face and hands with warm water', barrier: 'Low energy', fix: 'Keep clothes ready on a chair beforehand', day: 'Day 1', pleasure: 7, mastery: 6, completed: false },
  { id: 'g3', text: 'Message one supportive person', tinyVersion: 'Send a single heart emoji or short greeting', barrier: 'Worry about replying later', fix: 'Say "Just thinking of you, resting today"', day: 'Day 2', pleasure: 6, mastery: 6, completed: false },
  { id: 'g4', text: 'Eat a meal at a table mindfully', tinyVersion: 'Sit at the table with a cup of tea or small snack', barrier: 'Preferring to stay in bed', fix: 'Sit down for just 3 minutes', day: 'Day 3', pleasure: 5, mastery: 5, completed: false },
];

const SUGGESTED_MILD_ACTIVITIES = [
  '15-minute gentle walk in fresh air',
  'Listen to a favorite music album',
  'Water house plants or tend to garden',
  'Read one chapter of a comforting book',
  'Enjoy a warm cup of herbal tea mindfully',
  'Message a close friend or family member',
];

export const ActivityScheduler = ({ mode = 'mild', onComplete }) => {
  const isGraded = mode === 'graded';
  const isModerate = mode === 'moderate';

  const [scheduledItems, setScheduledItems] = useState(
    isGraded
      ? SEEDED_GRADED_ITEMS
      : [
          { id: '1', text: '15-minute gentle walk in fresh air', day: 'Today', time: 'Morning', pleasure: 7, mastery: 6, completed: false },
          { id: '2', text: 'Enjoy a warm cup of herbal tea mindfully', day: 'Tomorrow', time: 'Afternoon', pleasure: 8, mastery: 5, completed: false },
        ]
  );

  const [customText, setCustomText] = useState('');
  const [tinyVersionText, setTinyVersionText] = useState('');
  const [barrierText, setBarrierText] = useState('');
  const [fixText, setFixText] = useState('');
  const [selectedDay, setSelectedDay] = useState(isGraded ? 'Day 1' : 'Today');
  const [pleasureVal, setPleasureVal] = useState(5);
  const [masteryVal, setMasteryVal] = useState(5);
  const [beforeMood, setBeforeMood] = useState(50);
  const [afterMood, setAfterMood] = useState(65);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    if (isGraded) {
      const itemsForDay = scheduledItems.filter((i) => i.day === selectedDay);
      if (itemsForDay.length >= 2) {
        alert('In graded activation, we recommend a maximum of 1–2 tiny activities per day to avoid burnout.');
        return;
      }
    }

    const newItem = {
      id: 'act_' + Date.now(),
      text: customText.trim(),
      tinyVersion: tinyVersionText.trim() || 'Do 2–5 minutes of this activity',
      barrier: barrierText.trim() || 'Fatigue or low motivation',
      fix: fixText.trim() || 'Start with just 2 minutes without expectation',
      day: selectedDay,
      time: 'Flexible',
      pleasure: Number(pleasureVal),
      mastery: Number(masteryVal),
      completed: false,
    };

    setScheduledItems((prev) => [...prev, newItem]);
    setCustomText('');
    setTinyVersionText('');
    setBarrierText('');
    setFixText('');
  };

  const handleToggleComplete = (id) => {
    setScheduledItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemove = (id) => {
    setScheduledItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSavePlan = () => {
    setIsSaved(true);
    if (onComplete) onComplete();
  };

  const handleCopy = async () => {
    const summary = [
      `=== BEHAVIORAL ACTIVATION PLAN (${mode.toUpperCase()}) ===`,
      `Before Mood Rating: ${beforeMood}% | After Mood Rating: ${afterMood}%`,
      '',
      ...scheduledItems.map((item, idx) => {
        return `${idx + 1}. [${item.completed ? 'COMPLETED' : 'PLANNED'}] (${item.day}) ${item.text} | Pleasure: ${item.pleasure}/10 | Mastery: ${item.mastery}/10${item.tinyVersion ? ` | Tiny version: ${item.tinyVersion}` : ''}${item.barrier ? ` | Barrier: ${item.barrier} -> Fix: ${item.fix}` : ''}`;
      }),
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-tealBrand-400" />
            Behavioral Activation Planner ({isGraded ? 'Graded Micro-Tasks' : isModerate ? 'Structured 3-Day' : 'Mild'})
          </h4>
          <p className="text-xs text-slate-400">
            {isGraded
              ? 'Low-demand paced activities (max 1–2 per day) with tiny versions, obstacle troubleshooting, and 0–10 Pleasure/Mastery ratings.'
              : isModerate
              ? 'Structured multi-day rhythm with Pleasure (0–10) and Mastery (0–10) ratings.'
              : 'Small pleasant activities scheduled to reverse low momentum.'}
          </p>
        </div>
        <span className="text-xs font-bold text-tealBrand-400 bg-tealBrand-500/10 px-3 py-1 rounded-full border border-tealBrand-500/30 self-start sm:self-auto">
          {scheduledItems.length} Scheduled
        </span>
      </div>

      {isSaved ? (
        <div className="space-y-6 text-center py-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl">
            <FaCheckCircle />
          </div>
          <h4 className="text-xl font-bold text-white">Activation Plan Saved!</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Small, scheduled activities reliably stimulate neurotransmitters and lift mood. Even completing tiny versions counts as meaningful progress.
          </p>

          {/* Before/After Mood Indicator */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700 max-w-sm mx-auto text-xs font-bold">
            <div>
              <span className="text-slate-400 block text-[10px]">Before Mood</span>
              <span className="text-rose-400 text-base">{beforeMood}%</span>
            </div>
            <span className="text-slate-500">➔</span>
            <div>
              <span className="text-slate-400 block text-[10px]">Expected After</span>
              <span className="text-tealBrand-400 text-base">{afterMood}%</span>
            </div>
          </div>

          <div className="max-w-md mx-auto text-left space-y-2">
            {scheduledItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleComplete(item.id)}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 line-through'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <div>
                  <span className="font-bold mr-2 text-[10px] text-tealBrand-400">{item.day}:</span>
                  <span>{item.text}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Pleasure: {item.pleasure}/10 · Mastery: {item.mastery}/10
                  </div>
                </div>
                <span className="text-xs">{item.completed ? '✓ Done' : '○ Pending'}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Copied Plan!' : 'Copy Plan to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSaved(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
            >
              Modify Activities
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mood Check Rating */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Your Current Mood Right Now (0–100%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beforeMood}
                  onChange={(e) => setBeforeMood(Number(e.target.value))}
                  className="w-full accent-tealBrand-500"
                />
                <span className="text-xs font-bold text-tealBrand-400 w-8">{beforeMood}%</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Anticipated Mood After Activity (0–100%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={afterMood}
                  onChange={(e) => setAfterMood(Number(e.target.value))}
                  className="w-full accent-tealBrand-500"
                />
                <span className="text-xs font-bold text-tealBrand-400 w-8">{afterMood}%</span>
              </div>
            </div>
          </div>

          {/* 3-Day Monitoring Grid */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isGraded ? '3-Day Graded Activity Tracker (Max 1–2 per day)' : 'Scheduled Activities'}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(isGraded ? ['Day 1', 'Day 2', 'Day 3'] : ['Today', 'Tomorrow', 'Day 3']).map((dayLabel) => {
                const dayItems = scheduledItems.filter((i) => i.day === dayLabel);
                return (
                  <div key={dayLabel} className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-tealBrand-300 border-b border-slate-700/60 pb-1.5">
                      <span>{dayLabel}</span>
                      <span className="text-[10px] text-slate-400">{dayItems.length} planned</span>
                    </div>

                    <div className="space-y-2 min-h-[90px]">
                      {dayItems.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic pt-2">No activity scheduled yet.</p>
                      ) : (
                        dayItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                              item.completed
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-900 border-slate-700 text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold leading-snug">{item.text}</span>
                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                className="text-slate-500 hover:text-rose-400 text-xs shrink-0 p-0.5"
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>
                            {item.tinyVersion && (
                              <p className="text-[10px] text-slate-400">
                                <strong className="text-tealBrand-400">Tiny:</strong> {item.tinyVersion}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                              <span>P: {item.pleasure}/10 · M: {item.mastery}/10</span>
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(item.id)}
                                className={`text-[10px] font-bold ${item.completed ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                              >
                                {item.completed ? '✓ Completed' : '○ Mark done'}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Activity Form */}
          <form onSubmit={handleAddCustom} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-tealBrand-400">
              Add An Activity
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Activity Name</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Walk around the block, listen to favorite song..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                >
                  {isGraded ? (
                    <>
                      <option value="Day 1">Day 1</option>
                      <option value="Day 2">Day 2</option>
                      <option value="Day 3">Day 3</option>
                    </>
                  ) : (
                    <>
                      <option value="Today">Today</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Day 3">Day 3</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {isGraded && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Tiny Version (e.g. 2–5 min)</label>
                  <input
                    type="text"
                    value={tinyVersionText}
                    onChange={(e) => setTinyVersionText(e.target.value)}
                    placeholder="e.g. Stand outside for 1 minute"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">What could get in the way?</label>
                  <input
                    type="text"
                    value={barrierText}
                    onChange={(e) => setBarrierText(e.target.value)}
                    placeholder="e.g. Feeling too tired"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">One small fix for this</label>
                  <input
                    type="text"
                    value={fixText}
                    onChange={(e) => setFixText(e.target.value)}
                    placeholder="e.g. Leave sneakers by the door"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-tealBrand-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Anticipated Pleasure (0–10): {pleasureVal}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pleasureVal}
                  onChange={(e) => setPleasureVal(Number(e.target.value))}
                  className="w-full accent-tealBrand-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Anticipated Mastery (0–10): {masteryVal}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={masteryVal}
                  onChange={(e) => setMasteryVal(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!customText.trim()}
              className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow disabled:opacity-40 inline-flex items-center gap-1.5 transition-all"
            >
              <FaPlus className="text-[10px]" /> Add to Plan
            </button>
          </form>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSavePlan}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-extrabold text-xs shadow-md transition-all"
            >
              Save Activation Plan & Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
