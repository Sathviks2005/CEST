/**
 * Debug script: diagnose login/password issues
 * Run from JEE2/server/ directory: node scripts/debugLogin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const ts = Date.now();
    const email = 'dbgtest' + ts + '@cesttest.com';
    const plainPw = 'debug123';

    // 1. Create user
    console.log('\n--- REGISTER ---');
    const u = await User.create({ name: 'Debug User', email, password: plainPw, role: 'self_user' });
    console.log('User created _id:', u._id);
    console.log('Password on create (truncated):', u.password ? u.password.substring(0, 20) + '...' : 'NONE');
    console.log('Is bcrypt hash?', u.password ? u.password.startsWith('$2') : false);

    // 2. Retrieve with password
    console.log('\n--- FIND WITH +password ---');
    const found = await User.findOne({ email }).select('+password');
    console.log('Found user:', found ? 'yes' : 'no');
    if (found) {
      console.log('Password from DB (truncated):', found.password ? found.password.substring(0, 20) + '...' : 'NONE/undefined');
      console.log('Is bcrypt hash?', found.password ? found.password.startsWith('$2') : false);
      console.log('authProvider:', found.authProvider);

      // 3. bcrypt.compare
      console.log('\n--- BCRYPT.COMPARE ---');
      const matchDirect = await bcrypt.compare(plainPw, found.password);
      console.log('bcrypt.compare(plainPw, hash):', matchDirect);

      // 4. matchPassword method
      const matchMethod = await found.matchPassword(plainPw);
      console.log('found.matchPassword(plainPw):', matchMethod);

      // 5. Try wrong password
      const matchWrong = await found.matchPassword('wrongpassword');
      console.log('found.matchPassword(wrongPw):', matchWrong);
    }

    // Cleanup
    await User.deleteOne({ email });
    console.log('\nCleaned up test user.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
