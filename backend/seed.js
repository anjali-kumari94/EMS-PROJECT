// Creates the first Super Admin so you can log in at all.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@ems.com').toLowerCase();
  const existing = await Employee.findOne({ email });

  if (existing) {
    console.log(`Super Admin already exists: ${email}`);
    process.exit(0);
  }

  await Employee.create({
    name: 'System Administrator',
    email,
    phone: '9999999999',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    department: 'Administration',
    designation: 'Super Admin',
    salary: 0,
    joiningDate: new Date(),
    status: 'Active',
    role: 'Super Admin',
  });

  console.log(`Super Admin created: ${email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
