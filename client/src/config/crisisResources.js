/**
 * Crisis Resources Configuration (Client)
 * Standardized crisis support helplines and immediate intervention resources.
 * 
 * IMPORTANT: Verify national helpline and emergency numbers with regional
 * public health and medical compliance authorities before public release.
 */

export const CRISIS_RESOURCES = {
  headline: 'Immediate Support & Helplines',
  notice:
    'If you are thinking about harming yourself, ending your life, or feel unable to keep yourself safe, please reach out for immediate support. You do not have to carry this alone.',
  helplines: [
    // India is the primary default jurisdiction
    { country: 'India', details: 'Tele-MANAS: Call 14416 or 1800-891-4416 (24/7 Toll-free) | National Emergency: 112' },
    { country: 'United States & Canada', details: '988 Suicide & Crisis Lifeline: Call or text 988 (24/7, toll-free)' },
    { country: 'United Kingdom', details: 'Call 111 (NHS mental health) or 116 123 (Samaritans, 24/7 free)' },
    { country: 'International', details: 'Find verified regional helplines at https://findahelpline.com or visit the nearest emergency room.' },
  ],
  disclaimer: 'This tool is not a diagnosis. In an emergency contact your local emergency number (112 in India, 911 in US/Canada, 999 in UK).',
};
