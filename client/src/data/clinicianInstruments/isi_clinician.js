/**
 * ISI (Insomnia Severity Index) - Clinician Administered
 * Source Reference: Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001; 2:297–307.
 * Copyright © 2001, with permission from Elsevier.
 */

export const ISI_CLINICIAN_DEFINITION = {
  id: 'isi_clinician',
  name: 'Insomnia Severity Index (Clinician-Administered)',
  shortName: 'ISI (Clinician)',
  version: '1.0',
  citation: 'Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001; 2:297-307.',
  copyright: 'Reprinted from Bastien et al. [1]. Copyright © 2001, with permission from Elsevier.',
  timeFrame: 'Past 2 weeks',
  instructions:
    'Rate the current (i.e., last 2 weeks) severity of the patient\'s insomnia problem(s). Select one response for each of the 7 items.',
  targetDisorder: 'insomnia',
  estimatedMinutes: 5,
  itemsCount: 7,
  maxScore: 28,
  items: [
    {
      id: '1a',
      text: 'Difficulty falling asleep',
      description: 'Severity of difficulty falling asleep over the past 2 weeks',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Mild' },
        { value: 2, label: '2 = Moderate' },
        { value: 3, label: '3 = Severe' },
        { value: 4, label: '4 = Very severe' },
      ],
    },
    {
      id: '1b',
      text: 'Difficulty staying asleep',
      description: 'Severity of middle-of-the-night awakening problems',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Mild' },
        { value: 2, label: '2 = Moderate' },
        { value: 3, label: '3 = Severe' },
        { value: 4, label: '4 = Very severe' },
      ],
    },
    {
      id: '1c',
      text: 'Problem waking up too early',
      description: 'Severity of early morning awakening problems',
      options: [
        { value: 0, label: '0 = None' },
        { value: 1, label: '1 = Mild' },
        { value: 2, label: '2 = Moderate' },
        { value: 3, label: '3 = Severe' },
        { value: 4, label: '4 = Very severe' },
      ],
    },
    {
      id: '2',
      text: 'How satisfied/dissatisfied are you with your current sleep pattern?',
      description: 'Sleep satisfaction rating',
      options: [
        { value: 0, label: '0 = Very satisfied' },
        { value: 1, label: '1 = Satisfied' },
        { value: 2, label: '2 = Moderately satisfied' },
        { value: 3, label: '3 = Dissatisfied' },
        { value: 4, label: '4 = Very dissatisfied' },
      ],
    },
    {
      id: '3',
      text: 'To what extent do you consider your sleep problem to interfere with your daily functioning (e.g. daytime fatigue, ability to function at work/daily chores, concentration, memory, mood, etc.)?',
      description: 'Daytime interference rating',
      options: [
        { value: 0, label: '0 = Not at all interfering' },
        { value: 1, label: '1 = A little' },
        { value: 2, label: '2 = Somewhat' },
        { value: 3, label: '3 = Much' },
        { value: 4, label: '4 = Very much interfering' },
      ],
    },
    {
      id: '4',
      text: 'How noticeable to others do you think your sleeping problem is in terms of impairing the quality of your life?',
      description: 'Noticeability to others',
      options: [
        { value: 0, label: '0 = Not at all noticeable' },
        { value: 1, label: '1 = Barely' },
        { value: 2, label: '2 = Somewhat' },
        { value: 3, label: '3 = Much' },
        { value: 4, label: '4 = Very much noticeable' },
      ],
    },
    {
      id: '5',
      text: 'How worried/distressed are you about your current sleep problem?',
      description: 'Worry and distress about sleep',
      options: [
        { value: 0, label: '0 = Not at all' },
        { value: 1, label: '1 = A little' },
        { value: 2, label: '2 = Somewhat' },
        { value: 3, label: '3 = Much' },
        { value: 4, label: '4 = Very much' },
      ],
    },
  ],
  bands: [
    { min: 0, max: 7, label: 'No clinically significant insomnia', color: '#10b981' },
    { min: 8, max: 14, label: 'Subthreshold insomnia', color: '#3b82f6' },
    { min: 15, max: 21, label: 'Clinical insomnia (moderate severity)', color: '#f59e0b' },
    { min: 22, max: 28, label: 'Clinical insomnia (severe)', color: '#ef4444' },
  ],
};

export function scoreIsiClinician(answers) {
  const keys = ['1a', '1b', '1c', '2', '3', '4', '5'];
  const itemMap = {};

  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      itemMap[String(a.itemId)] = Number(a.value);
    });
  } else if (answers && typeof answers === 'object') {
    Object.keys(answers).forEach((k) => {
      itemMap[String(k)] = Number(answers[k]);
    });
  }

  let totalScore = 0;
  for (const k of keys) {
    const val = itemMap[k];
    if (val === undefined || isNaN(val) || val < 0 || val > 4) {
      throw new Error(`ISI item ${k} must have a score between 0 and 4`);
    }
    totalScore += val;
  }

  let band = 'No clinically significant insomnia';
  if (totalScore <= 7) {
    band = 'No clinically significant insomnia';
  } else if (totalScore <= 14) {
    band = 'Subthreshold insomnia';
  } else if (totalScore <= 21) {
    band = 'Clinical insomnia (moderate severity)';
  } else {
    band = 'Clinical insomnia (severe)';
  }

  return {
    totalScore,
    subscores: {
      sleepOnsetScore: itemMap['1a'],
      sleepMaintenanceScore: itemMap['1b'],
      earlyAwakeningScore: itemMap['1c'],
      sleepQualityImpact: itemMap['2'] + itemMap['3'] + itemMap['4'] + itemMap['5'],
    },
    band,
    flags: [],
    summary: `Clinician-administered ISI Total: ${totalScore}/28 (${band}).`,
  };
}
