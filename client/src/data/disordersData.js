export const disordersData = [
  {
    id: '1',
    slug: 'depression',
    name: 'Depression',
    category: 'Mood Disorder',
    iconName: 'FaCloudRain',
    shortDescription: 'Persistent sadness, fatigue, loss of interest, and executive function impairment.',
    definition: 'Depression (Major Depressive Disorder) is a mental health condition characterized by persistent feelings of sadness, helplessness, and a loss of interest in activities once enjoyed. Beyond emotional pain, depression causes cognitive alterations in working memory, decision-making speed, and processing focus.',
    symptoms: [
      'Persistent sad, anxious, or empty mood',
      'Loss of interest or pleasure in activities',
      'Fatigue and decreased energy levels',
      'Difficulty concentrating, remembering, or making decisions',
      'Changes in sleep patterns (insomnia or hypersomnia)',
      'Restlessness or slowed physical response times'
    ],
    causes: [
      'Neurochemical imbalances involving serotonin, norepinephrine, and dopamine',
      'Genetic vulnerability and family history',
      'Chronic medical illnesses or neurological factors',
      'Environmental stressors, prolonged grief, or major life shifts'
    ],
    riskFactors: [
      'History of trauma or severe chronic stress',
      'Co-occurring substance use disorders',
      'Low social support networks',
      'Personality traits such as high self-criticism or pessimism'
    ],
    commonSigns: [
      'Withdrawal from social interactions and workplace meetings',
      'Unexplained physical aches, pain, or digestive problems',
      'Neglecting personal self-care and daily organization',
      'Expressions of worthlessness or guilt'
    ],
    importanceOfEarlyDetection: 'Early identification prevents neurocognitive degradation, mitigates social isolation, and significantly increases the success rate of therapeutic and cognitive enhancement strategies.',
    cognitiveEnhancementSupport: [
      {
        title: 'Behavioral Activation & Pacing',
        description: 'Guided structured scheduling of rewarding micro-goals to restore dopamine reward pathways.'
      },
      {
        title: 'Working Memory Training',
        description: 'Interactive exercises designed to improve information holding capacity and attentional stamina.'
      },
      {
        title: 'Cognitive Restructuring',
        description: 'Reframing automatic negative thought loops using evidence-based cognitive protocols.'
      }
    ]
  },
  {
    id: '2',
    slug: 'generalized-anxiety-disorder',
    name: 'Generalized Anxiety Disorder',
    category: 'Anxiety Disorder',
    iconName: 'FaExclamationTriangle',
    shortDescription: 'Excessive, uncontrollable worry and heightened physiological tension in daily life.',
    definition: 'Generalized Anxiety Disorder (GAD) is characterized by chronic, persistent, and excessive worry about everyday events and activities. Individuals often anticipate disaster and are excessively concerned about health, finances, family, or work performance.',
    symptoms: ['Constant feeling of being on edge', 'Muscle tension and restlessness', 'Difficulty concentrating or mind going blank', 'Irritability and sleep disruption', 'Autonomic arousal (elevated heart rate)'],
    causes: ['Hyper-reactivity of the amygdala and fear-processing circuits', 'Genetic predisposition to high trait anxiety', 'Chronic exposure to unpredictable stress environments'],
    riskFactors: ['Personality traits characterized by harm avoidance', 'Childhood adversity', 'Chronic medical conditions'],
    commonSigns: ['Seeking constant reassurance', 'Procrastination driven by fear of failure', 'Physical complaints like tension headaches or stomach distress'],
    importanceOfEarlyDetection: 'Early detection mitigates somatic stress impacts on the cardiovascular and nervous systems, preserving cognitive clarity and focus.',
    cognitiveEnhancementSupport: [
      { title: 'Attentional Bias Modification', description: 'Cognitive training that redirects attention away from perceived threat stimuli toward task-relevant goals.' },
      { title: 'Mindfulness Focus Protocols', description: 'Structured grounding exercises to quiet hyper-arousal and improve executive control.' }
    ]
  },
  {
    id: '3',
    slug: 'ocd',
    name: 'Obsessive-Compulsive Disorder',
    category: 'Obsessive-Compulsive Spectrum',
    iconName: 'FaSync',
    shortDescription: 'Intrusive, unwanted thoughts followed by repetitive behavioral or mental compulsions.',
    definition: 'Obsessive-Compulsive Disorder (OCD) features a pattern of unwanted thoughts and fears (obsessions) that lead you to perform repetitive behaviors (compulsions). These interfere significantly with daily routines and cognitive flexibility.',
    symptoms: ['Fear of contamination or illness', 'Need for exactness, order, and symmetry', 'Intrusive upsetting mental images', 'Repetitive checking, washing, or counting rituals'],
    causes: ['Dysregulation within cortico-striato-thalamo-cortical (CSTC) brain circuits', 'Genetic factors and neurobiological vulnerability'],
    riskFactors: ['Family history of OCD or tic disorders', 'Stressful life events triggering onset'],
    commonSigns: ['Rigid adherence to excessive rules', 'Taking double the expected time to complete tasks due to re-checking', 'Avoidance of triggering objects or settings'],
    importanceOfEarlyDetection: 'Early intervention prevents compulsion escalation, protecting time management, cognitive flexibility, and quality of life.',
    cognitiveEnhancementSupport: [
      { title: 'Inhibitory Response Control', description: 'Specialized cognitive tasks designed to strengthen brain mechanisms responsible for stopping compulsive urges.' },
      { title: 'Cognitive Shift Games', description: 'Pattern-switching exercises that enhance mental flexibility and set-shifting abilities.' }
    ]
  },
  {
    id: '4',
    slug: 'ptsd',
    name: 'Post-Traumatic Stress Disorder',
    category: 'Trauma & Stressor-Related',
    iconName: 'FaShieldAlt',
    shortDescription: 'Debilitating stress reactions after witnessing or experiencing traumatic events.',
    definition: 'Post-Traumatic Stress Disorder (PTSD) is a psychiatric disorder that can occur in people who have experienced or witnessed a traumatic event such as a natural disaster, serious accident, assault, or military conflict.',
    symptoms: ['Intrusive memories, flashbacks, or distressing dreams', 'Avoidance of trauma-related thoughts, places, or people', 'Hypervigilance and exaggerated startle response', 'Persistent negative shifts in mood and cognition'],
    causes: ['Severe emotional or physical trauma overloading acute coping circuits', 'Altered stress hormone regulation (cortisol & adrenaline)'],
    riskFactors: ['Prior exposure to trauma', 'Lack of immediate psychological support after incident', 'High-stress occupations'],
    commonSigns: ['Sudden emotional outbursts or hyper-reactivity', 'Insomnia due to fear of nightmares', 'Emotional detachment from loved ones'],
    importanceOfEarlyDetection: 'Timely trauma-informed care protects neural architecture in the hippocampus and prefrontal cortex, preventing chronic autonomic exhaustion.',
    cognitiveEnhancementSupport: [
      { title: 'Grounding & Sensory Regulation', description: 'Interactive biofeedback and cognitive anchors to manage hyper-arousal.' },
      { title: 'Executive Processing Support', description: 'Structured cognitive modules aimed at rebuilding working memory and clear executive decision-making.' }
    ]
  },
  {
    id: '5',
    slug: 'adhd',
    name: 'ADHD',
    category: 'Neurodevelopmental Disorder',
    iconName: 'FaBolt',
    shortDescription: 'Persistent pattern of inattention, executive function challenges, and impulsivity.',
    definition: 'Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder affecting executive functions, working memory, attention control, and task switching. It impacts children, adolescents, and adults.',
    symptoms: ['Difficulty maintaining sustained focus on non-novel tasks', 'Executive dysfunction in planning, prioritizing, and organizing', 'Impulsive decision-making', 'Frequent fidgeting or internal restlessness'],
    causes: ['Differences in dopamine and norepinephrine neurotransmitter signaling', 'Strong genetic heritability (approx. 74-80%)'],
    riskFactors: ['Family history of ADHD', 'Premature birth or low birth weight'],
    commonSigns: ['Time blindness (misjudging task durations)', 'Frequently losing keys, tools, or documents', 'Difficulty following multi-step written or oral directions'],
    importanceOfEarlyDetection: 'Early diagnosis empowers individuals with targeted executive strategies, reducing self-esteem erosion and academic/professional friction.',
    cognitiveEnhancementSupport: [
      { title: 'Executive Function Coaching Modules', description: 'Step-by-step cognitive tools for task breakdown, time blocking, and goal organization.' },
      { title: 'Sustained Attention Stamina Games', description: 'Gamified focus challenges designed to gradually expand sustained concentration spans.' }
    ]
  },
  {
    id: '6',
    slug: 'insomnia',
    name: 'Insomnia Disorder',
    category: 'Sleep-Wake Disorder',
    iconName: 'FaMoon',
    shortDescription: 'Chronic sleep onset or maintenance difficulty impairing daytime cognitive speed.',
    definition: 'Insomnia Disorder involves persistent dissatisfaction with sleep quantity or quality, associated with difficulty initiating sleep, maintaining sleep, or waking early without ability to return to sleep.',
    symptoms: ['Daytime fatigue and low energy', 'Brain fog and impaired concentration', 'Mood irritability and anxiety around bedtime', 'Increased errors or accidents'],
    causes: ['Disrupted circadian rhythms', 'Physiological hyperarousal', 'Poor sleep environment habits', 'Co-occurring anxiety or depressive states'],
    riskFactors: ['High stress lifestyle', 'Irregular work patterns or shift work', 'Excessive evening blue light exposure'],
    commonSigns: ['Lying awake for hours calculating remaining sleep time', 'Frequent clock-watching during the night', 'Heavy reliance on daytime stimulants'],
    importanceOfEarlyDetection: 'Resolving sleep debt early restores neurotoxin clearance during deep sleep and preserves neuroplasticity for memory storage.',
    cognitiveEnhancementSupport: [
      { title: 'Cognitive Restructuring for Bedtime Anxiety', description: 'Exercises targeting nighttime catastrophic thinking and sleep-related worry.' },
      { title: 'Circadian Anchoring Techniques', description: 'Structured daily light, activity, and cognitive pacing protocols.' }
    ]
  }
];
