/**
 * One-off cleanup script to remove deleted disorders from MongoDB
 *
 * To run:
 *   cd server
 *   node scripts/cleanupDisorders.js
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Disorder = require('../models/Disorder');

const SLUGS_TO_REMOVE = [
  'stress',
  'panic-disorder',
  'social-anxiety-disorder',
  'mild-cognitive-impairment',
];

const cleanup = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[Cleanup] Error: MONGO_URI is not defined in server/.env');
    process.exit(1);
  }

  try {
    console.log('[Cleanup] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Cleanup] Connected successfully.');

    const result = await Disorder.deleteMany({ slug: { $in: SLUGS_TO_REMOVE } });
    console.log(`[Cleanup] Successfully removed ${result.deletedCount} disorder document(s).`);

    const remainingCount = await Disorder.countDocuments({});
    console.log(`[Cleanup] Remaining disorders in database: ${remainingCount}`);

    await mongoose.disconnect();
    console.log('[Cleanup] Disconnected from MongoDB. Done.');
    process.exit(0);
  } catch (err) {
    console.error('[Cleanup] Error during cleanup:', err.message);
    process.exit(1);
  }
};

cleanup();

