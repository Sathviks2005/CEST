const mongoose = require('mongoose');

const clinicianLinkSchema = new mongoose.Schema(
  {
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    initiatedBy: {
      type: String,
      enum: ['patient', 'clinician'],
      default: 'patient',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'invited', 'accepted', 'declined', 'revoked', 'cancelled', 'expired'],
      default: 'pending',
      required: true,
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    shareScope: {
      type: String,
      enum: ['selected', 'all'],
      default: 'selected',
      required: true,
    },
    alertOnHighestBand: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    lastAlertAt: {
      type: Date,
    },
    inviteMessage: {
      type: String,
      maxlength: [300, 'Invite message cannot exceed 300 characters'],
      trim: true,
    },
    trigger: {
      instrument: {
        type: String,
      },
      severity: {
        type: String,
      },
      score: {
        type: Number,
      },
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
      },
      itemNineFlag: {
        type: Boolean,
        default: false,
      },
    },
    sharedAssessmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
      },
    ],
    consentedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    clinicianNote: {
      type: String,
      maxlength: [300, 'Clinician note cannot exceed 300 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce uniqueness on active links (pending, invited, or accepted) between a self-user and clinician
clinicianLinkSchema.index(
  { patientUser: 1, clinician: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'invited', 'accepted'] } },
  }
);

module.exports = mongoose.model('ClinicianLink', clinicianLinkSchema);

