/**
 * CBT Exercises & Evidence-Based Clinical Content Specification
 * Standard, low-intensity CBT, CBT-I, ERP, and behavioral activation techniques
 * for GAD-7, PHQ-9, ISI, PCL-5, and Y-BOCS severity bands.
 */

export const CRISIS_RESOURCES = {
  notice:
    'If you are thinking about harming yourself, contact your local emergency number or a crisis helpline right now.',
  helplines: [
    { country: 'United States & Canada', details: '988 Suicide & Crisis Lifeline: Call or text 988 (Available 24/7)' },
    { country: 'United Kingdom', details: 'Call 111 (NHS) or 116 123 (Samaritans, 24/7)' },
    { country: 'India', details: 'Tele-MANAS: Call 14416 or 1800-891-4416 (24/7 Toll-free)' },
    { country: 'International', details: 'Find your local crisis line at https://findahelpline.com or visit the nearest emergency room.' },
  ],
};

export const CBT_EXERCISE_CONTENT = {
  gad7: {
    minimal: {
      reassurance:
        'Your responses suggest minimal anxiety symptoms right now. Keep up your daily healthy routines and self-care practices.',
      optInHeading: 'Want to try a few optional wellness exercises anyway?',
      optInSubheading: 'Light-touch grounding and slow paced breathing to help maintain calm.',
      exerciseIds: ['breathing-timer', 'grounding-54321'],
    },
    mild: {
      heading: 'Recommended Evidence-Based CBT Exercises for Mild Anxiety',
      subheading: 'Light-touch grounding and slow-paced breathing tools to help manage occasional worry.',
      exerciseIds: ['breathing-timer', 'grounding-54321'],
    },
    moderate: {
      heading: 'Targeted CBT Exercises for Moderate Anxiety',
      subheading: 'Structured cognitive techniques to organize worries and relieve somatic tension.',
      exerciseIds: ['worry-decision-tree', 'muscle-relaxation'],
    },
    severe: {
      redirect: true,
      heading: 'Important Clinical Support Prompt',
    },
  },
  phq9: {
    minimal: {
      reassurance:
        'Your responses suggest minimal depression symptoms right now. Continuing positive daily habits supports ongoing emotional well-being.',
      optInHeading: 'Preventive Wellness & Maintenance Exercises',
      optInSubheading: 'Gratitude reflection, daily mood tracking, sleep hygiene, and light movement.',
      exerciseIds: [
        'gratitude-mood-checkin',
        'sleep-hygiene-checklist',
        'sunlight-walk',
        'breathing-timer',
      ],
    },
    mild: {
      heading: 'Recommended Evidence-Based CBT Exercises for Mild Depression',
      subheading: 'Behavioral activation, automatic thought tracking, diaphragmatic breathing, and routine planning.',
      exerciseIds: [
        'activity-scheduler-mild',
        'thought-record',
        'breathing-timer',
        'daily-routine-planner',
        'social-connection-nudge',
      ],
    },
    moderate: {
      heading: 'Structured CBT Exercises for Moderate Depression',
      subheading: 'Activity scheduling with mastery/pleasure ratings, cognitive restructuring, problem solving, and guided mindfulness.',
      showClinicianNudge: true,
      exerciseIds: [
        'activity-scheduler-moderate',
        'thinking-traps-spotter',
        'problem-solving-worksheet',
        'body-scan-mindfulness',
        'self-compassion-break',
      ],
    },
    moderately_severe: {
      showClinicianNudge: true,
      heading: 'Graded Behavioral Activation & Low-Effort Micro-Steps',
      subheading:
        'Micro-task planning, basic biological needs checklist, sensory grounding, tiny activities, and pre-written reach-out scripts.',
      exerciseIds: [
        'micro-task-planner',
        'basic-needs-checklist',
        'grounding-54321',
        'activity-scheduler-graded',
        'reach-out-script',
      ],
    },
    severe: {
      showClinicianNudge: true,
      heading: 'Immediate Safety & Clinical Support Priority',
      subheading:
        'Professional care takes precedence. Gentle, low-demand safety and steadying exercises are provided below.',
      exerciseIds: [
        'coping-support-plan',
        'grounding-54321',
        'breathing-timer',
        'reach-out-script',
      ],
    },
  },
  insomnia: {
    minimal: {
      reassurance:
        'Your responses suggest no clinically significant insomnia right now. You can review healthy sleep hygiene habits.',
      optInHeading: 'Want to review healthy sleep habits anyway?',
      optInSubheading: 'A short checklist of habits that support restorative sleep.',
      exerciseIds: ['sleep-hygiene-checklist'],
    },
    mild: {
      heading: 'Recommended Exercises for Subthreshold Insomnia',
      subheading: 'Sleep habits, bedtime paced breathing, and sleep tracking based on CBT-I.',
      exerciseIds: ['sleep-hygiene-checklist', 'sleep-breathing-moon', 'sleep-diary'],
    },
    moderate: {
      heading: 'Targeted CBT-I Exercises for Moderate Insomnia',
      subheading:
        'Stimulus control rules, somatic relaxation, restructuring unhelpful sleep beliefs, and daily tracking.',
      exerciseIds: [
        'stimulus-control-guide',
        'muscle-relaxation',
        'sleep-thought-challenger',
        'sleep-diary',
      ],
    },
    severe: {
      redirect: true,
      heading: 'Important Clinical Support Prompt',
    },
  },
  ptsd: {
    minimal: {
      reassurance:
        'Your responses suggest few or no trauma-related symptoms right now. You can try an optional breathing exercise.',
      optInHeading: 'Want to try an optional calming exercise anyway?',
      optInSubheading: 'A short slow paced breathing exercise for calm and stress relief.',
      exerciseIds: ['breathing-timer'],
    },
    mild: {
      heading: 'Recommended Exercises for Mild Trauma-Related Symptoms',
      subheading: 'Learn how survival stress reactions work and practise sensory grounding skills.',
      exerciseIds: ['trauma-education-card', 'breathing-timer', 'grounding-54321'],
    },
    moderate: {
      heading: 'Recommended Exercises for Moderate Trauma-Related Symptoms',
      subheading: 'Sensory grounding, somatic relaxation, everyday balanced thinking, and a personal coping plan.',
      exerciseIds: [
        'grounding-54321',
        'muscle-relaxation',
        'balanced-thinking-check',
        'coping-support-plan',
      ],
    },
    severe: {
      showClinicianNudge: true,
      isStabilisationOnly: true,
      heading: 'Stabilisation & Grounding Tools for Severe Trauma Symptoms',
      subheading:
        'Gentle stabilisation, grounding in the present, sleep habits, and coping safety. These tools support steadiness between therapy sessions.',
      exerciseIds: [
        'trauma-education-card',
        'grounding-54321',
        'breathing-timer',
        'sleep-hygiene-checklist',
        'coping-support-plan',
      ],
    },
    extreme: {
      redirect: true,
      heading: 'Important Clinical Support Prompt',
    },
  },
  ocd: {
    minimal: {
      reassurance:
        'Your responses suggest few or no OCD-related symptoms right now. You can try an optional breathing exercise.',
      optInHeading: 'Want to try an optional calming exercise anyway?',
      optInSubheading: 'A short slow paced breathing exercise for nervous system regulation.',
      exerciseIds: ['breathing-timer'],
    },
    mild: {
      heading: 'Recommended Exercises for Mild OCD-Related Symptoms',
      subheading: 'Understand the OCD cycle, map your own triggers, and practise slow breathing.',
      exerciseIds: ['ocd-education-card', 'ocd-cycle-mapper', 'breathing-timer', 'activity-scheduler-mild'],
    },
    moderate: {
      heading: 'Targeted Exercises for Moderate OCD-Related Symptoms',
      subheading: 'Map obsessions and rituals, surf urges to delay compulsions, and build an early warning signs plan.',
      exerciseIds: [
        'ocd-cycle-mapper',
        'urge-surfing-timer',
        'muscle-relaxation',
        'ocd-warning-signs-plan',
      ],
    },
    severe: {
      showClinicianNudge: true,
      heading: 'Preparation & Structure Tools for Severe OCD Symptoms',
      subheading:
        'Map your cycles, construct an exposure hierarchy for your appointments, and practise urge surfing alongside clinical care.',
      exerciseIds: [
        'ocd-education-card',
        'ocd-cycle-mapper',
        'erp-hierarchy-builder',
        'urge-surfing-timer',
        'ocd-warning-signs-plan',
      ],
    },
    extreme: {
      redirect: true,
      heading: 'Important Clinical Support Prompt',
    },
  },
  adhd: {
    minimal: {
      reassurance:
        'Your responses indicate a low likelihood of adult ADHD symptoms right now. You can explore optional cognitive focus exercises below.',
      optInHeading: 'Want to try cognitive focus exercises anyway?',
      optInSubheading: 'Targeted exercises to train attention, task switching, and mental flexibility.',
      exerciseIds: ['flanker', 'trail-making'],
    },
    moderate: {
      showClinicianNudge: true,
      heading: 'Cognitive Enhancement & Executive Function Exercises',
      subheading:
        'Targeted cognitive tasks to train response inhibition, working memory updating, and sustained attention.',
      exerciseIds: ['stroop', 'go-no-go', 'n-back', 'cpt'],
    },
    severe: {
      redirect: true,
      heading: 'Important Clinical Support Prompt',
    },
  },
};

