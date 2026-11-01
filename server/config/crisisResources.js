/**
 * Crisis Resources Configuration (Server)
 * Contains standardized emergency contact information and crisis lines.
 * No invented phone numbers: uses established national public lifelines.
 */

const CRISIS_RESOURCES = {
  notice:
    'If you are thinking about harming yourself, ending your life, or feel unable to keep yourself safe, please reach out for immediate support. You do not have to carry this alone.',
  helplines: [
    { country: 'United States & Canada', details: '988 Suicide & Crisis Lifeline: Call or text 988 (Available 24/7, toll-free, English & Spanish)' },
    { country: 'United Kingdom', details: 'Call 111 (NHS mental health) or 116 123 (Samaritans, 24/7 free)' },
    { country: 'India', details: 'Tele-MANAS: Call 14416 or 1800-891-4416 (24/7 Toll-free mental health support)' },
    { country: 'International', details: 'Find your local verified crisis helpline at https://findahelpline.com or go to the nearest emergency department.' },
  ],
};

module.exports = { CRISIS_RESOURCES };
