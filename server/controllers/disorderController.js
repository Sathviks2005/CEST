const Disorder = require('../models/Disorder');

// Seed disorders dataset
const disordersSeed = [
  {
    slug: 'depression',
    name: 'Depression',
    category: 'Mood Disorder',
    iconName: 'FaCloudRain',
    shortDescription: 'Persistent feelings of sadness, fatigue, loss of interest, and difficulty experiencing joy.',
    definition: 'Depression (Major Depressive Disorder) is a common and serious medical illness that negatively affects how you feel, the way you think, and how you act.',
    symptoms: ['Persistent depressed mood', 'Loss of interest in hobbies', 'Changes in sleep & appetite', 'Low energy & fatigue', 'Difficulty concentrating'],
    causes: ['Brain chemistry imbalances', 'Genetics', 'Environmental stressors', 'Chronic pain or medical conditions'],
    riskFactors: ['Family history of mood disorders', 'Traumatic stress events', 'Substance abuse', 'Social isolation'],
    commonSigns: ['Social withdrawal', 'Unexplained irritability', 'Sleep pattern shifts', 'Reduced work or academic performance'],
    importanceOfEarlyDetection: 'Early identification prevents worsening cognitive impact, speeds recovery, and minimizes social & occupational impairment.',
    cognitiveEnhancementSupport: [
      { title: 'Behavioral Activation', description: 'Structured scheduling of rewarding cognitive and daily activities.' },
      { title: 'Working Memory Training', description: 'Exercises aimed at improving executive focus and mental speed.' }
    ]
  },
  {
    slug: 'generalized-anxiety-disorder',
    name: 'Generalized Anxiety Disorder',
    category: 'Anxiety Disorder',
    iconName: 'FaExclamationTriangle',
    shortDescription: 'Excessive, uncontrollable worry regarding daily situations and future events.',
    definition: 'Generalized Anxiety Disorder (GAD) involves persistent, excessive, and unrealistic worry about everyday activities or events.',
    symptoms: ['Restlessness or edge feeling', 'Muscle tension', 'Difficulty concentrating', 'Sleep disturbances'],
    causes: ['Amgylada hyperreactivity', 'Genetic predisposition', 'Chronic stress exposure'],
    riskFactors: ['Personality traits like neuroticism', 'Childhood trauma', 'Chronic health issues'],
    commonSigns: ['Constant overthinking', 'Reassurance seeking', 'Physical fatigue'],
    importanceOfEarlyDetection: 'Early intervention reduces physical stress markers and prevents progression into panic or severe avoidance.',
    cognitiveEnhancementSupport: [
      { title: 'Cognitive Reframing', description: 'Structured cognitive exercises to identify and neutralize catastrophic thinking.' },
      { title: 'Mindfulness & Focus Training', description: 'Attentional bias modification to anchor focus on present tasks.' }
    ]
  },
  {
    slug: 'ocd',
    name: 'Obsessive-Compulsive Disorder',
    category: 'Anxiety / Obsessive Spectrum',
    iconName: 'FaSync',
    shortDescription: 'Intrusive repetitive thoughts (obsessions) followed by ritualistic behaviors (compulsions).',
    definition: 'Obsessive-Compulsive Disorder (OCD) features a pattern of unwanted thoughts and fears (obsessions) that lead you to do repetitive behaviors (compulsions).',
    symptoms: ['Fear of contamination', 'Need for symmetry', 'Repetitive checking', 'Excessive washing or counting'],
    causes: ['Cortico-striato-thalamo-cortical circuit dysregulation', 'Genetic factors'],
    riskFactors: ['Family history of OCD', 'Stressful life triggers'],
    commonSigns: ['Rigid routines', 'Excessive time spent checking locks/appliances', 'Intensive cleaning rituals'],
    importanceOfEarlyDetection: 'Timely support reduces ritual rigidity and restores cognitive flexibility for daily productivity.',
    cognitiveEnhancementSupport: [
      { title: 'Inhibitory Control Exercises', description: 'Tasks designed to enhance response inhibition and cognitive flexibility.' },
      { title: 'Cognitive Shift Training', description: 'Mental switching games that train adaptive focus allocation.' }
    ]
  },
  {
    slug: 'ptsd',
    name: 'Post-Traumatic Stress Disorder',
    category: 'Trauma & Stressor-Related',
    iconName: 'FaShieldAlt',
    shortDescription: 'Stress response triggered by experiencing or witnessing terrifying events.',
    definition: 'PTSD is a psychiatric disorder that may occur in people who have experienced or witnessed a traumatic event.',
    symptoms: ['Flashbacks & intrusive memories', 'Hypervigilance', 'Avoidance of trauma reminders', 'Negative mood shifts'],
    causes: ['Severe physical or emotional trauma', 'Neurological stress overload'],
    riskFactors: ['Occupational trauma exposure', 'Lack of social support', 'Prior trauma history'],
    commonSigns: ['Exaggerated startle response', 'Nightmares', 'Emotional numbness'],
    importanceOfEarlyDetection: 'Early diagnosis protects hippocampal volume and mitigates long-term autonomic nervous system strain.',
    cognitiveEnhancementSupport: [
      { title: 'Emotional Regulation Modules', description: 'Biofeedback and grounding cognitive protocols.' },
      { title: 'Memory Reconsolidation Support', description: 'Cognitive organization techniques for trauma memory processing.' }
    ]
  },
  {
    slug: 'adhd',
    name: 'ADHD',
    category: 'Neurodevelopmental',
    iconName: 'FaBolt',
    shortDescription: 'Patterns of inattention, hyperactivity, and impulsivity impacting executive function.',
    definition: 'Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder marked by an ongoing pattern of inattention and/or hyperactivity-impulsivity.',
    symptoms: ['Difficulty sustaining focus', 'Disorganization', 'Impulsive decisions', 'Fidgeting & restlessness'],
    causes: ['Dopaminergic system variance', 'Hereditary genetic traits', 'Frontal lobe connectivity variations'],
    riskFactors: ['Premature birth', 'Environmental exposure', 'Genetics'],
    commonSigns: ['Frequent loss of items', 'Difficulty finishing tasks', 'Time blindness'],
    importanceOfEarlyDetection: 'Allows early executive function coaching, improving academic, career, and interpersonal outcomes.',
    cognitiveEnhancementSupport: [
      { title: 'Executive Function Training', description: 'Targeted working memory, organization, and planning exercises.' },
      { title: 'Sustained Attention Games', description: 'Interactive focus challenges to strengthen mental stamina.' }
    ]
  },
  {
    slug: 'insomnia',
    name: 'Insomnia Disorder',
    category: 'Sleep-Wake Disorder',
    iconName: 'FaMoon',
    shortDescription: 'Persistent difficulty falling asleep, staying asleep, or achieving restful sleep quality.',
    definition: 'Insomnia is a common sleep disorder that can make it hard to fall asleep, hard to stay asleep, or cause you to wake up too early.',
    symptoms: ['Difficulty falling asleep', 'Waking up during the night', 'Daytime sleepiness', 'Irritability & brain fog'],
    causes: ['Circadian rhythm disruption', 'Hyperarousal', 'Poor sleep hygiene', 'Stress'],
    riskFactors: ['Shift work', 'High stress environments', 'Chronic pain'],
    commonSigns: ['Reliance on caffeine', 'Frequent nighttime clock-watching', 'Fatigue-related errors'],
    importanceOfEarlyDetection: 'Restores healthy sleep architecture, essential for memory consolidation and neuroplasticity.',
    cognitiveEnhancementSupport: [
      { title: 'Cognitive Sleep Restructuring', description: 'CBT-I aligned cognitive exercises to reduce pre-sleep worry.' },
      { title: 'Relaxation Protocol Training', description: 'Autonomic nervous system soothing techniques.' }
    ]
  }
];

// @desc    Get all disorders
// @route   GET /api/disorders
// @access  Public
const getDisorders = async (req, res, next) => {
  try {
    try {
      const disorders = await Disorder.find({});
      if (disorders && disorders.length > 0) {
        return res.json({ success: true, count: disorders.length, data: disorders });
      }
    } catch (dbErr) {
      // DB offline
    }

    res.json({ success: true, count: disordersSeed.length, data: disordersSeed });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single disorder by slug
// @route   GET /api/disorders/:slug
// @access  Public
const getDisorderBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    try {
      const disorder = await Disorder.findOne({ slug });
      if (disorder) {
        return res.json({ success: true, data: disorder });
      }
    } catch (dbErr) {
      // DB offline
    }

    const item = disordersSeed.find((d) => d.slug === slug);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Disorder not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDisorders, getDisorderBySlug, disordersSeed };
