const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      default: '',
    },
    assessmentType: {
      type: String,
      default: 'PHQ-9 Patient Depression Questionnaire',
    },
    disorderSlug: {
      type: String,
      default: 'depression',
    },
    answers: {
      type: [Number],
      required: true,
    },
    functionalResponse: {
      type: String,
      default: '',
    },
    recommendationTag: {
      type: String,
      default: '',
    },
    totalScore: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      required: true,
    },
    diagnosticConsideration: {
      type: String,
      default: '',
    },
    itemNineFlag: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute itemNineFlag for PHQ-9 assessments
assessmentSchema.pre('save', function (next) {
  const slug = (this.disorderSlug || '').toLowerCase();
  const type = (this.assessmentType || '').toLowerCase();
  if (slug.includes('depression') || type.includes('phq-9') || type.includes('phq9')) {
    if (Array.isArray(this.answers) && this.answers.length >= 9) {
      this.itemNineFlag = Number(this.answers[8]) > 0;
    }
  }
  next();
});

// When a new assessment is saved for a self-user and an accepted link has alertOnHighestBand: true
// and the new result is in the last band, mark that link urgent: true and surface it with lastAlertAt.
assessmentSchema.post('save', async function (doc) {
  try {
    const { validateQualifyingSeverity } = require('../utils/clinicianLinkHelpers');
    const ClinicianLink = mongoose.model('ClinicianLink');

    const validation = validateQualifyingSeverity(doc);
    if (validation.qualifies) {
      const links = await ClinicianLink.find({
        patientUser: doc.user,
        status: 'accepted',
        alertOnHighestBand: true,
      });

      for (const link of links) {
        link.urgent = true;
        link.lastAlertAt = new Date();
        link.trigger = {
          instrument: doc.assessmentType || 'Clinical Assessment',
          severity: doc.severity || 'Severe',
          score: doc.totalScore,
          assessmentId: doc._id,
          itemNineFlag: Boolean(validation.itemNineFlag),
        };
        await link.save();
      }
    }
  } catch {
    // Avoid interrupting assessment submission if link alert update fails
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);

