export const ASRS_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very Often' },
];

export const ASRS_PART_A_QUESTIONS = [
  {
    id: 1,
    text: 'Trouble wrapping up the final details of a project, once the challenging parts have been done',
  },
  {
    id: 2,
    text: 'Difficulty getting things in order when a task requires organization',
  },
  {
    id: 3,
    text: 'Problems remembering appointments or obligations',
  },
  {
    id: 4,
    text: 'When a task requires a lot of thought, how often do you avoid or delay getting started',
  },
  {
    id: 5,
    text: 'Fidget or squirm with hands or feet when you have to sit down for a long time',
  },
  {
    id: 6,
    text: 'Feel overly active and compelled to do things, like driven by a motor',
  },
];

export const ASRS_PART_B_QUESTIONS = [
  {
    id: 7,
    text: 'Careless mistakes on a boring or difficult project',
  },
  {
    id: 8,
    text: 'Difficulty keeping attention on boring or repetitive work',
  },
  {
    id: 9,
    text: 'Difficulty concentrating on what people say, even when spoken to directly',
  },
  {
    id: 10,
    text: 'Misplace or have difficulty finding things at home or at work',
  },
  {
    id: 11,
    text: 'Distracted by activity or noise around you',
  },
  {
    id: 12,
    text: 'Leave your seat in meetings or situations where remaining seated is expected',
  },
  {
    id: 13,
    text: 'Feel restless or fidgety',
  },
  {
    id: 14,
    text: 'Difficulty unwinding and relaxing when you have time to yourself',
  },
  {
    id: 15,
    text: 'Find yourself talking too much in social situations',
  },
  {
    id: 16,
    text: "Finish other people's sentences before they can finish them",
  },
  {
    id: 17,
    text: 'Difficulty waiting your turn when turn-taking is required',
  },
  {
    id: 18,
    text: 'Interrupt others when they are busy',
  },
];

export const ASRS_QUESTIONS = [...ASRS_PART_A_QUESTIONS, ...ASRS_PART_B_QUESTIONS];

export const ASRS_INTRO =
  'Please answer the questions below, rating yourself on each criterion based on how you have felt and conducted yourself over the past 6 months.';

export const ASRS_ASSESSMENT_TYPE = 'ASRS-v1.1 Adult ADHD Self-Report Scale';
export const ASRS_DISORDER_SLUG = 'adhd';

export const ASRS_PART_A_MAX = 24;
export const ASRS_PART_B_MAX = 48;
export const ASRS_TOTAL_MAX = 72;
