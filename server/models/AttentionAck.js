const mongoose = require('mongoose');

const attentionAckSchema = new mongoose.Schema(
  {
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    until: {
      type: Date,
      required: true,
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    lastAcknowledgedHighPriorityDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

attentionAckSchema.index({ clinician: 1, patientUser: 1 }, { unique: true });

module.exports = mongoose.model('AttentionAck', attentionAckSchema);
