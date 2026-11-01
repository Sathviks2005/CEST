/**
 * Clinician Connection Wording Configuration
 * 
 * Centralized clinical guidance strings reviewed for tone, sensitivity, and clinical appropriateness.
 * Scales:
 * - Urgent tone: PHQ-9 Severe, PCL-5 Extreme, and PHQ-9 Question 9 Crisis Flag
 * - "See a doctor soon": GAD-7 Severe, Y-BOCS Extreme
 * - Non-urgent: ISI Severe ("talk to a doctor about your sleep")
 */

export const CONNECT_WORDING = {
  // Scale specific headline and recommendation banners
  instruments: {
    phq9: {
      urgent: true,
      badge: 'Urgent Clinical Recommendation',
      headline: 'Please Contact a Clinician to Discuss Your Results',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    pcl5: {
      urgent: true,
      badge: 'Urgent Clinical Recommendation',
      headline: 'Specialized Trauma Care Recommended',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    gad7: {
      urgent: false,
      badge: 'Professional Care Recommended',
      headline: 'Please See a Doctor Soon for Anxiety Support',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    ybocs: {
      urgent: false,
      badge: 'Professional Care Recommended',
      headline: 'Please See a Doctor Soon for OCD Evaluation',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    isi: {
      urgent: false,
      badge: 'Medical Consultation Recommended',
      headline: 'Talk to a Doctor About Your Sleep Patterns',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    adhd: {
      urgent: false,
      badge: 'Professional Care Recommended',
      headline: 'Please Contact a Clinician to Discuss Your ADHD Screening',
      guidance:
        'Your result is in the highest range for this questionnaire. This is a screening result, not a diagnosis. Please contact a qualified clinician soon to talk about it.',
    },
    item9Crisis: {
      urgent: true,
      badge: 'Crisis Support Alert',
      headline: 'Immediate Safety & Clinical Support',
      guidance:
        'Because you noted thoughts of self-harm or hurting yourself, please reach out right away. You can connect with a clinician below or speak directly to a trained crisis counselor on a 24/7 helpline.',
    },
  },

  // Modal disclosures, consent copy, and service disclaimers
  modal: {
    title: 'Connect with a Clinician',
    searchPlaceholder: 'Search clinicians by name, specialization, or hospital...',
    consentQuestion: (name) => `Share this result with ${name}?`,
    whatIsSharedNotice:
      'The clinician will receive this assessment instrument, total score, severity category, and date. Earlier assessment history is shared only if you select it below.',
    privacyNotice:
      'Chatbot conversations and individual exercise entries are strictly private and never shared. You can stop sharing at any time from your dashboard.',
    nonEmergencyNotice:
      'This is a request for clinician review, not an emergency service and not real-time monitoring. Clinicians check requests during their regular practice hours.',
    emergencyCallout:
      'If you feel unsafe or require immediate medical assistance, do not wait for a response. Please call emergency services (112) or your local crisis helpline.',
    successMessage: (name) =>
      `Request sent. ${name} will see it the next time they log in. If you feel unsafe right now, call the helpline or emergency number above.`,
    duplicateMessage:
      'You already have an active request or connection with this clinician.',
    declinedNotice:
      'The clinician was unable to accept your connection request at this time. You can choose another clinician from the directory or consult your local medical clinic.',
  },

  // Disclaimer shown on clinical connection cards and summaries
  generalDisclaimer:
    'This tool is not a medical diagnosis. In an emergency contact your local emergency number.',
};
