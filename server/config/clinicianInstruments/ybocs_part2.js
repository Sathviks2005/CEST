/**
 * Y-BOCS (Yale-Brown Obsessive-Compulsive Scale) - Part 2 Severity Ratings Only
 * Source Reference: Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown Obsessive Compulsive Scale (Y-BOCS) Part 1: Development, use and reliability. Arch Gen Psychiatry. 1989; 46:1006-1011.
 * Copyright © Goodman & Baer.
 */

const YBOCS_PART2_DEFINITION = {
  id: 'ybocs_part2',
  name: 'Yale-Brown Obsessive Compulsive Scale (Part 2 Severity Rating)',
  shortName: 'Y-BOCS Part 2',
  version: '1.0',
  citation: 'Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown Obsessive Compulsive Scale (Y-BOCS). Arch Gen Psychiatry 1989; 46:1006-1011.',
  copyright: 'The Y-BOCS was developed by Goodman, W.K., Price, L.H., Rasmussen, S.A., et al. (1989). Materials used for clinical and research purposes with attribution.',
  timeFrame: 'At their worst in the last 3-6 months (including today)',
  instructions:
    'Please think about the times when these symptoms were at their worst in the last 3-6 months (including today), and check one answer for each question (Items 1-10 rate severity; Item 11 rates insight separately).',
  targetDisorder: 'ocd',
  estimatedMinutes: 15,
  itemsCount: 11,
  maxScore: 40,
  items: [
    // Obsessions (1-5)
    {
      id: 1,
      section: 'obsessions',
      text: '1. TIME OCCUPIED BY OBSESSIVE THOUGHTS',
      description: 'How much of your time was occupied by obsessive thoughts? How frequently did these thoughts occur?',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Less than 1 hour per day, or occasional intrusions (occur no more than 8 times a day)' },
        { value: 2, label: '2 = 1-3 hours per day, or frequent intrusions (most hours of the day are free of obsessions)' },
        { value: 3, label: '3 = More than 3 hours and up to 8 hours per day, or very frequent intrusions' },
        { value: 4, label: '4 = More than 8 hours per day, or near-constant intrusions' },
      ],
    },
    {
      id: 2,
      section: 'obsessions',
      text: '2. INTERFERENCE DUE TO OBSESSIVE THOUGHTS',
      description: 'How much did these thoughts interfere with your social or work functioning? Is there anything that you didn’t do because of them?',
      options: [
        { value: 0, label: '0 = No interference' },
        { value: 1, label: '1 = Mild, slight interference with social or occupational performance, but still performance not impaired' },
        { value: 2, label: '2 = Moderate, definitive interference with social or occupational performance, but still manageable' },
        { value: 3, label: '3 = Severe interference, causes substantial impairment in social or occupational performance' },
        { value: 4, label: '4 = Extreme, incapacitating interference' },
      ],
    },
    {
      id: 3,
      section: 'obsessions',
      text: '3. DISTRESS ASSOCIATED WITH OBSESSIVE THOUGHTS',
      description: 'How much distress did your obsessive thoughts cause you?',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Mild, infrequent, and not too disturbing distress' },
        { value: 2, label: '2 = Moderate, frequent, and disturbing distress, but still manageable' },
        { value: 3, label: '3 = Severe, very frequent, and very disturbing distress' },
        { value: 4, label: '4 = Extreme, near-constant, and disabling distress' },
      ],
    },
    {
      id: 4,
      section: 'obsessions',
      text: '4. RESISTANCE AGAINST OBSESSIONS',
      description: 'How much effort did you make to resist the obsessive thoughts? How often did you try to disregard or turn your attention away from those thoughts as they entered your mind?',
      options: [
        { value: 0, label: '0 = I made an effort to always resist (or the obsessions are so minimal that there is no need to actively resist them)' },
        { value: 1, label: '1 = I tried to resist most of the time (e.g. more than half the time I tried to resist)' },
        { value: 2, label: '2 = I made some effort to resist' },
        { value: 3, label: '3 = I allowed all obsessions to fill my mind without attempting to control them, but I did so with some reluctance' },
        { value: 4, label: '4 = I completely and willingly gave in to all obsessions' },
      ],
    },
    {
      id: 5,
      section: 'obsessions',
      text: '5. DEGREES OF CONTROL OVER OBSESSIVE THOUGHTS',
      description: 'How much control did you have over your obsessive thoughts? How successful were you in stopping or diverting your obsessive thinking?',
      options: [
        { value: 0, label: '0 = Complete control' },
        { value: 1, label: '1 = Much control; usually I could stop or divert obsessions with some effort and concentration' },
        { value: 2, label: '2 = Moderate control; sometimes I could stop or divert obsessions' },
        { value: 3, label: '3 = Little control; I was rarely successful in stopping obsessions and could only divert attention with great difficulty' },
        { value: 4, label: '4 = No control; I was rarely able to even momentarily ignore the obsessions' },
      ],
    },
    // Compulsions (6-10)
    {
      id: 6,
      section: 'compulsions',
      text: '6. TIME SPENT PERFORMING COMPULSIVE BEHAVIORS',
      description: 'How much time did you spend performing compulsive behaviors? How frequently did you perform compulsions?',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Less than 1 hour per day was spent performing compulsions, or occasional performance of compulsive behaviors (no more than 8 times per day)' },
        { value: 2, label: '2 = 1-3 hours per day was spent performing compulsions, or frequent performance of compulsive behaviors (most hours were free of compulsions)' },
        { value: 3, label: '3 = More than 3 hours and up to 8 hours per day were spent performing compulsions, or very frequent performance of compulsive behaviors (during most hours of the day)' },
        { value: 4, label: '4 = More than 8 hours were spent performing compulsions, or near-constant performance of compulsive behaviors (hour rarely passes without several compulsions being performed)' },
      ],
    },
    {
      id: 7,
      section: 'compulsions',
      text: '7. INTERFERENCE DUE TO COMPULSIVE BEHAVIORS',
      description: 'How much did your compulsive behaviors interfere with your social or work functioning?',
      options: [
        { value: 0, label: '0 = No interference' },
        { value: 1, label: '1 = Mild, slight interference with social or occupational activities, but overall performance not impaired' },
        { value: 2, label: '2 = Moderate, definite interference with social or occupational performance, but still manageable' },
        { value: 3, label: '3 = Severe interference, substantial impairment in social or occupational performance' },
        { value: 4, label: '4 = Extreme, incapacitating interference' },
      ],
    },
    {
      id: 8,
      section: 'compulsions',
      text: '8. DISTRESS ASSOCIATED WITH COMPULSIVE BEHAVIORS',
      description: 'How would you have felt if prevented from performing your compulsions? How anxious would you have become?',
      options: [
        { value: 0, label: '0 = Not at all anxious' },
        { value: 1, label: '1 = Only slightly anxious if compulsions prevented' },
        { value: 2, label: '2 = Anxiety would mount but remain manageable if compulsions prevented' },
        { value: 3, label: '3 = Prominent and very disturbing increase in anxiety if compulsions interrupted' },
        { value: 4, label: '4 = Extreme, incapacitating anxiety from any intervention aimed at reducing the compulsions' },
      ],
    },
    {
      id: 9,
      section: 'compulsions',
      text: '9. RESISTANCE',
      description: 'How much effort did you make to resist the compulsions? Or how often did you try to stop the compulsions?',
      options: [
        { value: 0, label: '0 = I made effort to always resist (or the symptoms were so minimal that there was no need to actively resist them)' },
        { value: 1, label: '1 = I tried to resist most of the time (e.g. more than half the time)' },
        { value: 2, label: '2 = I made some effort to resist' },
        { value: 3, label: '3 = I yielded to almost all compulsions without attempting to control them, but I did so with some reluctance' },
        { value: 4, label: '4 = I completely and willingly yielded to all compulsions' },
      ],
    },
    {
      id: 10,
      section: 'compulsions',
      text: '10. DEGREES OF CONTROL OVER COMPULSIVE BEHAVIORS',
      description: 'How much control did you have over the compulsive behaviors? How successful were you in stopping the ritual(s)?',
      options: [
        { value: 0, label: '0 = I had complete control' },
        { value: 1, label: '1 = Usually I could stop compulsions or rituals with some effort and willpower' },
        { value: 2, label: '2 = Sometimes I could stop compulsive behaviors, but only with difficulty' },
        { value: 3, label: '3 = I could only delay the compulsive behaviors, but eventually they had to be carried out to completion' },
        { value: 4, label: '4 = I was rarely able to even momentarily delay performing the compulsive behaviors' },
      ],
    },
    // Item 11 Insight (recorded and shown separately, NOT added to total)
    {
      id: 11,
      section: 'insight',
      text: '11. INSIGHT INTO OBSESSIONS AND COMPULSIONS',
      description: 'Do you think your obsessions or compulsions are reasonable or rational? Would there be anything besides anxiety to worry about if you resisted them? Do you think something would really happen?',
      options: [
        { value: 0, label: '0 = I think my obsessions or compulsions are unreasonable or excessive' },
        { value: 1, label: '1 = I think my obsessions or compulsions are unreasonable or excessive, but I’m not completely convinced that they aren’t necessary' },
        { value: 2, label: '2 = I think my obsessions or compulsions may be unreasonable or excessive' },
        { value: 3, label: '3 = I don’t think my obsessions or compulsions are unreasonable or excessive' },
        { value: 4, label: '4 = I am sure my obsessions or compulsions are reasonable, no matter what anyone says' },
      ],
    },
  ],
  bands: [
    { min: 0, max: 7, label: 'Subclinical', color: '#10b981' },
    { min: 8, max: 15, label: 'Mild', color: '#3b82f6' },
    { min: 16, max: 23, label: 'Moderate', color: '#f59e0b' },
    { min: 24, max: 31, label: 'Severe', color: '#f97316' },
    { min: 32, max: 40, label: 'Extreme', color: '#ef4444' },
  ],
};

