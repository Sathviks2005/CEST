const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../server/.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require(__dirname + '/../server/models/User.js');
  const ts = Date.now();
  const email = 'bcrypttest_' + ts + '@cest.test';
  const plainPw = 'pass123';

  const u = await User.create({ name: 'BCrypt Test', email, password: plainPw, role: 'self_user' });
  console.log('Created user password (first 10):', u.password ? u.password.substring(0, 10) + '...' : 'NONE');

  // Retrieve with +password
  const found = await User.findById(u._id).select('+password');
  console.log('Found password field:', found.password ? found.password.substring(0, 10) + '...' : 'NONE');
  console.log('Is hashed ($2b)?', found.password ? found.password.startsWith('$2') : false);

  // bcrypt.compare
  const match = await bcrypt.compare(plainPw, found.password);
  console.log('bcrypt.compare:', match);

  // matchPassword method
  const match2 = await found.matchPassword(plainPw);
  console.log('matchPassword:', match2);

  // Clean up
  await User.deleteOne({ _id: u._id });
  await mongoose.disconnect();
}

test().catch(console.error);

