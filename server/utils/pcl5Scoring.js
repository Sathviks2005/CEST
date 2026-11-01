const PCL5_QUESTION_IDS = Array.from({ length: 20 }, (_, i) => i + 1);

const PROBABLE_PTSD_CUTOFF = 33;

// The PDF defines no severity bands; these 5 bands are a practical banding around the 33 cut-point, not an official table.
const PCL5_SEVERITY_BANDS = [
  { min: 0, max: 10, label: 'Absent / Minimal', tag: 'absent' },
  { min: 11, max: 32, label: 'Mild / Subthreshold', tag: 'mild' },
  { min: 33, max: 48, label: 'Moderate / Threshold', tag: 'moderate' },
  { min: 49, max: 64, label: 'Severe / Markedly Elevated', tag: 'severe' },
  { min: 65, max: 80, label: 'Extreme / Incapacitating', tag: 'extreme' },
];

const PCL5_DISCLAIMER =
  'This is a screening tool, not a diagnosis. PTSD diagnosis requires a comprehensive clinical evaluation by a qualified mental health professional.';

const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(80, Number(totalScore) || 0));
  const band = PCL5_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Absent / Minimal';
};

const getSeverityExplanation = (severity, isProbablePTSD = false) => {
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

/** Validate and normalize answers object {1: 0..4, ... 20: 0..4} or array */
const normalizeAnswers = (answers) => {
  if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
    return { valid: false, message: 'Answers must be an object or array keyed by question number (1–20)' };
  }

  const normalized = [];
  for (const id of PCL5_QUESTION_IDS) {
    const val = Array.isArray(answers) ? answers[id - 1] : (answers[id] ?? answers[String(id)]);
    if (val === undefined || val === null) {
      return { valid: false, message: `Question ${id} is unanswered` };
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0 || num > 4) {
      return { valid: false, message: `Question ${id} must be an integer between 0 and 4` };
    }
    normalized.push(num);
  }

  return { valid: true, normalized };
};

const scorePCL5 = (answers) => {
  const result = normalizeAnswers(answers);
  if (!result.valid) {
    return { error: result.message };
  }

  const normalized = result.normalized;
  // DSM-5 Clusters
  const clusterBAnswers = normalized.slice(0, 5); // items 1-5 (max 20)
  const clusterCAnswers = normalized.slice(5, 7); // items 6-7 (max 8)
  const clusterDAnswers = normalized.slice(7, 14); // items 8-14 (max 28)
  const clusterEAnswers = normalized.slice(14, 20); // items 15-20 (max 24)

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

module.exports = {
  PCL5_QUESTION_IDS,
  PROBABLE_PTSD_CUTOFF,
  PCL5_SEVERITY_BANDS,
  PCL5_DISCLAIMER,
  scorePCL5,
  getSeverityFromTotalScore,
  getSeverityExplanation,
  normalizeAnswers,
};
