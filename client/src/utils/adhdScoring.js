import {
  ASRS_QUESTIONS,
  ASRS_PART_A_QUESTIONS,
  ASRS_PART_B_QUESTIONS,
  ASRS_ASSESSMENT_TYPE,
  ASRS_DISORDER_SLUG,
} from '../data/adhd';

export const ASRS_DISCLAIMER =
  'This is a screening tool, not a diagnosis. ADHD diagnosis requires a comprehensive clinical evaluation, including childhood history.';

export const ASRS_SEVERITY_BANDS = [
  { min: 0, max: 18, label: 'Low likelihood' },
  { min: 19, max: 35, label: 'Moderate likelihood' },
  { min: 36, max: 72, label: 'High likelihood' },
];

export const getSeverityFromTotalScore = (totalScore) => {
  const band = ASRS_SEVERITY_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max);
  return band ? band.label : 'Low likelihood';
};

export const getSeverityExplanation = (screenResult) => {
  const explanations = {
    'Positive Screen':
      'Your Part A responses indicate 4 or more significant symptoms consistent with adult ADHD. Further clinical evaluation by a qualified professional is recommended.',
    'Negative Screen':
      'Your Part A responses do not meet the threshold for a positive ADHD screening (fewer than 4 significant symptoms in Part A).',
  };
  return explanations[screenResult] || explanations['Negative Screen'];
};

export const getSeverityColor = (severity) => {
  const map = {
    'Low likelihood':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    'Moderate likelihood':
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    'High likelihood':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
    'Positive Screen':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
    'Negative Screen':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
  };
  return map[severity] || map['Low likelihood'];
};

/** Normalize answers object {1: 3, 2: 4, ...} or array into ordered 18-item array [q1..q18] */
export const answersObjectToArray = (answers) =>
  ASRS_QUESTIONS.map((q, idx) => {
    const val = Array.isArray(answers) ? answers[idx] : (answers[q.id] ?? answers[String(q.id)]);
    return val === undefined || val === null ? null : Number(val);
  });

/** Check whether all 18 questions have been answered */
export const isASRSComplete = (answers) => {
  const arr = answersObjectToArray(answers);
  return arr.length === 18 && arr.every((val) => val !== null && !isNaN(val));
};

/** Check if a Part A question (q1..q6) counts as a shaded hit */
export const isShadedHit = (questionId, score) => {
  const qId = Number(questionId);
  const val = Number(score);
  if (qId >= 1 && qId <= 4) {
    return val >= 3; // Often (3) or Very Often (4)
  }
  if (qId === 5 || qId === 6) {
    return val === 4; // Very Often (4)
  }
  return false;
};

/** Core ASRS-v1.1 scoring calculation */
export const scoreASRS = (answers) => {
  const normalized = answersObjectToArray(answers);
  if (normalized.some((a) => a === null || !Number.isInteger(a) || a < 0 || a > 4)) {
    throw new Error('Invalid ASRS-v1.1 answers: All 18 items must be integers between 0 and 4');
  }

  const partAAnswers = normalized.slice(0, 6);
  const partBAnswers = normalized.slice(6, 18);

  const partAScore = partAAnswers.reduce((sum, n) => sum + n, 0);
  const partBScore = partBAnswers.reduce((sum, n) => sum + n, 0);
  const totalScore = partAScore + partBScore;

  let shadedHitCount = 0;
  partAAnswers.forEach((val, idx) => {
    const questionId = idx + 1;
    if (isShadedHit(questionId, val)) {
      shadedHitCount += 1;
    }
  });

  const screenResult = shadedHitCount >= 4 ? 'Positive Screen' : 'Negative Screen';
  const recommendationTag = screenResult === 'Positive Screen' ? 'positive' : 'negative';
  const severity = getSeverityFromTotalScore(totalScore);
  const explanation = getSeverityExplanation(screenResult);

  return {
    partAScore,
    partBScore,
    totalScore,
    score: totalScore,
    shadedHitCount,
    screenResult,
    severity,
    recommendationTag,
    explanation,
    disclaimer: ASRS_DISCLAIMER,
    answersArray: normalized,
  };
};

/** Local fallback when API is unavailable */
export const scoreASRSLocally = (answers) => {
  const normalized = answersObjectToArray(answers);
  const scored = scoreASRS(answers);
  const mockId = 'local_adhd_' + Date.now();

  return {
    _id: mockId,
    id: mockId,
    assessmentType: ASRS_ASSESSMENT_TYPE,
    disorderSlug: ASRS_DISORDER_SLUG,
    answers: normalized,
    totalScore: scored.totalScore,
    score: scored.totalScore,
    partAScore: scored.partAScore,
    partBScore: scored.partBScore,
    shadedHitCount: scored.shadedHitCount,
    screenResult: scored.screenResult,
    severity: scored.severity,
    recommendationTag: scored.recommendationTag,
    explanation: scored.explanation,
    diagnosticConsideration: `${scored.screenResult} (${scored.shadedHitCount}/6 Part A shaded criteria met). ${scored.explanation}`,
    disclaimer: ASRS_DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
};
