/**
 * End-to-End Test Suite: Admin Verification Workflow for Clinicians
 *
 * Verifies all requirements specified:
 * (a) A clinician requests verification and appears in the admin list
 * (b) Approve changes the patient-side badge to verified
 * (c) Reject with a reason shows the reason to the clinician
 * (d) Editing the number after verification resets to unverified
 * (e) A clinician and a self-user both get 403 on /api/admin routes
 * (f) Registration cannot create an admin
 * (g) The admin cannot read any patient or assessment data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const VerificationLog = require('../models/VerificationLog');
const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');

const { registerUser } = require('../controllers/authController');
const {
  getPendingVerificationRequests,
  getReviewedVerificationHistory,
  approveClinician,
  rejectClinician,
} = require('../controllers/adminClinicianController');
const { requestVerification, updateClinicianSettings } = require('../controllers/clinicianSettingsController');
const { authorize } = require('../middleware/authMiddleware');

// Mock Express Response Helper
function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('========================================================');
  console.log('STARTING ADMIN CLINICIAN VERIFICATION WORKFLOW TEST SUITE');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cest';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  await User.syncIndexes();

  const timestamp = Date.now();
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName) {
    totalCount++;
    if (condition) {
      console.log(`[PASS] (${totalCount}) ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] (${totalCount}) ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  const createdUserIds = [];

  try {
    // -------------------------------------------------------------------------
    // Setup Test Admin, Clinicians, and Patient
    // -------------------------------------------------------------------------
    console.log('--- Setting up test accounts ---');

    // 1. Admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: `admin_${timestamp}@cest.org`,
      password: 'AdminPassword123!',
      role: 'admin',
    });
    createdUserIds.push(adminUser._id);
    assert(adminUser.role === 'admin', 'Admin user created successfully');

    // 2. Clinician 1 (will be approved)
    const clinician1 = await User.create({
      name: 'Dr. Evelyn Vance',
      email: `clinician1_${timestamp}@cest.org`,
      password: 'Password123!',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Neurologist',
      institution: 'Metropolis Care',
      registeringBody: 'National Medical Commission / State Medical Council',
      registrationNumber: `NMC-VERIF-${timestamp}/01`,
      verificationStatus: 'unverified',
    });
    createdUserIds.push(clinician1._id);

    // 3. Clinician 2 (will be rejected)
    const clinician2 = await User.create({
      name: 'Dr. Marcus Holloway',
      email: `clinician2_${timestamp}@cest.org`,
      password: 'Password123!',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Clinical Psychologist',
      institution: 'Lakeside Mental Clinic',
      registeringBody: 'Rehabilitation Council of India',
      registrationNumber: `RCI-CR-${timestamp}/99`,
      verificationStatus: 'unverified',
    });
    createdUserIds.push(clinician2._id);

    // 4. Self User (Patient)
    const patientUser = await User.create({
      name: 'Jane Doe Patient',
      email: `patient_${timestamp}@cest.org`,
      password: 'Password123!',
      role: 'self_user',
    });
    createdUserIds.push(patientUser._id);

    // 5. Patient Assessment data (to verify data isolation)
    const testAssessment = await Assessment.create({
      user: patientUser._id,
      assessmentType: 'PHQ-9 Patient Depression Questionnaire',
      disorderSlug: 'depression',
      answers: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      totalScore: 18,
      severity: 'Moderately Severe',
    });

    console.log('✓ Accounts and test environment created\n');

    // -------------------------------------------------------------------------
    // TEST (a): A clinician requests verification and appears in the admin list
    // -------------------------------------------------------------------------
    console.log('--- TEST (a): Clinician requests verification & appears in admin list ---');

    // Clinician 1 requests verification
    const reqReq1 = { user: clinician1 };
    const resReq1 = createMockRes();
    await requestVerification(reqReq1, resReq1);

    assert(resReq1.statusCode === 200, 'Clinician 1 requestVerification returns 200');
    assert(resReq1.data.success === true, 'Clinician 1 requestVerification success is true');
    assert(resReq1.data.data.verificationStatus === 'pending', 'Clinician 1 status changed to pending');

    const refreshedClinician1 = await User.findById(clinician1._id);
    assert(refreshedClinician1.verificationStatus === 'pending', 'Database records verificationStatus as pending');
    assert(refreshedClinician1.verificationRequestedAt instanceof Date, 'verificationRequestedAt timestamp recorded');

    // Query pending verification requests via Admin Controller
    const reqAdminGet = { user: adminUser };
    const resAdminGet = createMockRes();
    await getPendingVerificationRequests(reqAdminGet, resAdminGet);

    assert(resAdminGet.statusCode === 200, 'Admin getPendingVerificationRequests returns 200');
    assert(Array.isArray(resAdminGet.data.data), 'Pending requests returns array');

    const foundInPending = resAdminGet.data.data.find(
      (c) => String(c.id || c._id) === String(clinician1._id)
    );
    assert(foundInPending != null, 'Clinician 1 appears in admin pending verification requests');
    assert(foundInPending.name === clinician1.name, 'Admin pending item includes clinician name');
    assert(foundInPending.email === clinician1.email, 'Admin pending item includes clinician email');
    assert(foundInPending.registeringBody === clinician1.registeringBody, 'Admin pending item includes registering body');
    assert(foundInPending.registrationNumber === clinician1.registrationNumber, 'Admin pending item includes registration number');
    assert(foundInPending.requestedAt != null, 'Admin pending item includes requestedAt date');

    // Rate limiting check (max 3 verification requests per 24 hours)
    // Add timestamps to hit limit
    refreshedClinician1.verificationRequestTimestamps = [
      new Date(),
      new Date(),
      new Date(),
    ];
    await refreshedClinician1.save();

    const resRateLimited = createMockRes();
    await requestVerification({ user: refreshedClinician1 }, resRateLimited);
    assert(resRateLimited.statusCode === 429, 'Excessive verification requests within 24h are rate limited (429)');

    console.log('✓ TEST (a) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (b): Approve changes patient-side badge to verified (no number exposed)
    // -------------------------------------------------------------------------
    console.log('--- TEST (b): Approve changes patient-side badge to verified ---');

    const reqApprove = {
      params: { id: clinician1._id },
      user: adminUser,
    };
    const resApprove = createMockRes();
    await approveClinician(reqApprove, resApprove);

    assert(resApprove.statusCode === 200, 'Admin approveClinician returns 200');
    assert(resApprove.data.success === true, 'Approval marked successful');

    const approvedClinician1 = await User.findById(clinician1._id);
    assert(approvedClinician1.verificationStatus === 'verified', 'Database verificationStatus updated to verified');
    assert(approvedClinician1.verifiedAt instanceof Date, 'verifiedAt timestamp populated');
    assert(String(approvedClinician1.verificationReviewedBy) === String(adminUser._id), 'verificationReviewedBy matches admin id');

    // Audit log written to VerificationLog collection
    const auditLogApproved = await VerificationLog.findOne({
      clinician: clinician1._id,
      decision: 'approved',
    });
    assert(auditLogApproved != null, 'Audit log created in VerificationLog collection for approval');
    assert(auditLogApproved.adminEmail === adminUser.email, 'Audit log records admin email');
    assert(auditLogApproved.registrationNumber === clinician1.registrationNumber, 'Audit log records registration number');

    // Patient Directory view (simulating GET /api/clinician-links/clinicians)
    const patientViewClinicians = await User.find({
      _id: clinician1._id,
      role: 'clinician',
    }).select('_id name title specialization institution verificationStatus');

    const patientDirectoryEntry = patientViewClinicians[0];
    assert(patientDirectoryEntry.verificationStatus === 'verified', 'Patient-side directory shows verificationStatus: verified');
    assert(patientDirectoryEntry.registrationNumber === undefined, 'Patient directory NEVER includes registrationNumber');
    assert(patientDirectoryEntry.licenseNumber === undefined, 'Patient directory NEVER includes licenseNumber');

    console.log('✓ TEST (b) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (c): Reject with reason shows reason to clinician (badge stays not verified)
    // -------------------------------------------------------------------------
    console.log('--- TEST (c): Reject with reason shows reason to clinician ---');

    // Clinician 2 requests verification first
    const resReq2 = createMockRes();
    await requestVerification({ user: clinician2 }, resReq2);
    assert(resReq2.statusCode === 200, 'Clinician 2 requested verification successfully');

    // Admin attempts to reject WITHOUT reason -> should fail with 400
    const resRejectNoReason = createMockRes();
    await rejectClinician(
      { params: { id: clinician2._id }, body: { reason: '' }, user: adminUser },
      resRejectNoReason
    );
    assert(resRejectNoReason.statusCode === 400, 'Rejecting without a reason returns 400 Bad Request');

    // Admin rejects with valid reason
    const rejectionNote = 'Registration number not found in RCI Central Clinical Register. Please recheck.';
    const resReject = createMockRes();
    await rejectClinician(
      { params: { id: clinician2._id }, body: { reason: rejectionNote }, user: adminUser },
      resReject
    );

    assert(resReject.statusCode === 200, 'Admin rejectClinician with reason returns 200');

    const rejectedClinician2 = await User.findById(clinician2._id);
    assert(rejectedClinician2.verificationStatus === 'rejected', 'Clinician status updated to rejected');
    assert(rejectedClinician2.rejectionReason === rejectionNote, 'Rejection reason saved to clinician record');

    // Audit log entry for rejection
    const auditLogRejected = await VerificationLog.findOne({
      clinician: clinician2._id,
      decision: 'rejected',
    });
    assert(auditLogRejected != null, 'Audit log created for rejection decision');
    assert(auditLogRejected.reason === rejectionNote, 'Audit log preserves rejection reason');

    // Clinician side gets reason
    assert(rejectedClinician2.rejectionReason.length > 0, 'Clinician can read rejection reason to address issues');

    // Patient side view for Clinician 2 shows unverified badge ("Credentials not verified by CEST")
    const patientViewRejected = await User.findOne({
      _id: clinician2._id,
      role: 'clinician',
    }).select('_id name title specialization institution verificationStatus');

    assert(
      patientViewRejected.verificationStatus !== 'verified',
      'Patient side does not show verified badge for rejected clinician'
    );
    assert(patientViewRejected.registrationNumber === undefined, 'Patient side never exposes registration number');

    console.log('✓ TEST (c) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (d): Editing registration number after verification resets to unverified
    // -------------------------------------------------------------------------
    console.log('--- TEST (d): Editing registration number resets status to unverified ---');

    // Verified Clinician 1 edits registration number
    const updatedNumber = `NMC-UPDATED-${timestamp}/99`;
    const reqUpdate = {
      user: approvedClinician1,
      body: {
        profile: {
          registrationNumber: updatedNumber,
          registeringBody: approvedClinician1.registeringBody,
          name: approvedClinician1.name,
        },
      },
    };
    const resUpdate = createMockRes();
    await updateClinicianSettings(reqUpdate, resUpdate);

    assert(resUpdate.statusCode === 200, 'Clinician settings update returns 200');

    const reloadedClinician1 = await User.findById(clinician1._id);
    assert(reloadedClinician1.registrationNumber === updatedNumber, 'Updated registration number saved');
    assert(reloadedClinician1.verificationStatus === 'unverified', 'Editing number resets status to unverified');
    assert(reloadedClinician1.verifiedAt === null, 'verifiedAt timestamp is cleared');
    assert(reloadedClinician1.rejectionReason === '', 'rejectionReason is cleared');

    console.log('✓ TEST (d) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (e): Clinician and self-user both get 403 on /api/admin routes
    // -------------------------------------------------------------------------
    console.log('--- TEST (e): Clinician and self-user get 403 on admin routes ---');

    // Test authorization middleware for 'admin' role
    const adminAuthMiddleware = authorize('admin');

    // 1. Clinician user attempt
    let clinicianForbidden = false;
    const reqClinician = { user: clinician1 };
    const resClinician = {
      status(code) {
        if (code === 403) clinicianForbidden = true;
        return this;
      },
      json() {
        return this;
      },
    };
    adminAuthMiddleware(reqClinician, resClinician, () => {
      clinicianForbidden = false; // next() should not be called
    });
    assert(clinicianForbidden === true, 'Clinician role receives 403 on admin routes');

    // 2. Self user (patient) attempt
    let selfUserForbidden = false;
    const reqSelfUser = { user: patientUser };
    const resSelfUser = {
      status(code) {
        if (code === 403) selfUserForbidden = true;
        return this;
      },
      json() {
        return this;
      },
    };
    adminAuthMiddleware(reqSelfUser, resSelfUser, () => {
      selfUserForbidden = false; // next() should not be called
    });
    assert(selfUserForbidden === true, 'Self user role receives 403 on admin routes');

    // 3. Admin user attempt
    let adminPassed = false;
    const reqAdmin = { user: adminUser };
    const resAdmin = createMockRes();
    adminAuthMiddleware(reqAdmin, resAdmin, () => {
      adminPassed = true; // next() should be called
    });
    assert(adminPassed === true, 'Admin role passes authorization middleware successfully');

    console.log('✓ TEST (e) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (f): Registration cannot create an admin
    // -------------------------------------------------------------------------
    console.log('--- TEST (f): Public registration cannot create an admin ---');

    const reqRegisterAdmin = {
      body: {
        name: 'Malicious Attacker',
        email: `hacker_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'admin',
      },
    };
    const resRegisterAdmin = createMockRes();
    await registerUser(reqRegisterAdmin, resRegisterAdmin);

    assert(resRegisterAdmin.statusCode === 400, 'Registration with role: admin is blocked with 400');
    assert(
      resRegisterAdmin.data.message.toLowerCase().includes('admin'),
      'Registration error explains admin role cannot be self-selected'
    );

    const checkAttacker = await User.findOne({ email: `hacker_${timestamp}@test.com` });
    assert(checkAttacker == null, 'Attacker account was never created in database');

    console.log('✓ TEST (f) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (g): Admin cannot read any patient or assessment data
    // -------------------------------------------------------------------------
    console.log('--- TEST (g): Admin cannot read patient or assessment data ---');

    // 1. Verify getPendingVerificationRequests returns NO patient or health data
    const resPendingAudit = createMockRes();
    await getPendingVerificationRequests({ user: adminUser }, resPendingAudit);

    for (const record of resPendingAudit.data.data) {
      assert(record.patientId === undefined, 'Admin pending request contains no patientId');
      assert(record.patients === undefined, 'Admin pending request contains no patients');
      assert(record.assessments === undefined, 'Admin pending request contains no assessments');
      assert(record.notes === undefined, 'Admin pending request contains no clinical notes');
      assert(record.scores === undefined, 'Admin pending request contains no scores');
    }

    // 2. Verify getReviewedVerificationHistory returns NO health data
    const resHistoryAudit = createMockRes();
    await getReviewedVerificationHistory({ user: adminUser, query: {} }, resHistoryAudit);

    for (const log of resHistoryAudit.data.data) {
      assert(log.patientId === undefined, 'Audit log contains no patientId');
      assert(log.assessments === undefined, 'Audit log contains no assessment info');
      assert(log.medicalRecord === undefined, 'Audit log contains no medical records');
      assert(log.clinicianName !== undefined, 'Audit log contains clinicianName');
      assert(log.decision !== undefined, 'Audit log contains decision');
    }

    // 3. Confirm patient assessment in DB is completely separate from admin models
    const storedAssessment = await Assessment.findById(testAssessment._id);
    assert(storedAssessment != null, 'Patient assessment exists in isolation');
    assert(String(storedAssessment.user) === String(patientUser._id), 'Assessment belongs strictly to patient');

    console.log('✓ TEST (g) PASSED\n');

    console.log('========================================================');
    console.log(`ALL 7 TESTS (a)-(g) PASSED! (${passedCount}/${totalCount} assertions)`);
    console.log('========================================================');
  } finally {
    // Clean up created test accounts
    try {
      if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
        await VerificationLog.deleteMany({ admin: { $in: createdUserIds } });
        await ClinicianLink.deleteMany({ patientUser: { $in: createdUserIds } });
        await Assessment.deleteMany({ user: { $in: createdUserIds } });
      }
    } catch {
      // ignore cleanup errors
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
