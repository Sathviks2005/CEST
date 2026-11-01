const mongoose = require('mongoose');

const exerciseResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
    },
    assessmentType: {
      type: String,
      default: 'PHQ-9 Patient Depression Questionnaire',
    },
    assessmentScore: {
      type: Number,
      default: null,
    },
    assessmentSeverity: {
      type: String,
      default: '',
    },
    exerciseId: {
      type: String,
      required: true,
    },
    exerciseName: {
      type: String,
      required: true,
    },
    cognitiveDomain: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'Easy',
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true, // in seconds
    },
    attempts: {
      type: Number,
      default: 1,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExerciseResult', exerciseResultSchema);
