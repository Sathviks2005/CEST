/**
 * Verification Script: Band Boundary & Exercise Suggestions across all 6 instruments
 * Rule: TOP BAND = "CONTACT A CLINICIAN", EVERY OTHER BAND = EXERCISES
 */

const assert = require('assert');
const path = require('path');

const {
  getCbtBandSuggestions,
  isValidExerciseId,
  getExerciseById,
  EXERCISE_CATALOG,
} = require('../server/config/exerciseCatalog');

console.log('--- Testing getCbtBandSuggestions for All Six Instruments ---');

const BOUNDARY_TESTS = [
  {
    instrument: 'phq9',
    name: 'PHQ-9 Depression',
    belowScore: 19,
    belowSeverity: 'Moderately severe',
    thresholdScore: 20,
    thresholdSeverity: 'Severe',
  },
  {
    instrument: 'gad7',
    name: 'GAD-7 Anxiety',
    belowScore: 14,
    belowSeverity: 'Moderate',
    thresholdScore: 15,
    thresholdSeverity: 'Severe',
  },
  {
    instrument: 'insomnia',
    name: 'ISI Insomnia',
    belowScore: 21,
    belowSeverity: 'Moderate',
    thresholdScore: 22,
    thresholdSeverity: 'Severe',
  },
  {
    instrument: 'ptsd',
    name: 'PCL-5 PTSD',
    belowScore: 64,
    belowSeverity: 'Severe',
    thresholdScore: 65,
    thresholdSeverity: 'Extreme',
  },
  {
    instrument: 'ocd',
    name: 'Y-BOCS OCD',
    belowScore: 31,
    belowSeverity: 'Severe',
    thresholdScore: 32,
    thresholdSeverity: 'Extreme',
  },
  {
    instrument: 'adhd',
    name: 'ASRS-v1.1 ADHD',
    belowScore: 35,
    belowSeverity: 'Moderate likelihood',
    thresholdScore: 36,
    thresholdSeverity: 'High likelihood',
  },
];

let totalChecks = 0;

BOUNDARY_TESTS.forEach((t) => {
  console.log(`\nTesting Boundary for ${t.name} (${t.instrument}):`);

  // 1. Below threshold -> Must return non-last band with exercises
  const belowRes = getCbtBandSuggestions(t.instrument, t.belowScore, t.belowSeverity);
  assert.strictEqual(
    belowRes.isLastBand,
    false,
    `${t.instrument} at score ${t.belowScore} must NOT be last band`
  );
  assert(
    Array.isArray(belowRes.exerciseIds) && belowRes.exerciseIds.length > 0,
    `${t.instrument} at score ${t.belowScore} must return at least one exerciseId`
  );
  belowRes.exerciseIds.forEach((id) => {
    assert(
      isValidExerciseId(id),
      `Exercise ID "${id}" returned for ${t.instrument} at score ${t.belowScore} must be a valid exercise ID in catalog`
    );
  });
  console.log(
    `  ✓ Score ${t.belowScore} (${t.belowSeverity}): isLastBand = false, exercises: [${belowRes.exerciseIds.join(', ')}]`
  );
  totalChecks += 2;

  // 2. Threshold -> Must return last band with empty exercises list
  const threshRes = getCbtBandSuggestions(t.instrument, t.thresholdScore, t.thresholdSeverity);
  assert.strictEqual(
    threshRes.isLastBand,
    true,
    `${t.instrument} at score ${t.thresholdScore} must be last band`
  );
  assert.strictEqual(
    threshRes.exerciseIds.length,
    0,
    `${t.instrument} at score ${t.thresholdScore} must return empty exerciseIds list`
  );
  console.log(
    `  ✓ Score ${t.thresholdScore} (${t.thresholdSeverity}): isLastBand = true, exercises: []`
  );
  totalChecks += 2;
});

console.log('\n--- Testing All Bands across all instruments (Minimal up to Last) ---');

