import {
  ISI_ITEM_KEYS,
  ISI_ASSESSMENT_TYPE,
  ISI_DISORDER_SLUG,
} from '../data/isi';

export const ISI_DISCLAIMER =
  'This is a screening tool, not a diagnosis. Insomnia diagnosis requires a clinical evaluation by a qualified professional.';

export const ISI_SEVERITY_BANDS = [
  { min: 0, max: 7, label: 'No clinically significant insomnia', tag: 'none' },
  { min: 8, max: 14, label: 'Subthreshold insomnia', tag: 'subthreshold' },
  { min: 15, max: 21, label: 'Clinical insomnia (moderate severity)', tag: 'moderate' },
  { min: 22, max: 28, label: 'Clinical insomnia (severe)', tag: 'severe' },
];

export const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(28, Number(totalScore) || 0));
  const band = ISI_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'No clinically significant insomnia';
};

export const getSeverityExplanation = (severity) => {
  const explanations = {
    'No clinically significant insomnia':
      'Your responses suggest no clinically significant insomnia symptoms over the past 2 weeks.',
    'Subthreshold insomnia':
      'Your responses indicate subthreshold insomnia. Maintaining regular sleep-wake rhythms and sleep hygiene habits may help improve your sleep quality.',
    'Clinical insomnia (moderate severity)':
      'Your responses indicate clinical insomnia of moderate severity. We suggest speaking with a doctor or sleep specialist to evaluate sleep patterns and potential treatments.',
    'Clinical insomnia (severe)':
      'Your responses indicate severe clinical insomnia causing significant daytime distress and functional impairment. We strongly suggest speaking with a doctor or sleep specialist for clinical support.',
  };
  return explanations[severity] || explanations['No clinically significant insomnia'];
};

export const getSeverityColor = (severity) => {
  const map = {
    'No clinically significant insomnia':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    'Subthreshold insomnia':
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    'Clinical insomnia (moderate severity)':
      'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
    'Clinical insomnia (severe)':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
  };
  return map[severity] || map['No clinically significant insomnia'];
};

/** Normalize answers object { '1a': 0, '1b': 1, '1c': 2, '2': 3, ... } or array into ordered 7-item array [1a, 1b, 1c, 2, 3, 4, 5] */
export const answersObjectToArray = (answers) =>
  ISI_ITEM_KEYS.map((key, idx) => {
    let val = undefined;
    if (Array.isArray(answers)) {
      val = answers[idx];
    } else if (answers && typeof answers === 'object') {
      val = answers[key] ?? answers[String(key)];
      // Also fallback if keys 1, 2, 3 were used
      if (val === undefined && idx >= 3) {
        const numericId = idx - 1; // index 3 -> question 2, index 4 -> question 3, etc.
        val = answers[numericId] ?? answers[String(numericId)];
      }
    }
    return val === undefined || val === null ? null : Number(val);
  });

/** Check whether all 7 questions have been answered */
export const isISIComplete = (answers) => {
  const arr = answersObjectToArray(answers);
  return arr.length === 7 && arr.every((val) => val !== null && !isNaN(val));
};

export const isComplete = isISIComplete;

/** Core ISI scoring calculation */
export const scoreISI = (answers) => {
  const normalized = answersObjectToArray(answers);
  if (normalized.some((a) => a === null || !Number.isInteger(a) || a < 0 || a > 4)) {
    throw new Error('Invalid ISI answers: All 7 items must be integers between 0 and 4');
  }

  const totalScore = normalized.reduce((sum, n) => sum + n, 0);
  const band = ISI_SEVERITY_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max) || ISI_SEVERITY_BANDS[0];
  const severity = band.label;
  const recommendationTag = band.tag;
  const explanation = getSeverityExplanation(severity);
  const diagnosticConsideration = `${severity} (Total Score: ${totalScore}/28). ${explanation}`;

  return {
    totalScore,
    score: totalScore,
    severity,
    recommendationTag,
    explanation,
    diagnosticConsideration,
    disclaimer: ISI_DISCLAIMER,
    answersArray: normalized,
  };
};

/** Local fallback when API is offline */
export const scoreISILocally = (answers) => {
  const normalized = answersObjectToArray(answers);
  const scored = scoreISI(answers);
  const mockId = 'local_insomnia_' + Date.now();

  return {
    _id: mockId,
    id: mockId,
    assessmentType: ISI_ASSESSMENT_TYPE,
    disorderSlug: ISI_DISORDER_SLUG,
    answers: normalized,
    totalScore: scored.totalScore,
    score: scored.totalScore,
    severity: scored.severity,
    recommendationTag: scored.recommendationTag,
    explanation: scored.explanation,
    diagnosticConsideration: scored.diagnosticConsideration,
    disclaimer: ISI_DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
};

export const scoreInsomniaLocally = scoreISILocally;
