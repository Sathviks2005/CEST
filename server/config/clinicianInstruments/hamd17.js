/**
 * HAM-D 17 (Hamilton Depression Rating Scale - 17 Item)
 * Source Reference: Hamilton M. A rating scale for depression. J Neurol Neurosurg Psychiatry 1960; 23:56–62.
 * Public domain.
 */

const HAMD17_DEFINITION = {
  id: 'hamd17',
  name: 'Hamilton Depression Rating Scale',
  shortName: 'HAM-D (17)',
  version: '1.0',
  citation: 'Hamilton M. A rating scale for depression. J Neurol Neurosurg Psychiatry 1960; 23:56-62.',
  copyright: 'The HDRS is in the public domain.',
  timeFrame: 'Past week',
  instructions:
    'Please complete the scale based on a structured clinical interview. For each item select the one cue which best characterizes the patient.',
  targetDisorder: 'depression',
  estimatedMinutes: 20,
  itemsCount: 17,
  maxScore: 52,
  items: [
    {
      id: 1,
      text: 'Depressed mood',
      description: 'Sadness, hopeless, helpless, worthless',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Absent.' },
        { value: 1, label: '1 = These feeling states indicated only on questioning.' },
        { value: 2, label: '2 = These feeling states spontaneously reported verbally.' },
        { value: 3, label: '3 = Communicates feeling states non-verbally, i.e. through facial expression, posture, voice and tendency to weep.' },
        { value: 4, label: '4 = Patient reports virtually only these feeling states in his/her spontaneous verbal and non-verbal communication.' },
      ],
    },
    {
      id: 2,
      text: 'Feelings of guilt',
      description: 'Self-reproach, ideas of guilt, delusions of guilt',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Absent.' },
        { value: 1, label: '1 = Self reproach, feels he/she has let people down.' },
        { value: 2, label: '2 = Ideas of guilt or rumination over past errors or sinful deeds.' },
        { value: 3, label: '3 = Present illness is a punishment. Delusions of guilt.' },
        { value: 4, label: '4 = Hears accusatory or denunciatory voices and/or experiences threatening visual hallucinations.' },
      ],
    },
    {
      id: 3,
      text: 'Suicide',
      description: 'Suicidal ideation, gestures, or attempts',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Absent.' },
        { value: 1, label: '1 = Feels life is not worth living.' },
        { value: 2, label: '2 = Wishes he/she were dead or any thoughts of possible death to self.' },
        { value: 3, label: '3 = Ideas or gestures of suicide.' },
        { value: 4, label: '4 = Attempts at suicide (any serious attempt rate 4).' },
      ],
    },
    {
      id: 4,
      text: 'Insomnia: Early in the night',
      description: 'Difficulty falling asleep',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = No difficulty falling asleep.' },
        { value: 1, label: '1 = Complains of occasional difficulty falling asleep, i.e. more than 1/2 hour.' },
        { value: 2, label: '2 = Complains of nightly difficulty falling asleep.' },
      ],
    },
    {
      id: 5,
      text: 'Insomnia: Middle of the night',
      description: 'Restless and disturbed during the night',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = No difficulty.' },
        { value: 1, label: '1 = Patient complains of being restless and disturbed during the night.' },
        { value: 2, label: '2 = Waking during the night - any getting out of bed rates 2 (except for purposes of voiding).' },
      ],
    },
    {
      id: 6,
      text: 'Insomnia: Early hours of the morning',
      description: 'Early morning awakening',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = No difficulty.' },
        { value: 1, label: '1 = Waking in early hours of the morning but goes back to sleep.' },
        { value: 2, label: '2 = Unable to fall asleep again if he/she gets out of bed.' },
      ],
    },
    {
      id: 7,
      text: 'Work and activities',
      description: 'Feelings of incapacity, loss of interest, decrease in productivity',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = No difficulty.' },
        { value: 1, label: '1 = Thoughts and feelings of incapacity, fatigue or weakness related to activities, work or hobbies.' },
        { value: 2, label: '2 = Loss of interest in activity, hobbies or work - either directly reported by the patient or indirect in listlessness, indecision and vacillation.' },
        { value: 3, label: '3 = Decrease in actual time spent in activities or decrease in productivity (less than 3 hours/day in activities).' },
        { value: 4, label: '4 = Stopped working because of present illness (or fails to perform routine chores unassisted).' },
      ],
    },
    {
      id: 8,
      text: 'Retardation',
      description: 'Slowness of thought and speech, impaired ability to concentrate, decreased motor activity',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Normal speech and thought.' },
        { value: 1, label: '1 = Slight retardation during the interview.' },
        { value: 2, label: '2 = Obvious retardation during the interview.' },
        { value: 3, label: '3 = Interview difficult.' },
        { value: 4, label: '4 = Complete stupor.' },
      ],
    },
    {
      id: 9,
      text: 'Agitation',
      description: 'Restlessness, motor tension',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = None.' },
        { value: 1, label: '1 = Fidgetiness.' },
        { value: 2, label: '2 = Playing with hands, hair, etc.' },
        { value: 3, label: '3 = Moving about, cannot sit still.' },
        { value: 4, label: '4 = Hand wringing, nail biting, hair-pulling, biting of lips.' },
      ],
    },
    {
      id: 10,
      text: 'Anxiety psychic',
      description: 'Subjective tension, apprehension, expressed fears',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = No difficulty.' },
        { value: 1, label: '1 = Subjective tension and irritability.' },
        { value: 2, label: '2 = Worrying about minor matters.' },
        { value: 3, label: '3 = Apprehensive attitude apparent in face or speech.' },
        { value: 4, label: '4 = Fears expressed without questioning.' },
      ],
    },
    {
      id: 11,
      text: 'Anxiety somatic',
      description: 'Physiological concomitants of anxiety (GI, CV, respiratory, urinary, sweating)',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Absent.' },
        { value: 1, label: '1 = Mild.' },
        { value: 2, label: '2 = Moderate.' },
        { value: 3, label: '3 = Severe.' },
        { value: 4, label: '4 = Incapacitating.' },
      ],
    },
    {
      id: 12,
      text: 'Somatic symptoms gastro-intestinal',
      description: 'Loss of appetite, heavy feelings in abdomen, constipation',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = None.' },
        { value: 1, label: '1 = Loss of appetite but eating without staff encouragement. Heavy feelings in abdomen.' },
        { value: 2, label: '2 = Difficulty eating without staff urging. Requests or requires laxatives or GI medication.' },
      ],
    },
    {
      id: 13,
      text: 'General somatic symptoms',
      description: 'Heaviness in limbs, back or head, backaches, headaches, muscle aches, loss of energy',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = None.' },
        { value: 1, label: '1 = Heaviness in limbs, back or head. Backaches, headaches, muscle aches. Loss of energy and fatigability.' },
        { value: 2, label: '2 = Any clear-cut symptom rates 2.' },
      ],
    },
    {
      id: 14,
      text: 'Genital symptoms',
      description: 'Loss of libido, menstrual disturbances',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = Absent.' },
        { value: 1, label: '1 = Mild.' },
        { value: 2, label: '2 = Severe.' },
      ],
    },
    {
      id: 15,
      text: 'Hypochondriasis',
      description: 'Preoccupation with bodily health',
      maxScore: 4,
      options: [
        { value: 0, label: '0 = Not present.' },
        { value: 1, label: '1 = Self-absorption (bodily).' },
        { value: 2, label: '2 = Preoccupation with health.' },
        { value: 3, label: '3 = Frequent complaints, requests for help, etc.' },
        { value: 4, label: '4 = Hypochondriacal delusions.' },
      ],
    },
    {
      id: 16,
      text: 'Loss of weight',
      description: 'Weight loss by patient report or weekly measurements (Option 3 = Not assessed contributes 0)',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = No weight loss (or <1 lb in week).' },
        { value: 1, label: '1 = Probable weight loss (or >1 lb in week).' },
        { value: 2, label: '2 = Definite weight loss (or >2 lb in week).' },
        { value: 3, label: '3 = Not assessed (contributes 0 to score).' },
      ],
    },
    {
      id: 17,
      text: 'Insight',
      description: 'Denial of illness, attribution of symptoms',
      maxScore: 2,
      options: [
        { value: 0, label: '0 = Acknowledges being depressed and ill.' },
        { value: 1, label: '1 = Acknowledges illness but attributes cause to bad food, climate, overwork, virus, need for rest, etc.' },
        { value: 2, label: '2 = Denies being ill at all.' },
      ],
    },
  ],
  bands: [
    { min: 0, max: 7, label: 'Normal', color: '#10b981' },
    { min: 8, max: 13, label: 'Mild depression', color: '#14b8a6' },
    { min: 14, max: 18, label: 'Moderate depression', color: '#f59e0b' },
    { min: 19, max: 22, label: 'Severe depression', color: '#f97316' },
    { min: 23, max: 52, label: 'Severe depression, intensive treatment indicated', color: '#f43f5e' },
  ],
};

