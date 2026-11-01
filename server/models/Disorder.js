const mongoose = require('mongoose');

const disorderSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    iconName: {
      type: String,
      default: 'FaBrain',
    },
    shortDescription: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      required: true,
    },
    symptoms: [
      {
        type: String,
      },
    ],
    causes: [
      {
        type: String,
      },
    ],
    riskFactors: [
      {
        type: String,
      },
    ],
    commonSigns: [
      {
        type: String,
      },
    ],
    importanceOfEarlyDetection: {
      type: String,
      required: true,
    },
    cognitiveEnhancementSupport: [
      {
        title: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Disorder', disorderSchema);
