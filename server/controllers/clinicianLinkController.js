const ClinicianLink = require('../models/ClinicianLink');
const AssignedExercise = require('../models/AssignedExercise');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Assessment = require('../models/Assessment');
const sendEmail = require('../utils/sendEmail');
const {
  validateQualifyingSeverity,
  canClinicianView,
  checkAndComputeExpiration,
} = require('../utils/clinicianLinkHelpers');
const AccessLog = require('../models/AccessLog');
const { logPatientAccess } = require('../utils/accessLogger');

// In-memory rate limiter for patient connection requests: max 10 requests per hour per user
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRecord = rateLimitMap.get(String(userId));

  if (!userRecord || now - userRecord.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(String(userId), { count: 1, firstRequestTime: now });
    return { allowed: true };
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false };
  }

  userRecord.count += 1;
  return { allowed: true };
};

/**
 * @desc    Get list of registered clinicians for self-user directory
 * @route   GET /api/clinician-links/clinicians
 * @access  Private (Self User)
 * SECURITY NOTE: Protected by User.find({ role: 'clinician' }).select('_id name title specialization institution verificationStatus').
 * Never returns email, phone, registrationNumber, or licenseNumber to ensure clinician privacy.
 */
const getClinicians = async (req, res) => {
  try {
    const clinicians = await User.find({ role: 'clinician' })
      .select('_id name title specialization institution verificationStatus')
      .sort({ name: 1 });

    const formatted = clinicians.map((c) => ({
      id: c._id,
      name: c.name,
      title: c.title || 'Dr.',
      specialization: c.specialization || 'Clinical Specialist',
      institution: c.institution || 'Medical Care Clinic',
      verificationStatus: c.verificationStatus || 'unverified',
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician directory',
    });
  }
};

/**
 * @desc    Submit connection request to a clinician (anytime or from assessment)
 * @route   POST /api/clinician-links
 * @access  Private (Self User)
 * SECURITY NOTE: Strictly binds patientUser to req.user._id. Never trusts client-supplied urgent flag.
 */
const createLink = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Rate limiting: max 10 requests / hr per user
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: You may submit up to 10 connection requests per hour.',
      });
    }

    const {
      clinicianId,
      assessmentId,
      sharedAssessmentIds = [],
      shareScope = 'selected',
      alertOnHighestBand = false,
    } = req.body;

    if (!clinicianId) {
      return res.status(400).json({
        success: false,
        message: 'Clinician ID is required',
      });
    }

    // 1. Verify target clinician exists and has role clinician
    const clinician = await User.findOne({ _id: clinicianId, role: 'clinician' });
    if (!clinician) {
      return res.status(404).json({
        success: false,
        message: 'Selected clinician was not found or is invalid',
      });
    }

    // 2. Enforce limits:
    // a. At most 1 accepted clinician at a time
    // Filter: patientUser === userId
    const acceptedCount = await ClinicianLink.countDocuments({
      patientUser: userId,
      status: 'accepted',
    });
    if (acceptedCount >= 1) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active connected clinician. You must end your existing connection before requesting a new one.',
      });
    }

    // b. At most 3 open (pending or invited) links (computed check for non-expired)
    // Filter: patientUser === userId
    const openCount = await ClinicianLink.countDocuments({
      patientUser: userId,
      status: { $in: ['pending', 'invited'] },
      expiresAt: { $gt: new Date() },
    });
    if (openCount >= 3) {
      return res.status(400).json({
        success: false,
        message:
          'You have reached the maximum limit of 3 open connection requests or invitations. Please wait for a response or cancel an open request.',
      });
    }

    // c. Duplicate prevention for active links between this patient and target clinician
    // Filter: patientUser === userId && clinician === clinicianId
    const existingActiveLink = await ClinicianLink.findOne({
      patientUser: userId,
      clinician: clinicianId,
      status: { $in: ['pending', 'invited', 'accepted'] },
      expiresAt: { $gt: new Date() },
    });

    if (existingActiveLink) {
      let msg = 'You already have an active connection with this clinician.';
      if (existingActiveLink.status === 'accepted') {
        msg = 'You are already linked with this clinician.';
      } else if (existingActiveLink.status === 'pending') {
        msg = 'You already have a pending connection request with this clinician.';
      } else if (existingActiveLink.status === 'invited') {
        msg = 'You have an open invitation from this clinician. Please accept or decline it in your clinician tab.';
      }
      return res.status(400).json({
        success: false,
        message: msg,
      });
    }

    // 3. Server evaluates assessment & urgent status (never trust client-supplied urgent flag)
    let isUrgent = false;
    let triggerData = undefined;
    let initialShared = [];

    if (assessmentId) {
      // Filter: user === userId strictly verifies ownership
      const assessment = await Assessment.findOne({
        _id: assessmentId,
        user: userId,
      });

      if (assessment) {
        const validation = validateQualifyingSeverity(assessment);
        isUrgent = validation.qualifies;
        triggerData = {
          instrument: assessment.assessmentType || 'Clinical Assessment',
          severity: assessment.severity || 'Assessment Score',
          score: assessment.totalScore ?? 0,
          assessmentId: assessment._id,
          itemNineFlag: Boolean(validation.itemNineFlag),
        };
        initialShared.push(assessment._id);
      }
    }

    // 4. Validate additional shared assessments (verify ownership by userId)
    let validatedSharedIds = initialShared;
    if (Array.isArray(sharedAssessmentIds) && sharedAssessmentIds.length > 0) {
      // Filter: user === userId
      const additionalValid = await Assessment.find({
        _id: { $in: sharedAssessmentIds },
        user: userId,
      }).select('_id');
      const additionalIds = additionalValid.map((a) => a._id);
      validatedSharedIds = Array.from(new Set([...validatedSharedIds, ...additionalIds]));
    }

    // 5. Create ClinicianLink record
    const newLink = await ClinicianLink.create({
      patientUser: userId,
      clinician: clinicianId,
      initiatedBy: 'patient',
      status: 'pending',
      urgent: isUrgent,
      shareScope: shareScope === 'all' ? 'all' : 'selected',
      alertOnHighestBand: Boolean(alertOnHighestBand),
      trigger: triggerData,
      sharedAssessmentIds: validatedSharedIds,
      consentedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // 6. Optional notification email (no health data sent)
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      clinician.email
    ) {
      try {
        await sendEmail({
          email: clinician.email,
          subject: isUrgent ? 'New urgent connection request' : 'New patient connection request',
          message: `Hello Dr. ${clinician.name},\n\nYou have received a new connection request from a CEST platform user. Please log in to your clinician dashboard to view details and respond.\n\nBest regards,\nCEST Platform Support`,
        });
      } catch {
        // Silently skip if email transmission fails
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: newLink,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active connection request or link with this clinician.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create clinician link request',
    });
  }
};

