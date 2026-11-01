const ISI_ITEM_KEYS = ['1a', '1b', '1c', '2', '3', '4', '5'];

const ISI_SEVERITY_BANDS = [
  { min: 0, max: 7, label: 'No clinically significant insomnia', tag: 'none' },
  { min: 8, max: 14, label: 'Subthreshold insomnia', tag: 'subthreshold' },
  { min: 15, max: 21, label: 'Clinical insomnia (moderate severity)', tag: 'moderate' },
  { min: 22, max: 28, label: 'Clinical insomnia (severe)', tag: 'severe' },
];

const ISI_DISCLAIMER =
  'This is a screening tool, not a diagnosis. Insomnia diagnosis requires a clinical evaluation by a qualified professional.';

const getSeverityFromTotalScore = (totalScore) => {
  const score = Math.max(0, Math.min(28, Number(totalScore) || 0));
  const band = ISI_SEVERITY_BANDS.find((b) => score >= b.min && score <= b.max);
  return band ? band.label : 'No clinically significant insomnia';
};

const getSeverityExplanation = (severity) => {
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

/** Validate and normalize answers object { '1a': 0, '1b': 1, '1c': 2, '2': 3, ... } or array of length 7 */
const normalizeAnswers = (answers) => {
  if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
    return { valid: false, message: 'Answers must be an object or array containing all 7 items (1a, 1b, 1c, 2, 3, 4, 5)' };
  }

  const normalized = [];
  for (let idx = 0; idx < ISI_ITEM_KEYS.length; idx++) {
    const key = ISI_ITEM_KEYS[idx];
    let val = undefined;
    if (Array.isArray(answers)) {
      val = answers[idx];
    } else {
      val = answers[key] ?? answers[String(key)];
      // Also fallback if numeric key was passed for 2, 3, 4, 5
      if (val === undefined && idx >= 3) {
        const numericId = idx - 1;
        val = answers[numericId] ?? answers[String(numericId)];
      }
    }

    if (val === undefined || val === null) {
      return { valid: false, message: `Question ${key} is unanswered` };
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num < 0 || num > 4) {
      return { valid: false, message: `Question ${key} must be an integer between 0 and 4` };
    }
    normalized.push(num);
  }

  return { valid: true, normalized };
};

const scoreISI = (answers) => {
  const result = normalizeAnswers(answers);
  if (!result.valid) {
    return { error: result.message };
  }

  const normalized = result.normalized;
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

module.exports = {
  ISI_ITEM_KEYS,
  ISI_SEVERITY_BANDS,
  ISI_DISCLAIMER,
  scoreISI,
  getSeverityFromTotalScore,
  getSeverityExplanation,
  normalizeAnswers,
};
