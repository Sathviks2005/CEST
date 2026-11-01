export const EXERCISES = {
  'attention-grid': {
    id: 'attention-grid',
    name: 'Selective Attention Grid',
    domain: 'Attention + Processing Speed',
    difficulty: 'Easy',
    estimatedDuration: 'Approx. 5 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Interactive visual search exercise designed to practice selective attention, target identification, and processing speed under visual distractor conditions. Inspired by Cognitive Enhancement Therapy.',
    instructions: [
      'At the start of each round, a target symbol/number will be displayed (e.g. "Find all 7s").',
      'Click all grid cells containing the exact target symbol as fast as possible.',
      'Rounds progressively increase grid size, add similar visual distractors, and tighten time limits.',
      'Try to achieve high accuracy without clicking incorrect distractor cells.',
    ],
  },
  'sequence-memory': {
    id: 'sequence-memory',
    name: 'Sequence Memory Challenge',
    domain: 'Working Memory + Recall',
    difficulty: 'Medium',
    estimatedDuration: '5–10 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Sequential recall exercise designed to challenge active working memory capacity, spatial ordering, and pattern retention. Inspired by Cognitive Enhancement Therapy.',
    instructions: [
      'A sequence of symbols or cards will be flashed one by one for a brief duration.',
      'Memorize the exact order of the sequence.',
      'Once hidden, reconstruct the sequence by selecting symbols in the correct order.',
      'Correct answers increase the sequence length, while mistakes maintain or slightly adjust difficulty.',
    ],
  },
  'problem-solving': {
    id: 'problem-solving',
    name: 'Planning & Problem-Solving Challenge',
    domain: 'Problem Solving • Executive Function • Cognitive Flexibility',
    difficulty: 'Medium → Advanced',
    estimatedDuration: '5–10 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Cognitive planning challenge designed to exercise goal decomposition, strategy planning, and step sequencing. Inspired by Cognitive Enhancement Therapy.',
    instructions: [
      'Read the scenario goal carefully before starting.',
      'In Goal Navigation levels: Navigate to the target destination using optimal moves while dodging obstacles.',
      'In Step Sequencing levels: Reorder steps into the most logical sequence to achieve the objective.',
      'Plan your moves in advance and adjust your strategy when constraints or distractors are introduced.',
    ],
  },
  'flanker': {
    id: 'flanker',
    name: 'Eriksen Flanker Task',
    domain: 'Inhibitory Control • Selective Attention',
    difficulty: 'Easy → Medium',
    estimatedDuration: 'Approx. 5 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Focus on the central target arrow while suppressing distracting flanking arrows pointing in congruent or conflicting directions.',
    instructions: [
      'Focus on the central target arrow in each array.',
      'Identify whether the center arrow points left or right.',
      'Ignore the flanking distractor arrows on either side.',
      'Maintain high speed and accuracy across rounds.',
    ],
  },
  'trail-making': {
    id: 'trail-making',
    name: 'Trail Making Challenge',
    domain: 'Visual Attention • Task Switching • Processing Speed',
    difficulty: 'Medium',
    estimatedDuration: '5–10 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Sequentially connect alternating numbers and letters under timed conditions to practice mental set-shifting and scanning speed.',
    instructions: [
      'Locate circle 1 and connect it to letter A.',
      'Alternate between ascending numbers and letters (1-A-2-B-3-C...).',
      'Scan the screen efficiently to find the next target.',
      'Complete the sequence as quickly as possible without skipping.',
    ],
  },
  'stroop': {
    id: 'stroop',
    name: 'Stroop Color-Word Challenge',
    domain: 'Response Inhibition • Cognitive Control',
    difficulty: 'Medium',
    estimatedDuration: 'Approx. 5 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Name the font/display color of words while inhibiting the automatic impulse to read the conflicting written color word.',
    instructions: [
      'Words will appear displaying color names printed in mismatched colors.',
      'Select the actual font color, NOT the written word itself.',
      'Suppress the automatic reading reflex to respond accurately.',
      'Strive for high accuracy and fast reaction times.',
    ],
  },
  'go-no-go': {
    id: 'go-no-go',
    name: 'Go / No-Go Focus Challenge',
    domain: 'Impulse Control • Sustained Attention',
    difficulty: 'Medium',
    estimatedDuration: 'Approx. 5 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Rapidly respond to target stimuli (Go) while maintaining inhibitory restraint to withhold responses on distractor signals (No-Go).',
    instructions: [
      'Green signals indicate "Go" — respond immediately.',
      'Red signals indicate "No-Go" — hold back and do not respond.',
      'Signal timing will vary to challenge anticipation and impulse control.',
      'Balance prompt responding with strong inhibitory control.',
    ],
  },
  'n-back': {
    id: 'n-back',
    name: 'Working Memory Dual N-Back',
    domain: 'Working Memory Updating • Executive Attention',
    difficulty: 'Hard',
    estimatedDuration: '5–10 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Track stimuli presented sequentially and indicate when the current stimulus matches the one from N steps earlier.',
    instructions: [
      'A continuous sequence of items will appear one at a time.',
      'Remember the item shown N steps earlier (e.g., 2 steps back).',
      'Signal a match whenever the current item matches the item N positions back.',
      'Continuously update your mental buffer as new items arrive.',
    ],
  },
  'cpt': {
    id: 'cpt',
    name: 'Continuous Performance Test (CPT)',
    domain: 'Sustained Attention • Vigilance • Concentration',
    difficulty: 'Medium → Advanced',
    estimatedDuration: '5–10 minutes',
    targetScoreBand: 'Cognitive Enhancement',
    shortDescription:
      'Maintain vigilance and quick accuracy over an extended series of rapid stimulus flashes to assess and train sustained attention.',
    instructions: [
      'Letters will flash rapidly on screen one after another.',
      'Respond only when the target pattern appears (e.g., letter X following letter A).',
      'Ignore all other non-target letters and sequences.',
      'Stay alert and maintain consistent concentration throughout the session.',
    ],
  },
};