/**
 * @desc    Get user's clinician connection requests, active links, and received invites
 * @route   GET /api/clinician-links/mine
 * @access  Private (Self User)
 * SECURITY NOTE: Query strictly filtered by logged-in user id (patientUser: req.user._id).
 */
const getMyLinks = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Strict filter by authenticated user id
    const links = await ClinicianLink.find({ patientUser: userId })
      .populate('clinician', 'name title specialization institution verificationStatus')
      .sort({ createdAt: -1 });

    // Compute expiration on the fly
    for (const l of links) {
      await checkAndComputeExpiration(l);
    }

    const formattedLinks = [];
    const formattedInvites = [];

    links.forEach((l) => {
      const formatted = {
        _id: l._id,
        id: l._id,
        initiatedBy: l.initiatedBy,
        status: l.status,
        urgent: l.urgent,
        shareScope: l.shareScope,
        alertOnHighestBand: l.alertOnHighestBand,
        expiresAt: l.expiresAt,
        lastAlertAt: l.lastAlertAt,
        inviteMessage: l.inviteMessage,
        sharedAssessmentIds: l.sharedAssessmentIds,
        trigger: l.trigger,
        clinician: l.clinician
          ? {
              id: l.clinician._id,
              name: l.clinician.name,
              title: l.clinician.title || 'Dr.',
              specialization: l.clinician.specialization,
              institution: l.clinician.institution,
            }
          : null,
        consentedAt: l.consentedAt,
        respondedAt: l.respondedAt,
        revokedAt: l.revokedAt,
        clinicianNote: l.clinicianNote,
        createdAt: l.createdAt,
      };

      if (l.status === 'invited') {
        formattedInvites.push(formatted);
      } else {
        formattedLinks.push(formatted);
      }
    });

    return res.status(200).json({
      success: true,
      data: formattedLinks,
      invites: formattedInvites,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your clinician links',
    });
  }
};