function scoreYbocsPart2(answers) {
  const itemMap = {};
  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      itemMap[Number(a.itemId)] = Number(a.value);
    });
  } else if (answers && typeof answers === 'object') {
    Object.keys(answers).forEach((k) => {
      itemMap[Number(k)] = Number(answers[k]);
    });
  }

  let obsessionSubtotal = 0;
  for (let i = 1; i <= 5; i++) {
    const val = itemMap[i];
    if (val === undefined || isNaN(val) || val < 0 || val > 4) {
      throw new Error(`Y-BOCS item ${i} score must be between 0 and 4`);
    }
    obsessionSubtotal += val;
  }

  let compulsionSubtotal = 0;
  for (let i = 6; i <= 10; i++) {
    const val = itemMap[i];
    if (val === undefined || isNaN(val) || val < 0 || val > 4) {
      throw new Error(`Y-BOCS item ${i} score must be between 0 and 4`);
    }
    compulsionSubtotal += val;
  }

  // Item 11 insight is recorded and shown separately, NOT added to total
  const insightScore = itemMap[11] !== undefined ? itemMap[11] : null;
  if (insightScore !== null && (isNaN(insightScore) || insightScore < 0 || insightScore > 4)) {
    throw new Error('Y-BOCS item 11 (insight) score must be between 0 and 4');
  }

  const totalScore = obsessionSubtotal + compulsionSubtotal; // 0-40

  let band = 'Subclinical';
  if (totalScore <= 7) {
    band = 'Subclinical';
  } else if (totalScore <= 15) {
    band = 'Mild';
  } else if (totalScore <= 23) {
    band = 'Moderate';
  } else if (totalScore <= 31) {
    band = 'Severe';
  } else {
    band = 'Extreme';
  }

  return {
    totalScore,
    subscores: {
      obsessionSubtotal,
      compulsionSubtotal,
      insightScore,
    },
    band,
    flags: [],
    summary: `Y-BOCS Part 2 Total: ${totalScore}/40 (${band}). Obsessions: ${obsessionSubtotal}/20, Compulsions: ${compulsionSubtotal}/20, Insight rating: ${
      insightScore !== null ? insightScore + '/4' : 'Not rated'
    }.`,
  };
}

module.exports = {
  YBOCS_PART2_DEFINITION,
  scoreYbocsPart2,
};
