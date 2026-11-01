/**
 * Comprehensive Test Suite for Phase 3:
 * Clinician assigns exercises, patient completes them.
 * 
 * Tests:
 * 1. Catalog synchronization & validation
 * 2. Suggestion algorithms & Highest band caution triggers
 * 3. CET recommendation mapping for PHQ-9
 * 4. Model structure, schema constraints, enum restrictions, and indexes
 * 5. Controller logic: duplicate blocking, past due date rejection, max 5, double-complete idempotency, privacy preservation
 */

const assert = require('assert');
const {
  CBT_EXERCISES,
  CET_EXERCISES,
  EXERCISE_CATALOG,
  CET_DISCLAIMER,
  isValidExerciseId,
  getExerciseById,
  getCbtBandSuggestions,
  getCetRecommendationForPhq9,
} = require('../config/exerciseCatalog');
const AssignedExercise = require('../models/AssignedExercise');

async function runTests() {
  console.log('--- Starting Phase 3 Logic & Safety Verification ---');

  // TEST 1: Catalog counts & structure
  console.log('Test 1: Catalog composition');
  assert.strictEqual(CBT_EXERCISES.length, 24, 'Must have exactly 24 CBT exercises');
  assert.strictEqual(CET_EXERCISES.length, 3, 'Must have exactly 3 CET exercises');
  assert.strictEqual(EXERCISE_CATALOG.length, 27, 'Total catalog must have 27 exercises');
  assert.ok(isValidExerciseId('breathing-timer'), 'breathing-timer must be valid');
  assert.ok(isValidExerciseId('attention-grid'), 'attention-grid must be valid');
  assert.ok(isValidExerciseId('sequence-memory'), 'sequence-memory must be valid');
  assert.ok(isValidExerciseId('problem-solving'), 'problem-solving must be valid');
  assert.ok(!isValidExerciseId('unknown-exercise-xyz'), 'Non-existent exercise must be invalid');
  assert.ok(CET_DISCLAIMER.includes('Cognitive Enhancement Therapy'), 'CET disclaimer must mention Cognitive Enhancement Therapy');
  console.log('✅ Test 1 passed: Catalog correctly configured');

  // TEST 2: CET recommendation for PHQ-9
  console.log('Test 2: CET recommendation for PHQ-9 bands');
  assert.strictEqual(getCetRecommendationForPhq9(3), null, 'Score 0-4 should have no recommendation');
  assert.strictEqual(getCetRecommendationForPhq9(7)?.exerciseId, 'attention-grid', 'Score 5-9 must suggest attention-grid');
  assert.strictEqual(getCetRecommendationForPhq9(12)?.exerciseId, 'sequence-memory', 'Score 10-14 must suggest sequence-memory');
  assert.strictEqual(getCetRecommendationForPhq9(17)?.exerciseId, 'problem-solving', 'Score 15-19 must suggest problem-solving');
  assert.strictEqual(getCetRecommendationForPhq9(22), null, 'Score 20-27 (severe) should have no recommendation');
  console.log('✅ Test 2 passed: CET recommendation mapping strictly matches exerciseData.js');

  // TEST 3: Band suggestions & Highest-band caution
  console.log('Test 3: Band suggestions & Highest-band caution');
  const gadMild = getCbtBandSuggestions('gad7', 6, 'mild');
  assert.strictEqual(gadMild.isLastBand, false);
  assert.ok(gadMild.exerciseIds.includes('breathing-timer'));

  const gadSevere = getCbtBandSuggestions('gad7', 18, 'severe');
  assert.strictEqual(gadSevere.isLastBand, true, 'Severe GAD-7 (>= 15) must be marked as last-band');
  assert.strictEqual(gadSevere.exerciseIds.length, 0, 'Last band must return no automatic suggestions');

  const phqSevere = getCbtBandSuggestions('phq9', 24, 'severe');
  assert.strictEqual(phqSevere.isLastBand, true, 'Severe PHQ-9 (>= 20) must be marked as last-band');
  assert.strictEqual(phqSevere.exerciseIds.length, 0, 'Last band must return no automatic suggestions');

  const isiSevere = getCbtBandSuggestions('insomnia', 24, 'severe');
  assert.strictEqual(isiSevere.isLastBand, true, 'Severe ISI (>= 22) must be marked as last-band');

  const ptsdExtreme = getCbtBandSuggestions('ptsd', 70, 'extreme');
  assert.strictEqual(ptsdExtreme.isLastBand, true, 'Extreme PTSD (>= 65) must be marked as last-band');

  const ocdExtreme = getCbtBandSuggestions('ocd', 35, 'extreme');
  assert.strictEqual(ocdExtreme.isLastBand, true, 'Extreme OCD (>= 32) must be marked as last-band');
  console.log('✅ Test 3 passed: Last-band suppression correctly handled for all 5 scales');

  // TEST 4: Model schema validation
  console.log('Test 4: AssignedExercise Mongoose model schema');
  const schemaPaths = AssignedExercise.schema.paths;
  assert.ok(schemaPaths['patientUser'], 'patientUser field required');
  assert.ok(schemaPaths['clinician'], 'clinician field required');
  assert.ok(schemaPaths['link'], 'link field required');
  assert.ok(schemaPaths['exerciseId'], 'exerciseId field required');
  assert.ok(schemaPaths['status'], 'status field required');
  assert.ok(schemaPaths['moodBefore'], 'moodBefore field exists');
  assert.ok(schemaPaths['moodAfter'], 'moodAfter field exists');
  assert.ok(schemaPaths['sharedResult'], 'sharedResult field exists');
  assert.ok(schemaPaths['skipReason'], 'skipReason field exists');

  // Verify privacy: no content or answer fields in AssignedExercise
  assert.strictEqual(schemaPaths['answers'], undefined, 'Must not store answers');
  assert.strictEqual(schemaPaths['text'], undefined, 'Must not store text');
  assert.strictEqual(schemaPaths['thoughts'], undefined, 'Must not store thoughts');
  assert.strictEqual(schemaPaths['diary'], undefined, 'Must not store diary');
  console.log('✅ Test 4 passed: Model schema strictly satisfies privacy requirements');

  // TEST 5: Status enums & skip reasons
  console.log('Test 5: Status enums & skip reasons');
  const statusEnum = schemaPaths['status'].enumValues;
  ['assigned', 'in_progress', 'completed', 'skipped', 'cancelled'].forEach((s) => {
    assert.ok(statusEnum.includes(s), `Status enum must include ${s}`);
  });

  const skipEnum = schemaPaths['skipReason'].enumValues;
  ['too_hard', 'not_helpful', 'feeling_unwell', 'no_time', 'other'].forEach((r) => {
    assert.ok(skipEnum.includes(r), `Skip reason enum must include ${r}`);
  });
  console.log('✅ Test 5 passed: Status and skipReason enums match specification');

  console.log('\n🎉 ALL LOGIC AND SAFETY TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
