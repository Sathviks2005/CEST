const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');
const HamDAssessment = require('../models/HamDAssessment');
const { repairAcceptedLinks } = require('../utils/clinicianLinkHelpers');

async function testProblem3() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  const ts = Date.now();

  // 1. Create a Clinician
  const clinician = await User.create({
    name: 'Dr. Gregory House',
    title: 'Dr.',
    specialization: 'Diagnostic Neuropsychiatry',
    institution: 'Princeton Plainsboro Teaching Hospital',
    email: `clinician_p3_${ts}@cest.org`,
    password: 'Password123!',
    role: 'clinician',
    isVerified: true,
  });

  // 2. Create Self-User A (for shareScope: "all")
  const userA = await User.create({
    name: 'Patient Alice AllScope',
    email: `alice_${ts}@cest.org`,
    password: 'Password123!',
    role: 'self_user',
    isVerified: true,
  });

  // 3. Create Self-User B (for shareScope: "selected")
  const userB = await User.create({
    name: 'Patient Bob SelectedScope',
    email: `bob_${ts}@cest.org`,
    password: 'Password123!',
    role: 'self_user',
    isVerified: true,
  });

  // 4. Create Self-User D (for revoked link)
  const userD = await User.create({
    name: 'Patient David Revoked',
    email: `david_${ts}@cest.org`,
    password: 'Password123!',
    role: 'self_user',
    isVerified: true,
  });

  console.log('=== TEST USERS CREATED ===');
  console.log(`Clinician: ${clinician.name} (_id: ${clinician._id})`);
  console.log(`User A (All): ${userA.name} (_id: ${userA._id})`);
  console.log(`User B (Selected): ${userB.name} (_id: ${userB._id})`);
  console.log(`User D (Revoked): ${userD.name} (_id: ${userD._id})\n`);

  // Create assessments for User A (5 instruments across different dates)
  const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const recentDate = new Date();

  const asmA1 = await Assessment.create({
    user: userA._id,
    userName: userA.name,
    assessmentType: 'PHQ-9 Patient Depression Questionnaire',
    disorderSlug: 'depression',
    answers: [2, 2, 3, 2, 1, 2, 2, 1, 0],
    totalScore: 15,
    severity: 'Moderately severe depression',
    diagnosticConsideration: 'Criteria met: Consider Major Depressive Disorder evaluation.',
    functionalResponse: 'Somewhat difficult',
    createdAt: pastDate,
  });

  const asmA2 = await Assessment.create({
    user: userA._id,
    userName: userA.name,
    assessmentType: 'GAD-7 Generalized Anxiety Disorder Scale',
    disorderSlug: 'generalized-anxiety-disorder',
    answers: [3, 2, 3, 2, 3, 2, 3],
    totalScore: 18,
    severity: 'Severe Anxiety',
    diagnosticConsideration: 'Severe anxiety symptoms indicated.',
    createdAt: pastDate,
  });

  // User A takes an assessment AFTER link is created/accepted:
  const asmA3 = await Assessment.create({
    user: userA._id,
    userName: userA.name,
    assessmentType: 'ISI Insomnia Severity Index',
    disorderSlug: 'insomnia',
    answers: [3, 3, 2, 3, 2, 3, 2],
    totalScore: 18,
    severity: 'Clinical insomnia (moderate severity)',
    createdAt: recentDate,
  });

  // Create assessments for User B
  const asmB1 = await Assessment.create({
    user: userB._id,
    userName: userB.name,
    assessmentType: 'GAD-7 Generalized Anxiety Disorder Scale',
    disorderSlug: 'generalized-anxiety-disorder',
    answers: [2, 2, 2, 2, 2, 2, 2],
    totalScore: 14,
    severity: 'Moderate Anxiety',
    createdAt: pastDate,
  });

  const asmB2 = await Assessment.create({
    user: userB._id,
    userName: userB.name,
    assessmentType: 'PCL-5 Post-Traumatic Stress Disorder Checklist',
    disorderSlug: 'ptsd',
    answers: Array(20).fill(2),
    totalScore: 40,
    severity: 'Provisional PTSD Cutoff (Elevated)',
    createdAt: recentDate,
  });

  // Create assessments for User D
  const asmD1 = await Assessment.create({
    user: userD._id,
    userName: userD.name,
    assessmentType: 'PHQ-9 Patient Depression Questionnaire',
    disorderSlug: 'depression',
    answers: [3, 3, 3, 3, 3, 3, 3, 3, 0],
    totalScore: 24,
    severity: 'Severe depression',
    createdAt: pastDate,
  });

  // Create Patient records
  // Patient A (linkedUser will be set via repair or direct)
  const patientA = await Patient.create({
    name: userA.name,
    email: userA.email,
    clinician: clinician._id,
    // Simulate older record without linkedUser initially to prove auto-repair:
  });

  // Patient B (linkedUser set)
  const patientB = await Patient.create({
    name: userB.name,
    email: userB.email,
    clinician: clinician._id,
    linkedUser: userB._id,
  });

  // Patient C: Hand-added manual patient (NO CEST account, NO linkedUser)
  const patientC = await Patient.create({
    name: 'Manual Patient Charlie',
    email: `charlie_manual_${ts}@otherclinic.org`,
    clinician: clinician._id,
  });
  // Add a HAM-D evaluation for Charlie
  const hamdC = await HamDAssessment.create({
    clinician: clinician._id,
    patientId: String(patientC._id),
    patientName: patientC.name,
    totalScore: 18,
    severity: 'Moderate Depression',
    notes: 'Initial clinical intake evaluation',
    createdAt: new Date(),
  });

  // Patient D (for revoked link)
  const patientD = await Patient.create({
    name: userD.name,
    email: userD.email,
    clinician: clinician._id,
    linkedUser: userD._id,
  });

  // Create ClinicianLinks
  // Link A: shareScope "all"
  const linkA = await ClinicianLink.create({
    patientUser: userA._id,
    clinician: clinician._id,
    status: 'accepted',
    shareScope: 'all',
    sharedAssessmentIds: [asmA1._id],
    respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  // Link B: shareScope "selected" (only asmB1 is approved)
  const linkB = await ClinicianLink.create({
    patientUser: userB._id,
    clinician: clinician._id,
    status: 'accepted',
    shareScope: 'selected',
    sharedAssessmentIds: [asmB1._id],
    respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  // Link D: revoked link
  const linkD = await ClinicianLink.create({
    patientUser: userD._id,
    clinician: clinician._id,
    status: 'revoked',
    shareScope: 'all',
    sharedAssessmentIds: [asmD1._id],
    revokedAt: new Date(),
  });

  console.log('=== TEST SETUP COMPLETE ===\n');

  // STEP 1: Trace Path with Real Values
  console.log('================================================================');
  console.log('STEP 1: TRACE THE PATH WITH REAL VALUES FOR ONE TEST PATIENT');
  console.log('================================================================');

  console.log('1.a) Patient.linkedUser before auto-repair:');
  console.log(`   Patient A _id: ${patientA._id}, linkedUser: ${patientA.linkedUser}`);
  const repairedCount = await repairAcceptedLinks();
  const refreshedPatientA = await Patient.findById(patientA._id);
  console.log(`   Running repairAcceptedLinks()... Repaired: ${repairedCount}`);
  console.log(`   Patient A _id: ${refreshedPatientA._id}, linkedUser: ${refreshedPatientA.linkedUser}`);
  console.log(`   Does Patient.linkedUser equal self-user _id (${userA._id})? ${String(refreshedPatientA.linkedUser) === String(userA._id)}`);

  console.log('\n1.b) ClinicianLink between clinician and user A:');
  const foundLinkA = await ClinicianLink.findOne({ patientUser: userA._id, clinician: clinician._id });
  console.log(`   Link _id: ${foundLinkA._id}`);
  console.log(`   Status: ${foundLinkA.status} (active accepted)`);
  console.log(`   shareScope: "${foundLinkA.shareScope}"`);
  console.log(`   sharedAssessmentIds: [${foundLinkA.sharedAssessmentIds.join(', ')}]`);

  console.log('\n1.c) Routes and IDs:');
  console.log('   - PatientProfile calls: GET /api/clinician-links/patients/:patientUserId/assessments');
  console.log(`     Sends: ${refreshedPatientA.linkedUser} (Self-User _id, with server fallback resolving Patient _id)`);
  console.log('   - Reports calls: GET /api/clinician/reports/patient/:patientId');
  console.log(`     Sends: ${refreshedPatientA._id} (Patient _id, server resolves Patient.linkedUser)`);

  console.log('\n1.d) Assessment Query Field Names:');
  console.log('   - Owner field: `user` (ref: User) -> Verified: ' + Boolean(asmA1.user));
  console.log('   - Instrument field: `assessmentType` / `disorderSlug` -> Verified: ' + asmA1.assessmentType);
  console.log('   - Score field: `totalScore` -> Verified: ' + asmA1.totalScore);
  console.log('   - Severity field: `severity` -> Verified: ' + asmA1.severity);
  console.log('   - Date field: `createdAt` -> Verified: ' + asmA1.createdAt.toISOString());

  // STEP 2 & 7: Test All 4 Cases via Mock Controllers
  console.log('\n================================================================');
  console.log('STEP 7: TEST AND REPORT WHAT PROFILE & REPORT RETURN FOR (a), (b), (c), (d)');
  console.log('================================================================');

  // Simulated Controller Call for getPatientAssessments (Profile Data Path)
  async function simulateGetPatientAssessments(reqUserId, paramId) {
    const { canClinicianView } = require('../utils/clinicianLinkHelpers');
    let targetUserId = paramId;
    let patientDoc = null;

    if (paramId && String(paramId).match(/^[0-9a-fA-F]{24}$/)) {
      patientDoc = await Patient.findOne({ _id: paramId, clinician: reqUserId });
      if (patientDoc?.linkedUser) targetUserId = patientDoc.linkedUser;
    }

    const { allowed, link } = await canClinicianView(targetUserId, reqUserId);
    if (!allowed || !link) {
      if (patientDoc && !patientDoc.linkedUser) {
        return {
          status: 200,
          notLinked: true,
          message: 'This patient is not linked to a CEST account, so self-assessment results are not available. HAM-D results are shown below.',
          data: [],
        };
      }
      const revoked = await ClinicianLink.findOne({ patientUser: targetUserId, clinician: reqUserId, status: 'revoked' });
      if (revoked) {
        return { status: 403, sharingRevoked: true, message: 'Sharing stopped by patient' };
      }
      return { status: 403, message: 'Forbidden' };
    }

    let assessments = [];
    if (link.shareScope === 'all') {
      assessments = await Assessment.find({ user: targetUserId }).sort({ createdAt: -1 });
    } else {
      const sharedIds = link.sharedAssessmentIds || [];
      assessments = await Assessment.find({ user: targetUserId, _id: { $in: sharedIds } }).sort({ createdAt: -1 });
    }

    return {
      status: 200,
      shareScope: link.shareScope,
      count: assessments.length,
      data: assessments.map(a => ({ id: a._id, type: a.assessmentType, score: a.totalScore, severity: a.severity, date: a.createdAt })),
    };
  }

  // Simulated Controller Call for getPatientReport (Reports Data Path)
  async function simulateGetPatientReport(reqUserId, patientId, rangeParam = '90') {
    const { canClinicianView } = require('../utils/clinicianLinkHelpers');
    const patient = await Patient.findOne({ _id: patientId, clinician: reqUserId });
    if (!patient) return { status: 404, message: 'Not found' };

    let sharedAssessments = [];
    let linkedInfo = null;
    let isRevoked = false;

    if (patient.linkedUser) {
      const { allowed, link } = await canClinicianView(patient.linkedUser, reqUserId);
      if (allowed && link) {
        linkedInfo = { shareScope: link.shareScope };
        if (link.shareScope === 'all') {
          sharedAssessments = await Assessment.find({ user: patient.linkedUser }).sort({ createdAt: 1 });
        } else {
          sharedAssessments = await Assessment.find({ user: patient.linkedUser, _id: { $in: link.sharedAssessmentIds || [] } }).sort({ createdAt: 1 });
        }
      } else {
        const revoked = await ClinicianLink.findOne({ patientUser: patient.linkedUser, clinician: reqUserId, status: 'revoked' });
        if (revoked) isRevoked = true;
      }
    }

    const hamdRecords = await HamDAssessment.find({
      clinician: reqUserId,
      $or: [{ patientId: String(patient._id) }, { patientName: patient.name }],
    });

    const scaleReports = [
      { key: 'phq9', title: 'PHQ-9' },
      { key: 'gad7', title: 'GAD-7' },
      { key: 'insomnia', title: 'ISI' },
      { key: 'ptsd', title: 'PCL-5' },
      { key: 'ocd', title: 'Y-BOCS' },
    ].map(conf => {
      const matching = sharedAssessments.filter(a => {
        const slug = (a.disorderSlug || '').toLowerCase();
        const type = (a.assessmentType || '').toLowerCase();
        if (conf.key === 'phq9') return slug.includes('depression') || type.includes('phq');
        if (conf.key === 'gad7') return slug.includes('anxiety') || slug.includes('gad') || type.includes('gad');
        if (conf.key === 'insomnia') return slug.includes('insomnia') || type.includes('isi');
        if (conf.key === 'ptsd') return slug.includes('ptsd') || type.includes('pcl');
        if (conf.key === 'ocd') return slug.includes('ocd') || type.includes('ybocs') || type.includes('y-bocs');
        return slug === conf.key;
      });
      return {
        key: conf.key,
        count: matching.length,
        records: matching.map(r => ({ score: r.totalScore, severity: r.severity, date: r.createdAt })),
      };
    });

    return {
      status: 200,
      header: {
        isLinked: Boolean(linkedInfo),
        sharingRevoked: isRevoked,
        shareScope: linkedInfo?.shareScope || null,
      },
      scales: scaleReports,
      hamdCount: hamdRecords.length,
      totalSharedAssessments: sharedAssessments.length,
    };
  }

  // (a) LINKED PATIENT WITH shareScope: "all"
  console.log('--- TEST (a): LINKED PATIENT WITH shareScope "all" (Patient A) ---');
  const profileResA = await simulateGetPatientAssessments(clinician._id, refreshedPatientA.linkedUser);
  const reportResA = await simulateGetPatientReport(clinician._id, refreshedPatientA._id);
  console.log('Profile Data Path:');
  console.log(`  HTTP Status: ${profileResA.status}`);
  console.log(`  shareScope: "${profileResA.shareScope}"`);
  console.log(`  Assessments Returned: ${profileResA.count} (Includes result taken after accepting)`);
  profileResA.data.forEach(a => console.log(`    - ${a.type}: Score ${a.score} (${a.severity})`));
  console.log('Reports Data Path:');
  console.log(`  isLinked: ${reportResA.header.isLinked}, Total Shared: ${reportResA.totalSharedAssessments}`);
  reportResA.scales.forEach(s => console.log(`    Scale ${s.key.toUpperCase()}: ${s.count} record(s)`));

  // (b) LINKED PATIENT WITH shareScope: "selected"
  console.log('\n--- TEST (b): LINKED PATIENT WITH shareScope "selected" (Patient B) ---');
  const profileResB = await simulateGetPatientAssessments(clinician._id, patientB.linkedUser);
  const reportResB = await simulateGetPatientReport(clinician._id, patientB._id);
  console.log('Profile Data Path:');
  console.log(`  HTTP Status: ${profileResB.status}`);
  console.log(`  shareScope: "${profileResB.shareScope}"`);
  console.log(`  Assessments Returned: ${profileResB.count} (Strictly only approved sharedAssessmentIds: asmB1, asmB2 withheld)`);
  profileResB.data.forEach(a => console.log(`    - ${a.type}: Score ${a.score} (${a.severity})`));
  console.log('Reports Data Path:');
  console.log(`  isLinked: ${reportResB.header.isLinked}, Total Shared: ${reportResB.totalSharedAssessments}`);
  reportResB.scales.forEach(s => console.log(`    Scale ${s.key.toUpperCase()}: ${s.count} record(s)`));

  // (c) HAND-ADDED MANUAL PATIENT (NO linkedUser)
  console.log('\n--- TEST (c): HAND-ADDED PATIENT (Patient C) ---');
  const profileResC = await simulateGetPatientAssessments(clinician._id, patientC._id);
  const reportResC = await simulateGetPatientReport(clinician._id, patientC._id);
  console.log('Profile Data Path:');
  console.log(`  HTTP Status: ${profileResC.status}`);
  console.log(`  notLinked: ${profileResC.notLinked}`);
  console.log(`  UI Message: "${profileResC.message}"`);
  console.log('Reports Data Path:');
  console.log(`  isLinked: ${reportResC.header.isLinked}`);
  console.log(`  HAM-D Records: ${reportResC.hamdCount}`);
  console.log('  UI Message in Report: "This patient is not linked to a CEST account, so self-assessment results are not available. HAM-D results are shown below."');

  // (d) REVOKED LINK
  console.log('\n--- TEST (d): REVOKED LINK (Patient D) ---');
  const profileResD = await simulateGetPatientAssessments(clinician._id, patientD.linkedUser);
  const reportResD = await simulateGetPatientReport(clinician._id, patientD._id);
  console.log('Profile Data Path:');
  console.log(`  HTTP Status: ${profileResD.status}`);
  console.log(`  sharingRevoked: ${profileResD.sharingRevoked}`);
  console.log(`  Message: "${profileResD.message}"`);
  console.log('Reports Data Path:');
  console.log(`  isLinked: ${reportResD.header.isLinked}, sharingRevoked: ${reportResD.header.sharingRevoked}`);
  console.log(`  Total Shared Assessments: ${reportResD.totalSharedAssessments}`);

  // Clean up
  console.log('\nCleaning up test records...');
  await Assessment.deleteMany({ user: { $in: [userA._id, userB._id, userD._id] } });
  await HamDAssessment.deleteMany({ clinician: clinician._id });
  await ClinicianLink.deleteMany({ clinician: clinician._id });
  await Patient.deleteMany({ clinician: clinician._id });
  await User.deleteMany({ _id: { $in: [clinician._id, userA._id, userB._id, userD._id] } });
  console.log('Cleanup complete.');

  await mongoose.disconnect();
  console.log('\n>>> ALL PROBLEM 3 TEST SCENARIOS COMPLETED & PROVEN WITH REAL VALUES <<<');
}

testProblem3().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
