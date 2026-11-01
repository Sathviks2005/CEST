export const YBOCS_ASSESSMENT_TYPE = 'Y-BOCS Yale-Brown Obsessive Compulsive Scale';
export const YBOCS_DISORDER_SLUG = 'ocd';

export const YBOCS_INTRO =
  'Think about the times when these symptoms were at their worst in the last 3-6 months (including today), and select one answer for each question.';

export const YBOCS_OBSESSION_QUESTIONS = [
  {
    id: 1,
    title: 'TIME OCCUPIED BY OBSESSIVE THOUGHTS',
    text: 'How much of your time was occupied by obsessive thoughts? How frequently did these thoughts occur?',
    options: [
      { value: 0, label: 'None' },
      { value: 1, label: 'Less than 1 hour per day, or occasional intrusions (occur no more than 8 times a day)' },
      { value: 2, label: '1-3 hours per day, or frequent intrusions (most hours of the day are free of obsessions)' },
      { value: 3, label: 'More than 3 hours and up to 8 hours per day, or very frequent intrusions' },
      { value: 4, label: 'More than 8 hours per day, or near-constant intrusions' },
    ],
  },
  {
    id: 2,
    title: 'INTERFERENCE DUE TO OBSESSIVE THOUGHTS',
    text: "How much did these thoughts interfere with your social or work functioning? Is there anything that you didn't do because of them?",
    options: [
      { value: 0, label: 'No interference' },
      { value: 1, label: 'Mild, slight interference with social or occupational performance, but still performance not impaired' },
      { value: 2, label: 'Moderate, definitive interference with social or occupational performance, but still manageable' },
      { value: 3, label: 'Severe interference, causes substantial impairment in social or occupational performance' },
      { value: 4, label: 'Extreme, incapacitating interference' },
    ],
  },
  {
    id: 3,
    title: 'DISTRESS ASSOCIATED WITH OBSESSIVE THOUGHTS',
    text: 'How much distress did your obsessive thoughts cause you?',
    options: [
      { value: 0, label: 'None' },
      { value: 1, label: 'Mild, infrequent, and not too disturbing distress' },
      { value: 2, label: 'Moderate, frequent, and disturbing distress, but still manageable' },
      { value: 3, label: 'Severe, very frequent, and very disturbing distress' },
      { value: 4, label: 'Extreme, near-constant, and disabling distress' },
    ],
  },
  {
    id: 4,
    title: 'RESISTANCE AGAINST OBSESSIONS',
    text: 'How much effort did you make to resist the obsessive thoughts? How often did you try to disregard or turn your attention away from those thoughts as they entered your mind?',
    options: [
      { value: 0, label: 'I made an effort to always resist (or the obsessions are so minimal that there is no need to actively resist them)' },
      { value: 1, label: 'I tried to resist most of the time (e.g. more than half the time I tried to resist)' },
      { value: 2, label: 'I made some effort to resist' },
      { value: 3, label: 'I allowed all obsessions to fill my mind without attempting to control them, but I did so with some reluctance' },
      { value: 4, label: 'I completely and willingly gave in to all obsessions' },
    ],
  },
  {
    id: 5,
    title: 'DEGREES OF CONTROL OVER OBSESSIVE THOUGHTS',
    text: 'How much control did you have over your obsessive thoughts? How successful were you in stopping or diverting your obsessive thinking?',
    options: [
      { value: 0, label: 'Complete control' },
      { value: 1, label: 'Much control; usually I could stop or divert obsessions with some effort and concentration' },
      { value: 2, label: 'Moderate control; sometimes I could stop or divert obsessions' },
      { value: 3, label: 'Little control; I was rarely successful in stopping obsessions and could only divert attention with great difficulty' },
      { value: 4, label: 'No control; I was rarely able to even momentarily ignore the obsessions' },
    ],
  },
];

