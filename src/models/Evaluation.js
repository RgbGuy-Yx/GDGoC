const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required'],
      index: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamLead',
      required: [true, 'Lead reference is required']
    },
    leadName: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true
    },
    evaluatorRole: {
      type: String,
      enum: ['lead', 'admin'],
      default: 'lead'
    },
    score: {
      type: Number,
      required: [true, 'Score out of 10 is required'],
      min: [0, 'Score cannot be less than 0'],
      max: [10, 'Score cannot be greater than 10']
    },
    remarks: {
      type: String,
      required: [true, 'Evaluation remarks are required'],
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent accidental deletion or mutation if needed, ordered by timestamp
evaluationSchema.index({ candidate: 1, timestamp: -1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
