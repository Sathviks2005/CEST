const Assessment = require('../models/Assessment');

// In-memory fallback for local testing without DB
const inMemoryAssessments = [];

const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

// Helper to determine 7-day cooldown status for authenticated user + assessment type
const getCooldownDetails = async (userId, disorderSlug = 'depression') => {
  let latestAssessment = null;

  try {
    latestAssessment = await Assessment.findOne({
      user: userId,
      $or: [
        { disorderSlug },
        { assessmentType: { $regex: new RegExp(disorderSlug, 'i') } },
      ],
    }).sort({ createdAt: -1 });
  } catch (dbErr) {
    // Database offline fallback
  }

  if (!latestAssessment) {
    const memoryMatches = inMemoryAssessments.filter(
      (a) =>
        String(a.user) === String(userId) &&
        ((a.disorderSlug && a.disorderSlug.toLowerCase() === disorderSlug.toLowerCase()) ||
          (a.assessmentType && a.assessmentType.toLowerCase().includes(disorderSlug.toLowerCase())))
    );
    if (memoryMatches.length > 0) {
      memoryMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      latestAssessment = memoryMatches[0];
    }
  }

  if (!latestAssessment) {
    return {
      canTakeAssessment: true,
      isLocked: false,
      lastCompletedAt: null,
      nextAvailableAt: null,
      daysRemaining: 0,
      latestAssessment: null,
    };
  }

  const completedAt = new Date(latestAssessment.createdAt || latestAssessment.completedAt || Date.now());
  const nextAvailableAt = new Date(completedAt.getTime() + COOLDOWN_MS);
  const now = new Date();

  if (now.getTime() < nextAvailableAt.getTime()) {
    const diffMs = nextAvailableAt.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      canTakeAssessment: false,
      isLocked: true,
      lastCompletedAt: completedAt.toISOString(),
      nextAvailableAt: nextAvailableAt.toISOString(),
      daysRemaining,
      latestAssessment,
    };
  }

  return {
    canTakeAssessment: true,
    isLocked: false,
    lastCompletedAt: completedAt.toISOString(),
    nextAvailableAt: nextAvailableAt.toISOString(),
    daysRemaining: 0,
    latestAssessment,
  };
};

// Helper to determine severity based on official PHQ-9 ranges
const getSeverity = (score) => {
  if (score === 0) return 'None';
  if (score >= 1 && score <= 4) return 'Minimal depression';
  if (score >= 5 && score <= 9) return 'Mild depression';
  if (score >= 10 && score <= 14) return 'Moderate depression';
  if (score >= 15 && score <= 19) return 'Moderately severe depression';
  if (score >= 20 && score <= 27) return 'Severe depression';
  return 'Minimal depression';
};

// Helper for official diagnostic consideration guidance (PHQ-9 shaded section)
// Q1–Q8: shaded if score ≥ 2; Q9: shaded if score ≥ 1
const getDiagnosticConsideration = (answers) => {
  const isShaded = (score, index) => (index === 8 ? score >= 1 : score >= 2);
  const shadedCount = answers.filter((score, index) => isShaded(Number(score), index)).length;
  const hasCoreSymptom = isShaded(Number(answers[0]), 0) || isShaded(Number(answers[1]), 1);

  if (shadedCount >= 5 && hasCoreSymptom) {
    return 'Criteria met: Consider Major Depressive Disorder evaluation.';
  }
  if (shadedCount >= 2 && shadedCount <= 4 && hasCoreSymptom) {
    return 'Criteria met: Consider Other Depressive Disorder evaluation.';
  }
  return 'Symptoms below major diagnostic threshold.';
};

// @desc    Submit PHQ-9 assessment
// @route   POST /api/assessments
// @access  Private (Self User)
const createAssessment = async (req, res, next) => {
  try {
    const { answers, functionalResponse } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length !== 9) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid responses for all 9 PHQ-9 questions',
      });
    }

    const normalizedAnswers = answers.map((a) => Number(a));
    if (normalizedAnswers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)) {
      return res.status(400).json({
        success: false,
        message: 'Each PHQ-9 answer must be an integer between 0 and 3',
      });
    }

    if (!functionalResponse) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response for the Functional Health Assessment question',
      });
    }

    const userId = req.user.id || req.user._id;
    const userName = req.user.name || 'Self User';
    const disorderSlug = req.body.disorderSlug || 'depression';

    // SERVER-SIDE 7-DAY COOLDOWN ENFORCEMENT
    const cooldownStatus = await getCooldownDetails(userId, disorderSlug);
    if (cooldownStatus.isLocked) {
      return res.status(403).json({
        success: false,
        message: `This assessment can only be completed once every 7 days. Available again on ${new Date(cooldownStatus.nextAvailableAt).toLocaleString()}`,
        isLocked: true,
        nextAvailableAt: cooldownStatus.nextAvailableAt,
        daysRemaining: cooldownStatus.daysRemaining,
      });
    }

    // Sum strictly Q1 to Q9 (functionalResponse is NOT included in total score)
    const totalScore = normalizedAnswers.reduce((acc, curr) => acc + curr, 0);
    const severity = getSeverity(totalScore);
    const diagnosticConsideration = getDiagnosticConsideration(normalizedAnswers);

    try {
      const assessment = await Assessment.create({
        user: userId,
        userName,
        assessmentType: 'PHQ-9 Patient Depression Questionnaire',
        disorderSlug,
        answers: normalizedAnswers,
        functionalResponse,
        totalScore,
        severity,
        diagnosticConsideration,
      });

      return res.status(201).json({
        success: true,
        data: assessment,
      });
    } catch (dbErr) {
      // Memory fallback for offline testing
      const mockId = 'asm_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        user: userId,
        userName,
        assessmentType: 'PHQ-9 Patient Depression Questionnaire',
        disorderSlug,
        answers: normalizedAnswers,
        functionalResponse,
        totalScore,
        severity,
        diagnosticConsideration,
        createdAt: new Date().toISOString(),
      };
      inMemoryAssessments.push(mockAssessment);

      return res.status(201).json({
        success: true,
        data: mockAssessment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get 7-day cooldown availability status for an assessment
// @route   GET /api/assessments/cooldown-status/:disorderSlug?
// @access  Private (Self User)
const getAssessmentCooldownStatus = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const disorderSlug = req.params.disorderSlug || req.query.disorderSlug || 'depression';

    const status = await getCooldownDetails(userId, disorderSlug);
    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's assessments
// @route   GET /api/assessments/my
// @access  Private (Self User)
const getMyAssessments = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    try {
      const assessments = await Assessment.find({ user: userId }).sort({ createdAt: -1 });
      if (assessments && assessments.length > 0) {
        return res.json({ success: true, count: assessments.length, data: assessments });
      }
    } catch (dbErr) {
      // DB offline
    }

    const userMems = inMemoryAssessments.filter((a) => String(a.user) === String(userId));
    userMems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, count: userMems.length, data: userMems });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const assessment = await Assessment.findById(id);
      if (assessment) {
        return res.json({ success: true, data: assessment });
      }
    } catch (dbErr) {
      // DB offline
    }

    const found = inMemoryAssessments.find((a) => a._id === id || a.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Assessment record not found' });
    }

    return res.json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssessment,
  getAssessmentCooldownStatus,
  getMyAssessments,
  getAssessmentById,
  getCooldownDetails,
  inMemoryAssessments,
};
