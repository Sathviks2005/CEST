/**
 * Chat Safety & Pre/Post-Check Filters
 *
 * NOTE: Keyword and regex matching serves as an immediate, deterministically reliable
 * safety net, but cannot serve as a complete detector for every subtle or nuanced phrasing.
 * It is layered with system prompt instructions and strict fallback mechanisms.
 */

const { CRISIS_RESOURCES } = require('../config/crisisResources');

// Maintained list of high-risk self-harm, suicide, and violence regex patterns
const CRISIS_PATTERNS = [
  /\b(want|wanna|wish(?:ing)?|hope(?:ing)?)\s+(to\s+)?(die|be\s+dead)\b/i,
  /\b(end\s+it\s+all|ending\s+it\s+all)\b/i,
  /\b(no\s+reason\s+to\s+live|nothing\s+to\s+live\s+for|no\s+point\s+in\s+living|not\s+worth\s+living)\b/i,
  /\b(kill|killing|murder)\s+(myself|me)\b/i,
  /\b(hurt|hurting|harm|harming|cut|cutting|burn|burning)\s+(myself|me)\b/i,
  /\b(better\s+off\s+without\s+me|better\s+off\s+dead|world\s+would\s+be\s+better\s+without\s+me)\b/i,
  /\b(end|ending|take|taking)\s+my\s+(own\s+)?life\b/i,
  /\b(don'?t|dont|do\s+not)\s+want\s+to\s+(be\s+here|live|exist)\s*(anymore)?\b/i,
  /\b(suicid(?:e|al|ality))\b/i,
  /\b(overdos(?:e|ing)|slit\s+(my\s+)?wrists?|hang\s+(myself|me)|jump\s+off\s+(a\s+bridge|a\s+roof|a\s+building))\b/i,
  /\b(kill|killing|hurt|hurting|harm|harming|shoot|shooting|stab|stabbing)\s+(someone|others?|people|anybody|everybody)\b/i,
];

/**
 * Builds the supportive fixed crisis response using CRISIS_RESOURCES
 */
const buildCrisisReply = () => {
  const helplineLines = CRISIS_RESOURCES.helplines
    .map((h) => `• ${h.country}: ${h.details}`)
    .join('\n');

  return (
    `I hear how much pain you are experiencing right now, and I want you to know that your life, safety, and well-being matter deeply.\n\n` +
    `Because I am an automated AI assistant and not a human clinician, I cannot provide crisis counseling or emergency intervention.\n\n` +
    `${CRISIS_RESOURCES.notice}\n\n` +
    `Immediate 24/7 confidential support resources:\n${helplineLines}\n\n` +
    `If you are in immediate danger of hurting yourself or someone else, please call your local emergency services (such as 911 in the US/Canada, 999/111 in the UK, 112 in Europe/India) or go to the nearest emergency department right away. You do not have to walk through this alone.`
  );
};

/**
 * Normalizes input text to catch common obfuscations, missing apostrophes, and spacing tricks
 */
const normalizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019`]/g, "'") // normalize smart quotes
    .replace(/[^\w\s']/g, ' ') // replace punctuation except apostrophe with space
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Safety pre-check: inspects the user's latest messages (checks the last 2 user messages)
 * before calling any LLM.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {{ crisis: boolean, reply?: string }}
 */
const checkCrisis = (messages = []) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { crisis: false };
  }

  // Filter for user messages and check the last 2 user messages
  const userMessages = messages
    .filter((m) => m && m.role === 'user' && typeof m.content === 'string')
    .slice(-2);

  for (const msg of userMessages) {
    const normalized = normalizeText(msg.content);
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(normalized)) {
        return {
          crisis: true,
          reply: buildCrisisReply(),
        };
      }
    }
  }

  return { crisis: false };
};

// Patterns for output filtering: diagnostic assertions and medication dosing/prescription advice
const DIAGNOSTIC_PATTERNS = [
  /\b(you\s+(have|suffer\s+from|are\s+diagnosed\s+with)\s+(major\s+depressive\s+disorder|depression|gad|generalized\s+anxiety\s+disorder|ptsd|post-traumatic\s+stress\s+disorder|ocd|obsessive-compulsive\s+disorder|bipolar|schizophrenia|adhd))\b/i,
  /\b(my\s+diagnosis\s+is|i\s+diagnose\s+you\s+with|this\s+confirms\s+you\s+have)\b/i,
];

const MEDICATION_DOSING_PATTERNS = [
  /\b(sertraline|zoloft|fluoxetine|prozac|escitalopram|lexapro|citalopram|celexa|paroxetine|paxil|duloxetine|cymbalta|venlafaxine|effexor|bupropion|wellbutrin|alprazolam|xanax|lorazepam|ativan|clonazepam|klonopin|diazepam|valium|zolpidem|ambien|quetiapine|seroquel|aripiprazole|abilify|lithium|trazodone|adderall|ritalin|methylphenidate)\b.*\b\d+\s*(mg|milligram|mcg|microgram|ml|pills?|tablets?)\b/i,
  /\b(take|increase|decrease|stop|start|prescribe|prescribing)\s+(your\s+)?(dose|dosage|medication|pills?|tablets?)\b/i,
];

const SELF_HARM_INSTRUCTION_PATTERNS = [
  /\b(how\s+to\s+(cut|hang|overdose|kill|harm)\s+(yourself|myself))\b/i,
  /\b(methods?\s+to\s+(commit\s+suicide|end\s+your\s+life|die))\b/i,
];

const SAFE_FILTER_FALLBACK =
  "I am here to share general psychoeducation, explore healthy coping strategies, and explain screening score bands, but as an automated AI wellbeing assistant, I cannot diagnose medical conditions, advise on medication doses, or replace the care of a licensed clinician. Please discuss any diagnostic questions or medication adjustments directly with your doctor or healthcare provider.";

/**
 * Output filter: sanitizes LLM output to prevent simulated medical diagnosis,
 * prescription advice, or self-harm encouragement.
 *
 * @param {string} replyText
 * @returns {string} filtered text
 */
const filterOutput = (replyText) => {
  if (typeof replyText !== 'string' || !replyText.trim()) {
    return "I am here to support you with psychoeducation and coping exercises. How can I help you today?";
  }

  // Check diagnostic assertions
  for (const pattern of DIAGNOSTIC_PATTERNS) {
    if (pattern.test(replyText)) {
      return SAFE_FILTER_FALLBACK;
    }
  }

  // Check medication dosing instructions
  for (const pattern of MEDICATION_DOSING_PATTERNS) {
    if (pattern.test(replyText)) {
      return SAFE_FILTER_FALLBACK;
    }
  }

  // Check self-harm encouragement
  for (const pattern of SELF_HARM_INSTRUCTION_PATTERNS) {
    if (pattern.test(replyText)) {
      return buildCrisisReply();
    }
  }

  return replyText;
};

module.exports = {
  checkCrisis,
  filterOutput,
  buildCrisisReply,
};
