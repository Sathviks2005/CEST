const YBOCS_QUESTION_IDS = Array.from({ length: 11 }, (_, i) => i + 1);

const YBOCS_SEVERITY_BANDS = [
  { min: 0, max: 7, label: 'Subclinical', tag: 'subclinical' },
  { min: 8, max: 15, label: 'Mild', tag: 'mild' },
  { min: 16, max: 23, label: 'Moderate', tag: 'moderate' },
  { min: 24, max: 31, label: 'Severe', tag: 'severe' },
  { min: 32, max: 40, label: 'Extreme', tag: 'extreme' },
];

const YBOCS_DISCLAIMER =
  'This is a screening tool, not a diagnosis. OCD diagnosis requires a comprehensive clinical evaluation by a qualified professional.';

const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(40, Number(totalScore) || 0));
  const band = YBOCS_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Subclinical';
};

const getSeverityExplanation = (severity) => {
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

/** Validate and normalize answers object {1: 0..4, ... 11: 0..4} or array */
const normalizeAnswers = (answers) => {
  if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
    return { valid: false, message: 'Answers must be an object or array keyed by question number (1–11)' };
  }

  const normalized = [];
  for (const id of YBOCS_QUESTION_IDS) {
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

const scoreYBOCS = (answers) => {
  const result = normalizeAnswers(answers);
  if (!result.valid) {
    return { error: result.message };
  }

  const normalized = result.normalized;
  const obsessionAnswers = normalized.slice(0, 5); // items 1-5
  const compulsionAnswers = normalized.slice(5, 10); // items 6-10
  const insightAnswer = normalized[10]; // item 11 (unscored)

  const obsessionSubtotal = obsessionAnswers.reduce((sum, n) => sum + n, 0);
  const compulsionSubtotal = compulsionAnswers.reduce((sum, n) => sum + n, 0);
  const totalScore = obsessionSubtotal + compulsionSubtotal; // item 11 excluded from sums

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

module.exports = {
  YBOCS_QUESTION_IDS,
  YBOCS_SEVERITY_BANDS,
  YBOCS_DISCLAIMER,
  scoreYBOCS,
  getSeverityFromTotalScore,
  getSeverityExplanation,
  normalizeAnswers,
};
