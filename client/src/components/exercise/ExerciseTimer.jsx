import React, { useEffect, useState } from 'react';
import { FaClock } from 'react-icons/fa';

export const ExerciseTimer = ({ isActive, onTick }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, onTick]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs sm:text-sm font-bold shadow-inner border border-slate-800">
      <FaClock className="text-brand-400 text-xs animate-pulse" />
      <span>Timer: {formatTime(seconds)}</span>
    </div>
  );
};
