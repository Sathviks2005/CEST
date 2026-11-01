/**
 * Script / Test to verify that server/config/exerciseCatalog.js stays 100% in sync
 * with client/src/data/exerciseContent.js (EXERCISE_DEFINITIONS)
 * and client/src/data/exerciseData.js (EXERCISES).
 *
 * Exits with 0 on perfect sync, or 1 with descriptive errors on any mismatch.
 */

const fs = require('fs');
const path = require('path');
const { CBT_EXERCISES, CET_EXERCISES, EXERCISE_CATALOG } = require('../config/exerciseCatalog');

const clientExerciseContentPath = path.resolve(__dirname, '../../client/src/data/exerciseContent.js');
const clientExerciseDataPath = path.resolve(__dirname, '../../client/src/data/exerciseData.js');

if (!fs.existsSync(clientExerciseContentPath)) {
  console.error(`[Catalog Sync Error] Missing client file: ${clientExerciseContentPath}`);
  process.exit(1);
}

if (!fs.existsSync(clientExerciseDataPath)) {
  console.error(`[Catalog Sync Error] Missing client file: ${clientExerciseDataPath}`);
  process.exit(1);
}

const exerciseContentText = fs.readFileSync(clientExerciseContentPath, 'utf8');
const exerciseDataText = fs.readFileSync(clientExerciseDataPath, 'utf8');

// Extract CBT ids from EXERCISE_DEFINITIONS keys or id: '...'
// Matches: 'breathing-timer': { or id: 'breathing-timer'
const cbtDefsMatch = exerciseContentText.matchAll(/'([a-z0-9-]+)'\s*:\s*\{\s*\r?\n\s*id:\s*'([a-z0-9-]+)'/g);
const clientCbtIds = new Set();
for (const match of cbtDefsMatch) {
  clientCbtIds.add(match[1]);
}

// Also scan EXERCISES in exerciseData.js
// Matches: 'attention-grid': { or id: 'attention-grid'
const cetDefsMatch = exerciseDataText.matchAll(/'([a-z0-9-]+)'\s*:\s*\{\s*\r?\n\s*id:\s*'([a-z0-9-]+)'/g);
const clientCetIds = new Set();
for (const match of cetDefsMatch) {
  clientCetIds.add(match[1]);
}

const serverCbtIds = new Set(CBT_EXERCISES.map((e) => e.id));
const serverCetIds = new Set(CET_EXERCISES.map((e) => e.id));

let hasErrors = false;

// 1. Check CBT exercises
for (const id of serverCbtIds) {
  if (!clientCbtIds.has(id)) {
    console.error(`[Mismatch] CBT exercise id '${id}' exists in server catalog but not in client EXERCISE_DEFINITIONS.`);
    hasErrors = true;
  }
}
for (const id of clientCbtIds) {
  if (!serverCbtIds.has(id)) {
    console.error(`[Mismatch] CBT exercise id '${id}' exists in client EXERCISE_DEFINITIONS but not in server catalog.`);
    hasErrors = true;
  }
}

// 2. Check CET exercises
for (const id of serverCetIds) {
  if (!clientCetIds.has(id)) {
    console.error(`[Mismatch] CET exercise id '${id}' exists in server catalog but not in client EXERCISES.`);
    hasErrors = true;
  }
}
for (const id of clientCetIds) {
  if (!serverCetIds.has(id)) {
    console.error(`[Mismatch] CET exercise id '${id}' exists in client EXERCISES but not in server catalog.`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n❌ Catalog sync verification FAILED.');
  process.exit(1);
}

console.log(`\n✅ Exercise catalog is 100% in sync! (${serverCbtIds.size} CBT exercises, ${serverCetIds.size} CET exercises, ${EXERCISE_CATALOG.length} total)`);
process.exit(0);
