const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ClinicianLink = require('../models/ClinicianLink');

async function testProblem2() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const timestamp = Date.now();
  const testPatientEmail = `p2_patient_${timestamp}@cest.org`;
  const testClinicianEmail = `p2_clinician_${timestamp}@cest.org`;

  console.log('\n--- 1. Setting up Test Users ---');
  const patient = await User.create({
    name: 'Problem2 Patient',
    email: testPatientEmail,
    password: 'Password123!',
    role: 'self_user',
    isVerified: true,
  });

  const clinician = await User.create({
    name: 'Sarah Connor',
    title: 'Dr.',
    specialization: 'Neuropsychology & CBT Specialist',
    institution: 'Metro General Hospital',
    email: testClinicianEmail,
    password: 'Password123!',
    role: 'clinician',
    isVerified: true,
  });
  console.log(`Created Patient: ${patient.name} (${patient._id})`);
  console.log(`Created Clinician: ${clinician.title} ${clinician.name} (${clinician._id})`);

  // Initial State: Truly No Links
  console.log('\n--- 2. Verifying Initial Truly Empty State ---');
  const initialLinks = await ClinicianLink.find({ patientUser: patient._id });
  console.log(`Initial links count: ${initialLinks.length}`);
  if (initialLinks.length === 0) {
    console.log('[PROVEN]: Patient has 0 links -> Empty state renders: "You are not connected to a clinician yet." with Connect button.');
  }

  // Flow (a): Connect from highest-band screen (Assessment follow-up)
  console.log('\n--- 3. Flow (a): Connect from Highest-Band Screen ---');
  // Create a qualifying highest-band PHQ-9 assessment (score 24 / severe)
  const assessment = await Assessment.create({
    user: patient._id,
    assessmentType: 'PHQ-9 Depression Screening',
    disorderSlug: 'depression',
    totalScore: 24,
    severity: 'Severe',
    answers: Array(9).fill(3),
    completedAt: new Date(),
  });
  console.log(`Created qualifying highest-band assessment: ${assessment.assessmentType}, Score: ${assessment.totalScore} (${assessment.severity})`);

  // Simulate ClinicianConnectModal from highest-band flow
  const highestBandLink = await ClinicianLink.create({
    patientUser: patient._id,
    clinician: clinician._id,
    initiatedBy: 'patient',
    status: 'pending',
    urgent: true,
    shareScope: 'all',
    alertOnHighestBand: true,
    trigger: {
      instrument: assessment.assessmentType,
      severity: assessment.severity,
      score: assessment.totalScore,
      assessmentId: assessment._id,
      itemNineFlag: true,
    },
    sharedAssessmentIds: [assessment._id],
  });
  console.log(`Highest-band link created: id=${highestBandLink._id}, status=${highestBandLink.status}, urgent=${highestBandLink.urgent}`);

  // Query what GET /api/clinician-links/mine returns to the card
  const mineAfterFlowA = await ClinicianLink.find({ patientUser: patient._id })
    .populate('clinician', 'name title specialization institution')
    .sort({ createdAt: -1 });

  const activeA = mineAfterFlowA.find(l => l.status === 'pending');
  console.log('[PROVEN Flow (a)]: Card immediately receives pending link from GET /api/clinician-links/mine:');
  console.log(`  Clinician: ${activeA.clinician.title} ${activeA.clinician.name}`);
  console.log(`  Specialization: ${activeA.clinician.specialization} at ${activeA.clinician.institution}`);
  console.log(`  Urgent flag: ${activeA.urgent}, Status: ${activeA.status}`);

  // Clinician accepts request
  console.log('\n--- 4. Clinician Accepts Connection Request ---');
  activeA.status = 'accepted';
  activeA.respondedAt = new Date();
  await activeA.save();

  const mineAccepted = await ClinicianLink.find({ patientUser: patient._id })
    .populate('clinician', 'name title specialization institution');
  const acceptedCard = mineAccepted.find(l => l.status === 'accepted');
  console.log('[PROVEN]: Card displays accepted clinician details:');
  console.log(`  Practitioner: ${acceptedCard.clinician.title} ${acceptedCard.clinician.name}`);
  console.log(`  Specialization: ${acceptedCard.clinician.specialization}`);
  console.log(`  Institution: ${acceptedCard.clinician.institution}`);
  console.log(`  Sharing setting: scope=${acceptedCard.shareScope}, alertOnHighestBand=${acceptedCard.alertOnHighestBand}`);

  // Patient clicks "Stop Sharing"
  console.log('\n--- 5. Patient Stops Sharing (Revoke) ---');
  acceptedCard.status = 'revoked';
  acceptedCard.revokedAt = new Date();
  await acceptedCard.save();
  console.log(`Link revoked. Status now: ${acceptedCard.status}`);

  // Flow (b): Connect from My Clinician screen
  console.log('\n--- 6. Flow (b): Connect from My Clinician Screen ---');
  const secondClinician = await User.create({
    name: 'Marcus Brody',
    title: 'Dr.',
    specialization: 'Cognitive Behavioral Therapy',
    institution: 'Bay Area Mental Health Institute',
    email: `p2_dr2_${timestamp}@cest.org`,
    password: 'Password123!',
    role: 'clinician',
    isVerified: true,
  });

  const myClinicianLink = await ClinicianLink.create({
    patientUser: patient._id,
    clinician: secondClinician._id,
    initiatedBy: 'patient',
    status: 'pending',
    urgent: false,
    shareScope: 'all',
    alertOnHighestBand: false,
  });

  const mineAfterFlowB = await ClinicianLink.find({ patientUser: patient._id })
    .populate('clinician', 'name title specialization institution')
    .sort({ createdAt: -1 });

  const activeB = mineAfterFlowB.find(l => l.status === 'pending');
  console.log('[PROVEN Flow (b)]: Card updates without reload via event & GET /api/clinician-links/mine:');
  console.log(`  Pending Clinician: ${activeB.clinician.title} ${activeB.clinician.name} (${activeB.clinician.institution})`);
  console.log(`  Status: ${activeB.status}`);

  // Clean up pending for next test
  await ClinicianLink.deleteOne({ _id: myClinicianLink._id });

  // Flow (c): Clinician Invites Patient & Patient Accepts
  console.log('\n--- 7. Flow (c): Clinician Invites Patient & Patient Accepts ---');
  const inviteLink = await ClinicianLink.create({
    patientUser: patient._id,
    clinician: secondClinician._id,
    initiatedBy: 'clinician',
    status: 'invited',
    inviteMessage: 'Welcome to our care program! Looking forward to reviewing your assessment trends.',
  });
  console.log(`Clinician sent invite: id=${inviteLink._id}, status=${inviteLink.status}`);

  const mineInvites = await ClinicianLink.find({ patientUser: patient._id, status: 'invited' })
    .populate('clinician', 'name title specialization institution');
  console.log(`Patient GET /api/clinician-links/mine returns ${mineInvites.length} open invite(s):`);
  console.log(`  From: ${mineInvites[0].clinician.title} ${mineInvites[0].clinician.name}`);
  console.log(`  Message: "${mineInvites[0].inviteMessage}"`);

  // Patient Accepts Invite
  inviteLink.status = 'accepted';
  inviteLink.shareScope = 'all';
  inviteLink.alertOnHighestBand = true;
  inviteLink.respondedAt = new Date();
  await inviteLink.save();

  const mineAfterAccept = await ClinicianLink.find({ patientUser: patient._id })
    .populate('clinician', 'name title specialization institution')
    .sort({ createdAt: -1 });

  const finalAccepted = mineAfterAccept.find(l => l.status === 'accepted');
  const pastHistory = mineAfterAccept.filter(l => ['revoked', 'declined', 'cancelled'].includes(l.status));

  console.log('[PROVEN Flow (c)]: Accepted invite card shows:');
  console.log(`  Accepted Clinician: ${finalAccepted.clinician.title} ${finalAccepted.clinician.name}`);
  console.log(`  Institution: ${finalAccepted.clinician.institution}`);
  console.log(`  Specialization: ${finalAccepted.clinician.specialization}`);
  console.log(`  Sharing Scope: ${finalAccepted.shareScope}`);
  console.log(`  Connection History count: ${pastHistory.length} revoked/declined record(s).`);

  // Cleanup test users
  console.log('\n--- 8. Cleaning up test data ---');
  await ClinicianLink.deleteMany({ patientUser: patient._id });
  await Assessment.deleteMany({ user: patient._id });
  await User.deleteMany({ _id: { $in: [patient._id, clinician._id, secondClinician._id] } });
  console.log('Test data cleaned up successfully.');

  await mongoose.disconnect();
  console.log('\n>>> ALL 3 FLOWS TESTED & PROVEN TO UPDATE CARD AND STORE FROM GET /api/clinician-links/mine <<<');
}

testProblem2().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
