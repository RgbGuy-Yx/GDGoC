const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teamLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team lead name is required'],
      trim: true
    },
    accessCode: {
      type: String,
      required: [true, 'Access code is required']
    },
    assignedDomains: {
      type: [String],
      required: [true, 'At least one domain must be assigned'],
      validate: {
        validator: function (domains) {
          return Array.isArray(domains) && domains.length > 0;
        },
        message: 'A team lead must have at least one assigned domain'
      }
    },
    role: {
      type: String,
      default: 'lead',
      enum: ['lead'],
      immutable: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash access code before saving
teamLeadSchema.pre('save', async function (next) {
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
teamLeadSchema.methods.compareAccessCode = async function (enteredCode) {
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
teamLeadSchema.methods.toJSON = function () {
  const lead = this.toObject();
  delete lead.accessCode;
  return lead;
};

module.exports = mongoose.model('TeamLead', teamLeadSchema);
