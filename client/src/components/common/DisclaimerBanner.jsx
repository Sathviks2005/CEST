import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export const DisclaimerBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm py-2 px-4 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 shrink-0 text-sm" />
          <span>
            <strong className="font-semibold">Medical Disclaimer:</strong> CEST provides educational & cognitive support tools. It does not replace professional medical diagnosis or clinical treatment.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-300 hover:opacity-75 transition-opacity p-1 rounded"
          aria-label="Dismiss disclaimer banner"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};