function scoreHamd17(answers) {
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

  // Maximum allowed per item:
  // 4 for items 1, 2, 3, 7, 8, 9, 10, 11, 15
  // 2 for items 4, 5, 6, 12, 13, 14, 17
  // For item 16: values 0, 1, 2, 3 allowed, where 3 ("Not assessed") contributes 0.
  const itemLimits = {
    1: 4, 2: 4, 3: 4, 4: 2, 5: 2, 6: 2, 7: 4, 8: 4,
    9: 4, 10: 4, 11: 4, 12: 2, 13: 2, 14: 2, 15: 4, 16: 3, 17: 2,
  };

  let totalScore = 0;
  const flags = [];

  for (let i = 1; i <= 17; i++) {
    const val = itemMap[i];
    if (val === undefined || isNaN(val) || val < 0 || val > itemLimits[i]) {
      throw new Error(`HAM-D item ${i} value must be between 0 and ${itemLimits[i]}`);
    }

    if (i === 16) {
      // Option 3 = "Not assessed" must contribute 0 (not 3)
      if (val === 3) {
        totalScore += 0;
      } else {
        totalScore += val;
      }
    } else {
      totalScore += val;
    }
  }

  // Suicide safety check on item 3
  const suicideVal = itemMap[3] || 0;
  if (suicideVal === 1) {
    flags.push('SUICIDE_IDEATION_MILD');
  } else if (suicideVal >= 2) {
    flags.push('SUICIDE_RISK_ALERT');
  }

  let band = 'Normal';
  if (totalScore <= 7) {
    band = 'Normal';
  } else if (totalScore <= 13) {
    band = 'Mild depression';
  } else if (totalScore <= 18) {
    band = 'Moderate depression';
  } else if (totalScore <= 22) {
    band = 'Severe depression';
  } else {
    band = 'Severe depression, intensive treatment indicated';
  }

  return {
    totalScore,
    subscores: {
      suicideItemScore: suicideVal,
      item16WeightLossScore: itemMap[16] === 3 ? 0 : itemMap[16],
    },
    band,
    flags,
    summary: `HAM-D-17 Total: ${totalScore}/52 (${band}).${
      suicideVal >= 2 ? ' CAUTION: Elevated suicide risk flagged (score ' + suicideVal + '). Follow clinical safety protocol.' : ''
    }`,
  };
}

module.exports = {
  HAMD17_DEFINITION,
  scoreHamd17,
};
