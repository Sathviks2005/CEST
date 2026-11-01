import React from 'react';
import { Link } from 'react-router-dom';
import { DisorderIcon } from '../common/DisorderIcon';
import { FaArrowRight } from 'react-icons/fa';

export const DisorderCard = ({ disorder }) => {
  return (
    <Link
      to={`/conditions/${disorder.slug}`}
      className="group glass-panel rounded-2xl p-6 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 cursor-pointer block text-left"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand-600 transition-colors duration-300">
            <DisorderIcon name={disorder.iconName} className="text-2xl text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-tealBrand-50 dark:bg-tealBrand-950/40 text-tealBrand-700 dark:text-tealBrand-300 border border-tealBrand-200/60 dark:border-tealBrand-800/50">
            {disorder.category}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {disorder.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {disorder.shortDescription}
          </p>
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {disorder.symptoms ? `${disorder.symptoms.length} Symptoms` : 'Detailed Guide'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
          <span>Learn More</span>
          <FaArrowRight className="text-xs" />
        </span>
      </div>
    </Link>
  );
};

