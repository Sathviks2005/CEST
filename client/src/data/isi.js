export const ISI_ASSESSMENT_TYPE = 'ISI Insomnia Severity Index';
export const ISI_DISORDER_SLUG = 'insomnia';

export const ISI_INTRO =
  'Please answer the following questions regarding your sleep habits and sleep difficulties over the last 2 weeks.';

export const ISI_ITEM_KEYS = ['1a', '1b', '1c', '2', '3', '4', '5'];

export const ISI_Q1_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Mild' },
  { value: 2, label: 'Moderate' },
  { value: 3, label: 'Severe' },
  { value: 4, label: 'Very Severe' },
];

export const ISI_Q1_SUBITEMS = [
  { id: '1a', label: '1a. Difficulty falling asleep' },
  { id: '1b', label: '1b. Difficulty staying asleep' },
  { id: '1c', label: '1c. Problem waking up too early' },
];

export const ISI_QUESTIONS = [
  {
    id: '1',
    isCompound: true,
    prompt: 'Please rate the current (i.e., last 2 weeks) SEVERITY of your insomnia problem(s).',
    subItems: ISI_Q1_SUBITEMS,
    options: ISI_Q1_OPTIONS,
  },
  {
    id: '2',
    isCompound: false,
    text: 'How SATISFIED/dissatisfied are you with your current sleep pattern?',
    options: [
      { value: 0, label: 'Very Satisfied' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: 'Very Dissatisfied' },
    ],
  },
  {
    id: '3',
    isCompound: false,
    text: 'To what extent do you consider your sleep problem to INTERFERE with your daily functioning (e.g. daytime fatigue, ability to function at work/daily chores, concentration, memory, mood, etc.).',
    options: [
      { value: 0, label: 'Not at all Interfering' },
      { value: 1, label: 'A Little' },
      { value: 2, label: 'Somewhat' },
      { value: 3, label: 'Much' },
      { value: 4, label: 'Very Much Interfering' },
    ],
  },
  {
    id: '4',
    isCompound: false,
    text: 'How NOTICEABLE to others do you think your sleeping problem is in terms of impairing the quality of your life?',
    options: [
      { value: 0, label: 'Not at all Noticeable' },
      { value: 1, label: 'Barely' },
      { value: 2, label: 'Somewhat' },
      { value: 3, label: 'Much' },
      { value: 4, label: 'Very Much Noticeable' },
    ],
  },
  {
    id: '5',
    isCompound: false,
    text: 'How WORRIED/distressed are you about your current sleep problem?',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'A Little' },
      { value: 2, label: 'Somewhat' },
      { value: 3, label: 'Much' },
      { value: 4, label: 'Very Much' },
    ],
  },
];

export const ISI_TOTAL_MAX = 28;
