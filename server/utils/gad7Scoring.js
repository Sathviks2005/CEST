const GAD7_QUESTION_IDS = [1, 2, 3, 4, 5, 6, 7];

const GAD7_SEVERITY_BANDS = [
  { min: 0, max: 4, label: 'Minimal Anxiety', tag: 'minimal' },
  { min: 5, max: 9, label: 'Mild Anxiety', tag: 'mild' },
  { min: 10, max: 14, label: 'Moderate Anxiety', tag: 'moderate' },
  { min: 15, max: 21, label: 'Severe Anxiety', tag: 'severe' },
];

const getSeverityFromScore = (score) => {
  const band = GAD7_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'Minimal Anxiety';
};

const getRecommendationTag = (score) => {
  const band = GAD7_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.tag : 'minimal';
};

const getSeverityExplanation = (severity) => {
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

/** Validate and normalize answers object {1: 2, 2: 1, ...} */
const normalizeAnswers = (answers) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { valid: false, message: 'Answers must be an object keyed by question number (1–7)' };
  }

  const normalized = [];
  for (const id of GAD7_QUESTION_IDS) {
    const val = answers[id] ?? answers[String(id)];
    if (val === undefined || val === null) {
      return { valid: false, message: `Question ${id} is unanswered` };
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0 || num > 3) {
      return { valid: false, message: `Question ${id} must be an integer between 0 and 3` };
    }
    normalized.push(num);
  }

  return { valid: true, normalized };
};

const scoreGAD7 = (answers) => {
  const result = normalizeAnswers(answers);
  if (!result.valid) {
    return { error: result.message };
  }

  const score = result.normalized.reduce((sum, n) => sum + n, 0);
  const severity = getSeverityFromScore(score);
  const recommendationTag = getRecommendationTag(score);

  return {
    score,
    severity,
    recommendationTag,
    explanation: getSeverityExplanation(severity),
    answersArray: result.normalized,
  };
};

module.exports = {
  GAD7_QUESTION_IDS,
  GAD7_SEVERITY_BANDS,
  scoreGAD7,
  getSeverityFromScore,
  getRecommendationTag,
  getSeverityExplanation,
  normalizeAnswers,
};
