/**
 * ADHD DSM-5 Symptom Checklist
 * Source Reference: DSM-5 ADHD Symptom Checklist (docs/instruments/ADHD-DSM-5-Checklist-childhood-LD-7_22.pdf)
 * Public domain / clinical checklist.
 */

export const ADHD_DSM5_DEFINITION = {
  id: 'adhd_dsm5',
  name: 'DSM-5 ADHD Symptom Checklist',
  shortName: 'ADHD DSM-5',
  version: '1.0',
  citation: 'American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5).',
  copyright: 'Clinical rating checklist adapted from DSM-5 diagnostic criteria.',
  timeFrame: 'Current presentation / developmental history',
  instructions:
    'For each item below, select the answer that best describes the individual: 0 = Not at all, 1 = Just a Little, 2 = Often, 3 = Very Often.',
  targetDisorder: 'adhd',
  estimatedMinutes: 10,
  itemsCount: 18,
  maxScore: 54,
  options: [
    { value: 0, label: '0 = Not at all' },
    { value: 1, label: '1 = Just a Little' },
    { value: 2, label: '2 = Often' },
    { value: 3, label: '3 = Very Often' },
  ],
  items: [
    // Inattention Symptoms (1-9)
    {
      id: 1,
      domain: 'inattention',
      text: 'Fails to give attention to details or makes careless mistakes in schoolwork, work, or during other activities (e.g. overlooks or misses details, work is inaccurate).',
    },
    {
      id: 2,
      domain: 'inattention',
      text: 'Has difficulty sustaining attention to tasks or play activities (e.g., has difficulty remaining focused during lectures, conversations, or lengthy reading).',
    },
    {
      id: 3,
      domain: 'inattention',
      text: 'Does not seem to listen when spoken to directly (e.g., mind seems elsewhere, even in the absence of any obvious distraction).',
    },
    {
      id: 4,
      domain: 'inattention',
      text: 'Does not follow through on instructions and fails to finish schoolwork, chores, or duties in the workplace (e.g., starts tasks but quickly loses focus and is easily sidetracked).',
    },
    {
      id: 5,
      domain: 'inattention',
      text: 'Difficulty organizing tasks and activities (e.g., difficulty with sequential tasks; difficulty keeping materials and belongings in order; messy, disorganized with work; has poor time management; fails to meet deadlines).',
    },
    {
      id: 6,
      domain: 'inattention',
      text: 'Avoids, dislikes, or is reluctant to engage in tasks that require sustained mental effort (e.g., schoolwork or homework, preparing reports, completing forms, reviewing lengthy papers).',
    },
    {
      id: 7,
      domain: 'inattention',
      text: 'Loses things necessary for tasks or activities (e.g., school materials, pencils, books, tools, wallets, keys, paperwork, eyeglasses, mobile telephones).',
    },
    {
      id: 8,
      domain: 'inattention',
      text: 'Is easily distracted by extraneous stimuli (for older adolescents and adults, may include unrelated thoughts).',
    },
    {
      id: 9,
      domain: 'inattention',
      text: 'Is forgetful in daily activities (e.g., doing chores, running errands; for older adolescents and adults, returning calls, paying bills, keeping appointments).',
    },
    // Hyperactive-Impulsive Symptoms (10-18)
    {
      id: 10,
      domain: 'hyperactivity_impulsivity',
      text: 'Fidgets with or taps hands or feet or squirms in seat.',
    },
    {
      id: 11,
      domain: 'hyperactivity_impulsivity',
      text: 'Leaves seat in situations in which it is inappropriate (NOTE: in adolescents or adults may be limited to feelings of restlessness).',
    },
    // NOTE: Items 12 and 13 in the source PDF are near-duplicates ("quietly").
    // As required by the prompt, we retain the exact wording from the source PDF.
    {
      id: 12,
      domain: 'hyperactivity_impulsivity',
      text: 'Unable to play or engage in leisure activities quietly.',
    },
    {
      id: 13,
      domain: 'hyperactivity_impulsivity',
      text: 'Has difficulty playing or engaging in leisure activities quietly.',
    },
    {
      id: 14,
      domain: 'hyperactivity_impulsivity',
      text: 'Is "on the go", acts as if "driven by a motor" (e.g., is unable or uncomfortable being still for extended time in restaurants, meetings; may be seen as restless or difficult to keep up with).',
    },
    {
      id: 15,
      domain: 'hyperactivity_impulsivity',
      text: 'Talks excessively.',
    },
    {
      id: 16,
      domain: 'hyperactivity_impulsivity',
      text: 'Blurts out an answer before question has been completed (e.g., completes people\'s sentences; cannot wait for turn in conversation).',
    },
    {
      id: 17,
      domain: 'hyperactivity_impulsivity',
      text: 'Has difficulty waiting his or her turn (e.g., while waiting in line).',
    },
    {
      id: 18,
      domain: 'hyperactivity_impulsivity',
      text: 'Interrupts or intrudes (e.g., butts into conversations, games, or activities; using other people\'s things without asking permission; may intrude into or take over what others are doing).',
    },
  ],
  extraFields: [
    {
      id: 'respondent',
      type: 'select',
      label: 'Completed by',
      options: [
        { value: 'patient', label: 'Patient / Individual' },
        { value: 'parent_caregiver', label: 'Parent / Caregiver' },
        { value: 'other', label: 'Other informant' },
      ],
      required: true,
    },
    {
      id: 'firstNoticed',
      type: 'text',
      label: 'Approximately when did you first notice the behaviors that occur often or very often?',
      required: false,
    },
    {
      id: 'impairsTwoSettings',
      type: 'boolean',
      label: 'Do these symptoms impair the person\'s functioning in two or more settings?',
      required: true,
    },
    {
      id: 'settings',
      type: 'multiSelect',
      label: 'Where is there impairment? (Select all that apply)',
      options: [
        { value: 'Home', label: 'Home' },
        { value: 'School', label: 'School' },
        { value: 'Socially', label: 'Socially' },
      ],
      required: false,
    },
  ],
  caveat:
    'Symptoms must have occurred by age 12, they must impair the individual\'s functioning in two or more settings, and they must not be primarily due to any other factors or conditions. Using a rating scale such as this, however, is not sufficient in and of itself to diagnose ADHD. Other sources of information should be considered and an appropriate health professional should be consulted.',
};

