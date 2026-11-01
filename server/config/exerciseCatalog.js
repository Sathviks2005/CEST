/**
 * Exercise Catalog - Shared source of truth for assignable exercises.
 * 
 * IMPORTANT: This catalog and getCbtBandSuggestions() must stay strictly aligned
 * with client/src/data/exerciseContent.js (CBT_EXERCISE_CONTENT & EXERCISE_DEFINITIONS)
 * and client/src/data/exerciseData.js (EXERCISES).
 * For all six instruments (PHQ-9, GAD-7, ISI, PCL-5, Y-BOCS, ASRS/ADHD):
 * - LAST (most severe) band returns { isLastBand: true, exerciseIds: [] } -> Contact a Clinician
 * - EVERY OTHER band returns { isLastBand: false, exerciseIds: [...] } with at least one valid exercise.
 */

const CBT_EXERCISES = [
  {
    id: 'breathing-timer',
    title: 'Slow Breathing',
    group: 'cbt',
    scales: ['gad7', 'ptsd', 'ocd'],
    technique: 'slow paced breathing',
    category: 'Relaxation & Regulation',
    description: 'Gentle 4s inhale and 6s exhale without breath-holds to down-regulate the nervous system.',
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    group: 'cbt',
    scales: ['gad7', 'ptsd'],
    technique: 'grounding technique',
    category: 'Grounding Technique',
    description: 'Reconnect with your immediate surroundings across 5 sensory domains to anchor in the present moment.',
  },
  {
    id: 'worry-decision-tree',
    title: 'Worry Decision Tree & Worry Time',
    group: 'cbt',
    scales: ['gad7'],
    technique: 'CBT for GAD (worry decision tree, worry time/stimulus control)',
    category: 'Cognitive Restructuring',
    description: 'Distinguish actionable problems from hypothetical "what if" worries, schedule daily worry time, and ground yourself in the present.',
  },
  {
    id: 'muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    group: 'cbt',
    scales: ['gad7', 'insomnia', 'ptsd', 'ocd'],
    technique: 'Progressive Muscle Relaxation (Jacobson; Bernstein & Borkovec)',
    category: 'Somatic Relaxation',
    description: 'Step-by-step light tension (~70%) and complete release through major muscle groups with clear visual indicators.',
  },
  {
    id: 'gratitude-mood-checkin',
    title: 'Three Good Things + Mood Check-in',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Three Good Things',
    category: 'Positive Focus & Maintenance',
    description: 'Positive psychology maintenance exercise: reflect on three small positive events and log your mood.',
  },
  {
    id: 'activity-scheduler-mild',
    title: 'Behavioral Activation Planner (Mild)',
    group: 'cbt',
    scales: ['phq9', 'ocd'],
    technique: 'Behavioral Activation',
    category: 'Behavioral Activation',
    description: 'Plan 2–3 uplifting activities, rate anticipated pleasure and mastery, and break low-momentum cycles.',
  },
  {
    id: 'activity-scheduler-moderate',
    title: 'Behavioral Activation Planner (Moderate)',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Behavioral Activation',
    category: 'Behavioral Activation',
    description: 'Structured 3-day activation planner with Pleasure and Mastery ratings (0–10) and before/after mood tracking.',
  },
  {
    id: 'activity-scheduler-graded',
    title: 'Graded Behavioral Activation Planner',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Behavioral Activation',
    category: 'Behavioral Activation',
    description: 'Graded low-demand activation: 1–2 tiny 5-minute activities per day with barrier troubleshooting and 3-day monitoring.',
  },
  {
    id: 'thinking-traps-spotter',
    title: 'Thinking Traps Spotter',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'cognitive distortions (Beck, Burns)',
    category: 'Cognitive Restructuring',
    description: 'Explore 6 common cognitive distortions, practice identifying them in everyday thoughts, and test one of your own.',
  },
  {
    id: 'thought-record',
    title: '7-Column Thought Record',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Thought Record (Beck; Greenberger & Padesky)',
    category: 'Cognitive Restructuring',
    description: 'Standard 7-step CBT thought record with evidence testing, belief ratings, and before/after mood thermometer.',
  },
  {
    id: 'problem-solving-worksheet',
    title: 'Problem-Solving Worksheet',
    group: 'cbt',
    scales: ['phq9'],
    technique: "Problem-Solving Therapy (D'Zurilla and Nezu)",
    category: 'Problem-Solving Therapy',
    description: 'Structured 6-step problem-solving sequence: problem definition, realistic goal, brainstorming, pros/cons, action plan, and review date.',
  },
  {
    id: 'sleep-hygiene-checklist',
    title: 'Sleep Hygiene Education Checklist',
    group: 'cbt',
    scales: ['insomnia', 'ptsd'],
    technique: 'sleep hygiene education',
    category: 'Sleep Habits',
    description: 'Review and commit to 8 evidence-based sleep hygiene habits supporting restorative night sleep.',
  },
  {
    id: 'sleep-breathing-moon',
    title: 'Bedtime Moon Breathing',
    group: 'cbt',
    scales: ['insomnia'],
    technique: 'slow paced breathing',
    category: 'Relaxation & Regulation',
    description: 'Bedtime 4s inhale / 6s exhale moon breathing with soft ambient visuals and no breath-holds.',
  },
  {
    id: 'stimulus-control-guide',
    title: 'Stimulus Control Bed & Wake Guide',
    group: 'cbt',
    scales: ['insomnia'],
    technique: 'Stimulus Control (Bootzin, CBT-I)',
    category: 'Sleep Habits',
    description: 'Bootzin CBT-I stimulus control protocol: break conditioned arousal, avoid clock-watching, and use a 15-minute practice timer.',
  },
  {
    id: 'sleep-thought-challenger',
    title: 'Sleep Thought Challenger',
    group: 'cbt',
    scales: ['insomnia'],
    technique: 'cognitive restructuring for sleep beliefs (DBAS-style)',
    category: 'Cognitive Restructuring',
    description: 'DBAS-informed cognitive restructuring: challenge catastrophic sleep assumptions and reduce nighttime anticipatory anxiety.',
  },
  {
    id: 'sleep-diary',
    title: 'Consensus Sleep Diary (7 Nights)',
    group: 'cbt',
    scales: ['insomnia'],
    technique: 'Consensus Sleep Diary',
    category: 'Tracking',
    description: 'Standard Consensus Sleep Diary logging bed time, lights-out, sleep latency, awakenings, wake time, out-of-bed time, and quality.',
  },
  {
    id: 'trauma-education-card',
    title: 'Understanding Stress & Trauma Reactions',
    group: 'cbt',
    scales: ['ptsd'],
    technique: 'trauma psychoeducation',
    category: 'Education & Stabilisation',
    description: 'Psychoeducation on trauma survival responses and the Window of Tolerance teaching model, focused on stabilisation and safety.',
  },
  {
    id: 'balanced-thinking-check',
    title: 'Everyday Balanced Thinking Check',
    group: 'cbt',
    scales: ['ptsd'],
    technique: 'cognitive distortions (Beck, Burns)',
    category: 'Cognitive Skills',
    description: 'Evaluate everyday routine thoughts and distortions (strictly not for trauma processing or exposure).',
  },
  {
    id: 'coping-support-plan',
    title: 'Personal Coping & Support Plan',
    group: 'cbt',
    scales: ['phq9', 'ptsd'],
    technique: 'safety/coping planning (Stanley–Brown style)',
    category: 'Stress Management & Safety',
    description: 'Stanley-Brown informed personal coping plan with warning signs, calming tools, support contacts, and crisis resources.',
  },
  {
    id: 'ocd-education-card',
    title: 'Understanding Obsessions & Compulsions',
    group: 'cbt',
    scales: ['ocd'],
    technique: 'OCD cognitive-behavioural model, functional analysis',
    category: 'Education',
    description: 'Psychoeducation on obsessions, compulsions, the reinforcement loop, and evidence-based ERP treatment.',
  },
  {
    id: 'ocd-cycle-mapper',
    title: 'OCD Cycle Mapper',
    group: 'cbt',
    scales: ['ocd'],
    technique: 'OCD cognitive-behavioural model, functional analysis',
    category: 'Functional Analysis',
    description: 'Interactive 5-node OCD cycle mapper and habituation curve showing natural anxiety reduction when compulsions are resisted.',
  },
  {
    id: 'urge-surfing-timer',
    title: 'Urge Surfing & Response Delay Timer',
    group: 'cbt',
    scales: ['ocd'],
    technique: 'response delay and urge surfing used in ERP and mindfulness-based approaches',
    category: 'Mindfulness & Response Delay',
    description: 'Mindfulness response delay tool: ride out urges with minute-by-minute discomfort ratings, wave animation, and tracking chart.',
  },
  {
    id: 'erp-hierarchy-builder',
    title: 'ERP Fear Hierarchy Builder',
    group: 'cbt',
    scales: ['ocd'],
    technique: 'ERP (Foa and Kozak; Meyer)',
    category: 'Exposure Preparation',
    description: 'Preparation ladder for clinical therapy: add 6–12 feared situations, rate expected distress (0–100), and auto-sort without self-exposure.',
  },
  {
    id: 'ocd-warning-signs-plan',
    title: 'OCD Warning Signs & Appointment Planner',
    group: 'cbt',
    scales: ['ocd'],
    technique: 'relapse prevention and appointment prep',
    category: 'Self-Management Plan',
    description: 'Track early symptom shifts, identify worsening triggers, and formulate concrete discussion questions for clinical appointments.',
  },
  {
    id: 'sunlight-walk',
    title: 'Sunlight & Light Movement Guide',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Behavioral Activation & Circadian Health',
    category: 'Preventive Wellness & Movement',
    description: '10–15 min gentle morning light movement and outdoor sunlight protocol to naturally regulate circadian rhythms, cortisol, and mood.',
  },
  {
    id: 'daily-routine-planner',
    title: 'Daily Rhythm & Routine Planner',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Interpersonal and Social Rhythm Therapy (IPSRT)',
    category: 'Behavioral Activation & Routine',
    description: 'Plan daily anchor times for wake-up, regular meals, light activity, and bedtime to rebuild healthy daily structure and circadian stability.',
  },
  {
    id: 'social-connection-nudge',
    title: 'Social Connection Nudge',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Behavioral Activation & Anti-Isolation',
    category: 'Social Connection & Support',
    description: 'Low-effort 1-tap message templates to reach out to a trusted contact without overthinking or energy exhaustion.',
  },
  {
    id: 'body-scan-mindfulness',
    title: 'Guided MBCT Body Scan',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Mindfulness-Based Cognitive Therapy (MBCT; Segal, Williams, Teasdale)',
    category: 'Mindfulness & Somatic Awareness',
    description: 'Non-judgmental, gentle somatic awareness scan through 7 bodily zones to disengage from depressive rumination loops.',
  },
  {
    id: 'self-compassion-break',
    title: 'Self-Compassion Break Practice',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Mindful Self-Compassion (Dr. Kristin Neff)',
    category: 'Self-Compassion & Emotional Care',
    description: 'Three-part soothing practice: Mindfulness of pain, Common Humanity ("I am not alone"), and Self-Kindness soothing touch.',
  },
  {
    id: 'micro-task-planner',
    title: 'Smallest-Possible-Step Micro-Task Planner',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Graded Behavioral Activation (Task Deconstruction)',
    category: 'Graded Behavioral Activation',
    description: 'Deconstruct overwhelming chores into atomic 2–5 minute micro-steps with single-step focus to bypass severe depressive inertia.',
  },
  {
    id: 'basic-needs-checklist',
    title: 'Basic Biological Needs Checklist',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Behavioral Self-Care & Physiological Stability',
    category: 'Basic Needs & Self-Care',
    description: 'Low-energy biological audit: hydration, nourishment, medication, daylight, and rest check-in for severe fatigue or low days.',
  },
  {
    id: 'reach-out-script',
    title: 'Pre-Written Reach-Out Script',
    group: 'cbt',
    scales: ['phq9'],
    technique: 'Crisis Support & Interpersonal Activation',
    category: 'Crisis Support & Safety',
    description: 'Ready-to-copy, low-pressure support messages to let someone you trust know that you are struggling without having to find the words.',
  },
];