export const CLINICAL_DISCLAIMER =
  'PHQ-9 is not a cognitive assessment; these are CET-informed cognitive training activities, not medical treatment.';

export const CET_ACADEMIC_NOTICE =
  'PHQ-9 is not a cognitive assessment; these are CET-informed cognitive training activities, not medical treatment.';

export const getExerciseRecommendation = (score = null, severity = '') => {
  const numScore =
    typeof score === 'number'
      ? score
      : score !== null && !isNaN(Number(score))
      ? Number(score)
      : null;

  if (numScore === null) {
    return {
      recommend: false,
      severity: severity || 'Unknown',
      scoreRange: '',
      exercise: null,
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  // 0–4: Minimal -> no game recommendation
  if (numScore >= 0 && numScore <= 4) {
    return {
      recommend: false,
      severity: 'Minimal',
      scoreRange: '0–4',
      exercise: null,
      message: 'Score indicates minimal symptoms. Automatic targeted cognitive exercise is not required.',
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  // 5–9: Mild -> Attention Grid
  if (numScore >= 5 && numScore <= 9) {
    return {
      recommend: true,
      severity: 'Mild',
      scoreRange: '5–9',
      exercise: EXERCISES['attention-grid'],
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  // 10–14: Moderate -> Sequence Memory
  if (numScore >= 10 && numScore <= 14) {
    return {
      recommend: true,
      severity: 'Moderate',
      scoreRange: '10–14',
      exercise: EXERCISES['sequence-memory'],
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  // 15–19: Moderately severe -> Problem Solving
  if (numScore >= 15 && numScore <= 19) {
    return {
      recommend: true,
      severity: 'Moderately severe',
      scoreRange: '15–19',
      exercise: EXERCISES['problem-solving'],
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  // 20–27: Severe -> no game recommendation
  if (numScore >= 20 && numScore <= 27) {
    return {
      recommend: false,
      severity: 'Severe',
      scoreRange: '20–27',
      exercise: null,
      message: 'Score indicates severe depression symptoms. Healthcare and professional guidance take precedence.',
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  return {
    recommend: false,
    severity: severity || 'Unknown',
    scoreRange: '',
    exercise: null,
    disclaimer: CLINICAL_DISCLAIMER,
  };
};
