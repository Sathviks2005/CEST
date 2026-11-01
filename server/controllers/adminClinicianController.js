const User = require('../models/User');
const VerificationLog = require('../models/VerificationLog');

/**
 * Admin Clinician Verification Controller
 *
 * NOTE ON DATA ACCESS:
 * This controller handles administrative verification of clinician credentials.
 * It NEVER queries, returns, or has access to patient health data, assessments,
 * notes, questionnaires, or screening histories.
 */

// @desc    Get all pending clinician verification requests
// @route   GET /api/admin/clinicians/pending
// @access  Private (Admin Only)
const getPendingVerificationRequests = async (req, res) => {
  try {
    const pendingClinicians = await User.find({
      role: 'clinician',
      verificationStatus: 'pending',
    })
      .select(
        '_id name email title specialization institution registeringBody registrationNumber verificationStatus verificationRequestedAt createdAt'
      )
      .sort({ verificationRequestedAt: 1, createdAt: 1 });

    const formatted = pendingClinicians.map((c) => ({
      id: c._id,
      _id: c._id,
      name: c.name,
      email: c.email,
      title: c.title || 'Dr.',
      specialization: c.specialization || '',
      institution: c.institution || '',
      registeringBody: c.registeringBody || 'Not specified',
      registrationNumber: c.registrationNumber || '',
      verificationStatus: c.verificationStatus,
      requestedAt: c.verificationRequestedAt || c.createdAt,
      createdAt: c.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verification requests',
    });
  }
};

// @desc    Get audit trail of reviewed clinician verifications
// @route   GET /api/admin/clinicians/reviewed
// @access  Private (Admin Only)
const getReviewedVerificationHistory = async (req, res) => {
  try {
    const { decision, search } = req.query;

    const filter = {};
    if (decision && ['approved', 'rejected'].includes(decision.toLowerCase())) {
      filter.decision = decision.toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { clinicianName: { $regex: q, $options: 'i' } },
        { clinicianEmail: { $regex: q, $options: 'i' } },
        { registrationNumber: { $regex: q, $options: 'i' } },
      ];
    }

    const logs = await VerificationLog.find(filter)
      .sort({ reviewedAt: -1 })
      .limit(200);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch verification audit history',
    });
  }
};

// @desc    Approve clinician credentials
// @route   PATCH /api/admin/clinicians/:id/approve
// @access  Private (Admin Only)
const approveClinician = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    const clinician = await User.findOne({ _id: id, role: 'clinician' });
    if (!clinician) {
      return res.status(404).json({
        success: false,
        message: 'Clinician account not found',
      });
    }

    const now = new Date();
    clinician.verificationStatus = 'verified';
    clinician.verifiedAt = now;
    clinician.verificationReviewedAt = now;
    clinician.verificationReviewedBy = adminUser._id;
    clinician.rejectionReason = '';

    await clinician.save();

    // Write audit log entry (no health data)
    await VerificationLog.create({
      admin: adminUser._id,
      adminEmail: adminUser.email,
      clinician: clinician._id,
      clinicianName: clinician.name,
      clinicianEmail: clinician.email,
      decision: 'approved',
      registeringBody: clinician.registeringBody || '',
      registrationNumber: clinician.registrationNumber || '',
      reason: '',
      reviewedAt: now,
    });

    return res.status(200).json({
      success: true,
      message: `Clinician credentials for ${clinician.name} have been approved.`,
      data: {
        id: clinician._id,
        name: clinician.name,
        verificationStatus: clinician.verificationStatus,
        verifiedAt: clinician.verifiedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve clinician verification',
    });
  }
};

// @desc    Reject clinician credentials with reason
// @route   PATCH /api/admin/clinicians/:id/reject
// @access  Private (Admin Only)
const rejectClinician = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = req.user;

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
      });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason cannot exceed 300 characters.',
      });
    }

    const clinician = await User.findOne({ _id: id, role: 'clinician' });
    if (!clinician) {
      return res.status(404).json({
        success: false,
        message: 'Clinician account not found',
      });
    }

    const now = new Date();
    clinician.verificationStatus = 'rejected';
    clinician.verifiedAt = null;
    clinician.verificationReviewedAt = now;
    clinician.verificationReviewedBy = adminUser._id;
    clinician.rejectionReason = trimmedReason;

    await clinician.save();

    // Write audit log entry (no health data)
    await VerificationLog.create({
      admin: adminUser._id,
      adminEmail: adminUser.email,
      clinician: clinician._id,
      clinicianName: clinician.name,
      clinicianEmail: clinician.email,
      decision: 'rejected',
      registeringBody: clinician.registeringBody || '',
      registrationNumber: clinician.registrationNumber || '',
      reason: trimmedReason,
      reviewedAt: now,
    });

    return res.status(200).json({
      success: true,
      message: `Clinician verification for ${clinician.name} was rejected.`,
      data: {
        id: clinician._id,
        name: clinician.name,
        verificationStatus: clinician.verificationStatus,
        rejectionReason: clinician.rejectionReason,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject clinician verification',
    });
  }
};

module.exports = {
  getPendingVerificationRequests,
  getReviewedVerificationHistory,
  approveClinician,
  rejectClinician,
};

