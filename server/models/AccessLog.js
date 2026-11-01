const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema(
  {
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['profile_view', 'report_generated'],
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup and de-duplication queries
accessLogSchema.index({ clinician: 1, patientUser: 1, type: 1, at: -1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
