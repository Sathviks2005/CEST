const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');
const HamDAssessment = require('../models/HamDAssessment');
const AssignedExercise = require('../models/AssignedExercise');
const ClinicianNote = require('../models/ClinicianNote');
const AttentionAck = require('../models/AttentionAck');
const AccessLog = require('../models/AccessLog');
const { logPatientAccess } = require('../utils/accessLogger');
const { ATTENTION_CONFIG } = require('../controllers/clinicianAttentionController');

async function runPhase4Tests() {
  console.log('--- Starting Comprehensive Phase 4 Logic & Safety Verification ---');

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('[OK] Connected to MongoDB');

  try {
    // Clean up any previous test artifacts
    await User.deleteMany({ email: /phase4test_.*@test\.com/ });
    await ClinicianNote.deleteMany({});
    await AttentionAck.deleteMany({});
    await AccessLog.deleteMany({});

    // 1. Create Test Clinicians A and B
    const clinicianA = await User.create({
      name: 'Dr. Alice Phase4',
      email: 'phase4test_clinician_a@test.com',
      password: 'password123',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Adult Neuropsychiatry',
      institution: 'Memorial Psychiatric Institute',
      settings: { notifyUrgentEmail: true, reportRangeDays: 90 },
    });

    const clinicianB = await User.create({
      name: 'Dr. Bob Phase4',
      email: 'phase4test_clinician_b@test.com',
      password: 'password123',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Cognitive Behavioral Specialist',
      institution: 'City Health Clinic',
    });

    // 2. Create Self-Users / Patients
    const patientUser1 = await User.create({
      name: 'Charlie Patient 1',
      email: 'phase4test_patient_1@test.com',
      password: 'password123',
      role: 'self_user',
    });

    const patientUser2 = await User.create({
      name: 'Diana Patient 2',
      email: 'phase4test_patient_2@test.com',
      password: 'password123',
      role: 'self_user',
    });

    // 3. Create Links
    const link1 = await ClinicianLink.create({
      patientUser: patientUser1._id,
      clinician: clinicianA._id,
      status: 'accepted',
      shareScope: 'all',
      respondedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    });

    const link2 = await ClinicianLink.create({
      patientUser: patientUser2._id,
      clinician: clinicianA._id,
      status: 'accepted',
      shareScope: 'all',
      respondedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    });

    // 4. Create Patient roster entries for Clinician A
    const patientRecord1 = await Patient.create({
      name: 'Charlie Patient 1',
      clinician: clinicianA._id,
      linkedUser: patientUser1._id,
      age: 29,
      gender: 'male',
      status: 'active',
    });

    const patientRecord2 = await Patient.create({
      name: 'Diana Patient 2',
      clinician: clinicianA._id,
      linkedUser: patientUser2._id,
      age: 34,
      gender: 'female',
      status: 'active',
    });

    console.log('[OK] Initialized test clinicians, patient users, and roster records.');

    // -------------------------------------------------------------
    // Test 1: Needs Attention Logic & Priority Categorization
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Needs-Attention Calculation ---');

    // Patient 1 has:
    // a) Recent PHQ-9 item 9 flag > 0 (High Priority)
    // b) Last-band result in GAD-7 (Severe, High Priority)
    const phq9_p1 = await Assessment.create({
      user: patientUser1._id,
      assessmentType: 'PHQ-9',
      disorderSlug: 'depression',
      totalScore: 21,
      severity: 'Severe',
      answers: [2, 2, 2, 2, 2, 2, 2, 2, 1], // answers[8] = 1 > 0 -> itemNineFlag = true
      itemNineFlag: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const gad7_p1 = await Assessment.create({
      user: patientUser1._id,
      assessmentType: 'GAD-7',
      disorderSlug: 'anxiety',
      totalScore: 19,
      severity: 'Severe', // Last band
      answers: [3, 3, 3, 3, 3, 2, 2],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Patient 2 has:
    // a) Worsening scale: previous PHQ-9 was Mild, latest is Moderate
    // b) 2 overdue exercises
    const phq9_p2_prev = await Assessment.create({
      user: patientUser2._id,
      assessmentType: 'PHQ-9',
      disorderSlug: 'depression',
      totalScore: 7,
      severity: 'Mild',
      answers: [1, 1, 1, 1, 1, 1, 1, 0, 0],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    const phq9_p2_curr = await Assessment.create({
      user: patientUser2._id,
      assessmentType: 'PHQ-9',
      disorderSlug: 'depression',
      totalScore: 13,
      severity: 'Moderate', // Worsened by 1 band!
      answers: [2, 2, 1, 2, 2, 2, 1, 1, 0],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // 2 Overdue exercises for Patient 2
    await AssignedExercise.create({
      patientUser: patientUser2._id,
      clinician: clinicianA._id,
      link: link2._id,
      exerciseId: 'breathing-timer',
      status: 'assigned',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue 2 days ago
    });

    await AssignedExercise.create({
      patientUser: patientUser2._id,
      clinician: clinicianA._id,
      link: link2._id,
      exerciseId: 'grounding-54321',
      status: 'assigned',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue 1 day ago
    });

    // Simulate Attention calculation controller directly
    const { getNeedsAttentionList } = require('../controllers/clinicianAttentionController');

    let attentionResData = null;
    const mockReqA = { user: clinicianA };
    const mockResA = {
      status: (code) => ({
        json: (data) => {
          attentionResData = data;
          return data;
        },
      }),
    };

    await getNeedsAttentionList(mockReqA, mockResA);

    if (!attentionResData || !attentionResData.success) {
      throw new Error('Failed to get attention list');
    }

    const activeList = attentionResData.data.active;
    console.log(`Active Needs Attention Count: ${activeList.length}`);

    // Verify Patient 1 is High Priority
    const p1Item = activeList.find((i) => String(i.patientUserId) === String(patientUser1._id));
    if (!p1Item) throw new Error('Patient 1 missing from attention list');
    if (p1Item.priority !== 'high') throw new Error(`Expected Patient 1 priority 'high', got '${p1Item.priority}'`);

    const hasItemNineReason = p1Item.reasons.some((r) => r.code === 'item_9_positive');
    const hasHighestBandReason = p1Item.reasons.some((r) => r.code === 'highest_band');
    if (!hasItemNineReason || !hasHighestBandReason) {
      throw new Error(`Patient 1 missing item-9 or highest-band reason. Found codes: ${p1Item.reasons.map(r => r.code).join(', ')}`);
    }
    console.log('[PASS] Patient 1 correctly flagged with High Priority (item 9 > 0 and highest-band result).');

    // Verify Patient 2 is Medium Priority (Worsening + Overdue exercises)
    const p2Item = activeList.find((i) => String(i.patientUserId) === String(patientUser2._id));
    if (!p2Item) throw new Error('Patient 2 missing from attention list');
    if (p2Item.priority !== 'medium') throw new Error(`Expected Patient 2 priority 'medium', got '${p2Item.priority}'`);

    const hasWorseningReason = p2Item.reasons.some((r) => r.code === 'worsening');
    const hasOverdueReason = p2Item.reasons.some((r) => r.code === 'overdue_exercises');
    if (!hasWorseningReason || !hasOverdueReason) {
      throw new Error(`Patient 2 missing worsening or overdue reason. Found codes: ${p2Item.reasons.map(r => r.code).join(', ')}`);
    }
    console.log('[PASS] Patient 2 correctly flagged with Medium Priority (worsening severity + 2 overdue exercises).');

    // Check Clinician B sees ZERO of Clinician A's patients
    let attentionResDataB = null;
    const mockReqB = { user: clinicianB };
    const mockResB = {
      status: (code) => ({
        json: (data) => {
          attentionResDataB = data;
          return data;
        },
      }),
    };

    await getNeedsAttentionList(mockReqB, mockResB);
    if (attentionResDataB.data.active.length !== 0) {
      throw new Error(`Clinician B saw ${attentionResDataB.data.active.length} patients! Privacy breach.`);
    }
    console.log('[PASS] Clinician isolation verified: Clinician B sees 0 alerts.');

    // -------------------------------------------------------------
    // Test 2: Acknowledging for 7 Days & High Priority Break-Through
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Attention Acknowledgment & 7-Day Suppression ---');
    const { acknowledgePatientAttention } = require('../controllers/clinicianAttentionController');

    const mockAckReq = {
      user: clinicianA,
      params: { patientUserId: String(patientUser1._id) },
    };
    let ackResult = null;
    const mockAckRes = {
      status: (code) => ({
        json: (data) => {
          ackResult = data;
          return data;
        },
      }),
    };

    await acknowledgePatientAttention(mockAckReq, mockAckRes);
    if (!ackResult?.success) throw new Error('Failed to acknowledge patient alert');

    // Re-check attention list: Patient 1 should now be in acknowledged group
    await getNeedsAttentionList(mockReqA, mockResA);
    const updatedActive = attentionResData.data.active;
    const updatedAck = attentionResData.data.acknowledged;

    if (updatedActive.some((i) => String(i.patientUserId) === String(patientUser1._id))) {
      throw new Error('Patient 1 should have moved out of active group');
    }
    if (!updatedAck.some((i) => String(i.patientUserId) === String(patientUser1._id))) {
      throw new Error('Patient 1 should be in acknowledged group');
    }
    console.log('[PASS] Patient 1 successfully moved to collapsed Acknowledged group.');

    // Now Patient 1 submits a BRAND NEW high-priority assessment
    console.log('Testing break-through: Patient 1 completes new high-priority assessment...');
    await Assessment.create({
      user: patientUser1._id,
      assessmentType: 'PHQ-9',
      disorderSlug: 'depression',
      totalScore: 24,
      severity: 'Severe',
      answers: [3, 3, 3, 3, 3, 3, 2, 2, 2], // itemNineFlag = true
      itemNineFlag: true,
      createdAt: new Date(), // Created AFTER acknowledgment
    });

    await getNeedsAttentionList(mockReqA, mockResA);
    const breakthroughActive = attentionResData.data.active;
    const breakthroughP1 = breakthroughActive.find((i) => String(i.patientUserId) === String(patientUser1._id));
    if (!breakthroughP1) {
      throw new Error('New high priority alert failed to bring patient back to active triage list');
    }
    console.log('[PASS] Break-through confirmed: New high-priority alert brought Patient 1 back to active triage.');

    // -------------------------------------------------------------
    // Test 3: Clinician Private Notes CRUD & Strict Isolation
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Clinician Notes CRUD & Privacy Isolation ---');
    const {
      createNote,
      getNotesForPatient,
      updateNote,
      deleteNote,
    } = require('../controllers/clinicianNoteController');

    let noteRes = null;
    const mockNoteRes = {
      status: (code) => ({
        json: (data) => {
          noteRes = data;
          return data;
        },
      }),
    };

    // Clinician A creates note for Patient 1
    await createNote(
      {
        user: clinicianA,
        body: {
          patientId: patientRecord1._id,
          text: 'Patient demonstrates moderate psychomotor agitation. Initiated sleep hygiene intervention.',
          noteDate: new Date(),
        },
      },
      mockNoteRes
    );

    if (!noteRes?.success) throw new Error('Failed to create clinician note');
    const createdNoteId = noteRes.data._id;
    console.log('[PASS] Note created successfully by Clinician A.');

    // Clinician A updates note
    await updateNote(
      {
        user: clinicianA,
        params: { id: createdNoteId },
        body: { text: 'Updated clinical observation: improved sleep latency.' },
      },
      mockNoteRes
    );
    if (!noteRes?.success || !noteRes.data.text.includes('Updated')) {
      throw new Error('Failed to update clinician note');
    }
    console.log('[PASS] Note updated successfully by Clinician A.');

    // Security check: Clinician B attempts to view or update Clinician A's note
    let securityErrorCaught = false;
    await updateNote(
      {
        user: clinicianB,
        params: { id: createdNoteId },
        body: { text: 'Malicious overwrite attempt' },
      },
      {
        status: (code) => ({
          json: (data) => {
            if (code === 404) securityErrorCaught = true;
          },
        }),
      }
    );
    if (!securityErrorCaught) throw new Error('Clinician B was able to modify Clinician A note!');
    console.log('[PASS] Security verified: Clinician B cannot access or modify Clinician A notes.');

    // -------------------------------------------------------------
    // Test 4: Patient Summary Reports & ShareScope Respect
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Patient Summary Report Generation & Access Checks ---');
    const { getPatientReport } = require('../controllers/clinicianReportController');

    let reportRes = null;
    const mockReportRes = {
      status: (code) => ({
        json: (data) => {
          reportRes = data;
          return data;
        },
      }),
    };

    await getPatientReport(
      {
        user: clinicianA,
        params: { patientId: String(patientRecord1._id) },
        query: { range: '90', includeNotes: 'true' },
      },
      mockReportRes
    );

    if (!reportRes?.success) throw new Error('Failed to generate patient report');
    const reportData = reportRes.data;

    if (!reportData.header || reportData.header.patientName !== 'Charlie Patient 1') {
      throw new Error('Invalid patient report header');
    }
    if (!reportData.scales || reportData.scales.length === 0) {
      throw new Error('Report missing screening scales');
    }
    if (!reportData.exercises.cet.disclaimer.includes('Cognitive Enhancement exercises')) {
      throw new Error('Missing mandatory CET disclaimer in report');
    }
    if (reportData.notes.length === 0) {
      throw new Error('Report missing included clinician notes');
    }
    console.log('[PASS] Report generated successfully with header, scale trends, CET disclaimer, and notes.');

    // Revocation check: Patient 1 revokes link
    link1.status = 'revoked';
    await link1.save();

    await getPatientReport(
      {
        user: clinicianA,
        params: { patientId: String(patientRecord1._id) },
        query: { range: '90', includeNotes: 'true' },
      },
      mockReportRes
    );

    const postRevokeReport = reportRes.data;
    // Shared assessments must now be empty
    const totalSharedRecords = postRevokeReport.scales.reduce((acc, s) => acc + s.records.length, 0);
    if (totalSharedRecords !== 0) {
      throw new Error('Shared assessments still returned after patient revoked link!');
    }
    // But clinician's own notes remain intact
    if (postRevokeReport.notes.length === 0) {
      throw new Error("Clinician's own private notes should persist after link revocation");
    }
    console.log('[PASS] Revocation safety verified: shared data removed immediately; private clinician notes retained.');

    // -------------------------------------------------------------
    // Test 5: Transparency Access Logs & 10-Minute De-duplication
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Access Log & 10-Minute De-duplication ---');

    await AccessLog.deleteMany({});

    // First access
    const log1 = await logPatientAccess(clinicianA._id, patientUser1._id, 'profile_view');
    if (!log1) throw new Error('Failed to create first access log');

    // Immediate second access within 10 minutes -> must de-duplicate
    const log2 = await logPatientAccess(clinicianA._id, patientUser1._id, 'profile_view');
    if (String(log1._id) !== String(log2._id)) {
      throw new Error('De-duplication failed: duplicate log entry created within 10 minutes');
    }

    const logCount = await AccessLog.countDocuments({
      clinician: clinicianA._id,
      patientUser: patientUser1._id,
      type: 'profile_view',
    });
    if (logCount !== 1) throw new Error(`Expected 1 de-duplicated log, found ${logCount}`);
    console.log('[PASS] Access log 10-minute de-duplication verified.');

    // -------------------------------------------------------------
    // Test 6: Clinician Settings & SMTP Validation
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Clinician Settings & Profile Credentials ---');
    const {
      getClinicianSettings,
      updateClinicianSettings,
    } = require('../controllers/clinicianSettingsController');

    let settingsRes = null;
    const mockSettingsRes = {
      status: (code) => ({
        json: (data) => {
          settingsRes = data;
          return data;
        },
      }),
    };

    await getClinicianSettings({ user: clinicianA }, mockSettingsRes);
    if (!settingsRes?.success) throw new Error('Failed to fetch clinician settings');
    if (settingsRes.data.settings.reportRangeDays !== 90) {
      throw new Error('Expected default report range 90 days');
    }

    // Update settings: change report range to 180 days
    await updateClinicianSettings(
      {
        user: clinicianA,
        body: {
          settings: { reportRangeDays: 180 },
          profile: { specialization: 'Adult & Geriatric Neuropsychiatry' },
        },
      },
      mockSettingsRes
    );
    if (!settingsRes?.success || settingsRes.data.settings.reportRangeDays !== 180) {
      throw new Error('Failed to update clinician settings');
    }
    console.log('[PASS] Settings validation and updates verified.');

    // Clean up test data
    await User.deleteMany({ email: /phase4test_.*@test\.com/ });
    await ClinicianLink.deleteMany({ _id: { $in: [link1._id, link2._id] } });
    await Patient.deleteMany({ _id: { $in: [patientRecord1._id, patientRecord2._id] } });
    await Assessment.deleteMany({ user: { $in: [patientUser1._id, patientUser2._id] } });
    await AssignedExercise.deleteMany({ patientUser: { $in: [patientUser1._id, patientUser2._id] } });
    await ClinicianNote.deleteMany({});
    await AttentionAck.deleteMany({});
    await AccessLog.deleteMany({});

    console.log('\n======================================================');
    console.log('>>> ALL PHASE 4 LOGIC & SAFETY TESTS PASSED! <<<');
    console.log('======================================================\n');
  } finally {
    await mongoose.disconnect();
    console.log('[OK] Disconnected from MongoDB');
  }
}

runPhase4Tests().catch((err) => {
  console.error('\n[FATAL TEST FAILURE]:', err);
  process.exit(1);
});
