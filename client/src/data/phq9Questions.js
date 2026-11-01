export const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

export const PHQ9_FUNCTIONAL_QUESTION =
  'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?';

export const PHQ9_FUNCTIONAL_OPTIONS = [
  'Not difficult at all',
  'Somewhat difficult',
  'Very difficult',
  'Extremely difficult',
];

export const PHQ9_SEVERITY_BANDS = [
  { min: 0, max: 4, label: 'Minimal depression' },

  { min: 5, max: 9, label: 'Mild depression' },
  { min: 10, max: 14, label: 'Moderate depression' },
  { min: 15, max: 19, label: 'Moderately severe depression' },
  { min: 20, max: 27, label: 'Severe depression' },
];

export const getSeverityFromScore = (score) => {
  const band = PHQ9_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Minimal depression';
};

export const getDiagnosticConsideration = (answers) => {
  const isShaded = (score, index) => (index === 8 ? score >= 1 : score >= 2);
  const shadedCount = answers.filter((score, index) => isShaded(Number(score), index)).length;
  const hasCoreSymptom = isShaded(Number(answers[0]), 0) || isShaded(Number(answers[1]), 1);

  if (shadedCount >= 5 && hasCoreSymptom) {
    return 'Criteria met: Consider Major Depressive Disorder evaluation.';
  }
  if (shadedCount >= 2 && shadedCount <= 4 && hasCoreSymptom) {
    return 'Criteria met: Consider Other Depressive Disorder evaluation.';
  }
  return 'Symptoms below major diagnostic threshold.';
};

/** Local PHQ-9 scoring (used when API is unavailable) */
export const scorePHQ9Locally = (answers, functionalResponse) => {
  const normalized = answers.map((a) => Number(a));
  const totalScore = normalized.reduce((sum, n) => sum + n, 0);
  return {
    _id: 'local_' + Date.now(),
    assessmentType: 'PHQ-9 Patient Depression Questionnaire',
    disorderSlug: 'depression',
    answers: normalized,
    functionalResponse,
    totalScore,
    severity: getSeverityFromScore(totalScore),
    diagnosticConsideration: getDiagnosticConsideration(normalized),
    createdAt: new Date().toISOString(),
  };
};

export const getSeverityColor = (severity) => {
  const map = {
    None: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
    'Minimal depression':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    'Mild depression':
      'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800',
    'Moderate depression':
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    'Moderately severe depression':
      'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
    'Severe depression':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
  };
  return map[severity] || map['Minimal depression'];
};
