const mongoose = require('mongoose');

const clinicianAssessmentSchema = new mongoose.Schema(
  {
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    instrumentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    answers: [
      {
        itemId: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
      },
    ],
    extras: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalScore: {
      type: Number,
      required: true,
    },
    subscores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    band: {
      type: String,
      required: true,
      trim: true,
    },
    flags: {
      type: [String],
      default: [],
    },
    respondent: {
      type: String,
      default: 'patient',
    },
    administeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    clinicianNote: {
      type: String,
      maxlength: [500, 'Clinician note cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    instrumentVersion: {
      type: String,
      default: '1.0',
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on (clinician, patient, instrumentId, administeredAt)
clinicianAssessmentSchema.index({
  clinician: 1,
  patient: 1,
  instrumentId: 1,
  administeredAt: -1,
});

module.exports = mongoose.model('ClinicianAssessment', clinicianAssessmentSchema);
