export const PCL5_ASSESSMENT_TYPE = 'PCL-5 PTSD Checklist for DSM-5';
export const PCL5_DISORDER_SLUG = 'ptsd';

export const PCL5_INTRO =
  'Below is a list of problems that people sometimes have in response to a very stressful experience. Keeping your worst event in mind, please read each problem carefully and select how much you have been bothered by that problem in the past month.';

export const PCL5_HEADING = 'In the past month, how much were you bothered by:';

export const PCL5_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'A little bit' },
  { value: 2, label: 'Moderately' },
  { value: 3, label: 'Quite a bit' },
  { value: 4, label: 'Extremely' },
];

export const PCL5_QUESTIONS = [
  {
    id: 1,
    cluster: 'B',
    clusterName: 'Intrusion',
    text: 'Repeated, disturbing, and unwanted memories of the stressful experience?',
  },
  {
    id: 2,
    cluster: 'B',
    clusterName: 'Intrusion',
    text: 'Repeated, disturbing dreams of the stressful experience?',
  },
  {
    id: 3,
    cluster: 'B',
    clusterName: 'Intrusion',
    text: 'Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?',
  },
  {
    id: 4,
    cluster: 'B',
    clusterName: 'Intrusion',
    text: 'Feeling very upset when something reminded you of the stressful experience?',
  },
  {
    id: 5,
    cluster: 'B',
    clusterName: 'Intrusion',
    text: 'Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?',
  },
  {
    id: 6,
    cluster: 'C',
    clusterName: 'Avoidance',
    text: 'Avoiding memories, thoughts, or feelings related to the stressful experience?',
  },
  {
    id: 7,
    cluster: 'C',
    clusterName: 'Avoidance',
    text: 'Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?',
  },
  {
    id: 8,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Trouble remembering important parts of the stressful experience?',
  },
  {
    id: 9,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?',
  },
  {
    id: 10,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Blaming yourself or someone else for the stressful experience or what happened after it?',
  },
  {
    id: 11,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Having strong negative feelings such as fear, horror, anger, guilt, or shame?',
  },
  {
    id: 12,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Loss of interest in activities that you used to enjoy?',
  },
  {
    id: 13,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Feeling distant or cut off from other people?',
  },
  {
    id: 14,
    cluster: 'D',
    clusterName: 'Negative cognition/mood',
    text: 'Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?',
  },
  {
    id: 15,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Irritable behavior, angry outbursts, or acting aggressively?',
  },
  {
    id: 16,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Taking too many risks or doing things that could cause you harm?',
  },
  {
    id: 17,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Being "superalert" or watchful or on guard?',
  },
  {
    id: 18,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Feeling jumpy or easily startled?',
  },
  {
    id: 19,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Having difficulty concentrating?',
  },
  {
    id: 20,
    cluster: 'E',
    clusterName: 'Arousal/reactivity',
    text: 'Trouble falling or staying asleep?',
  },
];

export const PROBABLE_PTSD_CUTOFF = 33;

export const PCL5_CLUSTER_B_MAX = 20;
export const PCL5_CLUSTER_C_MAX = 8;
export const PCL5_CLUSTER_D_MAX = 28;
export const PCL5_CLUSTER_E_MAX = 24;
export const PCL5_TOTAL_MAX = 80;
