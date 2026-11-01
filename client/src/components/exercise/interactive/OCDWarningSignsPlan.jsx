import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaCopy, FaCheck, FaUserMd, FaExclamationTriangle, FaCalendarCheck } from 'react-icons/fa';
import { useMotionSafe } from './motionPresets';

const APPOINTMENT_QUESTIONS = [
  'Do you think I have OCD?',
  'How do you treat OCD?',
  'Will exposure and response prevention therapy help?',
  'Are there medicines that might help?',
  'How long will treatment take?',
  'What can I do to help myself?',
];

export const OCDWarningSignsPlan = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState('warning-signs'); // 'warning-signs' | 'appointment'

  // Tab 1 state: Warning-signs plan (empty by default)
  const [worseningSituations, setWorseningSituations] = useState('');
  const [earlySigns, setEarlySigns] = useState('');
  const [healthyActions, setHealthyActions] = useState('');
  const [supportPeople, setSupportPeople] = useState('');
  const [careContact, setCareContact] = useState('');

  // Tab 2 state: Prepare for appointment (empty by default)
  const [symptomsNoticed, setSymptomsNoticed] = useState('');
  const [thingsAvoided, setThingsAvoided] = useState('');
  const [dailyTimeTaken, setDailyTimeTaken] = useState('');
  const [majorStresses, setMajorStresses] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [customQuestion, setCustomQuestion] = useState('');

  const [copied, setCopied] = useState(false);
  const { isReduced, safeTransition } = useMotionSafe();

  const toggleQuestion = (q) => {
    setSelectedQuestions((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
    );
  };

  const handleCopyCurrentTab = async () => {
    let content = '';

    if (activeTab === 'warning-signs') {
      content = `=== OCD WARNING-SIGNS & RELAPSE-PREVENTION PLAN ===

1. Situations / Stresses That Make Symptoms Worse:
${worseningSituations.trim() || '(None specified)'}

2. Early Signs Symptoms Are Returning:
${earlySigns.trim() || '(None specified)'}

3. Healthy Actions I Will Take:
${healthyActions.trim() || '(None specified)'}

4. Trusted People I Can Talk To:
${supportPeople.trim() || '(None specified)'}

5. Doctor / Therapist I Will Contact If Symptoms Change:
${careContact.trim() || '(None specified)'}
`;
    } else {
      const allQuestions = [...selectedQuestions];
      if (customQuestion.trim()) allQuestions.push(customQuestion.trim());

      content = `=== PREPARING FOR A CLINICAL APPOINTMENT ===

1. Symptoms Noticed:
${symptomsNoticed.trim() || '(None specified)'}

2. Things I Avoid Because of Symptoms:
${thingsAvoided.trim() || '(None specified)'}

3. Rough Time Taken in a Typical Day:
${dailyTimeTaken.trim() || '(None specified)'}

4. Major Stresses or Recent Life Changes:
${majorStresses.trim() || '(None specified)'}

5. Current Medications, Vitamins, or Supplements (with doses):
${currentMedications.trim() || '(None specified)'}

6. Questions to Ask the Clinician:
${allQuestions.length > 0 ? allQuestions.map((q) => `- ${q}`).join('\n') : '(No questions selected)'}
`;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      }
      setCopied(true);
      if (onComplete) onComplete();
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Clipboard copy error', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-400">
            <FaClipboardList />
            <span>Self-Management & Care Planning</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            OCD Warning Signs & Appointment Planner
          </h3>
          <p className="text-xs text-slate-400">
            Track early warning shifts and organize your observations for productive medical consultations.
          </p>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopyCurrentTab}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <FaCheck className="text-emerald-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <FaCopy />
              <span>Copy {activeTab === 'warning-signs' ? 'Plan' : 'Summary'}</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs with Animated Sliding Underline */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 relative">
        <button
          type="button"
          onClick={() => setActiveTab('warning-signs')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold transition-colors relative ${
            activeTab === 'warning-signs' ? 'text-tealBrand-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>My Warning-Signs Plan</span>
          {activeTab === 'warning-signs' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-tealBrand-400"
              transition={safeTransition({ type: 'spring', stiffness: 380, damping: 30 })}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointment')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold transition-colors relative ${
            activeTab === 'appointment' ? 'text-tealBrand-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Prepare for an Appointment</span>
          {activeTab === 'appointment' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-tealBrand-400"
              transition={safeTransition({ type: 'spring', stiffness: 380, damping: 30 })}
            />
          )}
        </button>
      </div>

      {/* Cross-fade Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'warning-signs' ? (
          <motion.div
            key="tab-warning"
            initial={{ opacity: 0, y: isReduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: safeTransition({ duration: 0.25 }) }}
            exit={{ opacity: 0, y: isReduced ? 0 : -8, transition: safeTransition({ duration: 0.15 }) }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Situations or stresses that make symptoms worse
              </label>
              <textarea
                rows={2}
                value={worseningSituations}
                onChange={(e) => setWorseningSituations(e.target.value)}
                placeholder="e.g. Sleep deprivation, exam or work deadlines, fatigue, conflicts with family..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Early signs symptoms are coming back or increasing
              </label>
              <textarea
                rows={2}
                value={earlySigns}
                onChange={(e) => setEarlySigns(e.target.value)}
                placeholder="e.g. Taking longer in the bathroom, checking doors an extra time, re-reading emails repeatedly..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Healthy things I will do
              </label>
              <textarea
                rows={2}
                value={healthyActions}
                onChange={(e) => setHealthyActions(e.target.value)}
                placeholder="e.g. Keep normal sleep routine, practise diaphragmatic breathing, stick to daily schedule without retreating..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                4. People I can talk to
              </label>
              <textarea
                rows={2}
                value={supportPeople}
                onChange={(e) => setSupportPeople(e.target.value)}
                placeholder="e.g. Partner, sibling, trusted friend who understands my recovery plan..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                5. Doctor or therapist I will contact if things change
              </label>
              <textarea
                rows={2}
                value={careContact}
                onChange={(e) => setCareContact(e.target.value)}
                placeholder="e.g. Name of therapist, clinic contact number or email address..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab-appt"
            initial={{ opacity: 0, y: isReduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: safeTransition({ duration: 0.25 }) }}
            exit={{ opacity: 0, y: isReduced ? 0 : -8, transition: safeTransition({ duration: 0.15 }) }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Symptoms noticed
                </label>
                <textarea
                  rows={2}
                  value={symptomsNoticed}
                  onChange={(e) => setSymptomsNoticed(e.target.value)}
                  placeholder="e.g. Intrusive thoughts about contamination, repetitive checking..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Things I avoid because of them
                </label>
                <textarea
                  rows={2}
                  value={thingsAvoided}
                  onChange={(e) => setThingsAvoided(e.target.value)}
                  placeholder="e.g. Public transit, shaking hands, cooking for others, certain rooms..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Rough time they take in a typical day
                </label>
                <input
                  type="text"
                  value={dailyTimeTaken}
                  onChange={(e) => setDailyTimeTaken(e.target.value)}
                  placeholder="e.g. 1 to 2 hours per day across various tasks..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Major stresses or recent changes
                </label>
                <input
                  type="text"
                  value={majorStresses}
                  onChange={(e) => setMajorStresses(e.target.value)}
                  placeholder="e.g. Started new job, moved apartment, family illness..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Medicines, vitamins or supplements with doses
              </label>
              <textarea
                rows={2}
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="e.g. Current prescriptions, over-the-counter vitamins, sleep aids and their dosages..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Questions to ask (tick any you want to include):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {APPOINTMENT_QUESTIONS.map((q) => {
                  const isChecked = selectedQuestions.includes(q);
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleQuestion(q)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-tealBrand-950/40 border-tealBrand-500 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                      }`}
                    >
                      <span>"{q}"</span>
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ml-2 ${
                          isChecked ? 'bg-tealBrand-500 text-white' : 'border border-slate-600'
                        }`}
                      >
                        {isChecked && <FaCheck className="text-[9px]" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Or type an additional custom question for the doctor..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-tealBrand-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
