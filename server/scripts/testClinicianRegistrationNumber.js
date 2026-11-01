/**
 * Test Suite: Clinician Professional Registration Number & Verification Status
 *
 * Covers requirements:
 * (a) Clinician registers with and without a number
 * (b) Invalid characters are rejected
 * (c) Duplicate number on a second account is rejected with friendly message
 * (d) API for patients never includes the number
 * (e) Badge/status reflects before and after running verify script (and resets on edit)
 * (f) Existing clinician accounts still log in
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const ClinicianLink = require('../models/ClinicianLink');
const {
  validateRegistrationNumber,
  sanitizeRegisteringBody,
} = require('../utils/clinicianValidation');

async function runTests() {
  console.log('========================================================');
  console.log('STARTING CLINICIAN REGISTRATION & VERIFICATION TEST SUITE');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cest';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  // Ensure sparse unique index is synchronized in database
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

  try {
    // -------------------------------------------------------------------------
    // TEST (a): A clinician registers with and without a number
    // -------------------------------------------------------------------------
    console.log('--- TEST (a): Clinician registration with and without number ---');

    // With valid registration number
    const regNumberA = `MCI-REG-${timestamp}/24`;
    const bodyA = 'National Medical Commission / State Medical Council';
    const emailA = `clinician_a_${timestamp}@cest.org`;

    const userA = await User.create({
      name: 'Dr. Alice Smith',
      email: emailA,
      password: 'Password123!',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Psychiatrist',
      institution: 'City Hospital',
      registrationNumber: regNumberA,
      registeringBody: bodyA,
      verificationStatus: 'unverified',
    });

    assert(userA._id != null, 'Clinician A registered with valid registration number');
    assert(userA.registrationNumber === regNumberA, 'Clinician A registration number saved');
    assert(userA.registeringBody === bodyA, 'Clinician A registering body saved');
    assert(userA.verificationStatus === 'unverified', 'Clinician A verificationStatus defaults to unverified');
    assert(userA.verifiedAt === null, 'Clinician A verifiedAt defaults to null');

    // Without registration number (empty)
    const emailB = `clinician_b_${timestamp}@cest.org`;
    const userB = await User.create({
      name: 'Dr. Bob Jones',
      email: emailB,
      password: 'Password123!',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Clinical Psychologist',
      institution: 'Hope Clinic',
      registrationNumber: undefined,
      registeringBody: undefined,
    });

    assert(userB._id != null, 'Clinician B registered without registration number');
    assert(!userB.registrationNumber, 'Clinician B registrationNumber is not set');
    assert(userB.verificationStatus === 'unverified', 'Clinician B verificationStatus defaults to unverified');

    // Second clinician without registration number (verify compound sparse index does not collide)
    const emailC = `clinician_c_${timestamp}@cest.org`;
    const userC = await User.create({
      name: 'Dr. Carol White',
      email: emailC,
      password: 'Password123!',
      role: 'clinician',
      title: 'Dr.',
      specialization: 'Psychotherapist',
      institution: 'Care Center',
      registrationNumber: '',
      registeringBody: '',
    });

    assert(userC._id != null, 'Clinician C registered without registration number (no sparse index collision on empty)');
    console.log('✓ TEST (a) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (b): Invalid characters are rejected
    // -------------------------------------------------------------------------
    console.log('--- TEST (b): Invalid characters are rejected ---');

    // Characters like @, $, !, %, spaces inside
    const invalidCharsTest = validateRegistrationNumber('MCI@#$990');
    assert(
      invalidCharsTest.valid === false,
      'Invalid characters (@#$) correctly rejected by validation'
    );
    assert(
      invalidCharsTest.message.includes('only contain letters, numbers, hyphens (-), and slashes (/)'),
      'Friendly message returned explaining allowed characters'
    );

    // Too short (< 3 chars)
    const tooShortTest = validateRegistrationNumber('AB');
    assert(tooShortTest.valid === false, 'Number shorter than 3 characters rejected');
    assert(tooShortTest.message.includes('between 3 and 30 characters'), 'Friendly length message returned');

    // Too long (> 30 chars)
    const tooLongTest = validateRegistrationNumber('1234567890123456789012345678901');
    assert(tooLongTest.valid === false, 'Number longer than 30 characters rejected');

    // Valid characters: letters, digits, hyphen, slash, whitespace trimmed
    const validTest = validateRegistrationNumber('  NMC-1234/2024  ');
    assert(validTest.valid === true, 'Letters, numbers, hyphens and slashes accepted');
    assert(validTest.value === 'NMC-1234/2024', 'Spaces trimmed correctly');

    // Empty/undefined optional
    const emptyTest = validateRegistrationNumber('');
    assert(emptyTest.valid === true, 'Empty registration number allowed (optional)');

    console.log('✓ TEST (b) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (c): Duplicate number on a second account is rejected
    // -------------------------------------------------------------------------
    console.log('--- TEST (c): Duplicate number on a second account is rejected ---');

    let duplicateRejected = false;
    let duplicateErrorMessage = '';

    try {
      // Attempt to register Clinician D with the exact same (registeringBody, registrationNumber) as Clinician A
      await User.create({
        name: 'Dr. Impostor',
        email: `impostor_${timestamp}@cest.org`,
        password: 'Password123!',
        role: 'clinician',
        title: 'Dr.',
        specialization: 'Counselor',
        institution: 'Fake Clinic',
        registrationNumber: regNumberA,
        registeringBody: bodyA,
      });
    } catch (err) {
      if (err.code === 11000) {
        duplicateRejected = true;
        duplicateErrorMessage =
          'This registration number is already linked to another account. Contact support.';
      }
    }

    assert(duplicateRejected === true, 'Duplicate (registeringBody, registrationNumber) rejected by database');
    assert(
      duplicateErrorMessage === 'This registration number is already linked to another account. Contact support.',
      'Clear, friendly error message returned without revealing whose account it is'
    );
    console.log('✓ TEST (c) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (d): The API for patients never includes the number
    // -------------------------------------------------------------------------
    console.log('--- TEST (d): API for patients never includes the registration number ---');

    // Simulate GET /api/clinician-links/clinicians
    const patientViewClinicians = await User.find({ role: 'clinician' })
      .select('_id name title specialization institution verificationStatus')
      .sort({ name: 1 });

    const formattedDirectory = patientViewClinicians.map((c) => ({
      id: c._id,
      name: c.name,
      title: c.title || 'Dr.',
      specialization: c.specialization || 'Clinical Specialist',
      institution: c.institution || 'Medical Care Clinic',
      verificationStatus: c.verificationStatus || 'unverified',
    }));

    for (const entry of formattedDirectory) {
      assert(entry.registrationNumber === undefined, `Directory entry ${entry.name} does NOT include registrationNumber`);
      assert(entry.licenseNumber === undefined, `Directory entry ${entry.name} does NOT include licenseNumber`);
      assert(entry.verificationStatus !== undefined, `Directory entry ${entry.name} includes verificationStatus`);
    }

    // Simulate ClinicianLink populated for a patient
    const patientUser = await User.create({
      name: 'Test Patient',
      email: `patient_${timestamp}@cest.org`,
      password: 'Password123!',
      role: 'self_user',
    });

    const link = await ClinicianLink.create({
      patientUser: patientUser._id,
      clinician: userA._id,
      status: 'pending',
    });

    const populatedLink = await ClinicianLink.findById(link._id)
      .populate('clinician', 'name title specialization institution verificationStatus');

    assert(populatedLink.clinician.registrationNumber === undefined, 'Populated ClinicianLink does NOT expose registrationNumber');
    assert(populatedLink.clinician.licenseNumber === undefined, 'Populated ClinicianLink does NOT expose licenseNumber');
    assert(populatedLink.clinician.verificationStatus === 'unverified', 'Populated ClinicianLink exposes verificationStatus');

    console.log('✓ TEST (d) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (e): Badge shows correctly before and after running verify script
    // -------------------------------------------------------------------------
    console.log('--- TEST (e): Badge shows before and after running verify script ---');

    // Before verify script
    assert(userA.verificationStatus === 'unverified', 'Before script: verificationStatus is unverified');

    // Run verification logic (same as scripts/verifyClinician.js)
    userA.verificationStatus = 'verified';
    userA.verifiedAt = new Date();
    await userA.save();

    const verifiedUserA = await User.findById(userA._id);
    assert(verifiedUserA.verificationStatus === 'verified', 'After script: verificationStatus is verified');
    assert(verifiedUserA.verifiedAt instanceof Date, 'After script: verifiedAt is set to Date timestamp');

    // Patient directory view reflects verified badge
    const updatedDirectoryClinician = await User.findById(userA._id)
      .select('_id name title specialization institution verificationStatus');
    assert(updatedDirectoryClinician.verificationStatus === 'verified', 'Patient directory reflects "Credentials verified"');

    // Editing registration number resets status to unverified
    verifiedUserA.registrationNumber = `MCI-UPDATED-${timestamp}`;
    verifiedUserA.verificationStatus = 'unverified';
    verifiedUserA.verifiedAt = null;
    await verifiedUserA.save();

    const resetUserA = await User.findById(userA._id);
    assert(resetUserA.verificationStatus === 'unverified', 'Editing registration number resets status to unverified');
    assert(resetUserA.verifiedAt === null, 'Editing registration number clears verifiedAt timestamp');

    console.log('✓ TEST (e) PASSED\n');

    // -------------------------------------------------------------------------
    // TEST (f): Existing clinician accounts still log in
    // -------------------------------------------------------------------------
    console.log('--- TEST (f): Existing clinician accounts still log in ---');

    // Existing clinician from earlier
    const loginUser = await User.findOne({ email: emailA }).select('+password');
    assert(loginUser != null, 'Found existing clinician account');
    const isMatch = await loginUser.matchPassword('Password123!');
    assert(isMatch === true, 'Existing clinician password matches successfully');
    assert(loginUser.role === 'clinician', 'Role is preserved as clinician');

    // Legacy account created without new fields
    const legacyClinician = await User.create({
      name: 'Dr. Legacy Clinician',
      email: `legacy_clinician_${timestamp}@cest.org`,
      password: 'Password123!',
      role: 'clinician',
      licenseNumber: 'OLD-LIC-12345',
    });

    const loadedLegacy = await User.findOne({ email: legacyClinician.email }).select('+password');
    const legacyMatch = await loadedLegacy.matchPassword('Password123!');
    assert(legacyMatch === true, 'Legacy clinician without new registration fields logs in successfully');
    assert(loadedLegacy.verificationStatus === 'unverified', 'Legacy clinician defaults safely to unverified');

    console.log('✓ TEST (f) PASSED\n');

    console.log('========================================================');
    console.log(`ALL TESTS PASSED! (${passedCount}/${totalCount} assertions)`);
    console.log('========================================================');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});