export function scoreAdhdDsm5(answers, extras = {}, patientAge = null) {
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
  let inattentionCount = 0;
  let hyperactiveImpulsiveCount = 0;

  for (let i = 1; i <= 18; i++) {
    const val = itemMap[i];
    if (val === undefined || isNaN(val) || val < 0 || val > 3) {
      throw new Error(`ADHD checklist item ${i} must have a score between 0 and 3`);
    }
    totalScore += val;

    const isSymptomPresent = val >= 2;
    if (i <= 9) {
      if (isSymptomPresent) inattentionCount++;
    } else {
      if (isSymptomPresent) hyperactiveImpulsiveCount++;
    }
  }

  const age = Number(extras.age ?? patientAge);
  const isAdultOrOlderAdolescent = !isNaN(age) && age >= 17;
  const symptomThreshold = isAdultOrOlderAdolescent ? 5 : 6;

  const inattentiveMet = inattentionCount >= symptomThreshold;
  const hyperactiveImpulsiveMet = hyperactiveImpulsiveCount >= symptomThreshold;

  let presentation = 'Screening criteria not met';
  let band = 'Below threshold';

  if (inattentiveMet && hyperactiveImpulsiveMet) {
    presentation = 'Screening criteria met for combined presentation';
    band = 'Screening criteria met (Combined)';
  } else if (inattentiveMet) {
    presentation = 'Screening criteria met for predominantly inattentive presentation';
    band = 'Screening criteria met (Inattentive)';
  } else if (hyperactiveImpulsiveMet) {
    presentation = 'Screening criteria met for predominantly hyperactive-impulsive presentation';
    band = 'Screening criteria met (Hyperactive-Impulsive)';
  }

  const flags = [];
  if (inattentiveMet || hyperactiveImpulsiveMet) {
    flags.push('ADHD_CRITERIA_SCREEN_MET');
  }

  return {
    totalScore,
    subscores: {
      inattentionCount,
      hyperactiveImpulsiveCount,
      symptomThreshold,
      evaluatedAge: isNaN(age) ? null : age,
      inattentiveMet,
      hyperactiveImpulsiveMet,
      presentation,
    },
    band,
    flags,
    summary: `ADHD Symptoms: Inattention ${inattentionCount}/9, Hyperactivity-Impulsivity ${hyperactiveImpulsiveCount}/9 (Threshold: ${symptomThreshold} for age ${
      isNaN(age) ? '<17 assumed' : age
    }). ${presentation}. Note: Screening scores support clinical evaluation and do not represent a diagnosis.`,
  };
}