export const YBOCS_COMPULSION_QUESTIONS = [
  {
    id: 6,
    title: 'TIME SPENT PERFORMING COMPULSIVE BEHAVIORS',
    text: 'How much time did you spend performing compulsive behaviors? How frequently did you perform compulsions?',
    options: [
      { value: 0, label: 'None' },
      { value: 1, label: 'Less than 1 hour per day was spent performing compulsions, or occasional performance of compulsive behaviors (no more than 8 times per day)' },
      { value: 2, label: '1-3 hours per day was spent performing compulsions, or frequent performance of compulsive behaviors (most hours were free of compulsions)' },
      { value: 3, label: 'More than 3 hours and up to 8 hours per day were spent performing compulsions, or very frequent performance of compulsive behaviors (during most hours of the day)' },
      { value: 4, label: 'More than 8 hours were spent performing compulsions, or near-constant performance of compulsive behaviors (hour rarely passes without several compulsions being performed)' },
    ],
  },
  {
    id: 7,
    title: 'INTERFERENCE DUE TO COMPULSIVE BEHAVIORS',
    text: 'How much did your compulsive behaviors interfere with your social or work functioning?',
    options: [
      { value: 0, label: 'No interference' },
      { value: 1, label: 'Mild, slight interference with social or occupational activities, but overall performance not impaired' },
      { value: 2, label: 'Moderate, definite interference with social or occupational performance, but still manageable' },
      { value: 3, label: 'Severe interference, substantial impairment in social or occupational performance' },
      { value: 4, label: 'Extreme, incapacitating interference' },
    ],
  },
  {
    id: 8,
    title: 'DISTRESS ASSOCIATED WITH COMPULSIVE BEHAVIORS',
    text: 'How would you have felt if prevented from performing your compulsions? How anxious would you have become?',
    options: [
      { value: 0, label: 'Not at all anxious' },
      { value: 1, label: 'Only slightly anxious if compulsions prevented' },
      { value: 2, label: 'Anxiety would mount but remain manageable if compulsions prevented' },
      { value: 3, label: 'Prominent and very disturbing increase in anxiety if compulsions interrupted' },
      { value: 4, label: 'Extreme, incapacitating anxiety from any intervention aimed at reducing the compulsions' },
    ],
  },
  {
    id: 9,
    title: 'RESISTANCE',
    text: 'How much effort did you make to resist the compulsions? Or how often did you try to stop the compulsions?',
    options: [
      { value: 0, label: 'I made effort to always resist (or the symptoms were so minimal that there was no need to actively resist them)' },
      { value: 1, label: 'I tried to resist most of the time (e.g. more than half the time)' },
      { value: 2, label: 'I made some effort to resist' },
      { value: 3, label: 'I yielded to almost all compulsions without attempting to control them, but I did so with some reluctance' },
      { value: 4, label: 'I completely and willingly yielded to all compulsions' },
    ],
  },
  {
    id: 10,
    title: 'DEGREES OF CONTROL OVER COMPULSIVE BEHAVIORS',
    text: 'How much control did you have over the compulsive behaviors? How successful were you in stopping the ritual(s)?',
    options: [
      { value: 0, label: 'I had complete control' },
      { value: 1, label: 'Usually I could stop compulsions or rituals with some effort and willpower' },
      { value: 2, label: 'Sometimes I could stop compulsive behaviors, but only with difficulty' },
      { value: 3, label: 'I could only delay the compulsive behaviors, but eventually they had to be carried out to completion' },
      { value: 4, label: 'I was rarely able to even momentarily delay performing the compulsive behaviors' },
    ],
  },
];

export const YBOCS_INSIGHT_QUESTIONS = [
  {
    id: 11,
    title: 'INSIGHT INTO OBSESSIONS AND COMPULSIONS',
    text: 'Do you think your obsessions or compulsions are reasonable or rational? Would there be anything besides anxiety to worry about if you resisted them? Do you think something would really happen?',
    unscored: true,
    options: [
      { value: 0, label: 'I think my obsessions or compulsions are unreasonable or excessive' },
      { value: 1, label: "I think my obsessions or compulsions are unreasonable or excessive, but I'm not completely convinced that they aren't necessary" },
      { value: 2, label: 'I think my obsessions or compulsions may be unreasonable or excessive' },
      { value: 3, label: "I don't think my obsessions or compulsions are unreasonable or excessive" },
      { value: 4, label: 'I am sure my obsessions or compulsions are reasonable, no matter what anyone says' },
    ],
  },
];

export const YBOCS_QUESTIONS = [
  ...YBOCS_OBSESSION_QUESTIONS,
  ...YBOCS_COMPULSION_QUESTIONS,
  ...YBOCS_INSIGHT_QUESTIONS,
];

export const YBOCS_OBSESSION_MAX = 20;
export const YBOCS_COMPULSION_MAX = 20;
export const YBOCS_TOTAL_MAX = 40;
