const mongoose = require('mongoose');

/**
 * VerificationLog Model
 *
 * Audit trail for administrative clinician credential reviews.
 * Records administrator ID/email, clinician ID/email/name, decision (approved/rejected),
 * registering body, registration number, rejection reason (if any), and timestamp.
 *
 * PRIVACY & COMPLIANCE NOTICE:
 * This collection strictly audits credential verification actions and NEVER
 * stores, references, or links to patient data, health information, or screening results.
 */
const verificationLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user ID is required for verification audit'],
    },
    adminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Clinician user ID is required for verification audit'],
    },
    clinicianName: {
      type: String,
      required: true,
      trim: true,
    },
    clinicianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    decision: {
      type: String,
      enum: ['approved', 'rejected'],
      required: true,
    },
    registeringBody: {
      type: String,
      default: '',
      trim: true,
    },
    registrationNumber: {
      type: String,
      default: '',
      trim: true,
    },
    reason: {
      type: String,
      maxlength: [300, 'Rejection reason cannot exceed 300 characters'],
      default: '',
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

verificationLogSchema.index({ clinician: 1, reviewedAt: -1 });
verificationLogSchema.index({ decision: 1, reviewedAt: -1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);

