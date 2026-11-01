const User = require('../models/User');
const {
  validateRegistrationNumber,
  sanitizeRegisteringBody,
} = require('../utils/clinicianValidation');

const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_USER !== 'your_smtp_username'
  );
};

/**
 * @desc    Get clinician portal settings, SMTP readiness, and profile credentials
 * @route   GET /api/clinician/settings
 * @access  Private (Clinician)
 */
const getClinicianSettings = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const user = await User.findById(clinicianId).select(
      'name title specialization institution settings role registrationNumber registeringBody verificationStatus verifiedAt verificationRequestedAt verificationReviewedAt rejectionReason'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Clinician account not found',
      });
    }

    const smtpConfigured = isSmtpConfigured();

    const settings = {
      notifyUrgentEmail:
        user.settings?.notifyUrgentEmail !== undefined ? user.settings.notifyUrgentEmail : true,
      reportRangeDays: user.settings?.reportRangeDays || 90,
    };

    return res.status(200).json({
      success: true,
      data: {
        settings,
        smtpConfigured,
        profile: {
          name: user.name || '',
          title: user.title || 'Dr.',
          specialization: user.specialization || '',
          institution: user.institution || '',
          registrationNumber: user.registrationNumber || '',
          registeringBody: user.registeringBody || '',
          verificationStatus: user.verificationStatus || 'unverified',
          verifiedAt: user.verifiedAt || null,
          verificationRequestedAt: user.verificationRequestedAt || null,
          verificationReviewedAt: user.verificationReviewedAt || null,
          rejectionReason: user.rejectionReason || '',
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician settings',
    });
  }
};

/**
 * @desc    Update clinician settings and profile credentials
 * @route   PATCH /api/clinician/settings
 * @access  Private (Clinician)
 */
const updateClinicianSettings = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { settings, profile } = req.body;

    const user = await User.findById(clinicianId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Clinician account not found',
      });
    }

    if (settings) {
      if (settings.notifyUrgentEmail !== undefined) {
        user.settings.notifyUrgentEmail = Boolean(settings.notifyUrgentEmail);
      }
      if (settings.reportRangeDays !== undefined) {
        const days = Number(settings.reportRangeDays);
        if (![30, 90, 180].includes(days)) {
          return res.status(400).json({
            success: false,
            message: 'Default report range must be 30, 90, or 180 days',
          });
        }
        user.settings.reportRangeDays = days;
      }
    }

    if (profile) {
      if (profile.name !== undefined) {
        if (!profile.name || !profile.name.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Name cannot be empty',
          });
        }
        user.name = profile.name.trim();
      }
      if (profile.title !== undefined) user.title = profile.title.trim();
      if (profile.specialization !== undefined) user.specialization = profile.specialization.trim();
      if (profile.institution !== undefined) user.institution = profile.institution.trim();

      const regNumInput =
        profile.registrationNumber !== undefined
          ? profile.registrationNumber
          : profile.licenseNumber;

      if (regNumInput !== undefined || profile.registeringBody !== undefined) {
        const valRes = validateRegistrationNumber(regNumInput);
        if (!valRes.valid) {
          return res.status(400).json({
            success: false,
            message: valRes.message,
          });
        }

        const cleanRegNum = valRes.value || '';
        const cleanBody = sanitizeRegisteringBody(profile.registeringBody);

        // Check if changed -> reset verification status to unverified
        const prevReg = user.registrationNumber || '';
        const prevBody = user.registeringBody || '';
        if (cleanRegNum !== prevReg || cleanBody !== prevBody) {
          user.verificationStatus = 'unverified';
          user.verifiedAt = null;
          user.rejectionReason = '';
          user.verificationReviewedAt = null;
          user.verificationReviewedBy = null;
        }

        // Uniqueness check across other clinicians
        if (cleanRegNum) {
          const duplicate = await User.findOne({
            _id: { $ne: user._id },
            registrationNumber: cleanRegNum,
            registeringBody: cleanBody || { $in: ['', null, undefined] },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message:
                'This registration number is already linked to another account. Contact support.',
            });
          }
        }

        user.registrationNumber = cleanRegNum || undefined;
        user.registeringBody = cleanBody || undefined;
        user.licenseNumber = cleanRegNum || user.licenseNumber;
      }
    }

    await user.save();

    const smtpConfigured = isSmtpConfigured();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: user.settings,
        smtpConfigured,
        profile: {
          name: user.name,
          title: user.title,
          specialization: user.specialization,
          institution: user.institution,
          registrationNumber: user.registrationNumber || '',
          registeringBody: user.registeringBody || '',
          verificationStatus: user.verificationStatus || 'unverified',
          verifiedAt: user.verifiedAt || null,
          verificationRequestedAt: user.verificationRequestedAt || null,
          rejectionReason: user.rejectionReason || '',
        },
      },
    });
  } catch (err) {
    if (
      err.code === 11000 &&
      (err.keyPattern?.registrationNumber ||
        JSON.stringify(err).includes('registrationNumber'))
    ) {
      return res.status(400).json({
        success: false,
        message:
          'This registration number is already linked to another account. Contact support.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update clinician settings',
    });
  }
};

/**
 * @desc    Request credential verification for clinician profile
 * @route   POST /api/clinician/settings/request-verification
 * @access  Private (Clinician)
 */
const requestVerification = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const user = await User.findById(clinicianId);

    if (!user || user.role !== 'clinician') {
      return res.status(404).json({
        success: false,
        message: 'Clinician account not found',
      });
    }

    const regNum = (user.registrationNumber || '').trim();
    const regBody = (user.registeringBody || '').trim();

    if (!regNum || !regBody) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide both a professional registration number and registering body before requesting verification.',
      });
    }

    // Rate limit: maximum 3 requests per 24 hours per clinician
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const recentRequests = (user.verificationRequestTimestamps || []).filter(
      (t) => new Date(t).getTime() > oneDayAgo
    );

    if (recentRequests.length >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: You may submit up to 3 verification requests per 24 hours.',
      });
    }

    if (user.verificationStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'A verification request is already pending review.',
      });
    }

    if (user.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Your credentials have already been verified.',
      });
    }

    user.verificationRequestTimestamps = [...recentRequests, new Date()];
    user.verificationStatus = 'pending';
    user.verificationRequestedAt = new Date();
    user.rejectionReason = '';

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Verification request submitted successfully. Your profile is now pending review.',
      data: {
        verificationStatus: user.verificationStatus,
        verificationRequestedAt: user.verificationRequestedAt,
        rejectionReason: '',
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit verification request. Please try again.',
    });
  }
};

module.exports = {
  getClinicianSettings,
  updateClinicianSettings,
  requestVerification,
};
