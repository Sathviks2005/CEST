import React, { useState } from 'react';
import { FaTasks, FaCheckCircle, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

const DEFAULT_MICRO_TASKS = [
  { text: 'Drink one tall glass of water', done: false, time: '1 min' },
  { text: 'Open the window or blinds for fresh air and light', done: false, time: '2 min' },
  { text: 'Put away 3 items from a tabletop or floor', done: false, time: '3 min' },
  { text: 'Wash hands and splash cool water on face', done: false, time: '2 min' },
];

export const MicroTaskPlanner = ({ onComplete }) => {
  const [tasks, setTasks] = useState(DEFAULT_MICRO_TASKS);
  const [newText, setNewText] = useState('');
  const [isDone, setIsDone] = useState(false);

  const toggleTask = (index) => {
    setTasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], done: !copy[index].done };
      return copy;
    });
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setTasks((prev) => [...prev, { text: newText.trim(), done: false, time: '2–5 min' }]);
    setNewText('');
  };

  const removeTask = (index) => {
    setTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <FaTasks className="text-amber-400" /> "Smallest Possible Step" Micro-Task Planner
          </h4>
          <p className="text-xs text-slate-400">
            When energy is scarce, normal chores paralyze. Break action down into tiny, low-effort micro-steps (2–5 min).
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400 border border-amber-500/30">
          Graded Momentum
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
        <p className="font-semibold leading-relaxed">
          <strong>Rule of thumb:</strong> If a task feels too heavy to start, shrink it until it feels ridiculously easy. Completing one 2-minute step is 100% a victory.
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
              task.done
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleTask(idx)}
              className="flex items-center gap-3 text-left flex-1"
            >
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                  task.done
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black'
                    : 'border-slate-500 bg-slate-900'
                }`}
              >
                {task.done && <FaCheck />}
              </div>
              <span className={`text-xs ${task.done ? 'line-through opacity-70' : 'font-medium'}`}>
                {task.text}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                {task.time}
              </span>
              <button
                type="button"
                onClick={() => removeTask(idx)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Micro-step */}
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a tiny 2-min step (e.g. Put shoes near door)..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <FaPlus /> Add
        </button>
      </form>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FaCheckCircle /> {isDone ? 'Micro-Steps Saved!' : `Complete Session (${completedCount}/${tasks.length} Done)`}
        </button>
      </div>
    </div>
  );
};

