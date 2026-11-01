/**
 * Admin Creation / Promotion Script
 *
 * Usage:
 *   node scripts/createAdmin.js <email>
 *
 * Examples:
 *   node scripts/createAdmin.js admin@example.com
 *   node JEE13/server/scripts/createAdmin.js admin@example.com
 *
 * Promotes an existing user account to the 'admin' role.
 * Admins cannot be created via public registration.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const User = require('../models/User');

async function main() {
  const emailArg = process.argv[2];

  if (!emailArg || !emailArg.trim()) {
    console.error('Error: User email argument is required.');
    console.error('Usage: node scripts/createAdmin.js <email>');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cest';

  console.log('Connecting to database...');
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${mongoUri}:`, err.message);
    process.exit(1);
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`Error: No user found with email: ${email}`);
      console.error('Please ensure the user is registered first, then run this script to promote them.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`Notice: User ${user.email} (${user.name}) is already an administrator.`);
    } else {
      const prevRole = user.role;
      user.role = 'admin';
      await user.save();
      console.log('----------------------------------------------------');
      console.log(`SUCCESS: User promoted to administrator role!`);
      console.log(`Name:        ${user.name}`);
      console.log(`Email:       ${user.email}`);
      console.log(`Previous:    ${prevRole}`);
      console.log(`New Role:    ${user.role}`);
      console.log('----------------------------------------------------');
    }
  } catch (err) {
    console.error('Error promoting user to admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

main();

