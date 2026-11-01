const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Server definitions and scorers
const serverInstruments = require('../server/config/clinicianInstruments');

// Simple parser or regex check for client definitions to ensure item ID parity
const clientDir = path.join(__dirname, '..', 'client', 'src', 'data', 'clinicianInstruments');

console.log('--- RUNNING CLINICIAN INSTRUMENT UNIT TESTS ---');

// 1. Check item IDs parity between client and server files
const instrumentIds = ['hama', 'hamd17', 'adhd_dsm5', 'nsesss_ptsd', 'isi_clinician', 'ybocs_part2'];

for (const id of instrumentIds) {
  const serverDef = serverInstruments.getInstrument(id);
  assert(serverDef, `Server definition for ${id} must exist`);
  const serverItemIds = serverDef.items.map((it) => String(it.id));

  const clientFilePath = path.join(clientDir, `${id}.js`);
  assert(fs.existsSync(clientFilePath), `Client file for ${id} must exist at ${clientFilePath}`);
  const clientContent = fs.readFileSync(clientFilePath, 'utf8');

  // Verify each server itemId is in client file
  for (const itemId of serverItemIds) {
    const hasId =
      clientContent.includes(`id: ${itemId},`) ||
      clientContent.includes(`id: '${itemId}',`) ||
      clientContent.includes(`id: "${itemId}",`);
    assert(hasId, `Client instrument ${id} is missing item ID ${itemId}`);
  }
}
console.log('✓ Item IDs parity between client and server verified.');

// 2. Acceptance Checklist: ISI all 0 gives 0 and all 4 gives 28
const isiZeroAnswers = ['1a', '1b', '1c', '2', '3', '4', '5'].map((id) => ({ itemId: id, value: 0 }));
const isiZeroRes = serverInstruments.scoreAssessment('isi_clinician', isiZeroAnswers);
assert.strictEqual(isiZeroRes.totalScore, 0, 'ISI all 0 must give 0');
assert.strictEqual(isiZeroRes.band, 'No clinically significant insomnia');

const isiMaxAnswers = ['1a', '1b', '1c', '2', '3', '4', '5'].map((id) => ({ itemId: id, value: 4 }));
const isiMaxRes = serverInstruments.scoreAssessment('isi_clinician', isiMaxAnswers);
assert.strictEqual(isiMaxRes.totalScore, 28, 'ISI all 4 must give 28');
assert.strictEqual(isiMaxRes.band, 'Clinical insomnia (severe)');
console.log('✓ ISI all 0 gives 0 and all 4 gives 28 passed.');

// 3. Acceptance Checklist: HAM-A all 4 gives 56
const hamaMaxAnswers = Array.from({ length: 14 }, (_, i) => ({ itemId: i + 1, value: 4 }));
const hamaMaxRes = serverInstruments.scoreAssessment('hama', hamaMaxAnswers);
assert.strictEqual(hamaMaxRes.totalScore, 56, 'HAM-A all 4 must give 56');
assert.strictEqual(hamaMaxRes.band, 'Above 30 (very severe by common convention)');

const hamaMild17 = Array.from({ length: 14 }, (_, i) => ({ itemId: i + 1, value: i === 0 ? 4 : (i < 5 ? 3 : 0) })); // sum = 4 + 3*4 = 16
hamaMild17[5] = { itemId: 6, value: 1 }; // sum = 17
const hama17Res = serverInstruments.scoreAssessment('hama', hamaMild17);
assert.strictEqual(hama17Res.totalScore, 17, 'HAM-A sum 17 should be 17');
assert.strictEqual(hama17Res.band, 'Mild', 'HAM-A score 17 must be treated as Mild');
console.log('✓ HAM-A all 4 gives 56, and score 17 gives Mild passed.');

// 4. Acceptance Checklist: HAM-D with every item at its maximum gives 52 (item 16 "Not assessed" counts 0)
// Items: 1:4, 2:4, 3:4, 4:2, 5:2, 6:2, 7:4, 8:4, 9:4, 10:4, 11:4, 12:2, 13:2, 14:2, 15:4, 16:2, 17:2 => total = 52
const hamdMaxAnswers = [
  { itemId: 1, value: 4 },
  { itemId: 2, value: 4 },
  { itemId: 3, value: 4 }, // Prominent suicide alert
  { itemId: 4, value: 2 },
  { itemId: 5, value: 2 },
  { itemId: 6, value: 2 },
  { itemId: 7, value: 4 },
  { itemId: 8, value: 4 },
  { itemId: 9, value: 4 },
  { itemId: 10, value: 4 },
  { itemId: 11, value: 4 },
  { itemId: 12, value: 2 },
  { itemId: 13, value: 2 },
  { itemId: 14, value: 2 },
  { itemId: 15, value: 4 },
  { itemId: 16, value: 2 }, // Max weight loss score
  { itemId: 17, value: 2 },
];
const hamdMaxRes = serverInstruments.scoreAssessment('hamd17', hamdMaxAnswers);
assert.strictEqual(hamdMaxRes.totalScore, 52, 'HAM-D every item at max must give 52');
assert.strictEqual(hamdMaxRes.flags.includes('SUICIDE_RISK_ALERT'), true, 'Suicide risk alert should be flagged');

// Item 16 option 3 = Not assessed contributes 0
const hamdItem16NotAssessed = [...hamdMaxAnswers];
hamdItem16NotAssessed[15] = { itemId: 16, value: 3 }; // Option 3: Not assessed
const hamd16Res = serverInstruments.scoreAssessment('hamd17', hamdItem16NotAssessed);
assert.strictEqual(hamd16Res.totalScore, 50, 'HAM-D item 16 option 3 contributes 0 (total 50)');

