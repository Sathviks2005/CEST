const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a patient name'],
      trim: true,
    },
    age: {
      type: Number,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['clinic_walkin', 'manual', 'app_linked'],
      default: 'manual',
    },
    consentGiven: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);
