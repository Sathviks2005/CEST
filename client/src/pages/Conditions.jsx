import React, { useState } from 'react';
import { disordersData } from '../data/disordersData';
import { DisorderCard } from '../components/disorder/DisorderCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

export const Conditions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(disordersData.map((d) => d.category))];

  const filteredDisorders = disordersData.filter((disorder) => {
    const matchesSearch =
      disorder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disorder.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || disorder.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mental Health Conditions
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Explore evidence-aligned guides for 6 core conditions. Learn about definitions, symptoms, causes, risk factors, and cognitive enhancement strategies.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conditions (e.g. Depression, ADHD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <FaFilter className="text-slate-400 text-xs shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Disorders */}
      {filteredDisorders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisorders.map((disorder) => (
            <DisorderCard key={disorder.slug} disorder={disorder} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            No mental health conditions matched your search query.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
};
