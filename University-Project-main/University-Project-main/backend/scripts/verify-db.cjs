const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
let MongoMemoryServer;
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch {}

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User.cjs');

async function connectDB() {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'research_grant_db';

  if (mongoUri === 'memory') {
    if (!MongoMemoryServer) {
      throw new Error('mongodb-memory-server is not installed. Run npm install (optionalDependencies)');
    }
    const mem = await MongoMemoryServer.create({ instance: { dbName } });
    mongoUri = mem.getUri();
    console.log('Using in-memory MongoDB instance');
  }

  const conn = await mongoose.connect(mongoUri, { dbName });
  console.log(`Connected to ${conn.connection.host}/${conn.connection.name}`);
}

async function main() {
  await connectDB();

  const email = `verify.${Date.now()}@example.com`;
  const empId = `AUTO-${Math.floor(1000 + Math.random()*9000)}`;

  const user = await User.create({
    name: 'Verify User',
    email,
    employeeId: empId,
    password: 'Passw0rd!',
    phone: '03123456789',
    cnic: '12345-1234567-1',
    city: 'Islamabad'
  });

  console.log('Created user id:', user._id.toString());

  const found = await User.findOne({ email });
  console.log('Fetched user:', { id: found._id.toString(), email: found.email, employeeId: found.employeeId });

  // Clean up the test user
  await User.deleteOne({ _id: user._id });
  console.log('Deleted test user.');

  process.exit(0);
}

main().catch(err => { console.error('Verify DB failed:', err); process.exit(1); });
