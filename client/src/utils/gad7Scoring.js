import {
  GAD7_QUESTIONS,
  GAD7_ASSESSMENT_TYPE,
  GAD7_DISORDER_SLUG,
} from '../data/gad7';

export const GAD7_SEVERITY_BANDS = [
  { min: 0, max: 4, label: 'Minimal Anxiety', tag: 'minimal' },
  { min: 5, max: 9, label: 'Mild Anxiety', tag: 'mild' },
  { min: 10, max: 14, label: 'Moderate Anxiety', tag: 'moderate' },
  { min: 15, max: 21, label: 'Severe Anxiety', tag: 'severe' },
];

export const getRecommendationTag = (score) => {
  const band = GAD7_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.tag : 'minimal';
};

export const getSeverityFromScore = (score) => {
  const band = GAD7_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Minimal Anxiety';
};

export const getSeverityExplanation = (severity) => {
  const explanations = {
    'Minimal Anxiety':
      'Your score indicates Minimal Anxiety. Symptoms are unlikely to interfere with daily life.',
    'Mild Anxiety':
      'Your score indicates Mild Anxiety. Some symptoms may appear occasionally but are generally manageable.',
    'Moderate Anxiety':
      'Your score indicates Moderate Anxiety. Some symptoms may be affecting daily life.',
    'Severe Anxiety':
      'Your score indicates Severe Anxiety. Symptoms are likely having a significant impact on daily functioning.',
  };
  return explanations[severity] || explanations['Minimal Anxiety'];
};

/** Normalize answers object {1: 2, 2: 1, ...} to ordered array [q1, q2, ...] */
export const answersObjectToArray = (answers) =>
  GAD7_QUESTIONS.map((q) => {
    const val = answers[q.id] ?? answers[String(q.id)];
    return val === undefined || val === null ? null : Number(val);
  });

/** Check whether all 7 questions have been answered */
export const isGAD7Complete = (answers) =>
  GAD7_QUESTIONS.every((q) => {
    const val = answers[q.id] ?? answers[String(q.id)];
    return val !== undefined && val !== null;
  });

/** Core GAD-7 scoring — returns { score, severity, recommendationTag } */
export const scoreGAD7 = (answers) => {
  const normalized = answersObjectToArray(answers);
  if (normalized.some((a) => a === null || !Number.isInteger(a) || a < 0 || a > 3)) {
    throw new Error('Invalid GAD-7 answers');
  }
  const score = normalized.reduce((sum, n) => sum + n, 0);
  const severity = getSeverityFromScore(score);
  const recommendationTag = getRecommendationTag(score);
  return { score, severity, recommendationTag };
};

/** Local fallback when API is unavailable */
export const scoreGAD7Locally = (answers) => {
  const normalized = answersObjectToArray(answers);
  const { score, severity, recommendationTag } = scoreGAD7(answers);
  return {
    _id: 'local_' + Date.now(),
    assessmentType: GAD7_ASSESSMENT_TYPE,
    disorderSlug: GAD7_DISORDER_SLUG,
    answers: normalized,
    totalScore: score,
    score,
    severity,
    recommendationTag,
    explanation: getSeverityExplanation(severity),
    createdAt: new Date().toISOString(),
  };
};

export const getSeverityColor = (severity) => {
  const map = {
    'Minimal Anxiety':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    'Mild Anxiety':
      'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800',
    'Moderate Anxiety':
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    'Severe Anxiety':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
  };
  return map[severity] || map['Minimal Anxiety'];
};
