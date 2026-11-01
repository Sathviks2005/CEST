const ClinicianLink = require('../models/ClinicianLink');

/**
 * Validates whether an assessment qualifies as last-band or positive for crisis indicators.
 * GAD-7 >= 15, PHQ-9 >= 20, ISI >= 22, PCL-5 >= 65, Y-BOCS >= 32
 */
const validateQualifyingSeverity = (assessment) => {
  if (!assessment) return { qualifies: false, isLastBand: false, itemNineFlag: false };

  const score = assessment.totalScore ?? 0;
  const slug = (assessment.disorderSlug || '').toLowerCase();
  const type = (assessment.assessmentType || '').toLowerCase();
  const answers = Array.isArray(assessment.answers) ? assessment.answers : [];

  let isLastBand = false;
  let itemNineFlag = false;

  // PHQ-9 Depression
  if (slug.includes('depression') || type.includes('phq-9') || type.includes('phq9')) {
    if (score >= 20) isLastBand = true;
    if (answers.length >= 9 && Number(answers[8]) > 0) {
      itemNineFlag = true;
    }
  }
  // GAD-7 Anxiety
  else if (slug.includes('anxiety') || slug.includes('gad') || type.includes('gad-7') || type.includes('gad7')) {
    if (score >= 15) isLastBand = true;
  }
  // Insomnia (ISI)
  else if (slug.includes('insomnia') || type.includes('isi')) {
    if (score >= 22) isLastBand = true;
  }
  // PTSD (PCL-5)
  else if (slug.includes('ptsd') || type.includes('pcl-5') || type.includes('pcl5')) {
    if (score >= 65) isLastBand = true;
  }
  // OCD (Y-BOCS)
  else if (slug.includes('ocd') || type.includes('y-bocs') || type.includes('ybocs')) {
    if (score >= 32) isLastBand = true;
  }

  return {
    qualifies: isLastBand || itemNineFlag,
    isLastBand,
    itemNineFlag,
  };
};

/**
 * Access helper function: checks if a clinician has permission to view a patient's data.
 * Access is permitted ONLY IF an active accepted link exists between this clinician and the patient.
 *
 * @param {string|mongoose.Types.ObjectId} patientUserId
 * @param {string|mongoose.Types.ObjectId} clinicianId
 * @returns {Promise<{ allowed: boolean, link: object|null }>}
 */
const canClinicianView = async (patientUserId, clinicianId) => {
  if (!patientUserId || !clinicianId) {
    return { allowed: false, link: null };
  }

  const link = await ClinicianLink.findOne({
    patientUser: patientUserId,
    clinician: clinicianId,
    status: 'accepted',
  });

  if (!link) {
    return { allowed: false, link: null };
  }

  return { allowed: true, link };
};

/**
 * Helper to check and mark expired links.
 * Expiration applies to 'pending' and 'invited' links whose expiresAt is in the past.
 */
const checkAndComputeExpiration = async (link) => {
  if (!link) return null;

  if (
    (link.status === 'pending' || link.status === 'invited') &&
    link.expiresAt &&
    new Date(link.expiresAt) <= new Date()
  ) {
    link.status = 'expired';
    try {
      if (typeof link.save === 'function') {
        await link.save();
      }
    } catch {
      // ignore concurrent write errors
    }
  }
  return link;
};

/**
 * Repair logic to ensure every accepted ClinicianLink has a corresponding
 * Patient record with linkedUser pointing to the self-user's _id.
 */
const repairAcceptedLinks = async () => {
  try {
    const Patient = require('../models/Patient');
    const ClinicianLink = require('../models/ClinicianLink');
    const User = require('../models/User');

    const acceptedLinks = await ClinicianLink.find({ status: 'accepted' });
    let repaired = 0;

    for (const link of acceptedLinks) {
      if (!link.patientUser || !link.clinician) continue;
      const patientUser = await User.findById(link.patientUser);
      if (!patientUser) continue;

      const userEmail = (patientUser.email || '').trim().toLowerCase();
      const userName = (patientUser.name || '').trim();

      let patient = await Patient.findOne({
        clinician: link.clinician,
        linkedUser: link.patientUser,
      });

      if (!patient && userEmail) {
        patient = await Patient.findOne({
          clinician: link.clinician,
          email: new RegExp(`^${userEmail}$`, 'i'),
        });
      }

      if (!patient && userName) {
        patient = await Patient.findOne({
          clinician: link.clinician,
          name: new RegExp(`^${userName}$`, 'i'),
        });
      }

      if (patient) {
        let changed = false;
        if (!patient.linkedUser || String(patient.linkedUser) !== String(link.patientUser)) {
          patient.linkedUser = link.patientUser;
          changed = true;
        }
        if (!patient.email && userEmail) {
          patient.email = userEmail;
          changed = true;
        }
        if (changed) {
          await patient.save();
          repaired++;
        }
      } else {
        await Patient.create({
          name: patientUser.name || 'Linked Self-User',
          email: userEmail || undefined,
          phone: patientUser.phone || undefined,
          clinician: link.clinician,
          linkedUser: link.patientUser,
        });
        repaired++;
      }
    }
    return repaired;
  } catch (err) {
    console.error('Error in repairAcceptedLinks:', err);
    return 0;
  }
};

module.exports = {
  validateQualifyingSeverity,
  canClinicianView,
  checkAndComputeExpiration,
  repairAcceptedLinks,
};

