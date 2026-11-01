export const HAMD_QUESTIONS = [
  {
    id: 1,
    order: 1,
    title: 'Depressed mood',
    description: 'Gloomy attitude, pessimism about the future, feeling of sadness, tendency to weep',
    maxScore: 4,
    options: [
      { label: 'Absent', score: 0 },
      { label: 'Gloomy, occasional weeping', score: 1 },
      { label: 'Frequent weeping', score: 2 },
      { label: 'Extreme symptoms', score: 3 },
      { label: 'Communicates non-verbally (facies, posture)', score: 4 },
    ],
  },
  {
    id: 2,
    order: 2,
    title: 'Feelings of guilt',
    description: 'Self-reproach, rumination, feelings of letting people down or punishment',
    maxScore: 4,
    options: [
      { label: 'Absent', score: 0 },
      { label: 'Self-reproach, feels let people down', score: 1 },
      { label: 'Ideas of guilt or rumination', score: 2 },
      { label: 'Present illness is a punishment', score: 3 },
      { label: 'Auditory hallucinations/delusions of guilt', score: 4 },
    ],
  },
  {
    id: 3,
    order: 3,
    title: 'Suicide',
    description: 'Suicidal ideation, wishes, gestures, or suicide attempts',
    maxScore: 4,
    options: [
      { label: 'Absent', score: 0 },
      { label: 'Feels life is not worth living', score: 1 },
      { label: 'Wishes he were dead', score: 2 },
      { label: 'Suicidal ideas or gesture', score: 3 },
      { label: 'Attempts at suicide', score: 4 },
    ],
  },
  {
    id: 4,
    order: 4,
    title: 'Initial insomnia',
    description: 'Difficulty falling asleep',
    maxScore: 2,
    options: [
      { label: 'No difficulty', score: 0 },
      { label: 'Occasional difficulty falling asleep', score: 1 },
      { label: 'Nightly difficulty', score: 2 },
    ],
  },
  {
    id: 5,
    order: 5,
    title: 'Insomnia during the night',
    description: 'Restless, disturbed, waking at night',
    maxScore: 2,
    options: [
      { label: 'No difficulty', score: 0 },
      { label: 'Restless/disturbed during night', score: 1 },
      { label: 'Waking during night (any getting out of bed)', score: 2 },
    ],
  },
  {
    id: 6,
    order: 6,
    title: 'Delayed insomnia',
    description: 'Waking in early hours of the morning and unable to fall asleep again',
    maxScore: 2,
    options: [
      { label: 'No difficulty', score: 0 },
      { label: 'Waking in early hours but goes back to sleep', score: 1 },
      { label: 'Unable to fall asleep again if gets out of bed', score: 2 },
    ],
  },
  {
    id: 7,
    order: 7,
    title: 'Work and interests',
    description: 'Loss of interest in activities, reduction in productivity or social participation',
    maxScore: 4,
    options: [
      { label: 'No difficulty', score: 0 },
      { label: 'Thoughts of incapacity, fatigue or weakness', score: 1 },
      { label: 'Loss of interest in activity', score: 2 },
      { label: 'Decrease in actual time spent in activity', score: 3 },
      { label: 'Stopped working because of present illness', score: 4 },
    ],
  },
  {
    id: 8,
    order: 8,
    title: 'Retardation',
    description: 'Slowness of thought, speech, and activity; apathy; stupor',
    maxScore: 4,
    options: [
      { label: 'Normal speech and thought', score: 0 },
      { label: 'Slight retardation', score: 1 },
      { label: 'Obvious retardation', score: 2 },
      { label: 'Interview difficult', score: 3 },
      { label: 'Complete stupor', score: 4 },
    ],
  },
  {
    id: 9,
    order: 9,
    title: 'Agitation',
    description: 'Restlessness associated with anxiety',
    maxScore: 4,
    options: [
      { label: 'None', score: 0 },
      { label: 'Fidgetiness', score: 1 },
      { label: 'Playing with hands', score: 2 },
      { label: 'Moving about', score: 3 },
      { label: 'Hand wringing', score: 4 },
    ],
  },
  {
    id: 10,
    order: 10,
    title: 'Psychiatric anxiety',
    description: 'Subjective tension, apprehension, worry, or expressed fears',
    maxScore: 4,
    options: [
      { label: 'No difficulty', score: 0 },
      { label: 'Tension', score: 1 },
      { label: 'Worrying', score: 2 },
      { label: 'Apprehensive', score: 3 },
      { label: 'Fears expressed', score: 4 },
    ],
  },
  {
    id: 11,
    order: 11,
    title: 'Somatic anxiety',
    description: 'Physical anxiety manifestations (GI, cardiovascular, headaches, respiratory, etc.)',
    maxScore: 4,
    options: [
      { label: 'Absent', score: 0 },
      { label: 'Mild', score: 1 },
      { label: 'Moderate', score: 2 },
      { label: 'Severe', score: 3 },
      { label: 'Incapacitating', score: 4 },
    ],
  },
  {
    id: 12,
    order: 12,
    title: 'Gastrointestinal somatic symptoms',
    description: 'Loss of appetite, heavy feeling in abdomen, constipation',
    maxScore: 2,
    options: [
      { label: 'None', score: 0 },
      { label: 'Loss of appetite', score: 1 },
      { label: 'Difficulty eating', score: 2 },
    ],
  },
  {
    id: 13,
    order: 13,
    title: 'General somatic symptoms',
    description: 'Heaviness in limbs, back, or head; diffuse backache; loss of energy and fatigability',
    maxScore: 2,
    options: [
      { label: 'None', score: 0 },
      { label: 'Heaviness', score: 1 },
      { label: 'Clear symptoms', score: 2 },
    ],
  },
  {
    id: 14,
    order: 14,
    title: 'Genital symptoms',
    description: 'Loss of libido, menstrual disturbances',
    maxScore: 2,
    options: [
      { label: 'Absent', score: 0 },
      { label: 'Mild', score: 1 },
      { label: 'Severe', score: 2 },
    ],
  },
  {
    id: 15,
    order: 15,
    title: 'Hypochondriasis',
    description: 'Self-absorption, bodily preoccupations, frequent complaints, or somatic delusions',
    maxScore: 4,
    options: [
      { label: 'Not present', score: 0 },
      { label: 'Self-absorption', score: 1 },
      { label: 'Preoccupation', score: 2 },
      { label: 'Frequent complaints', score: 3 },
      { label: 'Delusions', score: 4 },
    ],
  },
  {
    id: 16,
    order: 16,
    title: 'Weight loss',
    description: 'Weight loss according to history or measurements (Option 3 = Not assessed contributes 0)',
    maxScore: 2,
    options: [
      { label: '0 = No loss (<1 lb/wk)', score: 0 },
      { label: '1 = Probable (>1 lb/wk)', score: 1 },
      { label: '2 = Definite (>2 lb/wk)', score: 2 },
      { label: '3 = Not assessed', score: 3 },
    ],
  },
  {
    id: 17,
    order: 17,
    title: 'Insight',
    description: 'Patient recognition of illness and clinical state',
    maxScore: 2,
    options: [
      { label: 'Acknowledges', score: 0 },
      { label: 'Attributes elsewhere', score: 1 },
      { label: 'Denies illness', score: 2 },
    ],
  },
];

