/**
 * HAM-A (Hamilton Anxiety Rating Scale)
 * Source Reference: Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol 1959; 32:50–55.
 * Public domain.
 */

const HAMA_DEFINITION = {
  id: 'hama',
  name: 'Hamilton Anxiety Rating Scale',
  shortName: 'HAM-A',
  version: '1.0',
  citation: 'Hamilton M. The assessment of anxiety states by rating. Br J Med Psychol 1959; 32:50-55.',
  copyright: 'The HAM-A is in the public domain.',
  timeFrame: 'Past week / current clinical presentation',
  instructions:
    'Below is a list of phrases that describe certain feelings that people have. Rate the patient by finding the answer which best describes the extent to which he/she has these conditions. Select one of the five responses for each of the fourteen items.',
  targetDisorder: 'anxiety',
  estimatedMinutes: 12,
  itemsCount: 14,
  maxScore: 56,
  options: [
    { value: 0, label: '0 = Not present' },
    { value: 1, label: '1 = Mild' },
    { value: 2, label: '2 = Moderate' },
    { value: 3, label: '3 = Severe' },
    { value: 4, label: '4 = Very severe' },
  ],
  items: [
    {
      id: 1,
      text: 'Anxious mood',
      description: 'Worries, anticipation of the worst, fearful anticipation, irritability.',
    },
    {
      id: 2,
      text: 'Tension',
      description: 'Feelings of tension, fatigability, startle response, moved to tears easily, trembling, feelings of restlessness, inability to relax.',
    },
    {
      id: 3,
      text: 'Fears',
      description: 'Of dark, of strangers, of being left alone, of animals, of traffic, of crowds.',
    },
    {
      id: 4,
      text: 'Insomnia',
      description: 'Difficulty in falling asleep, broken sleep, unsatisfying sleep and fatigue on waking, dreams, nightmares, night terrors.',
    },
    {
      id: 5,
      text: 'Intellectual',
      description: 'Difficulty in concentration, poor memory.',
    },
    {
      id: 6,
      text: 'Depressed mood',
      description: 'Loss of interest, lack of pleasure in hobbies, depression, early waking, diurnal swing.',
    },
    {
      id: 7,
      text: 'Somatic (muscular)',
      description: 'Pains and aches, twitching, stiffness, myoclonic jerks, grinding of teeth, unsteady voice, increased muscular tone.',
    },
    {
      id: 8,
      text: 'Somatic (sensory)',
      description: 'Tinnitus, blurring of vision, hot and cold flushes, feelings of weakness, pricking sensation.',
    },
    {
      id: 9,
      text: 'Cardiovascular symptoms',
      description: 'Tachycardia, palpitations, pain in chest, throbbing of vessels, fainting feelings, missing beat.',
    },
    {
      id: 10,
      text: 'Respiratory symptoms',
      description: 'Pressure or constriction in chest, choking feelings, sighing, dyspnea.',
    },
    {
      id: 11,
      text: 'Gastrointestinal symptoms',
      description: 'Difficulty in swallowing, wind abdominal pain, burning sensations, abdominal fullness, nausea, vomiting, borborygmi, looseness of bowels, loss of weight, constipation.',
    },
    {
      id: 12,
      text: 'Genitourinary symptoms',
      description: 'Frequency of micturition, urgency of micturition, amenorrhea, menorrhagia, development of frigidity, premature ejaculation, loss of libido, impotence.',
    },
    {
      id: 13,
      text: 'Autonomic symptoms',
      description: 'Dry mouth, flushing, pallor, tendency to sweat, giddiness, tension headache, raising of hair.',
    },
    {
      id: 14,
      text: 'Behavior at interview',
      description: 'Fidgeting, restlessness or pacing, tremor of hands, furrowed brow, strained face, sighing or rapid respiration, facial pallor, swallowing, etc.',
    },
  ],
  // Severity bands as per source PDF:
  // Note: The PDF states "<17" indicates mild severity and "18-24" mild to moderate. Score 17 is not explicitly defined in the PDF range, so score 17 is treated as Mild (0-17).
  // Note: The PDF provides no band for scores >30; score 31-56 is labeled "Above 30 (very severe by common convention)".
  bands: [
    { min: 0, max: 17, label: 'Mild', color: '#10b981' },
    { min: 18, max: 24, label: 'Mild to moderate', color: '#3b82f6' },
    { min: 25, max: 30, label: 'Moderate to severe', color: '#f59e0b' },
    { min: 31, max: 56, label: 'Above 30 (very severe by common convention)', color: '#ef4444' },
  ],
};

function scoreHama(answers) {
  // answers: array of { itemId, value } or map
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

  let totalScore = 0;
  for (let i = 1; i <= 14; i++) {
    const val = itemMap[i];
    if (val === undefined || isNaN(val) || val < 0 || val > 4) {
      throw new Error(`HAM-A item ${i} must have a score between 0 and 4`);
    }
    totalScore += val;
  }

  // Psychic anxiety items: 1, 2, 3, 4, 5, 6, 14
  // Somatic anxiety items: 7, 8, 9, 10, 11, 12, 13
  const psychicItems = [1, 2, 3, 4, 5, 6, 14];
  const somaticItems = [7, 8, 9, 10, 11, 12, 13];

  const psychicSubscore = psychicItems.reduce((acc, id) => acc + (itemMap[id] || 0), 0);
  const somaticSubscore = somaticItems.reduce((acc, id) => acc + (itemMap[id] || 0), 0);

  // Band selection (17 included in Mild; >30 in Above 30)
  let band = 'Mild';
  if (totalScore <= 17) {
    band = 'Mild';
  } else if (totalScore <= 24) {
    band = 'Mild to moderate';
  } else if (totalScore <= 30) {
    band = 'Moderate to severe';
  } else {
    band = 'Above 30 (very severe by common convention)';
  }

  return {
    totalScore,
    subscores: {
      psychicSubscore,
      somaticSubscore,
    },
    band,
    flags: [],
    summary: `HAM-A Total: ${totalScore}/56 (${band}). Psychic anxiety: ${psychicSubscore}/28, Somatic anxiety: ${somaticSubscore}/28.`,
  };
}

module.exports = {
  HAMA_DEFINITION,
  scoreHama,
};
