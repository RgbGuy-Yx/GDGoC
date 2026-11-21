const mongoose = require('mongoose');

const transferLogSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required'],
      index: true
    },
    previousDomain: {
      type: String,
      required: [true, 'Previous domain is required'],
      trim: true
    },
    previousLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamLead',
      default: null
    },
    destinationDomain: {
      type: String,
      required: [true, 'Destination domain is required'],
      trim: true
    },
    destinationLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamLead',
      default: null
    },
    transferReason: {
      type: String,
      required: [true, 'Transfer reason is required'],
      trim: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    transferredBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        default: 'System User'
      },
      role: {
        type: String,
        enum: ['admin', 'lead'],
        default: 'lead'
      }
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

transferLogSchema.index({ candidate: 1, timestamp: -1 });

module.exports = mongoose.model('TransferLog', transferLogSchema);