export const HAMD_SEVERITY_BANDS = [
  { min: 0, max: 7, label: 'Normal', short: '0–7', color: '#10b981' },
  { min: 8, max: 13, label: 'Mild depression', short: '8–13', color: '#14b8a6' },
  { min: 14, max: 18, label: 'Moderate depression', short: '14–18', color: '#f59e0b' },
  { min: 19, max: 22, label: 'Severe depression', short: '19–22', color: '#f97316' },
  { min: 23, max: 52, label: 'Severe depression, intensive treatment indicated', short: '23–52', color: '#f43f5e' },
];

export const getHamdSeverityFromScore = (score) => {
  if (score <= 7) return 'Normal';
  if (score >= 8 && score <= 13) return 'Mild depression';
  if (score >= 14 && score <= 18) return 'Moderate depression';
  if (score >= 19 && score <= 22) return 'Severe depression';
  return 'Severe depression, intensive treatment indicated';
};

export const getHamdSeverityColor = (severity) => {
  if (!severity) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800';
  if (severity.startsWith('Normal')) {
    return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800';
  }
  if (severity.startsWith('Mild')) {
    return 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800';
  }
  if (severity.startsWith('Moderate')) {
    return 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800';
  }
  if (severity === 'Severe depression') {
    return 'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800';
  }
  return 'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800';
};

/** Local HAM-D scoring fallback */
export const scoreHamdLocally = (itemScores, patientName, notes = '') => {
  const normalized = itemScores.map((s) => Number(s));
  const totalScore = normalized.reduce((sum, n, idx) => {
    if (idx === 15 && n === 3) return sum + 0;
    return sum + (n || 0);
  }, 0);
  const severity = getHamdSeverityFromScore(totalScore);

  return {
    _id: 'local_hamd_' + Date.now(),
    id: 'local_hamd_' + Date.now(),
    patientName,
    disorderSlug: 'depression',
    itemScores: normalized,
    totalScore,
    severity,
    notes,
    createdAt: new Date().toISOString(),
  };
};
