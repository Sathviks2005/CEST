const AssignedExercise = require('../models/AssignedExercise');
const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { canClinicianView, validateQualifyingSeverity } = require('../utils/clinicianLinkHelpers');
const {
  CBT_EXERCISES,
  CET_EXERCISES,
  EXERCISE_CATALOG,
  CET_DISCLAIMER,
  isValidExerciseId,
  getExerciseById,
  getCbtBandSuggestions,
  getCetRecommendationForPhq9,
} = require('../config/exerciseCatalog');

// In-memory rate limiter for assignment creation: max 30 assignments per hour per clinician
const clinicianRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ASSIGNMENTS_PER_WINDOW = 30;

const checkClinicianRateLimit = (clinicianId) => {
  const now = Date.now();
  const key = String(clinicianId);
  const record = clinicianRateLimitMap.get(key);

  if (!record || now - record.firstTime > RATE_LIMIT_WINDOW_MS) {
    clinicianRateLimitMap.set(key, { count: 1, firstTime: now });
    return { allowed: true };
  }

  if (record.count >= MAX_ASSIGNMENTS_PER_WINDOW) {
    return { allowed: false };
  }

  record.count += 1;
  return { allowed: true };
};

/**
 * @desc    Get catalog of assignable exercises, plus tailored suggestions if patientUserId query is provided
 * @route   GET /api/assigned-exercises/catalog
 * @access  Private (Clinician)
 * SECURITY NOTE: Clinician role required. If patientUserId is provided, access is verified via canClinicianView.
 */
const getCatalog = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientUserId } = req.query;

    const responseData = {
      catalog: EXERCISE_CATALOG,
      groups: {
        cbt: CBT_EXERCISES,
        cet: CET_EXERCISES,
      },
      cetDisclaimer: CET_DISCLAIMER,
      suggestions: [],
      hasHighestBandCaution: false,
      cautionMessage: null,
    };

    if (patientUserId) {
      // Access check: only allow if accepted link exists
      const { allowed, link } = await canClinicianView(patientUserId, clinicianId);
      if (!allowed || !link) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: No active accepted link exists between you and this patient',
        });
      }

      // Fetch shared assessments according to shareScope
      const query = { user: patientUserId };
      if (link.shareScope === 'selected') {
        const allowedIds = Array.isArray(link.sharedAssessmentIds) ? link.sharedAssessmentIds : [];
        query._id = { $in: allowedIds };
      }

      // Filter: user === patientUserId (scoped to patient)
      const assessments = await Assessment.find(query).sort({ completedAt: -1, createdAt: -1 });

      // Group by instrument/scale to find latest shared assessment for each
      const latestByScale = {};
      for (const a of assessments) {
        const type = (a.assessmentType || a.disorderSlug || '').toLowerCase();
        let scaleKey = null;
        if (type.includes('gad') || type.includes('anxiety')) scaleKey = 'gad7';
        else if (type.includes('phq') || type.includes('depression')) scaleKey = 'phq9';
        else if (type.includes('isi') || type.includes('insomnia')) scaleKey = 'insomnia';
        else if (type.includes('pcl') || type.includes('ptsd')) scaleKey = 'ptsd';
        else if (type.includes('ybocs') || type.includes('ocd')) scaleKey = 'ocd';

        if (scaleKey && !latestByScale[scaleKey]) {
          latestByScale[scaleKey] = a;
        }
      }

      const suggestions = [];
      let anyHighestBand = false;

      for (const [scaleKey, a] of Object.entries(latestByScale)) {
        const score = a.totalScore ?? a.score ?? 0;
        const severity = a.severity || '';

        // Check if highest band
        const qual = validateQualifyingSeverity(a);
        if (qual.isLastBand) {
          anyHighestBand = true;
        }

        // 1. CBT suggestions
        const cbtResult = getCbtBandSuggestions(scaleKey, score, severity);
        if (cbtResult.isLastBand) {
          anyHighestBand = true;
        } else if (cbtResult.exerciseIds && cbtResult.exerciseIds.length > 0) {
          for (const exId of cbtResult.exerciseIds) {
            const exerciseDef = getExerciseById(exId);
            if (exerciseDef && !suggestions.some((s) => s.id === exId)) {
              suggestions.push({
                ...exerciseDef,
                scaleKey,
                reason: `Recommended for ${scaleKey.toUpperCase()} (${cbtResult.bandName || severity || 'Score ' + score})`,
              });
            }
          }
        }

        // 2. CET suggestions (for PHQ-9 only per specification)
        if (scaleKey === 'phq9') {
          const cetRec = getCetRecommendationForPhq9(score);
          if (cetRec) {
            const exerciseDef = getExerciseById(cetRec.exerciseId);
            if (exerciseDef && !suggestions.some((s) => s.id === exerciseDef.id)) {
              suggestions.push({
                ...exerciseDef,
                scaleKey: 'phq9',
                reason: `Recommended for PHQ-9: ${severity || 'score range ' + cetRec.scoreRange} (Cognitive Enhancement)`,
              });
            }
          }
        }
      }

      responseData.suggestions = suggestions;
      responseData.hasHighestBandCaution = anyHighestBand;
      if (anyHighestBand) {
        responseData.cautionMessage =
          'This patient\'s latest result is in the highest band. Consider whether self-guided exercises are appropriate right now.';
      }
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise catalog',
    });
  }
};

/**
 * @desc    Assign exercises to a linked patient
 * @route   POST /api/assigned-exercises
 * @access  Private (Clinician)
 * SECURITY NOTE: Protected by req.user._id as clinician. Verifies accepted link before creation.
 */
const createAssignments = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientUserId, exerciseIds, note = '', dueDate } = req.body;

    if (!patientUserId) {
      return res.status(400).json({
        success: false,
        message: 'Patient user ID is required',
      });
    }

    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one exercise ID must be selected',
      });
    }

    if (exerciseIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'A maximum of 5 exercises can be assigned at one time',
      });
    }

    // Rate limiting check
    const rateCheck = checkClinicianRateLimit(clinicianId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: You may assign up to 30 exercises per hour.',
      });
    }

    // Verify accepted link
    const { allowed, link } = await canClinicianView(patientUserId, clinicianId);
    if (!allowed || !link) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No active accepted link exists with this patient account',
      });
    }

    // Validate dueDate if provided: must not be in past
    let parsedDueDate = null;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format',
        });
      }
      // Compare to start of today (local time midnight tolerance)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (parsedDueDate < startOfToday) {
        return res.status(400).json({
          success: false,
          message: 'Due date cannot be in the past',
        });
      }
    }

    // Validate note length
    if (note && note.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Assignment note cannot exceed 300 characters',
      });
    }

    // Validate all exercise IDs against catalog
    for (const exId of exerciseIds) {
      if (!isValidExerciseId(exId)) {
        return res.status(400).json({
          success: false,
          message: `Exercise ID '${exId}' is not valid in the catalog`,
        });
      }
    }

    // Check for open duplicates: reject if same exercise is already 'assigned' or 'in_progress' for this patient
    // Filter: patientUser === patientUserId && status in ['assigned', 'in_progress']
    const existingOpenAssignments = await AssignedExercise.find({
      patientUser: patientUserId,
      exerciseId: { $in: exerciseIds },
      status: { $in: ['assigned', 'in_progress'] },
    });

    if (existingOpenAssignments.length > 0) {
      const duplicateIds = existingOpenAssignments.map((a) => a.exerciseId);
      return res.status(400).json({
        success: false,
        message: `The exercise (${duplicateIds.join(', ')}) is already currently assigned or in progress for this patient.`,
      });
    }

    // Create assignments
    const createdRecords = [];
    for (const exId of exerciseIds) {
      const record = await AssignedExercise.create({
        patientUser: patientUserId,
        clinician: clinicianId,
        link: link._id,
        exerciseId: exId,
        note: (note || '').trim(),
        dueDate: parsedDueDate,
        status: 'assigned',
      });
      createdRecords.push(record);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully assigned ${createdRecords.length} exercise(s)`,
      data: createdRecords,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to assign exercises',
    });
  }
};

/**
 * @desc    Get assignments for a specific patient by the logged-in clinician
 * @route   GET /api/assigned-exercises/patient/:patientUserId
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: clinician === req.user._id && patientUser === patientUserId. Access checked via canClinicianView.
 */
const getPatientAssignments = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientUserId } = req.params;

    // Strict access check
    const { allowed } = await canClinicianView(patientUserId, clinicianId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No active accepted link exists with this patient account',
      });
    }

    // Filter: clinician === clinicianId && patientUser === patientUserId
    const assignments = await AssignedExercise.find({
      clinician: clinicianId,
      patientUser: patientUserId,
    })
      .sort({ createdAt: -1 });

    const formatted = assignments.map((a) => {
      const def = getExerciseById(a.exerciseId);
      return {
        _id: a._id,
        id: a._id,
        exerciseId: a.exerciseId,
        title: def?.title || a.exerciseId,
        group: def?.group || 'cbt',
        groupLabel: def?.group === 'cet' ? 'Cognitive Enhancement exercises' : 'CBT exercises',
        technique: def?.technique || '',
        note: a.note,
        dueDate: a.dueDate,
        status: a.status,
        skipReason: a.skipReason,
        moodBefore: a.moodBefore,
        moodAfter: a.moodAfter,
        sharedResult: a.sharedResult,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient assignments',
    });
  }
};

/**
 * @desc    Get all assignments across all patients by the logged-in clinician
 * @route   GET /api/assigned-exercises/clinician/all
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: clinician === req.user._id. Returns only assignments initiated by this clinician.
 */
const getAllClinicianAssignments = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    // Filter: clinician === clinicianId
    const assignments = await AssignedExercise.find({
      clinician: clinicianId,
    })
      .populate('patientUser', 'name email')
      .sort({ createdAt: -1 });

    const formatted = assignments.map((a) => {
      const def = getExerciseById(a.exerciseId);
      const isOverdue =
        a.dueDate &&
        new Date(a.dueDate) < new Date() &&
        (a.status === 'assigned' || a.status === 'in_progress');

      return {
        _id: a._id,
        id: a._id,
        patientUser: a.patientUser,
        patientName: a.patientUser?.name || 'Linked Patient',
        patientEmail: a.patientUser?.email || '',
        exerciseId: a.exerciseId,
        title: def?.title || a.exerciseId,
        group: def?.group || 'cbt',
        groupLabel: def?.group === 'cet' ? 'Cognitive Enhancement exercises' : 'CBT exercises',
        technique: def?.technique || '',
        note: a.note,
        dueDate: a.dueDate,
        isOverdue,
        status: a.status,
        skipReason: a.skipReason,
        moodBefore: a.moodBefore,
        moodAfter: a.moodAfter,
        sharedResult: a.sharedResult,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician assignments list',
    });
  }
};

/**
 * @desc    Get overdue assignments count for logged-in clinician
 * @route   GET /api/assigned-exercises/clinician/counts
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: clinician === req.user._id
 */
const getClinicianAssignmentCounts = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    const overdueCount = await AssignedExercise.countDocuments({
      clinician: clinicianId,
      status: { $in: ['assigned', 'in_progress'] },
      dueDate: { $ne: null, $lt: new Date() },
    });

    return res.status(200).json({
      success: true,
      data: {
        overdueCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician assignment counts',
    });
  }
};

/**
 * @desc    Cancel an open assignment (clinician only)
 * @route   PATCH /api/assigned-exercises/:id/cancel
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: _id === req.params.id && clinician === req.user._id. Only non-completed assignments can be cancelled.
 */
const cancelAssignment = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    // Filter: _id === req.params.id && clinician === clinicianId
    const assignment = await AssignedExercise.findOne({
      _id: req.params.id,
      clinician: clinicianId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not assigned by you',
      });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an assignment that is already completed',
      });
    }

    assignment.status = 'cancelled';
    assignment.cancelledAt = new Date();
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Assignment cancelled successfully',
      data: assignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel assignment',
    });
  }
};

/**
 * @desc    Get patient's own assignments (due soonest first)
 * @route   GET /api/assigned-exercises/mine
 * @access  Private (Self User)
 * SECURITY NOTE: Filter: patientUser === req.user._id. Strictly isolates patient's own assignments.
 */
const getMyAssignments = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;
    const { status } = req.query;

    const query = { patientUser: patientUserId };
    if (status) {
      query.status = status;
    }

    // Filter: patientUser === patientUserId
    const assignments = await AssignedExercise.find(query)
      .populate('clinician', 'name title specialization institution')
      .sort({ dueDate: 1, createdAt: -1 });

    const formatted = assignments.map((a) => {
      const def = getExerciseById(a.exerciseId);
      const isOverdue =
        a.dueDate &&
        new Date(a.dueDate) < new Date() &&
        (a.status === 'assigned' || a.status === 'in_progress');

      return {
        _id: a._id,
        id: a._id,
        exerciseId: a.exerciseId,
        title: def?.title || a.exerciseId,
        group: def?.group || 'cbt',
        groupLabel: def?.group === 'cet' ? 'Cognitive Enhancement exercises' : 'CBT exercises',
        technique: def?.technique || '',
        category: def?.category || '',
        description: def?.description || '',
        clinicianName: a.clinician
          ? `${a.clinician.title || 'Dr.'} ${a.clinician.name}`
          : 'Your Clinician',
        clinicianSpecialization: a.clinician?.specialization || '',
        note: a.note,
        dueDate: a.dueDate,
        isOverdue,
        status: a.status,
        skipReason: a.skipReason,
        moodBefore: a.moodBefore,
        moodAfter: a.moodAfter,
        sharedResult: a.sharedResult,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
    });
  }
};

/**
 * @desc    Start an assignment (sets in_progress, accepts moodBefore)
 * @route   PATCH /api/assigned-exercises/:id/start
 * @access  Private (Self User)
 * SECURITY NOTE: Filter: _id === req.params.id && patientUser === req.user._id
 */
const startAssignment = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;
    const { moodBefore } = req.body;

    // Filter: _id === req.params.id && patientUser === patientUserId
    const assignment = await AssignedExercise.findOne({
      _id: req.params.id,
      patientUser: patientUserId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.status === 'completed' || assignment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot start an assignment with status '${assignment.status}'`,
      });
    }

    assignment.status = 'in_progress';
    if (!assignment.startedAt) {
      assignment.startedAt = new Date();
    }

    if (moodBefore !== undefined && moodBefore !== null) {
      const numMood = Number(moodBefore);
      if (isNaN(numMood) || numMood < 0 || numMood > 10) {
        return res.status(400).json({
          success: false,
          message: 'Mood rating must be a number between 0 and 10',
        });
      }
      assignment.moodBefore = numMood;
    }

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Assignment started',
      data: assignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to start assignment',
    });
  }
};

/**
 * @desc    Mark an assignment as completed
 * @route   POST /api/assigned-exercises/:id/complete
 * @access  Private (Self User)
 * SECURITY NOTE: Filter: _id === req.params.id && patientUser === req.user._id. Idempotent against double-click.
 * Privacy Rule: stores ONLY completion status, moodBefore, moodAfter, and optional patient-consented sharedResult for CET games.
 */
const completeAssignment = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;
    const { moodBefore, moodAfter, sharedResult } = req.body;

    // Filter: _id === req.params.id && patientUser === patientUserId
    const assignment = await AssignedExercise.findOne({
      _id: req.params.id,
      patientUser: patientUserId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Idempotency: if already completed, do not alter or duplicate data
    if (assignment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Assignment is already marked as completed',
        data: assignment,
      });
    }

    // Validate mood numbers (0-10)
    if (moodAfter === undefined || moodAfter === null) {
      return res.status(400).json({
        success: false,
        message: 'Mood rating after exercise is required (0–10)',
      });
    }

    const numAfter = Number(moodAfter);
    if (isNaN(numAfter) || numAfter < 0 || numAfter > 10) {
      return res.status(400).json({
        success: false,
        message: 'Mood rating must be a number between 0 and 10',
      });
    }
    assignment.moodAfter = numAfter;

    if (moodBefore !== undefined && moodBefore !== null) {
      const numBefore = Number(moodBefore);
      if (!isNaN(numBefore) && numBefore >= 0 && numBefore <= 10) {
        assignment.moodBefore = numBefore;
      }
    }

    // CET game result sharing: accept ONLY if exercise is CET group and patient explicitly shared
    const exerciseDef = getExerciseById(assignment.exerciseId);
    if (exerciseDef?.group === 'cet' && sharedResult && typeof sharedResult === 'object') {
      assignment.sharedResult = {
        score: typeof sharedResult.score === 'number' ? sharedResult.score : null,
        level: sharedResult.level || null,
      };
    } else {
      assignment.sharedResult = null;
    }

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Exercise completed successfully',
      data: assignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete assignment',
    });
  }
};

/**
 * @desc    Skip an assignment with a reason
 * @route   PATCH /api/assigned-exercises/:id/skip
 * @access  Private (Self User)
 * SECURITY NOTE: Filter: _id === req.params.id && patientUser === req.user._id
 */
const skipAssignment = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;
    const { reason } = req.body;

    const validReasons = ['too_hard', 'not_helpful', 'feeling_unwell', 'no_time', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid skip reason. Must be one of: ${validReasons.join(', ')}`,
      });
    }

    // Filter: _id === req.params.id && patientUser === patientUserId
    const assignment = await AssignedExercise.findOne({
      _id: req.params.id,
      patientUser: patientUserId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot skip an assignment that is already completed',
      });
    }

    assignment.status = 'skipped';
    assignment.skipReason = reason;
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: 'Assignment skipped',
      data: assignment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to skip assignment',
    });
  }
};

/**
 * @desc    Get count of open assignments for patient badge
 * @route   GET /api/assigned-exercises/counts
 * @access  Private (Self User)
 * SECURITY NOTE: Filter: patientUser === req.user._id && status in ['assigned', 'in_progress']
 */
const getPatientAssignmentCounts = async (req, res) => {
  try {
    const patientUserId = req.user._id || req.user.id;

    // Filter: patientUser === patientUserId && status in ['assigned', 'in_progress']
    const openCount = await AssignedExercise.countDocuments({
      patientUser: patientUserId,
      status: { $in: ['assigned', 'in_progress'] },
    });

    return res.status(200).json({
      success: true,
      data: {
        openAssignments: openCount,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch open assignments count',
    });
  }
};

module.exports = {
  getCatalog,
  createAssignments,
  getPatientAssignments,
  getAllClinicianAssignments,
  getClinicianAssignmentCounts,
  cancelAssignment,
  getMyAssignments,
  startAssignment,
  completeAssignment,
  skipAssignment,
  getPatientAssignmentCounts,
};
