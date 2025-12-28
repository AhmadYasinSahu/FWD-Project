const dotenv = require('dotenv');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User.cjs');
const { sendPasswordResetEmail } = require('../utils/sendEmail.cjs');
let MongoMemoryServer;
try { MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer; } catch {}

async function connectDB() {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'research_grant_db';
  if (mongoUri === 'memory') {
    if (!MongoMemoryServer) {
      throw new Error('mongodb-memory-server is not installed. Run npm i -D mongodb-memory-server');
    }
    const mem = await MongoMemoryServer.create({ instance: { dbName } });
    mongoUri = mem.getUri();
    console.log('Using in-memory MongoDB instance');
  }
  const conn = await mongoose.connect(mongoUri, { dbName });
  console.log(`MongoDB Connected: ${conn.connection.host}/${dbName}`);
}

async function main() {
  const emailArg = process.argv.find(a => a.startsWith('--email='));
  if (!emailArg) {
    console.error('Usage: node scripts/send-reset.cjs --email=user@example.com');
    process.exit(1);
  }
  const email = emailArg.split('=')[1];

  await connectDB();

  let user = await User.findOne({ email });
  if (!user) {
    console.log('No user found, creating a temporary user for test...');
    user = await User.create({
      name: 'Temp User',
      email,
      employeeId: `AUTO-${Math.floor(1000 + Math.random()*9000)}`,
      password: 'Passw0rd!',
      phone: '03123456789',
      cnic: '12345-1234567-1',
      city: 'Islamabad'
    });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  await sendPasswordResetEmail(email, resetToken);
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  console.log('Password reset email triggered.');
  console.log('Reset URL:', resetUrl);

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
