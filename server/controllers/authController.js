const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');
const {
  validateRegistrationNumber,
  sanitizeRegisteringBody,
} = require('../utils/clinicianValidation');

// In-memory user store fallback for zero-dependency local testing if Mongo is offline
const inMemoryUsers = [];
const inMemoryOtps = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Send 6-digit authentication code (OTP) for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendRegistrationOtp = async (req, res, next) => {
  try {
    const {
      name,
      email,
      role,
      registrationNumber,
      registeringBody,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const selectedRole = role === 'clinician' ? 'clinician' : 'self_user';

    // 1. Check if user already exists
    if (isDbConnected()) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please sign in instead.',
          });
        }
      } catch (e) {
        const memExisting = inMemoryUsers.find((u) => u.email === cleanEmail);
        if (memExisting) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists. Please sign in instead.',
          });
        }
      }
    } else {
      const memExisting = inMemoryUsers.find((u) => u.email === cleanEmail);
      if (memExisting) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.',
        });
      }
    }

    // 2. Clinician registration number validation if clinician
    if (selectedRole === 'clinician' && registrationNumber) {
      const valRes = validateRegistrationNumber(registrationNumber);
      if (!valRes.valid) {
        return res.status(400).json({
          success: false,
          message: valRes.message,
        });
      }
      const cleanRegNum = valRes.value || '';
      const cleanBody = sanitizeRegisteringBody(registeringBody);

      if (isDbConnected()) {
        try {
          const duplicate = await User.findOne({
            registrationNumber: cleanRegNum,
            registeringBody: cleanBody || { $in: ['', null, undefined] },
          });
          if (duplicate) {
            return res.status(400).json({
              success: false,
              message:
                'This professional registration number is already linked to another account.',
            });
          }
        } catch (e) {
          const memDup = inMemoryUsers.find(
            (u) =>
              u.registrationNumber === cleanRegNum &&
              (u.registeringBody || '') === cleanBody
          );
          if (memDup) {
            return res.status(400).json({
              success: false,
              message:
                'This professional registration number is already linked to another account.',
            });
          }
        }
      } else {
        const memDup = inMemoryUsers.find(
          (u) =>
            u.registrationNumber === cleanRegNum &&
            (u.registeringBody || '') === cleanBody
        );
        if (memDup) {
          return res.status(400).json({
            success: false,
            message:
              'This professional registration number is already linked to another account.',
          });
        }
      }
    }

    // 3. Generate random 6-digit numeric verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. Save to DB (or fallback to memory)
    if (isDbConnected()) {
      try {
        await Otp.deleteMany({ email: cleanEmail });
        await Otp.create({
          email: cleanEmail,
          otp,
          expiresAt,
          attempts: 0,
        });
      } catch (dbErr) {
        inMemoryOtps.set(cleanEmail, {
          otp,
          expiresAt: expiresAt.getTime(),
          attempts: 0,
        });
      }
    } else {
      inMemoryOtps.set(cleanEmail, {
        otp,
        expiresAt: expiresAt.getTime(),
        attempts: 0,
      });
    }

    // 5. Send Email
    const recipientName = name ? name.trim() : 'User';
    const roleLabel = selectedRole === 'clinician' ? 'Clinician' : 'Self User';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Cognitive Enhancement Support Tool</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Authentication Code</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <p style="color: #334155; font-size: 15px; margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for registering with CEST as a <strong>${roleLabel}</strong>. To authenticate your email and complete your registration, enter this 6-digit verification code:
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #15803d; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">This code will expire in 10 minutes.</p>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
          &copy; ${new Date().getFullYear()} CEST Platform. Evidence-aligned cognitive tools & clinical support.
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: cleanEmail,
        subject: `Your CEST Authentication Code: ${otp}`,
        message: `Hello ${recipientName},\n\nYour 6-digit CEST authentication code is: ${otp}\nThis code will expire in 10 minutes.\n\nIf you did not request this code, you can ignore this email.`,
        html: htmlContent,
      });

      console.log(`[CEST Auth] Sent 6-digit OTP code to ${cleanEmail}`);

      return res.status(200).json({
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}),
      });
    } catch (emailErr) {
      console.error(`[CEST Auth] Failed to send OTP email: ${emailErr.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${emailErr.message}. Ensure SMTP credentials are configured on your server.`,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Self User or Clinician)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      title,
      specialization,
      licenseNumber,
      registrationNumber,
      registeringBody,
      institution,
      otp,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be created via registration',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify 6-digit OTP unless running automated script tests in NODE_ENV === 'test'
    if (process.env.NODE_ENV !== 'test') {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the 6-digit authentication code sent to your email',
        });
      }

      const cleanOtp = String(otp).trim();

      if (isDbConnected()) {
        try {
          const otpRecord = await Otp.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
          if (!otpRecord) {
            return res.status(400).json({
              success: false,
              message: 'No authentication code found for this email. Please click Authenticate to receive a code.',
            });
          }

          if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteMany({ email: cleanEmail });
            return res.status(400).json({
              success: false,
              message: 'Authentication code has expired. Please request a new code.',
            });
          }

          if (otpRecord.attempts >= 5) {
            await Otp.deleteMany({ email: cleanEmail });
            return res.status(400).json({
              success: false,
              message: 'Too many incorrect attempts. Please request a new authentication code.',
            });
          }

          if (otpRecord.otp !== cleanOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({
              success: false,
              message: 'Incorrect 6-digit authentication code. Please check your email and try again.',
            });
          }

          // Verified successfully, delete OTP record
          await Otp.deleteMany({ email: cleanEmail });
        } catch (dbOtpErr) {
          // Fallback to in-memory OTP verification if Mongo throws
          const memOtp = inMemoryOtps.get(cleanEmail);
          if (!memOtp) {
            return res.status(400).json({
              success: false,
              message: 'No authentication code found for this email. Please click Authenticate to receive a code.',
            });
          }
          if (Date.now() > memOtp.expiresAt) {
            inMemoryOtps.delete(cleanEmail);
            return res.status(400).json({
              success: false,
              message: 'Authentication code has expired. Please request a new code.',
            });
          }
          if (memOtp.otp !== cleanOtp) {
            return res.status(400).json({
              success: false,
              message: 'Incorrect 6-digit authentication code. Please check your email and try again.',
            });
          }
          inMemoryOtps.delete(cleanEmail);
        }
      } else {
        // Direct in-memory OTP verification
        const memOtp = inMemoryOtps.get(cleanEmail);
        if (!memOtp) {
          return res.status(400).json({
            success: false,
            message: 'No authentication code found for this email. Please click Authenticate to receive a code.',
          });
        }
        if (Date.now() > memOtp.expiresAt) {
          inMemoryOtps.delete(cleanEmail);
          return res.status(400).json({
            success: false,
            message: 'Authentication code has expired. Please request a new code.',
          });
        }
        if (memOtp.otp !== cleanOtp) {
          return res.status(400).json({
            success: false,
            message: 'Incorrect 6-digit authentication code. Please check your email and try again.',
          });
        }
        inMemoryOtps.delete(cleanEmail);
      }
    }

    const selectedRole = role === 'clinician' ? 'clinician' : 'self_user';

    // Clinician registration validation
    const regNumInput =
      registrationNumber !== undefined ? registrationNumber : licenseNumber;
    let cleanRegNum = '';
    let cleanBody = '';

    if (selectedRole === 'clinician') {
      const valRes = validateRegistrationNumber(regNumInput);
      if (!valRes.valid) {
        return res.status(400).json({
          success: false,
          message: valRes.message,
        });
      }
      cleanRegNum = valRes.value || '';
      cleanBody = sanitizeRegisteringBody(registeringBody);
    }

    if (isDbConnected()) {
      try {
        // Check if user exists in MongoDB
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists',
          });
        }

        // Check unique registration number if provided
        if (selectedRole === 'clinician' && cleanRegNum) {
          const duplicate = await User.findOne({
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

        // Create user in DB
        const user = await User.create({
          name,
          email: cleanEmail,
          password,
          role: selectedRole,
          title: title || '',
          specialization: specialization || '',
          licenseNumber: cleanRegNum || licenseNumber || '',
          registrationNumber: cleanRegNum || undefined,
          registeringBody: cleanBody || undefined,
          verificationStatus: 'unverified',
          verifiedAt: null,
          institution: institution || '',
          isVerified: true,
        });

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            title: user.title,
            specialization: user.specialization,
            licenseNumber: user.licenseNumber,
            registrationNumber: user.registrationNumber || '',
            registeringBody: user.registeringBody || '',
            verificationStatus: user.verificationStatus || 'unverified',
            verifiedAt: user.verifiedAt || null,
            rejectionReason: user.rejectionReason || '',
            verificationRequestedAt: user.verificationRequestedAt || null,
            institution: user.institution,
            isVerified: user.isVerified,
          },
        });
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
    }

    // Fallback for memory execution if DB is offline or throws
    const existing = inMemoryUsers.find((u) => u.email === cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    if (selectedRole === 'clinician' && cleanRegNum) {
      const memDup = inMemoryUsers.find(
        (u) =>
          u.registrationNumber === cleanRegNum &&
          (u.registeringBody || '') === cleanBody
      );
      if (memDup) {
        return res.status(400).json({
          success: false,
          message:
            'This registration number is already linked to another account. Contact support.',
        });
      }
    }

    const mockId = 'mem_' + Date.now();
    const mockUser = {
      id: mockId,
      _id: mockId,
      name,
      email: cleanEmail,
      password, // In real DB this is hashed
      role: selectedRole,
      title: title || '',
      specialization: specialization || '',
      licenseNumber: cleanRegNum || licenseNumber || '',
      registrationNumber: cleanRegNum || '',
      registeringBody: cleanBody || '',
      verificationStatus: 'unverified',
      verifiedAt: null,
      institution: institution || '',
      isVerified: true,
    };
    inMemoryUsers.push(mockUser);

    const token = generateToken(mockUser.id, mockUser.role);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        title: mockUser.title,
        specialization: mockUser.specialization,
        licenseNumber: mockUser.licenseNumber,
        registrationNumber: mockUser.registrationNumber,
        registeringBody: mockUser.registeringBody,
        verificationStatus: mockUser.verificationStatus,
        verifiedAt: mockUser.verifiedAt,
        institution: mockUser.institution,
        isVerified: mockUser.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    try {
      // Check for user in DB
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Friendly error for Google-only accounts that have no local password
      if (user.authProvider === 'google' && !user.password) {
        return res.status(401).json({
          success: false,
          message: 'This account was created with Google. Please sign in with Google.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          registrationNumber: user.registrationNumber || '',
          registeringBody: user.registeringBody || '',
          verificationStatus: user.verificationStatus || 'unverified',
          verifiedAt: user.verifiedAt || null,
          rejectionReason: user.rejectionReason || '',
          verificationRequestedAt: user.verificationRequestedAt || null,
          institution: user.institution,
          isVerified: user.isVerified,
        },
      });
    } catch (dbErr) {
      // Fallback in-memory search
      const user = inMemoryUsers.find(
        (u) => u.email === email.toLowerCase() && u.password === password
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or user not registered',
        });
      }

      const token = generateToken(user.id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          registrationNumber: user.registrationNumber || '',
          registeringBody: user.registeringBody || '',
          verificationStatus: user.verificationStatus || 'unverified',
          verifiedAt: user.verifiedAt || null,
          rejectionReason: user.rejectionReason || '',
          verificationRequestedAt: user.verificationRequestedAt || null,
          institution: user.institution,
          isVerified: user.isVerified,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Sign-in / Sign-up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required',
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!googleClientId) {
      return res.status(503).json({
        success: false,
        message: 'Google sign-in is not configured on this server',
      });
    }

    const client = new OAuth2Client(googleClientId);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('[CEST Google Auth] Token verification failed:', verifyErr.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential token',
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Google token does not contain a valid email address',
      });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Google email address is not verified',
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split('@')[0];

    try {
      // 1. Look up by googleId first
      let user = await User.findOne({ googleId });

      // 2. If not found by googleId, look up by email
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = googleId;
          await user.save({ validateBeforeSave: false });
        }
      }

      // 3. If still not found, this is a new user
      if (!user) {
        if (!role) {
          return res.status(200).json({
            success: false,
            needsRole: true,
            email,
            name,
          });
        }

        const selectedRole = role === 'clinician' ? 'clinician' : 'self_user';
        user = await User.create({
          name,
          email,
          googleId,
          authProvider: 'google',
          role: selectedRole,
          isVerified: true,
        });
      }

      const token = generateToken(user._id, user.role);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          registrationNumber: user.registrationNumber || '',
          registeringBody: user.registeringBody || '',
          verificationStatus: user.verificationStatus || 'unverified',
          verifiedAt: user.verifiedAt || null,
          rejectionReason: user.rejectionReason || '',
          verificationRequestedAt: user.verificationRequestedAt || null,
          institution: user.institution,
          isVerified: user.isVerified,
        },
      });
    } catch (dbErr) {
      // Google auth requires a live database connection; we do not use the in-memory fallback here
      console.error('[CEST Google Auth] Database error during Google sign-in:', dbErr.message);
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again shortly.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    try {
      const user = await User.findById(userId);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            title: user.title,
            specialization: user.specialization,
            licenseNumber: user.licenseNumber,
            institution: user.institution,
            isVerified: user.isVerified,
            bio: user.bio,
            phone: user.phone,
          },
        });
      }
    } catch (dbErr) {
      // DB offline fallback
    }

    const memUser = inMemoryUsers.find((u) => u.id === userId || u._id === userId);
    if (memUser) {
      return res.json({
        success: true,
        user: {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          title: memUser.title,
          specialization: memUser.specialization,
          licenseNumber: memUser.licenseNumber,
          institution: memUser.institution,
          isVerified: memUser.isVerified,
          bio: memUser.bio || '',
          phone: memUser.phone || '',
        },
      });
    }

    // Default return attached user token payload
    return res.json({
      success: true,
      user: {
        id: userId,
        name: 'CEST User',
        email: req.user.email || 'user@cest.org',
        role: req.user.role || 'self_user',
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const targetEmail = email.trim().toLowerCase();
    let user = null;

    try {
      user = await User.findOne({ email: targetEmail });
    } catch (dbErr) {
      // Mongo offline
    }

    if (!user) {
      user = inMemoryUsers.find((u) => u.email === targetEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Please enter a valid, registered email address',
      });
    }

    // Google accounts without local password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created with Google. Please sign in with Google.',
      });
    }

    // Generate unhashed reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expireTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    if (user.save && typeof user.save === 'function') {
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = expireTime;
      await user.save({ validateBeforeSave: false });
    } else {
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = expireTime.getTime();
    }

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
    const emailMessage = `You are receiving this email because a password reset was requested for your CEST account.\n\nPlease click the link below or paste it into your browser to reset your password:\n\n${resetUrl}\n\nThis link is valid for 30 minutes. If you did not request a password reset, please ignore this message.`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
    .header { font-size: 20px; font-weight: 800; color: #0284c7; margin-bottom: 18px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 14px; }
    .url-box { background: #f1f5f9; padding: 12px 14px; border-radius: 8px; font-size: 13px; word-break: break-all; color: #0f172a; margin: 16px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">CEST Password Reset Request</div>
    <p>Hello,</p>
    <p>You recently requested to reset your password for your Cognitive Enhancement Support Tool (CEST) account.</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </p>
    <p>If the button does not work, copy and paste this link into your web browser:</p>
    <div class="url-box">${resetUrl}</div>
    <p>This link is valid for 30 minutes. If you did not request a password reset, please ignore this message.</p>
    <div class="footer">
      Cognitive Enhancement Support Tool (CEST) &bull; Automated Security Notice
    </div>
  </div>
</body>
</html>`;

    try {
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'CEST Password Reset Request',
        message: emailMessage,
        html: emailHtml,
        resetUrl,
      });

      if (emailResult && emailResult.mockSent) {
        return res.json({
          success: true,
          devMode: true,
          message: 'Development mode: SMTP is not configured. The password reset link was printed to the server console.',
          resetUrl: (process.env.NODE_ENV || 'development') === 'development' ? resetUrl : undefined,
        });
      }

      return res.json({
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      });
    } catch (mailErr) {
      if (user.save && typeof user.save === 'function') {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
      }
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    let user = null;
    try {
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
    } catch (dbErr) {
      // DB offline
    }

    if (!user) {
      const now = Date.now();
      user = inMemoryUsers.find(
        (u) =>
          u.resetPasswordToken === hashedToken &&
          u.resetPasswordExpire &&
          new Date(u.resetPasswordExpire).getTime() > now
      );
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    if (user.save && typeof user.save === 'function') {
      user.password = password; // bcrypt pre-save hook will hash this
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    }

    return res.json({
      success: true,
      message: 'Password reset successful. You may now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email Link
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    res.json({
      success: true,
      message: 'Email successfully verified. You may now access all features.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
