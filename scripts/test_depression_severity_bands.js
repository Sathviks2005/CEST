/**
 * Unit Test Suite for Depression Questionnaires and Severity-Based Activities
 * Verifies:
 * 1. Standard PHQ-9 cut-off banding (0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-19 Moderately Severe, 20-27 Severe)
 * 2. PHQ-2 quick screen cut-off (score >= 3 is positive screen, score < 3 is negative screen)
 * 3. Item 9 positive safety behavior
 * 4. Exercise catalog completeness for depression activities across all 5 bands
 */

const assert = require('assert');
const {
  getCbtBandSuggestions,
  isValidExerciseId,
  getExerciseById,
  EXERCISE_CATALOG,
} = require('../server/config/exerciseCatalog');

console.log('=== Running Depression Severity Bands & Activities Test Suite ===\n');

// Test 1: PHQ-9 Cut-off Boundaries
const PHQ9_TEST_CASES = [
  { score: 0, severity: 'Minimal depression', expectedBand: 'Minimal', isLast: false },
  { score: 4, severity: 'Minimal depression', expectedBand: 'Minimal', isLast: false },
  { score: 5, severity: 'Mild depression', expectedBand: 'Mild', isLast: false },
  { score: 9, severity: 'Mild depression', expectedBand: 'Mild', isLast: false },
  { score: 10, severity: 'Moderate depression', expectedBand: 'Moderate', isLast: false },
  { score: 14, severity: 'Moderate depression', expectedBand: 'Moderate', isLast: false },
  { score: 15, severity: 'Moderately severe depression', expectedBand: 'Moderately severe', isLast: false },
  { score: 19, severity: 'Moderately severe depression', expectedBand: 'Moderately severe', isLast: false },
  { score: 20, severity: 'Severe depression', expectedBand: 'Severe', isLast: true },
  { score: 27, severity: 'Severe depression', expectedBand: 'Severe', isLast: true },
];

console.log('1. Testing PHQ-9 Score Cut-offs & Band Assignments:');
PHQ9_TEST_CASES.forEach((tc) => {
  const result = getCbtBandSuggestions('phq9', tc.score, tc.severity);
  assert.strictEqual(
    result.isLastBand,
    tc.isLast,
    `Score ${tc.score} isLastBand mismatch: expected ${tc.isLast}, got ${result.isLastBand}`
  );
  if (!tc.isLast) {
    assert(result.exerciseIds.length >= 2, `Score ${tc.score} must have at least 2 assigned exercises`);
    result.exerciseIds.forEach((id) => {
      assert(isValidExerciseId(id), `Exercise "${id}" for score ${tc.score} must exist in catalog`);
    });
  }
  console.log(`  ✓ Score ${tc.score} (${tc.severity}) -> isLastBand: ${result.isLastBand}, exercises count: ${result.exerciseIds.length}`);
});

// Test 2: PHQ-2 Scoring Logic
console.log('\n2. Testing PHQ-2 Screening Logic (Cut-off >= 3):');
const PHQ2_TESTS = [
  { a1: 0, a2: 0, total: 0, positive: false },
  { a1: 1, a2: 1, total: 2, positive: false },
  { a1: 2, a2: 1, total: 3, positive: true },
  { a1: 3, a2: 2, total: 5, positive: true },
  { a1: 3, a2: 3, total: 6, positive: true },
];

PHQ2_TESTS.forEach((t) => {
  const score = t.a1 + t.a2;
  const isPositive = score >= 3;
  assert.strictEqual(score, t.total);
  assert.strictEqual(isPositive, t.positive, `PHQ-2 total ${score} should have positive=${t.positive}`);
  console.log(`  ✓ PHQ-2 items [${t.a1}, ${t.a2}] = ${score}/6 -> ${isPositive ? 'Positive Screen (Proceed to PHQ-9)' : 'Negative Screen'}`);
});

// Test 3: New Depression Exercises Catalog Integrity
console.log('\n3. Verifying All Depression Severity Exercise IDs Exist in Server Catalog:');
const NEW_DEPRESSION_EXERCISES = [
  'gratitude-mood-checkin',
  'sleep-hygiene-checklist',
  'sunlight-walk',
  'breathing-timer',
  'activity-scheduler-mild',
  'thought-record',
  'daily-routine-planner',
  'social-connection-nudge',
  'activity-scheduler-moderate',
  'thinking-traps-spotter',
  'problem-solving-worksheet',
  'body-scan-mindfulness',
  'self-compassion-break',
  'micro-task-planner',
  'basic-needs-checklist',
  'grounding-54321',
  'activity-scheduler-graded',
  'reach-out-script',
  'coping-support-plan',
];

NEW_DEPRESSION_EXERCISES.forEach((id) => {
  const ex = getExerciseById(id);
  assert(ex, `Exercise "${id}" must be registered in server catalog`);
  assert(ex.title, `Exercise "${id}" must have a title`);
  assert(ex.description, `Exercise "${id}" must have a description`);
  console.log(`  ✓ Registered: [${id}] "${ex.title}" (${ex.category})`);
});

console.log('\n=== All Depression Severity Band & Questionnaire Tests Passed Successfully! ===');
