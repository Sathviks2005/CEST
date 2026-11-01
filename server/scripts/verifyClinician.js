/**
 * Clinician Verification Demo Script
 *
 * Usage:
 *   node scripts/verifyClinician.js <clinician-email>
 *
 * Example:
 *   node scripts/verifyClinician.js doctor@example.com
 *   node JEE13/server/scripts/verifyClinician.js doctor@example.com
 *
 * Sets the clinician's verificationStatus to 'verified' and records verifiedAt timestamp.
 * Note: For demo / administrative testing only. No public admin UI is exposed.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory

const User = require('../models/User');

async function main() {
  const emailArg = process.argv[2];

  if (!emailArg || !emailArg.trim()) {
    console.error('Error: Clinician email argument is required.');
    console.error('Usage: node scripts/verifyClinician.js <clinician-email>');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cest';

  console.log(`Connecting to database...`);
  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB.`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${mongoUri}:`, err.message);
    process.exit(1);
  }

  try {
    const clinician = await User.findOne({ email, role: 'clinician' });

    if (!clinician) {
      console.error(`Error: No clinician account found with email: ${email}`);
      console.error('Ensure the account exists and has role="clinician".');
      process.exit(1);
    }

    console.warn('\n[WARNING]: This script is for local testing and demo purposes only.');
    console.warn('[WARNING]: In production, use the official administrative verification workflow at /admin.\n');

    clinician.verificationStatus = 'verified';
    clinician.verifiedAt = new Date();
    await clinician.save();

    console.log('----------------------------------------------------');
    console.log(`SUCCESS: Clinician verification status updated!`);
    console.log(`Name:                ${clinician.name}`);
    console.log(`Email:               ${clinician.email}`);
    console.log(`Registration Number: ${clinician.registrationNumber || '(none)'}`);
    console.log(`Registering Body:    ${clinician.registeringBody || '(none)'}`);
    console.log(`Verification Status: ${clinician.verificationStatus}`);
    console.log(`Verified At:         ${clinician.verifiedAt.toISOString()}`);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Error verifying clinician:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

main();