const CET_EXERCISES = [
  {
    id: 'attention-grid',
    title: 'Selective Attention Grid',
    group: 'cet',
    scales: ['phq9'],
    technique: 'Inspired by Cognitive Enhancement Therapy',
    category: 'Attention & Processing Speed',
    description: 'Interactive visual search exercise designed to practice selective attention, target identification, and processing speed under visual distractor conditions.',
  },
  {
    id: 'sequence-memory',
    title: 'Sequence Memory Challenge',
    group: 'cet',
    scales: ['phq9'],
    technique: 'Inspired by Cognitive Enhancement Therapy',
    category: 'Working Memory & Recall',
    description: 'Sequential recall exercise designed to challenge active working memory capacity, spatial ordering, and pattern retention.',
  },
  {
    id: 'problem-solving',
    title: 'Planning & Problem-Solving Challenge',
    group: 'cet',
    scales: ['phq9'],
    technique: 'Inspired by Cognitive Enhancement Therapy',
    category: 'Problem Solving & Executive Function',
    description: 'Cognitive planning challenge designed to exercise goal decomposition, strategy planning, and step sequencing.',
  },
  {
    id: 'flanker',
    title: 'Eriksen Flanker Task',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Inhibitory Control & Selective Attention',
    category: 'Attention & Interference Control',
    description: 'Focus on the central target arrow while suppressing distracting flanking arrows pointing in congruent or conflicting directions.',
  },
  {
    id: 'trail-making',
    title: 'Trail Making Challenge',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Visual Attention & Task Switching',
    category: 'Cognitive Flexibility & Processing Speed',
    description: 'Sequentially connect alternating numbers and letters under timed conditions to practice mental set-shifting and scanning speed.',
  },
  {
    id: 'stroop',
    title: 'Stroop Color-Word Challenge',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Response Inhibition & Cognitive Control',
    category: 'Response Inhibition',
    description: 'Name the ink color of words while inhibiting the automatic impulse to read the conflicting color name.',
  },
  {
    id: 'go-no-go',
    title: 'Go / No-Go Focus Challenge',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Impulse Control & Sustained Attention',
    category: 'Impulse Control',
    description: 'Rapidly respond to target stimuli (Go) while maintaining inhibitory restraint to withhold responses on distractor signals (No-Go).',
  },
  {
    id: 'n-back',
    title: 'Working Memory Dual N-Back',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Working Memory Updating',
    category: 'Working Memory & Focus',
    description: 'Track stimuli presented sequentially and indicate when the current stimulus matches the one from N steps earlier.',
  },
  {
    id: 'cpt',
    title: 'Continuous Performance Test (CPT)',
    group: 'cet',
    scales: ['adhd'],
    technique: 'Vigilance & Sustained Attention',
    category: 'Sustained Attention',
    description: 'Maintain vigilance and quick accuracy over an extended series of rapid stimulus flashes to assess and train sustained attention.',
  },
];

