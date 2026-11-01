import {
  YBOCS_QUESTIONS,
  YBOCS_ASSESSMENT_TYPE,
  YBOCS_DISORDER_SLUG,
} from '../data/ocd';

export const YBOCS_DISCLAIMER =
  'This is a screening tool, not a diagnosis. OCD diagnosis requires a comprehensive clinical evaluation by a qualified professional.';

export const YBOCS_SEVERITY_BANDS = [
  { min: 0, max: 7, label: 'Subclinical', tag: 'subclinical' },
  { min: 8, max: 15, label: 'Mild', tag: 'mild' },
  { min: 16, max: 23, label: 'Moderate', tag: 'moderate' },
  { min: 24, max: 31, label: 'Severe', tag: 'severe' },
  { min: 32, max: 40, label: 'Extreme', tag: 'extreme' },
];

export const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(40, Number(totalScore) || 0));
  const band = YBOCS_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Subclinical';
};

export const getSeverityExplanation = (severity) => {
  const explanations = {
    Subclinical:
      'Your responses indicate subclinical or minimal obsessive-compulsive symptoms that do not cause significant daily interference.',
    Mild:
      'Your responses indicate mild obsessive-compulsive symptoms. Monitoring patterns and practicing evidence-based cognitive strategies may be beneficial.',
    Moderate:
      'Your responses indicate moderate obsessive-compulsive symptoms that may cause noticeable distress and interference with your daily activities.',
    Severe:
      'Your responses indicate severe obsessive-compulsive symptoms causing substantial impairment in daily functioning. We strongly advise speaking with a qualified mental health professional for a comprehensive evaluation.',
    Extreme:
      'Your responses indicate extreme, near-constant obsessive-compulsive symptoms causing incapacitating distress. We strongly advise speaking with a qualified mental health professional promptly for comprehensive evaluation.',
  };
  return explanations[severity] || explanations['Subclinical'];
};

export const getSeverityColor = (severity) => {
  const map = {
    Subclinical:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    Mild:
      'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800',
    Moderate:
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    Severe:
      'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
    Extreme:
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
  };
  return map[severity] || map['Subclinical'];
};

/** Normalize answers object {1: 0..4, ... 11: 0..4} or array into ordered 11-item array */
export const answersObjectToArray = (answers) =>
  YBOCS_QUESTIONS.map((q, idx) => {
    const val = Array.isArray(answers) ? answers[idx] : (answers[q.id] ?? answers[String(q.id)]);
    return val === undefined || val === null ? null : Number(val);
  });

/** Check whether all 11 questions have been answered */
export const isYBOCSComplete = (answers) => {
  const arr = answersObjectToArray(answers);
  return arr.length === 11 && arr.every((val) => val !== null && !isNaN(val));
};

export const isComplete = isYBOCSComplete;

/** Core Y-BOCS scoring calculation (Part 2) */
export const scoreYBOCS = (answers) => {
  const normalized = answersObjectToArray(answers);
  if (normalized.some((a) => a === null || !Number.isInteger(a) || a < 0 || a > 4)) {
    throw new Error('Invalid Y-BOCS answers: All 11 items must be integers between 0 and 4');
  }

  const obsessionAnswers = normalized.slice(0, 5); // items 1-5
  const compulsionAnswers = normalized.slice(5, 10); // items 6-10
  const insightAnswer = normalized[10]; // item 11 (unscored)

  const obsessionSubtotal = obsessionAnswers.reduce((sum, n) => sum + n, 0);
  const compulsionSubtotal = compulsionAnswers.reduce((sum, n) => sum + n, 0);
  const totalScore = obsessionSubtotal + compulsionSubtotal; // Item 11 excluded

  const band = YBOCS_SEVERITY_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max) || YBOCS_SEVERITY_BANDS[0];
  const severity = band.label;
  const recommendationTag = band.tag;
  const explanation = getSeverityExplanation(severity);
  const diagnosticConsideration = `${severity} obsessive-compulsive symptoms (Obsessions: ${obsessionSubtotal}/20, Compulsions: ${compulsionSubtotal}/20, Total: ${totalScore}/40). ${explanation}`;

  return {
    obsessionSubtotal,
    compulsionSubtotal,
    insightAnswer,
    totalScore,
    score: totalScore,
    severity,
    recommendationTag,
    explanation,
    diagnosticConsideration,
    disclaimer: YBOCS_DISCLAIMER,
    answersArray: normalized,
  };
};

/** Local fallback when API is offline or returns error */
export const scoreYBOCSLocally = (answers) => {
  const normalized = answersObjectToArray(answers);
  const scored = scoreYBOCS(answers);
  const mockId = 'local_ocd_' + Date.now();

  return {
    _id: mockId,
    id: mockId,
    assessmentType: YBOCS_ASSESSMENT_TYPE,
    disorderSlug: YBOCS_DISORDER_SLUG,
    answers: normalized,
    totalScore: scored.totalScore,
    score: scored.totalScore,
    obsessionSubtotal: scored.obsessionSubtotal,
    compulsionSubtotal: scored.compulsionSubtotal,
    insightAnswer: scored.insightAnswer,
    severity: scored.severity,
    recommendationTag: scored.recommendationTag,
    explanation: scored.explanation,
    diagnosticConsideration: scored.diagnosticConsideration,
    disclaimer: YBOCS_DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
};

export const scoreOCDLocally = scoreYBOCSLocally;
