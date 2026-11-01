/**
 * Validation helper for Clinician Professional Registration Number and Registering Body
 * Rule: 3-30 characters, letters, digits and the characters - / only. Trim spaces.
 * Reject anything else with a friendly message. Do not claim the number is valid.
 * Both fields are optional.
 */

const ALLOWED_REGISTERING_BODIES = [
  'National Medical Commission / State Medical Council',
  'Rehabilitation Council of India',
  'Other',
];

const validateRegistrationNumber = (number) => {
  if (number === undefined || number === null) {
    return { valid: true, value: '' };
  }
  const trimmed = String(number).trim();
  if (trimmed.length === 0) {
    return { valid: true, value: '' };
  }
  if (trimmed.length < 3 || trimmed.length > 30) {
    return {
      valid: false,
      message: 'Professional registration number must be between 3 and 30 characters.',
    };
  }
  const regRegex = /^[a-zA-Z0-9\-\/]+$/;
  if (!regRegex.test(trimmed)) {
    return {
      valid: false,
      message:
        'Professional registration number can only contain letters, numbers, hyphens (-), and slashes (/).',
    };
  }
  return { valid: true, value: trimmed };
};

const sanitizeRegisteringBody = (body) => {
  if (!body || typeof body !== 'string') return '';
  const trimmed = body.trim();
  if (ALLOWED_REGISTERING_BODIES.includes(trimmed)) {
    return trimmed;
  }
  return trimmed ? 'Other' : '';
};

module.exports = {
  validateRegistrationNumber,
  sanitizeRegisteringBody,
  ALLOWED_REGISTERING_BODIES,
};