// Aliases matching specific clinical instrument names
CBT_EXERCISE_CONTENT.insomnia.none = CBT_EXERCISE_CONTENT.insomnia.minimal;
CBT_EXERCISE_CONTENT.ptsd.absent = CBT_EXERCISE_CONTENT.ptsd.minimal;
CBT_EXERCISE_CONTENT.ocd.subclinical = CBT_EXERCISE_CONTENT.ocd.minimal;
CBT_EXERCISE_CONTENT.adhd.low = CBT_EXERCISE_CONTENT.adhd.minimal;
CBT_EXERCISE_CONTENT.adhd.high = CBT_EXERCISE_CONTENT.adhd.severe;

export const EXERCISE_DEFINITIONS = {
  'breathing-timer': {
    id: 'breathing-timer',
    title: 'Slow Breathing',
    category: 'Relaxation & Regulation',
    type: 'interactive',
    basedOn: 'slow paced breathing',
    visual: 'BreathingOrb',
    steps: [
      'Settle into a comfortable posture with your shoulders dropped.',
      'Inhale gently through your nose for 4 seconds as the circle expands.',
      'Exhale slowly and smoothly through your mouth for 6 seconds as it contracts.',
      'Complete 6–8 gentle cycles without holding your breath.',
    ],
    shortDescription:
      'Gentle 4s inhale and 6s exhale without breath-holds to down-regulate the nervous system.',
    instructions: [
      'Find a comfortable posture and relax your shoulders and jaw.',
      'Breathe in slowly through your nose for 4 seconds.',
      'Breathe out slowly and smoothly through your mouth for 6 seconds.',
      'Stop anytime. If you feel dizzy, breathe normally.',
    ],
    componentName: 'BreathingTimer',
  },
  'grounding-54321': {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    category: 'Grounding Technique',
    type: 'interactive',
    basedOn: 'grounding technique',
    visual: 'SenseIcons',
    steps: [
      'Scan your physical environment with eyes open.',
      'Notice 5 things you see and 4 things you can physically touch.',
      'Notice 3 sounds you hear, 2 scents you notice, and 1 taste.',
      'You can say your answers out loud, in your head, or type them.',
    ],
    shortDescription:
      'Reconnect with your immediate surroundings across 5 sensory domains to anchor in the present moment.',
    instructions: [
      'Focus attention on your immediate physical surroundings with eyes open.',
      'You can say answers out loud or in your head (typing is optional).',
      'Step through all 5 senses to bring your nervous system back to safety.',
    ],
    componentName: 'GroundingForm',
  },
  'worry-decision-tree': {
    id: 'worry-decision-tree',
    title: 'Worry Decision Tree & Worry Time',
    category: 'Cognitive Restructuring',
    type: 'interactive',
    basedOn: 'CBT for GAD (worry decision tree, worry time/stimulus control)',
    visual: 'WorryTreeDiagram',
    steps: [
      'Write down a current worry weighing on your mind.',
      'Ask: "Is there something I can do about this right now or soon?"',
      'If yes: write one concrete next step and when you will do it.',
      'If no: postpone it to a scheduled 15-minute Worry Time slot and ground yourself.',
    ],
    shortDescription:
      'Distinguish actionable problems from hypothetical "what if" worries, schedule daily worry time, and ground yourself in the present.',
    instructions: [
      'Enter what you are worrying about.',
      'Decide whether this is a practical problem you can act on soon.',
      'Take action on practical worries, or postpone hypothetical worries to a daily worry slot.',
    ],
    componentName: 'WorryDecisionTree',
  },
  'muscle-relaxation': {
    id: 'muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    category: 'Somatic Relaxation',
    type: 'interactive',
    basedOn: 'Progressive Muscle Relaxation (Jacobson; Bernstein & Borkovec)',
    visual: 'BodyMap',
    steps: [
      'Rest comfortably and loosen tight clothing.',
      'Apply gentle tension (~70%) to a muscle group for 5 seconds.',
      'Release suddenly and notice the sensation of warmth and softness for 10–15 seconds.',
      'Skip any area that hurts, is injured, or feels uncomfortable.',
    ],
    shortDescription:
      'Step-by-step light tension (~70%) and complete release through major muscle groups with clear visual indicators.',
    instructions: [
      'Tense each muscle group gently (~70% effort) for 5 seconds without straining.',
      'Release completely and notice the physical contrast for 10–15 seconds.',
      'Skip any area that hurts or is injured.',
    ],
    componentName: 'MuscleRelaxationTimer',
  },
  'gratitude-mood-checkin': {
    id: 'gratitude-mood-checkin',
    title: 'Three Good Things + Mood Check-in',
    category: 'Positive Focus & Maintenance',
    type: 'interactive',
    basedOn: 'Three Good Things',
    visual: 'MoodThermometer',
    steps: [
      'Rate your current mood on a gentle visual scale.',
      'Identify 3 small things that went okay, felt comfortable, or brought a smile today.',
      'Reflect briefly on why each small thing occurred.',
      'Notice how attending to neutral or pleasant details affects your mindset.',
    ],
    shortDescription:
      'Positive psychology maintenance exercise: reflect on three small positive events and log your mood.',
    instructions: [
      'Log how you feel right now in a single tap.',
      'Note 3 small things that went okay or brought comfort today.',
      'Save your reflection to your clipboard if desired.',
    ],
    componentName: 'GratitudeMoodCheckin',
  },
  'activity-scheduler-mild': {
    id: 'activity-scheduler-mild',
    title: 'Behavioral Activation Planner (Mild)',
    category: 'Behavioral Activation',
    type: 'interactive',
    basedOn: 'Behavioral Activation',
    visual: 'CycleLoop',
    steps: [
      'Select 2–3 small manageable activities that offer pleasure or a sense of accomplishment.',
      'Rate your expected Pleasure and Mastery (0–10).',
      'Schedule them for specific times over the next 1–2 days.',
      'Notice how taking small actions reverses the withdrawal loop.',
    ],
    shortDescription:
      'Plan 2–3 uplifting activities, rate anticipated pleasure and mastery, and break low-momentum cycles.',
    instructions: [
      'Choose manageable activities that spark interest or comfort.',
      'Assign a specific day or time to build positive momentum.',
      'Rate Pleasure (0–10) and Mastery (0–10) for each activity.',
    ],
    componentName: 'ActivityScheduler',
    mode: 'mild',
  },
  'activity-scheduler-moderate': {
    id: 'activity-scheduler-moderate',
    title: 'Behavioral Activation Planner (Moderate)',
    category: 'Behavioral Activation',
    type: 'interactive',
    basedOn: 'Behavioral Activation',
    visual: 'CycleLoop',
    steps: [
      'Build a structured multi-day routine across the next 2–3 days.',
      'Include a mix of pleasurable activities and small daily responsibilities.',
      'Rate before-mood and after-mood, plus Pleasure and Mastery (0–10).',
      'Check items off as you accomplish them to rebuild daily structure.',
    ],
    shortDescription:
      'Structured 3-day activation planner with Pleasure and Mastery ratings (0–10) and before/after mood tracking.',
    instructions: [
      'Plan small, actionable steps across the upcoming 2–3 days.',
      'Rate anticipated Pleasure and Mastery (0–10).',
      'Track your mood before and after completing activities.',
    ],
    componentName: 'ActivityScheduler',
    mode: 'moderate',
  },
  'activity-scheduler-graded': {
    id: 'activity-scheduler-graded',
    title: 'Graded Behavioral Activation Planner',
    category: 'Behavioral Activation',
    type: 'interactive',
    basedOn: 'Behavioral Activation',
    visual: 'CycleLoop',
    steps: [
      'Pick maximum 1–2 low-demand activities per day.',
      'Define a "tiny version" (e.g. 5 minutes or 1 small step).',
      'Identify one barrier that could get in the way and a small fix for it.',
      'Rate Pleasure and Mastery (0–10) without pressure.',
    ],
    shortDescription:
      'Graded low-demand activation: 1–2 tiny 5-minute activities per day with barrier troubleshooting and 3-day monitoring.',
    instructions: [
      'Start very small with 1–2 micro activities (e.g. step outside for 5 min, drink a glass of water).',
      'Plan for obstacles: what could get in the way and what is a tiny workaround?',
      'Rate Pleasure and Mastery (0–10) upon completion.',
    ],
    componentName: 'ActivityScheduler',
    mode: 'graded',
  },
  'thinking-traps-spotter': {
    id: 'thinking-traps-spotter',
    title: 'Thinking Traps Spotter',
    category: 'Cognitive Restructuring',
    type: 'interactive',
    basedOn: 'cognitive distortions (Beck, Burns)',
    visual: 'TrapCards',
    steps: [
      'Learn 6 common thinking traps: all-or-nothing, catastrophizing, mind reading, emotional reasoning, "shoulds", and overgeneralizing.',
      'Practice spotting traps in 4 sample thoughts with gentle feedback.',
      'Try analyzing one of your own recurring thoughts.',
      'Notice that thoughts are mental events, not objective facts.',
    ],
    shortDescription:
      'Explore 6 common cognitive distortions, practice identifying them in everyday thoughts, and test one of your own.',
    instructions: [
      'Review definitions and examples of 6 common thinking traps.',
      'Tap which trap fits each sample thought (multiple traps can fit).',
      'Enter one of your own thoughts to identify its thinking trap.',
    ],
    componentName: 'ThinkingTrapsSpotter',
  },
  'thought-record': {
    id: 'thought-record',
    title: '7-Column Thought Record',
    category: 'Cognitive Restructuring',
    type: 'interactive',
    basedOn: 'Thought Record (Beck; Greenberger & Padesky)',
    visual: 'ThoughtRecordSteps',
    steps: [
      'Describe the situation and identify your mood and intensity (0–100%).',
      'Capture your automatic thought and rate how much you believe it (0–100%).',
      'Examine factual evidence for and against the thought.',
      'Formulate a balanced thought, re-rate belief %, and re-rate mood intensity.',
    ],
    shortDescription:
      'Standard 7-step CBT thought record with evidence testing, belief ratings, and before/after mood thermometer.',
    instructions: [
      'Step 1: Identify the trigger situation.',
      'Step 2: Note the emotion and rate intensity (0–100%).',
      'Step 3: Capture automatic thought and rate belief (0–100%).',
      'Step 4 & 5: Weigh factual evidence for and against.',
      'Step 6 & 7: Formulate a balanced alternative and re-rate your mood.',
    ],
    componentName: 'ThoughtRecordForm',
  },
  'problem-solving-worksheet': {
    id: 'problem-solving-worksheet',
    title: 'Problem-Solving Worksheet',
    category: 'Problem-Solving Therapy',
    type: 'interactive',
    basedOn: "Problem-Solving Therapy (D'Zurilla and Nezu)",
    visual: 'StaircaseSteps',
    steps: [
      'Step 1: Define one specific, manageable problem.',
      'Step 2: Set a realistic, concrete goal.',
      'Step 3: Brainstorm at least 3 possible options without judgment.',
      'Step 4: Weigh pros and cons and select the best option.',
      'Step 5: Write an action plan with timing and backup fixes.',
      'Step 6: Pick a review date to check how it went.',
    ],
    shortDescription:
      'Structured 6-step problem-solving sequence: problem definition, realistic goal, brainstorming, pros/cons, action plan, and review date.',
    instructions: [
      'Work through one specific problem step by step.',
      'Brainstorm multiple options before picking the most practical one.',
      'Formulate a concrete action plan with a review date.',
    ],
    componentName: 'ProblemSolvingWorksheet',
  },
  'sleep-hygiene-checklist': {
    id: 'sleep-hygiene-checklist',
    title: 'Sleep Hygiene Education Checklist',
    category: 'Sleep Habits',
    type: 'interactive',
    basedOn: 'sleep hygiene education',
    visual: 'BedroomFlow',
    steps: [
      'Review 8 evidence-based daytime and evening sleep habits.',
      'Check off habits you already follow or want to commit to today.',
      'Pick 1 or 2 small adjustments to focus on for the upcoming week.',
      'Keep changes gradual and consistent.',
    ],
    shortDescription:
      'Review and commit to 8 evidence-based sleep hygiene habits supporting restorative night sleep.',
    instructions: [
      'Review 8 evidence-based sleep hygiene practices.',
      'Commit to 1 or 2 changes to build gradually.',
      'Export or save your sleep commitments.',
    ],
    componentName: 'SleepHygieneChecklist',
  },
  'sleep-breathing-moon': {
    id: 'sleep-breathing-moon',
    title: 'Bedtime Moon Breathing',
    category: 'Relaxation & Regulation',
    type: 'interactive',
    basedOn: 'slow paced breathing',
    visual: 'BreathingOrb',
    steps: [
      'Settle into a comfortable resting posture in dim lighting.',
      'Breathe in slowly through your nose for 4 seconds as the moon glows.',
      'Breathe out gently through your mouth for 6 seconds without holding.',
      'Follow the rhythm for 2 minutes to transition your body toward sleep.',
    ],
    shortDescription:
      'Bedtime 4s inhale / 6s exhale moon breathing with soft ambient visuals and no breath-holds.',
    instructions: [
      'Dim lights and get into a resting posture.',
      'Follow the 4s inhale / 6s exhale moon rhythm.',
      'Stop anytime. If you feel dizzy, breathe normally.',
    ],
    componentName: 'SleepBreathingMoon',
  },
  'stimulus-control-guide': {
    id: 'stimulus-control-guide',
    title: 'Stimulus Control Bed & Wake Guide',
    category: 'Sleep Habits',
    type: 'interactive',
    basedOn: 'Stimulus Control (Bootzin, CBT-I)',
    visual: 'BedroomFlow',
    steps: [
      'Rule 1: Use bed only for sleep and intimacy.',
      'Rule 2: If you feel you have been awake roughly 15–20 minutes, get up. Do not watch the clock.',
      'Rule 3: Return to bed only when sleepy. Repeat getting up if awake again.',
      'Rule 4: Set the same alarm time 7 days a week, and avoid daytime naps.',
    ],
    shortDescription:
      'Bootzin CBT-I stimulus control protocol: break conditioned arousal, avoid clock-watching, and use a 15-minute practice timer.',
    instructions: [
      'Review the 5 core stimulus control rules.',
      'If awake in bed roughly 15–20 minutes, get up without clock-watching.',
      'Use the 15-minute timer for daytime practice only.',
    ],
    componentName: 'StimulusControlGuide',
  },
  'sleep-thought-challenger': {
    id: 'sleep-thought-challenger',
    title: 'Sleep Thought Challenger',
    category: 'Cognitive Restructuring',
    type: 'interactive',
    basedOn: 'cognitive restructuring for sleep beliefs (DBAS-style)',
    visual: 'ThoughtRecordSteps',
    steps: [
      'Select a common catastrophic sleep belief (e.g. "If I don\'t sleep 8 hours, my day is ruined").',
      'Examine objective evidence for and against the thought.',
      'Consider what compassionate advice you would give a friend.',
      'Formulate a realistic, reassuring alternative belief.',
    ],
    shortDescription:
      'DBAS-informed cognitive restructuring: challenge catastrophic sleep assumptions and reduce nighttime anticipatory anxiety.',
    instructions: [
      'Pick an unhelpful sleep worry or enter your own.',
      'Weigh factual evidence to dismantle worst-case beliefs.',
      'Draft a realistic, reassuring alternative view.',
    ],
    componentName: 'SleepThoughtChallenger',
  },
  'sleep-diary': {
    id: 'sleep-diary',
    title: 'Consensus Sleep Diary (7 Nights)',
    category: 'Tracking',
    type: 'interactive',
    basedOn: 'Consensus Sleep Diary',
    visual: 'ClockMoon',
    steps: [
      'Record bedtime and lights-out time.',
      'Log minutes to fall asleep and nighttime awakenings.',
      'Record final wake time, out-of-bed time, and sleep quality (1–5).',
      'Review sleep efficiency percentage and duration trends.',
    ],
    shortDescription:
      'Standard Consensus Sleep Diary logging bed time, lights-out, sleep latency, awakenings, wake time, out-of-bed time, and quality.',
    instructions: [
      'Fill in each night using the standard Consensus Sleep Diary fields.',
      'Calculate average sleep duration and sleep efficiency.',
      'Copy your 7-night summary to share with your healthcare provider.',
    ],
    componentName: 'SleepDiary',
  },
  'trauma-education-card': {
    id: 'trauma-education-card',
    title: 'Understanding Stress & Trauma Reactions',
    category: 'Education & Stabilisation',
    type: 'interactive',
    basedOn: 'trauma psychoeducation',
    visual: 'WindowOfTolerance',
    steps: [
      'Explore the Window of Tolerance model (hyperarousal, optimal zone, hypoarousal).',
      'Understand common survival responses following severe stress.',
      'Learn grounding techniques to return to the comfortable middle zone.',
      'Review clear signs of when to connect with trauma-focused specialists.',
    ],
    shortDescription:
      'Psychoeducation on trauma survival responses and the Window of Tolerance teaching model, focused on stabilisation and safety.',
    instructions: [
      'Explore the 4 key sections of trauma reaction psychoeducation.',
      'Observe the Window of Tolerance visual and grounding arrow.',
      'Stop anytime and exit to grounding or coping plan if overwhelmed.',
    ],
    componentName: 'TraumaEducationCard',
  },
  'balanced-thinking-check': {
    id: 'balanced-thinking-check',
    title: 'Everyday Balanced Thinking Check',
    category: 'Cognitive Skills',
    type: 'interactive',
    basedOn: 'cognitive distortions (Beck, Burns)',
    visual: 'TrapCards',
    steps: [
      'Focus strictly on everyday routine worries (do not describe or process trauma events).',
      'Identify which cognitive distortion is magnifying the everyday worry.',
      'Evaluate factual facts and draft a balanced reframe.',
    ],
    shortDescription:
      'Evaluate everyday routine thoughts and distortions (strictly not for trauma processing or exposure).',
    instructions: [
      'Focus only on everyday worries, never trauma memories.',
      'Identify thinking traps and weigh evidence.',
      'Draft a grounded, balanced perspective.',
    ],
    componentName: 'BalancedThinkingCheck',
  },
  'coping-support-plan': {
    id: 'coping-support-plan',
    title: 'Personal Coping & Support Plan',
    category: 'Stress Management & Safety',
    type: 'interactive',
    basedOn: 'safety/coping planning (Stanley–Brown style)',
    visual: 'StaircaseSteps',
    steps: [
      'Document your personalized early warning signs.',
      'List calming tools and grounding strategies that help you steady yourself.',
      'Record trusted friends or family contacts.',
      'Include your clinician/clinic info and emergency crisis helpline numbers.',
    ],
    shortDescription:
      'Stanley-Brown informed personal coping plan with warning signs, calming tools, support contacts, and crisis resources.',
    instructions: [
      'Identify personal warning signs of rising distress.',
      'List calming grounding tools and trusted contacts.',
      'Copy your completed plan for quick reference.',
    ],
    componentName: 'CopingSupportPlan',
  },
  'ocd-education-card': {
    id: 'ocd-education-card',
    title: 'Understanding Obsessions & Compulsions',
    category: 'Education',
    type: 'interactive',
    basedOn: 'OCD cognitive-behavioural model, functional analysis',
    visual: 'CycleLoop',
    steps: [
      'Learn how intrusive thoughts differ from everyday worries.',
      'Understand the 5-part OCD cycle: Trigger → Obsession → Anxiety → Compulsion → Temporary Relief.',
      'See why compulsions reinforce the cycle over time.',
      'Learn how evidence-based Exposure and Response Prevention (ERP) works with a therapist.',
    ],
    shortDescription:
      'Psychoeducation on obsessions, compulsions, the reinforcement loop, and evidence-based ERP treatment.',
    instructions: [
      'Learn how obsessions and compulsions interact.',
      'Understand the role of short-term relief in strengthening symptoms.',
      'Read about evidence-based clinical treatments (CBT & ERP).',
    ],
    componentName: 'OCDEducationCard',
  },
  'ocd-cycle-mapper': {
    id: 'ocd-cycle-mapper',
    title: 'OCD Cycle Mapper',
    category: 'Functional Analysis',
    type: 'interactive',
    basedOn: 'OCD cognitive-behavioural model, functional analysis',
    visual: 'CycleLoop',
    steps: [
      'Map your own example into 5 nodes: Trigger → Obsession → Anxiety/Discomfort → Compulsion → Short-term relief.',
      'Observe the animated loop showing how temporary relief strengthens the obsession.',
      'Examine the second habituation diagram: when the compulsion is delayed or resisted, anxiety rises, peaks, and naturally falls on its own.',
    ],
    shortDescription:
      'Interactive 5-node OCD cycle mapper and habituation curve showing natural anxiety reduction when compulsions are resisted.',
    instructions: [
      'Fill in your own example across the 5 nodes of the OCD cycle.',
      'Review how the compulsion keeps the loop alive.',
      'See how discomfort naturally subsides over time without performing rituals.',
    ],
    componentName: 'OCDCycleMapper',
  },
  'urge-surfing-timer': {
    id: 'urge-surfing-timer',
    title: 'Urge Surfing & Response Delay Timer',
    category: 'Mindfulness & Response Delay',
    type: 'interactive',
    basedOn: 'response delay and urge surfing used in ERP and mindfulness-based approaches',
    visual: 'WaveSurf',
    steps: [
      'Name the urge or compulsion and rate your current discomfort (0–100).',
      'Start a 5-minute delay timer (extendable to 10 or 15 minutes).',
      'Re-rate your discomfort every minute as the wave rises and peaks.',
      'Observe how urges rise, crest, and recede without needing to act on them.',
    ],
    shortDescription:
      'Mindfulness response delay tool: ride out urges with minute-by-minute discomfort ratings, wave animation, and tracking chart.',
    instructions: [
      'Practise on small, manageable triggers first.',
      'Notice the urge without fighting it or immediately acting on it.',
      'Re-rate discomfort each minute and review your habituation curve.',
      'Stop if overwhelmed; contact your clinician if delaying feels unsafe.',
    ],
    componentName: 'UrgeSurfingTimer',
  },
  'erp-hierarchy-builder': {
    id: 'erp-hierarchy-builder',
    title: 'ERP Fear Hierarchy Builder',
    category: 'Exposure Preparation',
    type: 'interactive',
    basedOn: 'ERP (Foa and Kozak; Meyer)',
    visual: 'ExposureLadder',
    steps: [
      'Add 6–12 feared triggers, situations, or intrusive thought scenarios.',
      'Rate expected distress (SUDS: 0–100) for each item.',
      'View auto-sorted hierarchy ladder from least distressing (bottom) to most distressing (top).',
      'Copy/export your ladder to bring directly to your appointment with an ERP therapist.',
    ],
    shortDescription:
      'Preparation ladder for clinical therapy: add 6–12 feared situations, rate expected distress (0–100), and auto-sort without self-exposure.',
    instructions: [
      'Add 6–12 feared situations and rate expected distress (0–100).',
      'Items automatically slot into the exposure ladder from lowest to highest.',
      'Bring this ladder to your trained ERP clinician for guided exposure planning.',
    ],
    componentName: 'ERPHierarchyBuilder',
  },
  'ocd-warning-signs-plan': {
    id: 'ocd-warning-signs-plan',
    title: 'OCD Warning Signs & Appointment Planner',
    category: 'Self-Management Plan',
    type: 'interactive',
    basedOn: 'relapse prevention and appointment prep',
    visual: 'StaircaseSteps',
    steps: [
      'Document early subtle symptom shifts and trigger situations.',
      'List constructive actions to take before symptoms intensify.',
      'Organize your questions and avoidance patterns for your therapist or psychiatrist.',
      'Copy your customized appointment brief to clipboard.',
    ],
    shortDescription:
      'Track early symptom shifts, identify worsening triggers, and formulate concrete discussion questions for clinical appointments.',
    instructions: [
      'Tab 1: Document early symptom shifts, worsening situations, and healthy actions to take.',
      'Tab 2: Organize symptoms, avoidance patterns, and questions for your doctor or therapist.',
      'Copy your customized plan to your clipboard for your records or upcoming appointment.',
    ],
    componentName: 'OCDWarningSignsPlan',
  },
  'flanker': {
    id: 'flanker',
    title: 'Eriksen Flanker Task',
    category: 'Attention & Interference Control',
    type: 'interactive',
    basedOn: 'Inhibitory Control & Selective Attention',
    visual: 'FlankerVisual',
    componentName: 'FlankerExercise',
    shortDescription:
      'Focus on the central target arrow while suppressing distracting flanking arrows pointing in congruent or conflicting directions.',
    instructions: [
      'Focus on the central target arrow in each array.',
      'Identify whether the center arrow points left or right.',
      'Ignore the flanking distractor arrows on either side.',
      'Maintain high speed and accuracy across rounds.',
    ],
    steps: [
      'Fixate on the center of the display area.',
      'Quickly identify the central arrow direction.',
      'Inhibit distraction from flanking side arrows.',
      'Review reaction accuracy and interference control.',
    ],
  },
  'trail-making': {
    id: 'trail-making',
    title: 'Trail Making Challenge',
    category: 'Cognitive Flexibility & Processing Speed',
    type: 'interactive',
    basedOn: 'Visual Attention & Task Switching',
    visual: 'TrailMakingVisual',
    componentName: 'TrailMakingExercise',
    shortDescription:
      'Sequentially connect alternating numbers and letters under timed conditions to practice mental set-shifting and scanning speed.',
    instructions: [
      'Locate circle 1 and connect it to letter A.',
      'Alternate between ascending numbers and letters (1-A-2-B-3-C...).',
      'Scan the screen efficiently to find the next target.',
      'Complete the sequence as quickly as possible without skipping.',
    ],
    steps: [
      'Scan the layout for target 1 and target A.',
      'Alternate numbers and letters in correct alphabetical and numerical order.',
      'Recover quickly if an incorrect target is selected.',
      'Track time to completion and error-free transitions.',
    ],
  },
  'stroop': {
    id: 'stroop',
    title: 'Stroop Color-Word Challenge',
    category: 'Response Inhibition',
    type: 'interactive',
    basedOn: 'Response Inhibition & Cognitive Control',
    visual: 'StroopVisual',
    componentName: 'StroopExercise',
    shortDescription:
      'Name the font/display color of words while inhibiting the automatic impulse to read the conflicting written color word.',
    instructions: [
      'Words will appear displaying color names printed in mismatched colors.',
      'Select the actual font color, NOT the written word itself.',
      'Suppress the automatic reading reflex to respond accurately.',
      'Strive for high accuracy and fast reaction times.',
    ],
    steps: [
      'Observe the color-word stimulus.',
      'Suppress the automatic habit to read the word text.',
      'Select the physical ink/display color.',
      'Review response latency and interference management.',
    ],
  },
  'go-no-go': {
    id: 'go-no-go',
    title: 'Go / No-Go Focus Challenge',
    category: 'Impulse Control & Sustained Attention',
    type: 'interactive',
    basedOn: 'Impulse Control & Sustained Attention',
    visual: 'GoNoGoVisual',
    componentName: 'GoNoGoExercise',
    shortDescription:
      'Rapidly respond to target stimuli (Go) while maintaining inhibitory restraint to withhold responses on distractor signals (No-Go).',
    instructions: [
      'Green signals indicate "Go" — respond immediately.',
      'Red signals indicate "No-Go" — hold back and do not respond.',
      'Signal timing will vary to challenge anticipation and impulse control.',
      'Balance prompt responding with strong inhibitory control.',
    ],
    steps: [
      'Watch the central stimulus cue.',
      'Respond immediately when the designated Go target appears.',
      'Inhibit motor response when a No-Go distractor appears.',
      'Track commission errors (false alarms) and omission rates.',
    ],
  },
  'n-back': {
    id: 'n-back',
    title: 'Working Memory Dual N-Back',
    category: 'Working Memory & Focus',
    type: 'interactive',
    basedOn: 'Working Memory Updating',
    visual: 'NBackVisual',
    componentName: 'NBackExercise',
    shortDescription:
      'Track stimuli presented sequentially and indicate when the current stimulus matches the one from N steps earlier.',
    instructions: [
      'A continuous sequence of items will appear one at a time.',
      'Remember the item shown N steps earlier (e.g., 2 steps back).',
      'Signal a match whenever the current item matches the item N positions back.',
      'Continuously update your mental buffer as new items arrive.',
    ],
    steps: [
      'Hold the initial sequence of N items in working memory.',
      'Compare each new item to the item N steps back.',
      'Signal matches accurately and drop older items from memory.',
      'Monitor working memory load and accuracy rates.',
    ],
  },
  'cpt': {
    id: 'cpt',
    title: 'Continuous Performance Test (CPT)',
    category: 'Sustained Attention & Vigilance',
    type: 'interactive',
    basedOn: 'Vigilance & Sustained Attention',
    visual: 'CptVisual',
    componentName: 'CptExercise',
    shortDescription:
      'Maintain vigilance and quick accuracy over an extended series of rapid stimulus flashes to assess and train sustained attention.',
    instructions: [
      'Letters will flash rapidly on screen one after another.',
      'Respond only when the target pattern appears (e.g., letter X following letter A).',
      'Ignore all other non-target letters and sequences.',
      'Stay alert and maintain consistent concentration throughout the session.',
    ],
    steps: [
      'Maintain steady visual fixation on the presentation window.',
      'Recognize the priming cue (letter A).',
      'Execute the response only when followed by the target (letter X).',
      'Track vigilance decline and sustained attentional stability.',
    ],
  },
  'sunlight-walk': {
    id: 'sunlight-walk',
    title: 'Light Movement & Sunlight Walk (10–15 min)',
    category: 'Circadian Rhythm & Light Movement',
    type: 'interactive',
    basedOn: 'Circadian neurobiology and behavioral activation',
    visual: 'CognitiveTaskVisual',
    componentName: 'SunlightWalkGuide',
    shortDescription:
      'Natural daylight exposure and gentle rhythmic pacing to regulate circadian rhythm, boost serotonin synthesis, and steady low energy.',
    instructions: [
      'Step outside into natural morning or midday daylight.',
      'Walk at a gentle, conversational pace without physical strain.',
      'Notice environmental sights and sounds to anchor present awareness.',
      'Complete 10 to 15 minutes of continuous gentle movement.',
    ],
    steps: [
      'Put on comfortable shoes and step outdoors.',
      'Begin steady rhythmic walking at an unhurried pace.',
      'Notice sunlight, ambient sounds, and footing.',
      'Conclude with three deep diaphragmatic breaths.',
    ],
  },
  'daily-routine-planner': {
    id: 'daily-routine-planner',
    title: 'Daily Routine Planner (Sleep, Meals, Movement)',
    category: 'Behavioral Activation & Routine',
    type: 'interactive',
    basedOn: 'Interpersonal and Social Rhythm Therapy (IPSRT)',
    visual: 'BedroomFlow',
    componentName: 'DailyRoutinePlanner',
    shortDescription:
      'Anchor core biological zeitgebers (wake time, meals, movement, bedtime) to stabilize circadian rhythms and counter depressive inertia.',
    instructions: [
      'Select a consistent planned wake time and bed time.',
      'Schedule regular intervals for three meals.',
      'Commit to one small pocket of physical movement.',
      'Copy your completed routine or check it off daily.',
    ],
    steps: [
      'Set target wake and sleep boundaries.',
      'Plan regular breakfast, lunch, and dinner times.',
      'Designate a movement window.',
      'Review and save routine commitments.',
    ],
  },
  'social-connection-nudge': {
    id: 'social-connection-nudge',
    title: 'Social Connection Nudge (Reach Out to One Person)',
    category: 'Social Engagement',
    type: 'interactive',
    basedOn: 'Behavioral activation and anti-isolation protocols',
    visual: 'CycleLoop',
    componentName: 'SocialConnectionNudge',
    shortDescription:
      'Counter depressive withdrawal by sending a micro, low-pressure message to one trusted person using pre-formulated templates.',
    instructions: [
      'Identify one friend, family member, or trusted contact.',
      'Select a low-effort, no-pressure message template.',
      'Customize or copy the text directly to your messaging app.',
      'Send the message and mark the connection as completed.',
    ],
    steps: [
      'Name your contact.',
      'Pick a gentle message template.',
      'Copy or edit the message.',
      'Send and acknowledge your step against isolation.',
    ],
  },
  'body-scan-mindfulness': {
    id: 'body-scan-mindfulness',
    title: 'Guided Mindfulness Body Scan (5–10 min)',
    category: 'Mindfulness & Somatic Grounding',
    type: 'interactive',
    basedOn: 'Mindfulness-Based Cognitive Therapy (MBCT)',
    visual: 'BodyMap',
    componentName: 'BodyScanMindfulness',
    shortDescription:
      'Step through areas of physical sensation to cultivate non-judgmental present-moment awareness and release somatic tension.',
    instructions: [
      'Rest in a comfortable position and close or soften your gaze.',
      'Direct attention sequentially from feet to crown of head.',
      'Notice physical sensations without needing to change them.',
      'Anchor in the sensation of breath whenever attention wanders.',
    ],
    steps: [
      'Settle posture and take steady natural breaths.',
      'Scan feet, legs, and pelvis.',
      'Scan abdomen, chest, shoulders, and face.',
      'Rest in whole-body awareness.',
    ],
  },
  'self-compassion-break': {
    id: 'self-compassion-break',
    title: 'Self-Compassion Break (Dr. Kristin Neff 3-Step)',
    category: 'Compassion-Focused Therapy',
    type: 'interactive',
    basedOn: 'Mindful Self-Compassion (Neff & Germer)',
    visual: 'MoodThermometer',
    componentName: 'SelfCompassionBreak',
    shortDescription:
      'Counter inner harshness, shame, and self-blame with evidence-based mindfulness, common humanity, and self-kindness.',
    instructions: [
      'Step 1 (Mindfulness): Acknowledge that this is a moment of suffering.',
      'Step 2 (Common Humanity): Remember that struggle is part of the shared human experience.',
      'Step 3 (Self-Kindness): Offer yourself the same supportive words you would give a loved friend.',
    ],
    steps: [
      'Acknowledge present distress without minimization.',
      'Recognize shared common humanity.',
      'Adopt a personalized compassionate phrase.',
      'Integrate the soothing touch and release tension.',
    ],
  },
  'micro-task-planner': {
    id: 'micro-task-planner',
    title: '"Smallest Possible Step" Micro-Task Planner',
    category: 'Behavioral Activation & Micro-Steps',
    type: 'interactive',
    basedOn: 'Graded task assignment and micro-activation',
    visual: 'StaircaseSteps',
    componentName: 'MicroTaskPlanner',
    shortDescription:
      'Deconstruct overwhelming daily chores into bite-sized 2–5 minute micro-actions that require minimal energy to initiate.',
    instructions: [
      'Review pre-loaded low-demand micro-tasks (1–3 minutes each).',
      'Add any tiny personal action you can do in 2 minutes.',
      'Check off items as completed to reverse depressive inertia.',
    ],
    steps: [
      'Select or add a micro-action.',
      'Execute the step for 2 minutes without judging total outcome.',
      'Check off and observe the completion.',
      'Rest or proceed with another micro-step.',
    ],
  },
  'basic-needs-checklist': {
    id: 'basic-needs-checklist',
    title: 'Basic-Needs Grounding Checklist',
    category: 'Biological Baseline & Stabilization',
    type: 'interactive',
    basedOn: 'Biological stabilization in acute distress',
    visual: 'BodyMap',
    componentName: 'BasicNeedsChecklist',
    shortDescription:
      'Quick biological baseline check: systematically audit hydration, food, medication, daylight, and physical rest.',
    instructions: [
      'Check in on your core physiological needs: water, food, meds, light, posture.',
      'Address any unmet fundamental need before tackling complex emotional tasks.',
      'Mark off all items checked and complete session.',
    ],
    steps: [
      'Audit hydration and nutrition status.',
      'Confirm daily medication / vitamins.',
      'Check exposure to natural daylight.',
      'Commit to one immediate baseline adjustment.',
    ],
  },
  'reach-out-script': {
    id: 'reach-out-script',
    title: 'Reach-Out & "Tell Someone" Support Scripts',
    category: 'Safety & Social Support',
    type: 'interactive',
    basedOn: 'Social safety planning and communication support',
    visual: 'CognitiveTaskVisual',
    componentName: 'ReachOutScript',
    shortDescription:
      'Pre-written, customizable message templates to help you communicate with family, friends, or coworkers when finding words feels impossible.',
    instructions: [
      'Select the scenario that best reflects your current situation.',
      'Copy the pre-formulated message in one click.',
      'Paste into your messaging or email app to reach a trusted person.',
      'Mark as sent to reinforce connection.',
    ],
    steps: [
      'Choose a recipient category.',
      'Read and select the appropriate script.',
      'Copy text to clipboard.',
      'Send and acknowledge your support outreach.',
    ],
  },
};
