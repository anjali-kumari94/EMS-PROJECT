const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['Super Admin', 'HR Manager', 'Employee'];
const STATUSES = ['Active', 'Inactive'];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      // Generated in a pre-validate hook below (e.g. EMP0001)
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be under 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never return password by default
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Active',
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'Employee',
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    profileImage: {
      type: String, // URL or path to uploaded image
      default: '',
    },
  },
  { timestamps: true }
);

// ---- Auto-generate a human readable employeeId like EMP0001 ----
employeeSchema.pre('validate', async function (next) {
  if (this.employeeId) return next();
  const last = await this.constructor
    .findOne({})
    .sort({ createdAt: -1 })
    .select('employeeId')
    .lean();

  let nextNumber = 1;
  if (last && last.employeeId) {
    const match = last.employeeId.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  this.employeeId = `EMP${String(nextNumber).padStart(4, '0')}`;
  next();
});

// ---- Hash password before saving, only if it changed ----
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Instance method to compare a candidate password ----
employeeSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Prevent an employee from being their own manager at the schema level too
employeeSchema.pre('save', function (next) {
  if (
    this.reportingManager &&
    this._id &&
    this.reportingManager.toString() === this._id.toString()
  ) {
    return next(new Error('An employee cannot be their own reporting manager'));
  }
  next();
});

employeeSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
module.exports.ROLES = ROLES;
module.exports.STATUSES = STATUSES;
