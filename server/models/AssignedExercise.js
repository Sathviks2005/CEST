const mongoose = require('mongoose');
const { isValidExerciseId } = require('../config/exerciseCatalog');

const assignedExerciseSchema = new mongoose.Schema(
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
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicianLink',
      required: true,
    },
    exerciseId: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return isValidExerciseId(v);
        },
        message: (props) => `${props.value} is not a valid exercise in the catalog`,
      },
    },
    note: {
      type: String,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'skipped', 'cancelled'],
      default: 'assigned',
      required: true,
    },
    skipReason: {
      type: String,
      enum: ['too_hard', 'not_helpful', 'feeling_unwell', 'no_time', 'other', null],
      default: null,
    },
    moodBefore: {
      type: Number,
      min: [0, 'Mood must be between 0 and 10'],
      max: [10, 'Mood must be between 0 and 10'],
      default: null,
    },
    moodAfter: {
      type: Number,
      min: [0, 'Mood must be between 0 and 10'],
      max: [10, 'Mood must be between 0 and 10'],
      default: null,
    },
    sharedResult: {
      type: {
        score: { type: Number },
        level: { type: mongoose.Schema.Types.Mixed },
      },
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
assignedExerciseSchema.index({ patientUser: 1, status: 1 });
assignedExerciseSchema.index({ clinician: 1, patientUser: 1 });

module.exports = mongoose.model('AssignedExercise', assignedExerciseSchema);
