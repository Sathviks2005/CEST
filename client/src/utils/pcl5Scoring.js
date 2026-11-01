import {
  PCL5_QUESTIONS,
  PCL5_ASSESSMENT_TYPE,
  PCL5_DISORDER_SLUG,
  PROBABLE_PTSD_CUTOFF,
} from '../data/pcl5';

// The PDF defines no severity bands; these 5 bands are a practical banding around the 33 cut-point, not an official table.
export const PCL5_SEVERITY_BANDS = [
  { min: 0, max: 10, label: 'Absent / Minimal', tag: 'absent' },
  { min: 11, max: 32, label: 'Mild / Subthreshold', tag: 'mild' },
  { min: 33, max: 48, label: 'Moderate / Threshold', tag: 'moderate' },
  { min: 49, max: 64, label: 'Severe / Markedly Elevated', tag: 'severe' },
  { min: 65, max: 80, label: 'Extreme / Incapacitating', tag: 'extreme' },
];

export const PCL5_DISCLAIMER =
  'This is a screening tool, not a diagnosis. PTSD diagnosis requires a comprehensive clinical evaluation by a qualified mental health professional.';

export const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(80, Number(totalScore) || 0));
  const band = PCL5_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Absent / Minimal';
};

export const getSeverityExplanation = (severity, isProbablePTSD = false) => {
  const explanations = {
    'Absent / Minimal':
      'Your responses indicate minimal or absent post-traumatic stress symptoms in the past month.',
    'Mild / Subthreshold':
      'Your responses indicate mild or subthreshold post-traumatic stress symptoms, below the provisional screening threshold (33).',
    'Moderate / Threshold':
      'Your responses meet or exceed the provisional clinical screening threshold (>= 33) for probable PTSD. Further evaluation by a trauma-informed healthcare provider is recommended.',
    'Severe / Markedly Elevated':
      'Your responses indicate markedly elevated post-traumatic stress symptoms significantly exceeding the screening cut-point. We advise reaching out to a trauma-informed mental health professional for a comprehensive evaluation.',
    'Extreme / Incapacitating':
      'Your responses indicate extreme, incapacitating post-traumatic stress symptoms across multiple symptom clusters. We advise reaching out to a trauma-informed mental health professional promptly for comprehensive clinical care.',
  };
  return explanations[severity] || explanations['Absent / Minimal'];
};

export const getSeverityColor = (severity) => {
  const map = {
    'Absent / Minimal':
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
    'Mild / Subthreshold':
      'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800',
    'Moderate / Threshold':
      'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800',
    'Severe / Markedly Elevated':
      'text-orange-800 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800',
    'Extreme / Incapacitating':
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
    // Screen result aliases
    Positive:
      'text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800',
    Negative:
      'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
  };
  return map[severity] || map['Absent / Minimal'];
};

/** Normalize answers object {1: 0..4, ... 20: 0..4} or array into ordered 20-item array */
export const answersObjectToArray = (answers) =>
  PCL5_QUESTIONS.map((q, idx) => {
    const val = Array.isArray(answers) ? answers[idx] : (answers[q.id] ?? answers[String(q.id)]);
    return val === undefined || val === null ? null : Number(val);
  });

/** Check whether all 20 questions have been answered */
export const isPCL5Complete = (answers) => {
  const arr = answersObjectToArray(answers);
  return arr.length === 20 && arr.every((val) => val !== null && !isNaN(val));
};

export const isComplete = isPCL5Complete;

/** Core PCL-5 scoring calculation */
export const scorePCL5 = (answers) => {
  const normalized = answersObjectToArray(answers);
  if (normalized.some((a) => a === null || !Number.isInteger(a) || a < 0 || a > 4)) {
    throw new Error('Invalid PCL-5 answers: All 20 items must be integers between 0 and 4');
  }

  // DSM-5 Clusters
  // B Intrusion: items 1-5 (idx 0..4)
  // C Avoidance: items 6-7 (idx 5..6)
  // D Negative cognitions/mood: items 8-14 (idx 7..13)
  // E Arousal/reactivity: items 15-20 (idx 14..19)
  const clusterBAnswers = normalized.slice(0, 5);
  const clusterCAnswers = normalized.slice(5, 7);
  const clusterDAnswers = normalized.slice(7, 14);
  const clusterEAnswers = normalized.slice(14, 20);

  const clusterBScore = clusterBAnswers.reduce((sum, n) => sum + n, 0);
  const clusterCScore = clusterCAnswers.reduce((sum, n) => sum + n, 0);
  const clusterDScore = clusterDAnswers.reduce((sum, n) => sum + n, 0);
  const clusterEScore = clusterEAnswers.reduce((sum, n) => sum + n, 0);

  const totalScore = clusterBScore + clusterCScore + clusterDScore + clusterEScore;
  const isProbablePTSD = totalScore >= PROBABLE_PTSD_CUTOFF;
  const screenResult = isProbablePTSD ? 'Positive' : 'Negative';

  const band = PCL5_SEVERITY_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max) || PCL5_SEVERITY_BANDS[0];
  const severity = band.label;
  const recommendationTag = band.tag;
  const explanation = getSeverityExplanation(severity, isProbablePTSD);
  const diagnosticConsideration = `Probable PTSD Screen: ${screenResult} (Cut-point: 33, Total: ${totalScore}/80. Clusters: Intrusion ${clusterBScore}/20, Avoidance ${clusterCScore}/8, Negative Cognition/Mood ${clusterDScore}/28, Arousal/Reactivity ${clusterEScore}/24). ${explanation}`;

  return {
    clusterBScore,
    clusterCScore,
    clusterDScore,
    clusterEScore,
    totalScore,
    score: totalScore,
    isProbablePTSD,
    screenResult,
    severity,
    recommendationTag,
    explanation,
    diagnosticConsideration,
    disclaimer: PCL5_DISCLAIMER,
    answersArray: normalized,
  };
};

/** Local fallback when API is offline */
export const scorePCL5Locally = (answers) => {
  const normalized = answersObjectToArray(answers);
  const scored = scorePCL5(answers);
  const mockId = 'local_ptsd_' + Date.now();

  return {
    _id: mockId,
    id: mockId,
    assessmentType: PCL5_ASSESSMENT_TYPE,
    disorderSlug: PCL5_DISORDER_SLUG,
    answers: normalized,
    totalScore: scored.totalScore,
    score: scored.totalScore,
    clusterBScore: scored.clusterBScore,
    clusterCScore: scored.clusterCScore,
    clusterDScore: scored.clusterDScore,
    clusterEScore: scored.clusterEScore,
    isProbablePTSD: scored.isProbablePTSD,
    screenResult: scored.screenResult,
    severity: scored.severity,
    recommendationTag: scored.recommendationTag,
    explanation: scored.explanation,
    diagnosticConsideration: scored.diagnosticConsideration,
    disclaimer: PCL5_DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
};

export const scorePTSDLocally = scorePCL5Locally;
