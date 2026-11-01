const mongoose = require('mongoose');

const clinicianNoteSchema = new mongoose.Schema(
  {
    clinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Note text is required'],
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
      trim: true,
    },
    noteDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

clinicianNoteSchema.index({ clinician: 1, patient: 1, noteDate: -1 });

module.exports = mongoose.model('ClinicianNote', clinicianNoteSchema);