const EXERCISE_CATALOG = [...CBT_EXERCISES, ...CET_EXERCISES];

const EXERCISE_MAP = new Map(EXERCISE_CATALOG.map((ex) => [ex.id, ex]));

/**
 * Mandatory CET disclaimer text to be shown wherever CET games appear.
 */
const CET_DISCLAIMER =
  'These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment.';

/**
 * Validates if an exercise ID exists in the catalog.
 */
const isValidExerciseId = (id) => EXERCISE_MAP.has(id);

/**
 * Returns an exercise by ID.
 */
const getExerciseById = (id) => EXERCISE_MAP.get(id) || null;

/**
 * Band mapping logic aligned with CBT_EXERCISE_CONTENT:
 * If the assessment is in the highest band (last-band), return no suggestions.
 */
const getCbtBandSuggestions = (scaleKey, score, severity) => {
  const s = typeof score === 'number' ? score : Number(score) || 0;
  const sevLower = (severity || '').toLowerCase();

  switch (scaleKey) {
    case 'gad7': {
      if (sevLower.includes('severe') || s >= 15) return { isLastBand: true, exerciseIds: [] };
      if (sevLower.includes('moderate') || s >= 10) return { isLastBand: false, exerciseIds: ['worry-decision-tree', 'muscle-relaxation'], bandName: 'Moderate' };
      if (sevLower.includes('mild') || s >= 5) return { isLastBand: false, exerciseIds: ['breathing-timer', 'grounding-54321'], bandName: 'Mild' };
      return { isLastBand: false, exerciseIds: ['breathing-timer', 'grounding-54321'], bandName: 'Minimal' };
    }
    case 'phq9': {
      if ((!sevLower.includes('moderately') && sevLower.includes('severe')) || s >= 20) return { isLastBand: true, exerciseIds: [] };
      if (sevLower.includes('moderately severe') || s >= 15) {
        return {
          isLastBand: false,
          exerciseIds: [
            'micro-task-planner',
            'basic-needs-checklist',
            'grounding-54321',
            'activity-scheduler-graded',
            'reach-out-script',
          ],
          bandName: 'Moderately severe',
        };
      }
      if (sevLower.includes('moderate') || s >= 10) {
        return {
          isLastBand: false,
          exerciseIds: [
            'activity-scheduler-moderate',
            'thinking-traps-spotter',
            'problem-solving-worksheet',
            'body-scan-mindfulness',
            'self-compassion-break',
          ],
          bandName: 'Moderate',
        };
      }
      if (sevLower.includes('mild') || s >= 5) {
        return {
          isLastBand: false,
          exerciseIds: [
            'activity-scheduler-mild',
            'thought-record',
            'breathing-timer',
            'daily-routine-planner',
            'social-connection-nudge',
          ],
          bandName: 'Mild',
        };
      }
      return {
        isLastBand: false,
        exerciseIds: [
          'gratitude-mood-checkin',
          'sleep-hygiene-checklist',
          'sunlight-walk',
          'breathing-timer',
        ],
        bandName: 'Minimal',
      };
    }
    case 'insomnia': {
      if (sevLower.includes('severe') || s >= 22) return { isLastBand: true, exerciseIds: [] };
      if (sevLower.includes('moderate') || s >= 15) {
        return {
          isLastBand: false,
          exerciseIds: ['stimulus-control-guide', 'muscle-relaxation', 'sleep-thought-challenger', 'sleep-diary'],
          bandName: 'Moderate',
        };
      }
      if (sevLower.includes('subthreshold') || sevLower.includes('mild') || s >= 8) {
        return {
          isLastBand: false,
          exerciseIds: ['sleep-hygiene-checklist', 'sleep-breathing-moon', 'sleep-diary'],
          bandName: 'Subthreshold / Mild',
        };
      }
      return { isLastBand: false, exerciseIds: ['sleep-hygiene-checklist'], bandName: 'None / Minimal' };
    }
    case 'ptsd': {
      if (sevLower.includes('extreme') || s >= 65) return { isLastBand: true, exerciseIds: [] };
      if (sevLower.includes('severe') || s >= 49) {
        return {
          isLastBand: false,
          exerciseIds: ['trauma-education-card', 'grounding-54321', 'breathing-timer', 'sleep-hygiene-checklist', 'coping-support-plan'],
          bandName: 'Severe',
        };
      }
      if (sevLower.includes('moderate') || s >= 33) {
        return {
          isLastBand: false,
          exerciseIds: ['grounding-54321', 'muscle-relaxation', 'balanced-thinking-check', 'coping-support-plan'],
          bandName: 'Moderate',
        };
      }
      if (sevLower.includes('mild') || s >= 11) {
        return {
          isLastBand: false,
          exerciseIds: ['trauma-education-card', 'breathing-timer', 'grounding-54321'],
          bandName: 'Mild',
        };
      }
      return { isLastBand: false, exerciseIds: ['breathing-timer'], bandName: 'Minimal / Absent' };
    }
    case 'ocd': {
      if (sevLower.includes('extreme') || s >= 32) return { isLastBand: true, exerciseIds: [] };
      if (sevLower.includes('severe') || s >= 24) {
        return {
          isLastBand: false,
          exerciseIds: ['ocd-education-card', 'ocd-cycle-mapper', 'erp-hierarchy-builder', 'urge-surfing-timer', 'ocd-warning-signs-plan'],
          bandName: 'Severe',
        };
      }
      if (sevLower.includes('moderate') || s >= 16) {
        return {
          isLastBand: false,
          exerciseIds: ['ocd-cycle-mapper', 'urge-surfing-timer', 'muscle-relaxation', 'ocd-warning-signs-plan'],
          bandName: 'Moderate',
        };
      }
      if (sevLower.includes('mild') || s >= 8) {
        return {
          isLastBand: false,
          exerciseIds: ['ocd-education-card', 'ocd-cycle-mapper', 'breathing-timer', 'activity-scheduler-mild'],
          bandName: 'Mild',
        };
      }
      return { isLastBand: false, exerciseIds: ['breathing-timer'], bandName: 'Subclinical / Minimal' };
    }
    case 'adhd': {
      if (sevLower.includes('high') || sevLower.includes('severe') || s >= 36) {
        return { isLastBand: true, exerciseIds: [] };
      }
      if (sevLower.includes('moderate') || s >= 19) {
        return {
          isLastBand: false,
          exerciseIds: ['stroop', 'go-no-go', 'n-back', 'cpt'],
          bandName: 'Moderate likelihood',
        };
      }
      return {
        isLastBand: false,
        exerciseIds: ['flanker', 'trail-making'],
        bandName: 'Low likelihood',
      };
    }
    default:
      return { isLastBand: false, exerciseIds: [] };
  }
};

/**
 * Returns suggested CET exercise id for PHQ-9 score, exactly matching data/exerciseData.js:
 * 5-9 -> attention-grid
 * 10-14 -> sequence-memory
 * 15-19 -> problem-solving
 * 0-4 and 20-27 -> none
 */
const getCetRecommendationForPhq9 = (score) => {
  const numScore = typeof score === 'number' ? score : Number(score) || 0;
  if (numScore >= 5 && numScore <= 9) {
    return { exerciseId: 'attention-grid', title: 'Selective Attention Grid', scoreRange: '5–9' };
  }
  if (numScore >= 10 && numScore <= 14) {
    return { exerciseId: 'sequence-memory', title: 'Sequence Memory Challenge', scoreRange: '10–14' };
  }
  if (numScore >= 15 && numScore <= 19) {
    return { exerciseId: 'problem-solving', title: 'Planning & Problem-Solving Challenge', scoreRange: '15–19' };
  }
  return null;
};

module.exports = {
  CBT_EXERCISES,
  CET_EXERCISES,
  EXERCISE_CATALOG,
  CET_DISCLAIMER,
  isValidExerciseId,
  getExerciseById,
  getCbtBandSuggestions,
  getCetRecommendationForPhq9,
};
