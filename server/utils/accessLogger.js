const AccessLog = require('../models/AccessLog');

/**
 * Log patient record access by a clinician with 10-minute de-duplication per type.
 *
 * @param {string|ObjectId} clinicianId - Clinician User ID
 * @param {string|ObjectId} patientUserId - Linked Patient User ID
 * @param {'profile_view'|'report_generated'} type - Action type
 */
const logPatientAccess = async (clinicianId, patientUserId, type) => {
  try {
    if (!clinicianId || !patientUserId || !type) return null;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Check for recent log within the 10-minute de-duplication window
    const recentLog = await AccessLog.findOne({
      clinician: clinicianId,
      patientUser: patientUserId,
      type,
      at: { $gt: tenMinutesAgo },
    });

    if (recentLog) {
      // De-duplicated: do not log again within 10 minutes
      return recentLog;
    }

    return await AccessLog.create({
      clinician: clinicianId,
      patientUser: patientUserId,
      type,
      at: new Date(),
    });
  } catch (err) {
    // Non-blocking error handling: logging failure should not abort clinical workflows
    console.error('[CEST AccessLog] Failed to record access log entry:', err.message);
    return null;
  }
};

module.exports = {
  logPatientAccess,
};
