// Populates realistic demo data (a Super Admin, an HR Manager, and a small
// multi-department org tree) so the dashboard, org chart, and search/filter
// features have something meaningful to show in a demo video or screenshots.
// Run with: npm run seed:demo   (after `npm run seed`)
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const PASSWORD = 'Demo@12345';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await Employee.findOne({ role: 'Super Admin' });
  if (!admin) {
    console.log('No Super Admin found — run `npm run seed` first.');
    process.exit(1);
  }

  const existingDemo = await Employee.findOne({ email: 'priya.hr@ems.com' });
  if (existingDemo) {
    console.log('Demo data already seeded.');
    process.exit(0);
  }

  const hr = await Employee.create({
    name: 'Priya Sharma',
    email: 'priya.hr@ems.com',
    phone: '9812345670',
    password: PASSWORD,
    department: 'HR',
    designation: 'HR Manager',
    salary: 900000,
    joiningDate: new Date('2023-02-01'),
    status: 'Active',
    role: 'HR Manager',
    reportingManager: admin._id,
  });

  const engManager = await Employee.create({
    name: 'Rohan Verma',
    email: 'rohan.verma@ems.com',
    phone: '9812345671',
    password: PASSWORD,
    department: 'Engineering',
    designation: 'Engineering Manager',
    salary: 1800000,
    joiningDate: new Date('2022-06-15'),
    status: 'Active',
    role: 'Employee',
    reportingManager: admin._id,
  });

  const salesManager = await Employee.create({
    name: 'Ananya Iyer',
    email: 'ananya.iyer@ems.com',
    phone: '9812345672',
    password: PASSWORD,
    department: 'Sales',
    designation: 'Sales Manager',
    salary: 1400000,
    joiningDate: new Date('2023-08-10'),
    status: 'Active',
    role: 'Employee',
    reportingManager: admin._id,
  });

  const reports = [
    { name: 'Karan Mehta', email: 'karan.mehta@ems.com', phone: '9812345673', department: 'Engineering', designation: 'Backend Developer', salary: 1000000, manager: engManager._id },
    { name: 'Sneha Reddy', email: 'sneha.reddy@ems.com', phone: '9812345674', department: 'Engineering', designation: 'Frontend Developer', salary: 950000, manager: engManager._id },
    { name: 'Arjun Nair', email: 'arjun.nair@ems.com', phone: '9812345675', department: 'Engineering', designation: 'QA Engineer', salary: 800000, manager: engManager._id, status: 'Inactive' },
    { name: 'Divya Pillai', email: 'divya.pillai@ems.com', phone: '9812345676', department: 'Sales', designation: 'Sales Executive', salary: 700000, manager: salesManager._id },
    { name: 'Vikram Singh', email: 'vikram.singh@ems.com', phone: '9812345677', department: 'Sales', designation: 'Sales Executive', salary: 700000, manager: salesManager._id },
    { name: 'Meera Krishnan', email: 'meera.krishnan@ems.com', phone: '9812345678', department: 'Design', designation: 'Product Designer', salary: 950000, manager: admin._id },
  ];

  for (const r of reports) {
    await Employee.create({
      ...r,
      password: PASSWORD,
      joiningDate: new Date('2024-01-15'),
      status: r.status || 'Active',
      role: 'Employee',
      reportingManager: r.manager,
    });
  }

  console.log('Demo data seeded. All demo accounts use the password:', PASSWORD);
  console.log('Try logging in as HR: priya.hr@ems.com');
  console.log('Or as an employee: karan.mehta@ems.com');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
