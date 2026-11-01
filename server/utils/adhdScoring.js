const ASRS_QUESTION_IDS = Array.from({ length: 18 }, (_, i) => i + 1);

const ASRS_SEVERITY_BANDS = [
  { min: 0, max: 18, label: 'Low likelihood' },
  { min: 19, max: 35, label: 'Moderate likelihood' },
  { min: 36, max: 72, label: 'High likelihood' },
];

const ASRS_DISCLAIMER =
  'This is a screening tool, not a diagnosis. ADHD diagnosis requires a comprehensive clinical evaluation, including childhood history.';

const getSeverityFromTotalScore = (totalScore) => {
  const band = ASRS_SEVERITY_BANDS.find((b) => totalScore >= b.min && totalScore <= b.max);
  return band ? band.label : 'Low likelihood';
};

const getSeverityExplanation = (screenResult) => {
  const explanations = {
    'Positive Screen':
      'Your Part A responses indicate 4 or more significant symptoms consistent with adult ADHD. Further clinical evaluation by a qualified professional is recommended.',
    'Negative Screen':
      'Your Part A responses do not meet the threshold for a positive ADHD screening (fewer than 4 significant symptoms in Part A).',
  };
  return explanations[screenResult] || explanations['Negative Screen'];
};

const isShadedHit = (questionId, score) => {
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

/** Validate and normalize answers object {1: 3, 2: 4, ...} or array */
const normalizeAnswers = (answers) => {
  if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
    return { valid: false, message: 'Answers must be an object or array keyed by question number (1–18)' };
  }

  const normalized = [];
  for (const id of ASRS_QUESTION_IDS) {
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

const scoreASRS = (answers) => {
  const result = normalizeAnswers(answers);
  if (!result.valid) {
    return { error: result.message };
  }

  const normalized = result.normalized;
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
  const diagnosticConsideration = `${screenResult} (${shadedHitCount}/6 Part A shaded criteria met). ${explanation}`;

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
    diagnosticConsideration,
    disclaimer: ASRS_DISCLAIMER,
    answersArray: normalized,
  };
};

module.exports = {
  ASRS_QUESTION_IDS,
  ASRS_SEVERITY_BANDS,
  ASRS_DISCLAIMER,
  scoreASRS,
  getSeverityFromTotalScore,
  getSeverityExplanation,
  normalizeAnswers,
};
