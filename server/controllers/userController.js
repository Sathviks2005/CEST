const User = require('../models/User');
const {
  validateRegistrationNumber,
  sanitizeRegisteringBody,
} = require('../utils/clinicianValidation');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      name,
      bio,
      phone,
      title,
      specialization,
      licenseNumber,
      registrationNumber,
      registeringBody,
      institution,
    } = req.body;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.name = name || user.name;
        user.bio = bio !== undefined ? bio : user.bio;
        user.phone = phone !== undefined ? phone : user.phone;

        if (user.role === 'clinician') {
          user.title = title || user.title;
          user.specialization = specialization || user.specialization;
          user.institution = institution || user.institution;

          const regNumInput =
            registrationNumber !== undefined ? registrationNumber : licenseNumber;

          if (regNumInput !== undefined || registeringBody !== undefined) {
            const valRes = validateRegistrationNumber(regNumInput);
            if (!valRes.valid) {
              return res.status(400).json({
                success: false,
                message: valRes.message,
              });
            }

            const cleanRegNum = valRes.value || '';
            const cleanBody = sanitizeRegisteringBody(registeringBody);

            // Check if changed -> reset verification status
            const prevReg = user.registrationNumber || '';
            const prevBody = user.registeringBody || '';
            if (cleanRegNum !== prevReg || cleanBody !== prevBody) {
              user.verificationStatus = 'unverified';
              user.verifiedAt = null;
              user.rejectionReason = '';
              user.verificationReviewedAt = null;
              user.verificationReviewedBy = null;
            }

            // Uniqueness check across other accounts
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

        const updatedUser = await user.save();
        return res.json({
          success: true,
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            title: updatedUser.title,
            specialization: updatedUser.specialization,
            licenseNumber: updatedUser.licenseNumber,
            registrationNumber: updatedUser.registrationNumber || '',
            registeringBody: updatedUser.registeringBody || '',
            verificationStatus: updatedUser.verificationStatus || 'unverified',
            verifiedAt: updatedUser.verifiedAt || null,
            institution: updatedUser.institution,
          },
        });
      }
    } catch (dbErr) {
      if (
        dbErr.code === 11000 &&
        (dbErr.keyPattern?.registrationNumber ||
          JSON.stringify(dbErr).includes('registrationNumber'))
      ) {
        return res.status(400).json({
          success: false,
          message:
            'This registration number is already linked to another account. Contact support.',
        });
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: name || 'CEST User',
        role: req.user.role || 'self_user',
        bio: bio || '',
        phone: phone || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile };
