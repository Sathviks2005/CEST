import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../interactive/motionPresets';

export const WaveSurf = () => {
  const { isReduced } = useMotionSafe();
  const [markerX, setMarkerX] = useState(30);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setMarkerX((prev) => (prev >= 170 ? 30 : prev + 35));
    }, 1800);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <div
      role="img"
      aria-label="Wave surfing animation: an urge rises like an ocean wave, crests, and naturally breaks without acting on it"
      className="flex flex-col items-center justify-center p-3 space-y-2.5"
    >
      <div className="relative w-56 h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Ocean Wave Path */}
          <path
            d="M10 80 Q55 20 100 30 T190 80"
            className="stroke-tealBrand-500 fill-tealBrand-500/15"
            strokeWidth="3"
          />

          {/* Marker Surfer / "Now" */}
          <motion.circle
            cx={markerX}
            cy={markerX < 100 ? 80 - ((markerX - 10) * 55) / 90 : 25 + ((markerX - 100) * 55) / 90}
            r="6"
            className="fill-brand-600 stroke-white stroke-2"
            animate={{ scale: isReduced ? 1 : [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </svg>

        <span className="absolute bottom-2 left-4 text-[9px] font-bold text-slate-400">Urge rises</span>
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-tealBrand-500">Peak crest</span>
        <span className="absolute bottom-2 right-4 text-[9px] font-bold text-slate-400">Wave subsides</span>
      </div>

      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
        Urges are temporary physical waves you can surf through
      </p>
    </div>
  );
};
