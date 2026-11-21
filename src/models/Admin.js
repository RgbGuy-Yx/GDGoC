const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'GDGoC Admin',
      trim: true
    },
    accessCode: {
      type: String,
      required: [true, 'Admin access code is required']
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
      immutable: true
    }
  },
  {
    timestamps: true
  }
);

// Hash access code before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('accessCode')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.accessCode = await bcrypt.hash(this.accessCode, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to verify access code
adminSchema.methods.compareAccessCode = async function (enteredCode) {
  if (!enteredCode || !this.accessCode) return false;
  try {
    const codeStr = String(enteredCode).trim();
    // Check exact match
    const isExactMatch = await bcrypt.compare(codeStr, this.accessCode);
    if (isExactMatch) return true;
    // Check uppercase match if user typed in lowercase
    return await bcrypt.compare(codeStr.toUpperCase(), this.accessCode);
  } catch (err) {
    return false;
  }
};

// Remove accessCode from JSON responses
adminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.accessCode;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