// Suicide item 3 = 1 gives mild suicide ideation flag
const hamdSuicide1 = [...hamdMaxAnswers];
hamdSuicide1[2] = { itemId: 3, value: 1 };
const hamdSuicide1Res = serverInstruments.scoreAssessment('hamd17', hamdSuicide1);
assert.strictEqual(hamdSuicide1Res.flags.includes('SUICIDE_IDEATION_MILD'), true);
console.log('✓ HAM-D all max gives 52, item 16 option 3 contributes 0, and suicide flags verified.');

// 5. Acceptance Checklist: Y-BOCS items 1-10 at 4 give 40 and item 11 does not change the total
const ybocsMaxAnswers = Array.from({ length: 10 }, (_, i) => ({ itemId: i + 1, value: 4 }));
ybocsMaxAnswers.push({ itemId: 11, value: 4 }); // Insight
const ybocsMaxRes = serverInstruments.scoreAssessment('ybocs_part2', ybocsMaxAnswers);
assert.strictEqual(ybocsMaxRes.totalScore, 40, 'Y-BOCS items 1-10 at 4 must give 40');
assert.strictEqual(ybocsMaxRes.subscores.obsessionSubtotal, 20);
assert.strictEqual(ybocsMaxRes.subscores.compulsionSubtotal, 20);
assert.strictEqual(ybocsMaxRes.subscores.insightScore, 4);
assert.strictEqual(ybocsMaxRes.band, 'Extreme');

const ybocsWithInsight0 = [...ybocsMaxAnswers];
ybocsWithInsight0[10] = { itemId: 11, value: 0 };
const ybocsInsight0Res = serverInstruments.scoreAssessment('ybocs_part2', ybocsWithInsight0);
assert.strictEqual(ybocsInsight0Res.totalScore, 40, 'Y-BOCS item 11 does not change the total');
console.log('✓ Y-BOCS items 1-10 at 4 gives 40 and item 11 does not change the total passed.');

// 6. Acceptance Checklist: NSESSS with 7 answered items summing to 14 gives a prorated total of 18, and 6 or fewer answered cannot be saved
const nsesss7Answers = [
  { itemId: 1, value: 2 },
  { itemId: 2, value: 2 },
  { itemId: 3, value: 2 },
  { itemId: 4, value: 2 },
  { itemId: 5, value: 2 },
  { itemId: 6, value: 2 },
  { itemId: 7, value: 2 }, // 7 items with score 2 = sum 14
]; // items 8 and 9 unanswered
const nsesss7Res = serverInstruments.scoreAssessment('nsesss_ptsd', nsesss7Answers);
// formula: round((14 * 9) / 7) = round(126 / 7) = round(18) = 18
assert.strictEqual(nsesss7Res.totalScore, 18, 'NSESSS 7 items summing to 14 must prorate to 18');
assert.strictEqual(nsesss7Res.subscores.isProrated, true);
assert.strictEqual(nsesss7Res.subscores.proratedTotalRawScore, 18);

// 6 or fewer answered must throw error
const nsesss6Answers = nsesss7Answers.slice(0, 6);
assert.throws(() => {
  serverInstruments.scoreAssessment('nsesss_ptsd', nsesss6Answers);
}, /Minimum 7 answered items required/);
console.log('✓ NSESSS prorating 14 -> 18 and rejection of <=6 answered items passed.');

// 7. Acceptance Checklist: ADHD for age 10 with 6 inattention items scored 2 or 3 meets screening threshold, and age 20 meets it with 5
const adhdChildAnswers = Array.from({ length: 18 }, (_, i) => ({ itemId: i + 1, value: 0 }));
// Set 6 inattention items (items 1-6) to 2
for (let i = 0; i < 6; i++) {
  adhdChildAnswers[i] = { itemId: i + 1, value: 2 };
}
const adhdChildRes = serverInstruments.scoreAssessment('adhd_dsm5', adhdChildAnswers, {}, 10);
assert.strictEqual(adhdChildRes.subscores.inattentionCount, 6);
assert.strictEqual(adhdChildRes.subscores.symptomThreshold, 6);
assert.strictEqual(adhdChildRes.subscores.inattentiveMet, true);
assert.strictEqual(adhdChildRes.band, 'Screening criteria met (Inattentive)');

// For child with 5 inattention symptoms, threshold (6) is NOT met
const adhdChild5Answers = [...adhdChildAnswers];
adhdChild5Answers[5] = { itemId: 6, value: 1 }; // Only 5 items scored >= 2
const adhdChild5Res = serverInstruments.scoreAssessment('adhd_dsm5', adhdChild5Answers, {}, 10);
assert.strictEqual(adhdChild5Res.subscores.inattentionCount, 5);
assert.strictEqual(adhdChild5Res.subscores.inattentiveMet, false);
assert.strictEqual(adhdChildRes.band.includes('Screening criteria met'), true);

// For age 20, 5 inattention symptoms DOES meet the threshold (5)
const adhdAdult5Res = serverInstruments.scoreAssessment('adhd_dsm5', adhdChild5Answers, {}, 20);
assert.strictEqual(adhdAdult5Res.subscores.inattentionCount, 5);
assert.strictEqual(adhdAdult5Res.subscores.symptomThreshold, 5);
assert.strictEqual(adhdAdult5Res.subscores.inattentiveMet, true);
assert.strictEqual(adhdAdult5Res.band, 'Screening criteria met (Inattentive)');
console.log('✓ ADHD age thresholds (6 for child, 5 for adult) verified.');

console.log('--- ALL CLINICIAN INSTRUMENT UNIT TESTS PASSED SUCCESSFULLY ---');