/**
 * @desc    Accept an invitation from a clinician
 * @route   PATCH /api/clinician-links/:id/accept-invite
 * @access  Private (Self User)
 * SECURITY NOTE: Strictly filters by _id and patientUser: req.user._id. Enforces one-accepted-clinician rule.
 */
const acceptInvite = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { shareScope = 'selected', sharedAssessmentIds = [], alertOnHighestBand = false } = req.body;

    // Strict filter: link must be addressed to THIS patient user
    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      patientUser: userId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    await checkAndComputeExpiration(link);

    if (link.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired.',
      });
    }

    if (link.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept an invitation with status '${link.status}'`,
      });
    }

    // Enforce one-accepted-clinician rule
    const existingAccepted = await ClinicianLink.findOne({
      patientUser: userId,
      status: 'accepted',
    });
    if (existingAccepted) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active connected clinician. You must end your existing connection before accepting this invitation.',
      });
    }

    // Validate shared assessment IDs belong to this patient
    let validatedSharedIds = [];
    if (Array.isArray(sharedAssessmentIds) && sharedAssessmentIds.length > 0) {
      const validDocs = await Assessment.find({
        _id: { $in: sharedAssessmentIds },
        user: userId,
      }).select('_id');
      validatedSharedIds = validDocs.map((d) => d._id);
    }

    link.status = 'accepted';
    link.shareScope = shareScope === 'all' ? 'all' : 'selected';
    link.alertOnHighestBand = Boolean(alertOnHighestBand);
    link.sharedAssessmentIds = validatedSharedIds;
    link.consentedAt = new Date();
    link.respondedAt = new Date();
    await link.save();

    // Match to existing Patient record for this clinician by linkedUser, email, or name
    const patientUser = await User.findById(userId);
    const userEmail = (patientUser?.email || '').trim().toLowerCase();
    const userName = (patientUser?.name || '').trim();

    let patientRecord = await Patient.findOne({
      clinician: link.clinician,
      linkedUser: userId,
    });

    if (!patientRecord && userEmail) {
      patientRecord = await Patient.findOne({
        clinician: link.clinician,
        email: new RegExp(`^${userEmail}$`, 'i'),
      });
    }

    if (!patientRecord && userName) {
      patientRecord = await Patient.findOne({
        clinician: link.clinician,
        name: new RegExp(`^${userName}$`, 'i'),
      });
    }

    if (patientRecord) {
      patientRecord.linkedUser = userId;
      if (!patientRecord.name && patientUser?.name) patientRecord.name = patientUser.name;
      if (!patientRecord.email && userEmail) patientRecord.email = userEmail;
      await patientRecord.save();
    } else {
      patientRecord = await Patient.create({
        name: patientUser?.name || 'Linked Self-User',
        email: userEmail || undefined,
        phone: patientUser?.phone || undefined,
        clinician: link.clinician,
        linkedUser: userId,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation accepted and sharing enabled',
      data: link,
      patient: patientRecord,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
    });
  }
};

/**
 * @desc    Decline an invitation from a clinician
 * @route   PATCH /api/clinician-links/:id/decline-invite
 * @access  Private (Self User)
 * SECURITY NOTE: Strictly filters by _id and patientUser: req.user._id.
 */
const declineInvite = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      patientUser: userId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (link.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: `Cannot decline an invitation with status '${link.status}'`,
      });
    }

    link.status = 'declined';
    link.respondedAt = new Date();
    await link.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation declined',
      data: link,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to decline invitation',
    });
  }
};

/**
 * @desc    Update sharing scope and alert options on an accepted link
 * @route   PATCH /api/clinician-links/:id/sharing
 * @access  Private (Self User)
 * SECURITY NOTE: Strictly filters by _id and patientUser: req.user._id with status 'accepted'.
 */
const updateSharing = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { shareScope, sharedAssessmentIds, alertOnHighestBand } = req.body;

    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      patientUser: userId,
      status: 'accepted',
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Active accepted clinician link not found',
      });
    }

    if (shareScope && (shareScope === 'all' || shareScope === 'selected')) {
      link.shareScope = shareScope;
    }

    if (alertOnHighestBand !== undefined) {
      link.alertOnHighestBand = Boolean(alertOnHighestBand);
    }

    if (Array.isArray(sharedAssessmentIds)) {
      // Validate that all specified assessment IDs belong to the user
      const validDocs = await Assessment.find({
        _id: { $in: sharedAssessmentIds },
        user: userId,
      }).select('_id');
      link.sharedAssessmentIds = validDocs.map((d) => d._id);
    }

    await link.save();

    return res.status(200).json({
      success: true,
      message: 'Sharing settings updated successfully',
      data: link,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update sharing settings',
    });
  }
};

/**
 * @desc    Cancel a pending connection request
 * @route   PATCH /api/clinician-links/:id/cancel
 * @access  Private (Self User)
 * SECURITY NOTE: Query strictly checks patientUser === req.user._id
 */
const cancelLink = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      patientUser: userId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link request not found',
      });
    }

    if (link.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request with status '${link.status}'`,
      });
    }

    link.status = 'cancelled';
    await link.save();

    // Cancel all open assignments associated with this link
    await AssignedExercise.updateMany(
      { link: link._id, status: { $in: ['assigned', 'in_progress'] } },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Connection request cancelled successfully',
      data: link,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel link request',
    });
  }
};

/**
 * @desc    Revoke sharing on an accepted clinician link
 * @route   PATCH /api/clinician-links/:id/revoke
 * @access  Private (Self User)
 * SECURITY NOTE: Sets revokedAt; clinician immediately loses access
 */
const revokeLink = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      patientUser: userId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link record not found',
      });
    }

    if (link.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot revoke a link that is not currently accepted (status: ${link.status})`,
      });
    }

    link.status = 'revoked';
    link.revokedAt = new Date();
    await link.save();

    // Cancel all open assignments associated with this revoked link
    await AssignedExercise.updateMany(
      { link: link._id, status: { $in: ['assigned', 'in_progress'] } },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Sharing stopped. The clinician no longer has access to your assessment records.',
      data: link,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke clinician link',
    });
  }
};

/**
 * @desc    Clinician invites a self-user by email
 * @route   POST /api/clinician-links/invite
 * @access  Private (Clinician)
 * SECURITY NOTE: Rate limited to 20 invites / 24hr per clinician.
 * Never reveals account existence (anti-enumeration). Always returns generic confirmation.
 */
const invitePatient = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { email, message = '' } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required',
      });
    }

    if (message && message.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Invite message cannot exceed 300 characters',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Rate limit: 20 invites per 24 hours per clinician
    // Strict filter: clinician === clinicianId
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentInvitesCount = await ClinicianLink.countDocuments({
      clinician: clinicianId,
      initiatedBy: 'clinician',
      createdAt: { $gte: oneDayAgo },
    });

    if (recentInvitesCount >= 20) {
      return res.status(429).json({
        success: false,
        message: 'Daily invitation limit reached: You may send up to 20 patient invitations per day.',
      });
    }

    // 2. Generic confirmation message (returned whether user exists or not)
    const genericSuccessResponse = {
      success: true,
      message: 'If this person has an account, they will see your invitation.',
    };

    // 3. Look up self_user account
    const targetUser = await User.findOne({
      email: new RegExp(`^${trimmedEmail}$`, 'i'),
      role: 'self_user',
    });

    // If no user exists with this email, return generic message immediately (no enumeration)
    if (!targetUser) {
      return res.status(200).json(genericSuccessResponse);
    }

    // 4. Edge case check: already connected with this clinician
    // Filter: clinician === clinicianId && patientUser === targetUser._id
    const alreadyConnected = await ClinicianLink.findOne({
      clinician: clinicianId,
      patientUser: targetUser._id,
      status: 'accepted',
    });

    if (alreadyConnected) {
      return res.status(400).json({
        success: false,
        message: 'You are already connected with this patient.',
      });
    }

    // Check if an open link already exists with this clinician
    const existingOpenLink = await ClinicianLink.findOne({
      clinician: clinicianId,
      patientUser: targetUser._id,
      status: { $in: ['pending', 'invited'] },
      expiresAt: { $gt: new Date() },
    });

    if (existingOpenLink) {
      if (existingOpenLink.status === 'invited') {
        // Refresh message and expiry on existing open invite
        if (message) existingOpenLink.inviteMessage = message.trim();
        existingOpenLink.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await existingOpenLink.save();
      }
      return res.status(200).json(genericSuccessResponse);
    }

    // Check target patient open links limit (max 3 open links)
    const patientOpenLinks = await ClinicianLink.countDocuments({
      patientUser: targetUser._id,
      status: { $in: ['pending', 'invited'] },
      expiresAt: { $gt: new Date() },
    });

    if (patientOpenLinks >= 3) {
      // Return generic response without revealing patient's pending link count
      return res.status(200).json(genericSuccessResponse);
    }

    // 5. Create ClinicianLink record with status 'invited'
    await ClinicianLink.create({
      clinician: clinicianId,
      patientUser: targetUser._id,
      initiatedBy: 'clinician',
      status: 'invited',
      urgent: false,
      shareScope: 'selected',
      alertOnHighestBand: false,
      inviteMessage: message ? message.trim() : '',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // 6. Optional plain notification email (no health data included)
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      targetUser.email
    ) {
      try {
        await sendEmail({
          email: targetUser.email,
          subject: 'A clinician has invited you to connect on CEST',
          message:
            'A clinician has invited you to connect on CEST. Log in to your self-user dashboard to respond.',
        });
      } catch {
        // Silently continue if email fails
      }
    }

    return res.status(200).json(genericSuccessResponse);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'If this person has an account, they will see your invitation.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to process invitation request',
    });
  }
};

/**
 * @desc    Get sent invitations by logged-in clinician
 * @route   GET /api/clinician-links/invites
 * @access  Private (Clinician)
 * SECURITY NOTE: Strictly filtered by clinician: req.user._id. Returns NO patient health data.
 */
const getClinicianInvites = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    // Strict filter by clinician id
    const invites = await ClinicianLink.find({
      clinician: clinicianId,
      initiatedBy: 'clinician',
    })
      .populate('patientUser', 'name')
      .sort({ createdAt: -1 });

    for (const inv of invites) {
      await checkAndComputeExpiration(inv);
    }

    const formatted = invites.map((inv) => ({
      _id: inv._id,
      id: inv._id,
      status: inv.status,
      patientName: inv.patientUser?.name || 'Invited User',
      inviteMessage: inv.inviteMessage,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      respondedAt: inv.respondedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sent invitations',
    });
  }
};

/**
 * @desc    Cancel a sent invitation
 * @route   PATCH /api/clinician-links/invites/:id/cancel
 * @access  Private (Clinician)
 * SECURITY NOTE: Strictly filtered by _id and clinician: req.user._id.
 */
const cancelClinicianInvite = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    const invite = await ClinicianLink.findOne({
      _id: req.params.id,
      clinician: clinicianId,
      initiatedBy: 'clinician',
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (invite.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an invitation with status '${invite.status}'`,
      });
    }

    invite.status = 'cancelled';
    await invite.save();

    // Cancel all open assignments associated with this link
    await AssignedExercise.updateMany(
      { link: invite._id, status: { $in: ['assigned', 'in_progress'] } },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully',
      data: invite,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel invitation',
    });
  }
};

/**
 * @desc    Get pending connection requests addressed to logged-in clinician (urgent and non-urgent)
 * @route   GET /api/clinician-links/requests
 * @access  Private (Clinician)
 * SECURITY NOTE: Query strictly filtered by logged-in clinician ID (clinician: req.user._id).
 * Urgent requests first, newest first. Contains NO raw item answers.
 */
const getClinicianRequests = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const requestedStatus = req.query.status || 'pending';

    // Strict filter by logged-in clinician ID
    const requests = await ClinicianLink.find({
      clinician: clinicianId,
      status: requestedStatus,
    })
      .populate('patientUser', 'name')
      .sort({ urgent: -1, createdAt: -1 });

    for (const r of requests) {
      await checkAndComputeExpiration(r);
    }

    // Filter out expired items if checking pending
    const activeRequests = requests.filter((r) => r.status === requestedStatus);

    let activeAlerts = [];
    if (requestedStatus === 'pending') {
      // Find accepted links for this clinician that triggered highest band alert
      const alertedLinks = await ClinicianLink.find({
        clinician: clinicianId,
        status: 'accepted',
        urgent: true,
        lastAlertAt: { $ne: null },
      })
        .populate('patientUser', 'name')
        .sort({ lastAlertAt: -1 });

      activeAlerts = alertedLinks.map((al) => ({
        _id: al._id,
        id: al._id,
        status: al.status,
        urgent: true,
        isHighestBandAlert: true,
        patientName: al.patientUser?.name || 'Linked Patient',
        patientUserId: al.patientUser?._id,
        instrument: al.trigger?.instrument || 'Assessment',
        severity: al.trigger?.severity || 'Severe',
        score: al.trigger?.score,
        itemNineFlag: al.trigger?.itemNineFlag,
        shareScope: al.shareScope,
        alertOnHighestBand: true,
        lastAlertAt: al.lastAlertAt,
        createdAt: al.lastAlertAt || al.updatedAt,
      }));
    }

    const formatted = activeRequests.map((r) => ({
      _id: r._id,
      id: r._id,
      status: r.status,
      urgent: r.urgent,
      isHighestBandAlert: false,
      patientName: r.patientUser?.name || 'Self-User',
      patientUserId: r.patientUser?._id,
      instrument: r.trigger?.instrument || 'Assessment',
      severity: r.trigger?.severity || 'Standard Request',
      score: r.trigger?.score,
      itemNineFlag: r.trigger?.itemNineFlag,
      shareScope: r.shareScope,
      alertOnHighestBand: r.alertOnHighestBand,
      lastAlertAt: r.lastAlertAt,
      createdAt: r.createdAt,
      consentedAt: r.consentedAt,
      clinicianNote: r.clinicianNote,
    }));

    return res.status(200).json({
      success: true,
      data: [...activeAlerts, ...formatted],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician requests',
    });
  }
};

/**
 * @desc    Accept connection request addressed to logged-in clinician
 * @route   PATCH /api/clinician-links/:id/accept
 * @access  Private (Clinician)
 * SECURITY NOTE: Matches existing Patient by email or creates new. Patient.linkedUser = patientUser._id.
 */
const acceptRequest = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { clinicianNote } = req.body;

    if (clinicianNote && clinicianNote.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Clinician note cannot exceed 300 characters',
      });
    }

    // Strict filter: link must be addressed to THIS clinician and currently pending
    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      clinician: clinicianId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or not assigned to you',
      });
    }

    await checkAndComputeExpiration(link);

    if (link.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'This connection request has expired.',
      });
    }

    if (link.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request cannot be accepted because it has status '${link.status}'`,
      });
    }

    link.status = 'accepted';
    link.respondedAt = new Date();
    if (clinicianNote) link.clinicianNote = clinicianNote.trim();
    await link.save();

    // Match to existing Patient record for that clinician by linkedUser, email, or name
    const patientUser = await User.findById(link.patientUser);
    const userEmail = (patientUser?.email || '').trim().toLowerCase();
    const userName = (patientUser?.name || '').trim();

    let patientRecord = await Patient.findOne({
      clinician: clinicianId,
      linkedUser: link.patientUser,
    });

    if (!patientRecord && userEmail) {
      patientRecord = await Patient.findOne({
        clinician: clinicianId,
        email: new RegExp(`^${userEmail}$`, 'i'),
      });
    }

    if (!patientRecord && userName) {
      patientRecord = await Patient.findOne({
        clinician: clinicianId,
        name: new RegExp(`^${userName}$`, 'i'),
      });
    }

    if (patientRecord) {
      patientRecord.linkedUser = link.patientUser;
      if (!patientRecord.name && patientUser?.name) patientRecord.name = patientUser.name;
      if (!patientRecord.email && userEmail) patientRecord.email = userEmail;
      await patientRecord.save();
    } else {
      patientRecord = await Patient.create({
        name: patientUser ? patientUser.name : 'Linked Self-User',
        email: userEmail || undefined,
        phone: patientUser?.phone || undefined,
        clinician: clinicianId,
        linkedUser: link.patientUser,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Request accepted and patient added to roster',
      data: {
        link,
        patient: patientRecord,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to accept request',
    });
  }
};

/**
 * @desc    Decline connection request addressed to logged-in clinician
 * @route   PATCH /api/clinician-links/:id/decline
 * @access  Private (Clinician)
 * SECURITY NOTE: Strict filter by clinician: req.user._id and status: 'pending'.
 */
const declineRequest = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { clinicianNote } = req.body;

    if (clinicianNote && clinicianNote.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Clinician note cannot exceed 300 characters',
      });
    }

    // Strict filter: link must be addressed to THIS clinician and currently pending
    const link = await ClinicianLink.findOne({
      _id: req.params.id,
      clinician: clinicianId,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found or not assigned to you',
      });
    }

    if (link.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request cannot be declined because it has status '${link.status}'`,
      });
    }

    link.status = 'declined';
    link.respondedAt = new Date();
    if (clinicianNote) link.clinicianNote = clinicianNote.trim();
    await link.save();

    return res.status(200).json({
      success: true,
      message: 'Request declined',
      data: link,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to decline request',
    });
  }
};

/**
 * @desc    Get assessment history for a linked self-user respecting shareScope
 * @route   GET /api/clinician-links/patients/:patientUserId/assessments
 * @access  Private (Clinician)
 * SECURITY RULE: Access permitted ONLY IF canClinicianView confirms an active accepted link exists.
 * Returns 403 otherwise.
 * Respects shareScope:
 *   - 'selected': only sharedAssessmentIds are returned
 *   - 'all': all self-user assessments are returned, including those completed after accepting
 */
const getPatientAssessments = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientUserId } = req.params;

    let targetUserId = patientUserId;
    let patientDoc = null;

    // Check if patientUserId is a Patient document in clinician's roster
    if (patientUserId && String(patientUserId).match(/^[0-9a-fA-F]{24}$/)) {
      patientDoc = await Patient.findOne({
        _id: patientUserId,
        clinician: clinicianId,
      });

      if (patientDoc) {
        if (patientDoc.linkedUser) {
          targetUserId = patientDoc.linkedUser;
        } else {
          // Check if an accepted link exists for this clinician and patient's email or name
          let matchedUser = null;
          if (patientDoc.email) {
            matchedUser = await User.findOne({ email: new RegExp(`^${patientDoc.email.trim()}$`, 'i') });
          }
          if (!matchedUser && patientDoc.name) {
            matchedUser = await User.findOne({ name: new RegExp(`^${patientDoc.name.trim()}$`, 'i'), role: 'self_user' });
          }

          if (matchedUser) {
            const accepted = await ClinicianLink.findOne({
              patientUser: matchedUser._id,
              clinician: clinicianId,
              status: 'accepted',
            });
            if (accepted) {
              patientDoc.linkedUser = matchedUser._id;
              await patientDoc.save();
              targetUserId = matchedUser._id;
            }
          }
        }

        // If still no linkedUser, this is a hand-added patient with no CEST link
        if (!patientDoc.linkedUser) {
          return res.status(200).json({
            success: true,
            notLinked: true,
            message:
              'This patient is not linked to a CEST account, so self-assessment results are not available. HAM-D results are shown below.',
            linkInfo: null,
            data: [],
          });
        }
      }
    }

    // Strict access check via helper function
    const { allowed, link: acceptedLink } = await canClinicianView(targetUserId, clinicianId);

    if (!allowed || !acceptedLink) {
      // Check if link was revoked
      const revokedLink = await ClinicianLink.findOne({
        patientUser: targetUserId,
        clinician: clinicianId,
        status: 'revoked',
      });

      if (revokedLink) {
        return res.status(403).json({
          success: false,
          sharingRevoked: true,
          message: 'Sharing stopped by patient: Assessment sharing has been revoked for this link.',
        });
      }

      return res.status(403).json({
        success: false,
        message: 'Forbidden: No active accepted link exists between you and this patient account',
      });
    }

    // Log access for patient transparency (de-duplicated to one entry per 10 mins)
    await logPatientAccess(clinicianId, targetUserId, 'profile_view');

    const shareScope = acceptedLink.shareScope || 'selected';
    let assessments = [];

    // Date range filter support
    const { startDate, endDate, range } = req.query;
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        dateFilter.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = e;
      }
    } else if (range && range !== 'all') {
      const parsedDays = parseInt(range, 10);
      if (!isNaN(parsedDays)) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - parsedDays);
        sinceDate.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        dateFilter.createdAt = { $gte: sinceDate, $lte: endOfToday };
      }
    }

    if (shareScope === 'all') {
      // Return all assessments for this targetUserId within date filter (if any)
      assessments = await Assessment.find({
        user: targetUserId,
        ...dateFilter,
      }).sort({ createdAt: -1 });
    } else {
      // Selected scope: return strictly assessments in sharedAssessmentIds within date filter (if any)
      const sharedIds = acceptedLink.sharedAssessmentIds || [];
      assessments = await Assessment.find({
        user: targetUserId,
        _id: { $in: sharedIds },
        ...dateFilter,
      }).sort({ createdAt: -1 });
    }

    const formatted = assessments.map((a) => ({
      _id: a._id,
      id: a._id,
      assessmentType: a.assessmentType,
      disorderSlug: a.disorderSlug,
      totalScore: a.totalScore,
      severity: a.severity,
      diagnosticConsideration: a.diagnosticConsideration,
      functionalResponse: a.functionalResponse,
      createdAt: a.createdAt,
      answers: a.answers,
      isSharedWithClinician: true,
    }));

    return res.status(200).json({
      success: true,
      linkInfo: {
        acceptedAt: acceptedLink.respondedAt || acceptedLink.updatedAt,
        urgent: acceptedLink.urgent,
        shareScope: acceptedLink.shareScope,
        alertOnHighestBand: acceptedLink.alertOnHighestBand,
        lastAlertAt: acceptedLink.lastAlertAt,
        trigger: acceptedLink.trigger,
      },
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient assessment history',
    });
  }
};

/**
 * @desc    Get notification badge counts
 * @route   GET /api/clinician-links/counts
 * @access  Private (Self User or Clinician)
 * Returns:
 *   patient -> { openInvites: count }
 *   clinician -> { pendingRequests: count, urgentRequests: count }
 */
const getCounts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (userRole === 'self_user') {
      // Strict filter: patientUser === userId
      const openInvites = await ClinicianLink.countDocuments({
        patientUser: userId,
        status: 'invited',
        expiresAt: { $gt: new Date() },
      });

      return res.status(200).json({
        success: true,
        data: {
          openInvites,
        },
      });
    }

    if (userRole === 'clinician') {
      // Strict filter: clinician === userId
      const pendingRequests = await ClinicianLink.countDocuments({
        clinician: userId,
        status: 'pending',
        expiresAt: { $gt: new Date() },
      });

      // Count urgent pending requests plus any accepted links with active highest-band alerts
      const urgentPending = await ClinicianLink.countDocuments({
        clinician: userId,
        status: 'pending',
        urgent: true,
        expiresAt: { $gt: new Date() },
      });

      const urgentAlerts = await ClinicianLink.countDocuments({
        clinician: userId,
        status: 'accepted',
        urgent: true,
        lastAlertAt: { $ne: null },
      });

      return res.status(200).json({
        success: true,
        data: {
          pendingRequests,
          urgentRequests: urgentPending + urgentAlerts,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notification counts',
    });
  }
};

/**
 * @desc    Get transparency access logs for self-user (last 10 entries)
 * @route   GET /api/clinician-links/access-logs
 * @access  Private (Self User)
 * SECURITY NOTE: Strictly filtered by patientUser === req.user._id. No clinical or health data stored or returned.
 */
const getAccessLogs = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;

    const logs = await AccessLog.find({ patientUser: patientUserId })
      .sort({ at: -1 })
      .limit(10)
      .populate('clinician', 'name title specialization institution');

    const formatted = logs.map((log) => ({
      _id: log._id,
      clinicianName: log.clinician
        ? `${log.clinician.title || 'Dr.'} ${log.clinician.name}`
        : 'Assigned Clinician',
      clinicianSpecialization: log.clinician?.specialization || '',
      type: log.type,
      label:
        log.type === 'profile_view'
          ? 'Viewed patient assessment profile'
          : 'Generated clinical summary report',
      at: log.at,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch access logs',
    });
  }
};

module.exports = {
  getClinicians,
  createLink,
  getMyLinks,
  acceptInvite,
  declineInvite,
  updateSharing,
  cancelLink,
  revokeLink,
  invitePatient,
  getClinicianInvites,
  cancelClinicianInvite,
  getClinicianRequests,
  acceptRequest,
  declineRequest,
  getPatientAssessments,
  getCounts,
  getAccessLogs,
};
