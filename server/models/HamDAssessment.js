const mongoose = require('mongoose');

const hamdAssessmentSchema = new mongoose.Schema(
  {
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: String,
      default: '',
    },
    disorderSlug: {
      type: String,
      default: 'depression',
    },
    itemScores: {
      type: [Number],
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HamDAssessment', hamdAssessmentSchema);