const ALL_BAND_TEST_CASES = [
  // GAD-7: 0 (minimal), 7 (mild), 12 (moderate), 18 (severe)
  { inst: 'gad7', score: 0, sev: 'Minimal', expectLast: false },
  { inst: 'gad7', score: 7, sev: 'Mild', expectLast: false },
  { inst: 'gad7', score: 12, sev: 'Moderate', expectLast: false },
  { inst: 'gad7', score: 18, sev: 'Severe', expectLast: true },

  // PHQ-9: 2 (minimal), 7 (mild), 12 (moderate), 17 (moderately severe), 24 (severe)
  { inst: 'phq9', score: 2, sev: 'Minimal', expectLast: false },
  { inst: 'phq9', score: 7, sev: 'Mild', expectLast: false },
  { inst: 'phq9', score: 12, sev: 'Moderate', expectLast: false },
  { inst: 'phq9', score: 17, sev: 'Moderately severe', expectLast: false },
  { inst: 'phq9', score: 24, sev: 'Severe', expectLast: true },

  // ISI: 3 (none/minimal), 10 (subthreshold), 18 (moderate), 25 (severe)
  { inst: 'insomnia', score: 3, sev: 'None / Minimal', expectLast: false },
  { inst: 'insomnia', score: 10, sev: 'Subthreshold / Mild', expectLast: false },
  { inst: 'insomnia', score: 18, sev: 'Moderate', expectLast: false },
  { inst: 'insomnia', score: 25, sev: 'Severe', expectLast: true },

  // PCL-5: 5 (minimal), 20 (mild), 40 (moderate), 55 (severe), 70 (extreme)
  { inst: 'ptsd', score: 5, sev: 'Minimal', expectLast: false },
  { inst: 'ptsd', score: 20, sev: 'Mild', expectLast: false },
  { inst: 'ptsd', score: 40, sev: 'Moderate', expectLast: false },
  { inst: 'ptsd', score: 55, sev: 'Severe', expectLast: false },
  { inst: 'ptsd', score: 70, sev: 'Extreme', expectLast: true },

  // Y-BOCS: 4 (subclinical), 12 (mild), 20 (moderate), 28 (severe), 36 (extreme)
  { inst: 'ocd', score: 4, sev: 'Subclinical', expectLast: false },
  { inst: 'ocd', score: 12, sev: 'Mild', expectLast: false },
  { inst: 'ocd', score: 20, sev: 'Moderate', expectLast: false },
  { inst: 'ocd', score: 28, sev: 'Severe', expectLast: false },
  { inst: 'ocd', score: 36, sev: 'Extreme', expectLast: true },

  // ADHD: 10 (low likelihood), 25 (moderate likelihood), 45 (high likelihood)
  { inst: 'adhd', score: 10, sev: 'Low likelihood', expectLast: false },
  { inst: 'adhd', score: 25, sev: 'Moderate likelihood', expectLast: false },
  { inst: 'adhd', score: 45, sev: 'High likelihood', expectLast: true },
];

ALL_BAND_TEST_CASES.forEach((c) => {
  const res = getCbtBandSuggestions(c.inst, c.score, c.sev);
  assert.strictEqual(
    res.isLastBand,
    c.expectLast,
    `${c.inst} score ${c.score} (${c.sev}) expected isLastBand=${c.expectLast}, got ${res.isLastBand}`
  );
  if (c.expectLast) {
    assert.strictEqual(
      res.exerciseIds.length,
      0,
      `Last band for ${c.inst} must return 0 exercises`
    );
  } else {
    assert(
      res.exerciseIds.length >= 1,
      `Non-last band for ${c.inst} (${c.sev}) must return at least 1 exercise, got ${res.exerciseIds.length}`
    );
    res.exerciseIds.forEach((id) => {
      assert(isValidExerciseId(id), `Exercise ID "${id}" in ${c.inst} must be valid`);
    });
  }
  totalChecks += 1;
});

console.log(`\n✓ All ${totalChecks} boundary and band assertions passed successfully!`);
console.log('✓ Validated catalog contains', EXERCISE_CATALOG.length, 'total assignable exercises.');

