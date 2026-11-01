const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cest').replace(
    'localhost',
    '127.0.0.1'
  );
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    try {
      const { repairAcceptedLinks } = require('../utils/clinicianLinkHelpers');
      await repairAcceptedLinks();
    } catch (e) {
      console.warn('Initial repair error:', e.message);
    }
    return true;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB at ${uri}`);
    console.warn(`[Database Warning] ${error.message}`);
    console.warn(`[Database Mode] Running in memory / mock fallback state for frontend testing.`);
    return false;
  }
};

module.exports = connectDB;
