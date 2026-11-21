const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    // Unique Candidate ID (e.g., GDGOC-2025-A8F2K)
    candidateId: {
      type: String,
      required: [true, 'Candidate ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    // Candidate Full Name
    name: {
      type: String,
      default: '',
      trim: true
    },

    // 1. Email ID
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },

    // 2. Phone No.
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },

    // 3. Roll Number
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      uppercase: true,
      trim: true,
      index: true
    },

    // 4. Year of Study
    yearOfStudy: {
      type: String,
      required: [true, 'Year of study is required'],
      trim: true
    },

    // 5. Branch/Department
    branch: {
      type: String,
      required: [true, 'Branch/Department is required'],
      trim: true
    },

    // 6. Section
    section: {
      type: String,
      default: '',
      trim: true
    },

    // 7. Preferred domain/team
    preferredDomain: {
      type: String,
      required: [true, 'Preferred domain is required'],
      trim: true
    },

    // 8. Why do you want to join GDGoC?
    whyJoin: {
      type: String,
      default: '',
      trim: true
    },

    // 9. Why are you interested in this particular domain?
    whyDomain: {
      type: String,
      default: '',
      trim: true
    },

    // 10. Prior experience or knowledge
    priorExperience: {
      type: String,
      default: '',
      trim: true
    },

    // 11. Open to another domain?
    openToOtherDomain: {
      type: String,
      default: 'Yes',
      trim: true
    },

    // 12. How can you contribute to GDGoC VJIT?
    contribution: {
      type: String,
      default: '',
      trim: true
    },

    // 13. LinkedIn URL
    linkedinUrl: {
      type: String,
      default: '',
      trim: true
    },

    // 14. GitHub URL
    githubUrl: {
      type: String,
      default: '',
      trim: true
    },

    // 15. Other portfolio links
    portfolioUrl: {
      type: String,
      default: '',
      trim: true
    },

    // Original Applied Domain: MUST NEVER BE OVERWRITTEN
    originalDomain: {
      type: String,
      required: [true, 'Original applied domain is required'],
      immutable: true,
      trim: true
    },

    // Current Assigned Domain: changes when transferred
    currentDomain: {
      type: String,
      required: [true, 'Current assigned domain is required'],
      trim: true,
      index: true
    },

    // Currently Assigned Team Lead
    assignedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamLead',
      default: null,
      index: true
    },

    // Shortlist Status
    shortlistStatus: {
      type: String,
      enum: ['PENDING', 'SHORTLISTED', 'WAITLISTED', 'REJECTED', 'IN_REVIEW'],
      default: 'PENDING',
      index: true
    },

    // Final Selection Status (Admin Only)
    finalSelectionStatus: {
      type: String,
      enum: ['PENDING', 'SELECTED', 'REJECTED', 'WAITLISTED'],
      default: 'PENDING',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual relationship for interview evaluations
candidateSchema.virtual('evaluations', {
  ref: 'Evaluation',
  localField: '_id',
  foreignField: 'candidate'
});

// Virtual relationship for transfer history
candidateSchema.virtual('transferHistory', {
  ref: 'TransferLog',
  localField: '_id',
  foreignField: 'candidate'
});

// Guard: originalDomain must never be modified once created
candidateSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('originalDomain')) {
    return next(new Error('CRITICAL VIOLATION: originalDomain is immutable and cannot be changed.'));
  }
  next();
});

// Guard: disallow updating originalDomain via findOneAndUpdate / updateOne
candidateSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update) {
    if (update.originalDomain) {
      delete update.originalDomain;
    }
    if (update.$set && update.$set.originalDomain) {
      delete update.$set.originalDomain;
    }
  }
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);
