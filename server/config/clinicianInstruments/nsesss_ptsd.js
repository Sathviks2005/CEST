/**
 * NSESSS PTSD Short Scale (National Stressful Events Survey PTSD Short Scale)
 * Source Reference: Kilpatrick DG, Resnick HS, Friedman, MJ. Copyright © 2013 American Psychiatric Association.
 * Rights granted: This measure can be reproduced without permission by researchers and by clinicians for use with their patients.
 */

const NSESSS_PTSD_DEFINITION = {
  id: 'nsesss_ptsd',
  name: 'Severity of Posttraumatic Stress Symptoms—Adult (NSESSS)',
  shortName: 'NSESSS PTSD',
  version: '1.0',
  citation: 'Kilpatrick DG, Resnick HS, Friedman MJ. National Stressful Events Survey PTSD Short Scale (NSESSS). American Psychiatric Association, 2013.',
  copyright: 'Kilpatrick DG, Resnick HS, Friedman MJ. Copyright © 2013 American Psychiatric Association. All rights reserved. This measure can be reproduced without permission by researchers and by clinicians for use with their patients.',
  timeFrame: 'Past 7 days',
  instructions:
    'People sometimes have problems after extremely stressful events or experiences. How much have you been bothered during the PAST SEVEN (7) DAYS by each of the following problems that occurred or became worse after an extremely stressful event/experience? Respond to each item from 0 (Not at all) to 4 (Extremely).',
  targetDisorder: 'ptsd',
  estimatedMinutes: 8,
  itemsCount: 9,
  maxScore: 36,
  options: [
    { value: 0, label: '0 = Not at all' },
    { value: 1, label: '1 = A little bit' },
    { value: 2, label: '2 = Moderately' },
    { value: 3, label: '3 = Quite a bit' },
    { value: 4, label: '4 = Extremely' },
  ],
  items: [
    {
      id: 1,
      text: 'Having "flashbacks," that is, you suddenly acted or felt as if a stressful experience from the past was happening all over again (for example, you reexperienced parts of a stressful experience by seeing, hearing, smelling, or physically feeling parts of the experience)?',
    },
    {
      id: 2,
      text: 'Feeling very emotionally upset when something reminded you of a stressful experience?',
    },
    {
      id: 3,
      text: 'Trying to avoid thoughts, feelings, or physical sensations that reminded you of a stressful experience?',
    },
    {
      id: 4,
      text: 'Thinking that a stressful event happened because you or someone else (who didn\'t directly harm you) did something wrong or didn\'t do everything possible to prevent it, or because of something about you?',
    },
    {
      id: 5,
      text: 'Having a very negative emotional state (for example, you were experiencing lots of fear, anger, guilt, shame, or horror) after a stressful experience?',
    },
    {
      id: 6,
      text: 'Losing interest in activities you used to enjoy before having a stressful experience?',
    },
    {
      id: 7,
      text: 'Being "super alert," on guard, or constantly on the lookout for danger?',
    },
    {
      id: 8,
      text: 'Feeling jumpy or easily startled when you hear an unexpected noise?',
    },
    {
      id: 9,
      text: 'Being extremely irritable or angry to the point where you yelled at other people, got into fights, or destroyed things?',
    },
  ],
  extraFields: [
    {
      id: 'traumaticEvent',
      type: 'text',
      label: 'Please list the traumatic event that you experienced (Optional, Clinician-only):',
      required: false,
    },
    {
      id: 'traumaticEventDate',
      type: 'date',
      label: 'Date of the traumatic event (Optional):',
      required: false,
    },
  ],
  bands: [
    { min: 0, max: 0, label: 'None (0)', color: '#10b981' },
    { min: 1, max: 1, label: 'Mild (1)', color: '#3b82f6' },
    { min: 2, max: 2, label: 'Moderate (2)', color: '#f59e0b' },
    { min: 3, max: 3, label: 'Severe (3)', color: '#f97316' },
    { min: 4, max: 4, label: 'Extreme (4)', color: '#ef4444' },
  ],
};

const SEVERITY_AVERAGE_LABELS = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
  4: 'Extreme',
};

function scoreNsesssPtsd(answers) {
  const itemMap = {};
  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      if (a.value !== null && a.value !== undefined && a.value !== '') {
        itemMap[Number(a.itemId)] = Number(a.value);
      }
    });
  } else if (answers && typeof answers === 'object') {
    Object.keys(answers).forEach((k) => {
      const v = answers[k];
      if (v !== null && v !== undefined && v !== '') {
        itemMap[Number(k)] = Number(v);
      }
    });
  }

  let answeredCount = 0;
  let rawSum = 0;

  for (let i = 1; i <= 9; i++) {
    const val = itemMap[i];
    if (val !== undefined && !isNaN(val)) {
      if (val < 0 || val > 4) {
        throw new Error(`NSESSS item ${i} score must be between 0 and 4`);
      }
      rawSum += val;
      answeredCount++;
    }
  }

  // Scoring rules from PDF:
  // If 3 or more items are left unanswered, total score cannot be calculated (do not allow saving).
  // If 1 or 2 items are unanswered (7 or 8 answered), prorate: round((rawSum * 9) / answeredCount).
  const unansweredCount = 9 - answeredCount;
  if (unansweredCount >= 3) {
    throw new Error(`Cannot score NSESSS: ${unansweredCount} items left unanswered. Minimum 7 answered items required.`);
  }

  const isProrated = unansweredCount > 0;
  const finalTotalScore = isProrated ? Math.round((rawSum * 9) / answeredCount) : rawSum;

  const averageScore = Number((finalTotalScore / 9).toFixed(2));
  const roundedAverage = Math.round(averageScore);
  const band = SEVERITY_AVERAGE_LABELS[roundedAverage] || 'None';

  return {
    totalScore: finalTotalScore,
    subscores: {
      rawSum,
      answeredCount,
      unansweredCount,
      isProrated,
      proratedTotalRawScore: isProrated ? finalTotalScore : null,
      averageScore,
      roundedAverage,
    },
    band,
    flags: [],
    summary: `NSESSS PTSD Total: ${finalTotalScore}/36 (${band}). Average score: ${averageScore.toFixed(2)}/4.00 (${band}).${
      isProrated ? ` (Prorated from ${answeredCount}/9 answered items; raw sum: ${rawSum}).` : ''
    }`,
  };
}

module.exports = {
  NSESSS_PTSD_DEFINITION,
  scoreNsesssPtsd,
  SEVERITY_AVERAGE_LABELS,
};
