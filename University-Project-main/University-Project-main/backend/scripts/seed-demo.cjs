const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User.cjs');
const PersonalInformation = require('../models/PersonalInformation.cjs');
const EducationalInformation = require('../models/EducationalInformation.cjs');
const EmploymentInformation = require('../models/EmploymentInformation.cjs');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'research_grant_db';
  const conn = await mongoose.connect(mongoUri, { dbName });
  console.log(`Connected to ${conn.connection.host}/${conn.connection.name}`);
}

async function main() {
  await connectDB();

  const email = process.env.SEED_EMAIL || 'ahmadsahu453@gmail.com';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'Ahmad Sahu',
      email,
      employeeId: 'AUTO-2001',
      password: 'Passw0rd!',
      phone: '03123456789',
      cnic: '32303-4356107-5',
      city: 'Islamabad'
    });
    console.log('Created user:', user._id.toString());
  } else {
    console.log('User already exists:', user._id.toString());
  }

  // Personal Information
  const personal = await PersonalInformation.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      title: 'Mr',
      firstName: 'Ahmad',
      lastName: 'Sahu',
      fatherName: 'Sahu',
      dob: new Date('1995-01-01'),
      maritalStatus: 'single',
      gender: 'male',
      permanentAddress: 'Permanent Address',
      permanentCountry: 'PK',
      permanentCity: 'Islamabad',
      mailingAddress: 'Mailing Address',
      mailingCountry: 'PK',
      mailingCity: 'Islamabad'
    },
    { upsert: true, new: true }
  );
  console.log('Upserted personal info:', personal._id.toString());

  // Educational Information
  const edu = await EducationalInformation.create({
    userId: user._id,
    qualificationLevel: 'Masters',
    startDate: new Date('2018-09-01'),
    country: 'PK',
    city: 'Islamabad',
    institute: 'Air University',
    discipline: 'CS',
    campus: 'Main',
    department: 'CS',
    degreeType: 'MS',
    sessionType: 'Evening',
    major: 'AI',
    isHighestEducation: true
  });
  console.log('Inserted education:', edu._id.toString());

  // Employment Information
  const emp = await EmploymentInformation.create({
    userId: user._id,
    organizationType: 'ACADEMIC',
    country: 'PK',
    sector: 'Public',
    category: 'University',
    employerName: 'Air University',
    jobType: 'Full-time',
    jobTitle: 'Research Associate',
    fieldOfWork: 'Research',
    careerLevel: 'Entry',
    startDate: new Date('2023-01-15'),
    isCurrentEmployment: true
  });
  console.log('Inserted employment:', emp._id.toString());

  console.log('Seeding complete.');
  process.exit(0);
}

main().catch(err => { console.error('Seed failed:', err); process.exit(1); });
