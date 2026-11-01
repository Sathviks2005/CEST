const Assessment = require('../models/Assessment');
const { scoreASRS } = require('../utils/adhdScoring');
const { getCooldownDetails, inMemoryAssessments } = require('./assessmentController');

const ASRS_ASSESSMENT_TYPE = 'ASRS-v1.1 Adult ADHD Self-Report Scale';
const ASRS_DISORDER_SLUG = 'adhd';

// @desc    Submit ASRS-v1.1 ADHD assessment
// @route   POST /api/adhd/submit
// @access  Private (Self User)
const submitADHD = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const scoring = scoreASRS(answers);
    if (scoring.error) {
      return res.status(400).json({ success: false, message: scoring.error });
    }

    const {
      partAScore,
      partBScore,
      totalScore,
      shadedHitCount,
      screenResult,
      severity,
      recommendationTag,
      explanation,
      diagnosticConsideration,
      disclaimer,
      answersArray,
    } = scoring;
    const userId = req.user.id || req.user._id;
    const userName = req.user.name || 'Self User';

    // 7-day cooldown enforcement
    const cooldownStatus = await getCooldownDetails(userId, ASRS_DISORDER_SLUG);
    if (cooldownStatus.isLocked) {
      return res.status(403).json({
        success: false,
        message: `This assessment can only be completed once every 7 days. Available again on ${new Date(cooldownStatus.nextAvailableAt).toLocaleString()}`,
        isLocked: true,
        nextAvailableAt: cooldownStatus.nextAvailableAt,
        daysRemaining: cooldownStatus.daysRemaining,
      });
    }

    const assessmentPayload = {
      user: userId,
      userName,
      assessmentType: ASRS_ASSESSMENT_TYPE,
      disorderSlug: ASRS_DISORDER_SLUG,
      answers: answersArray,
      functionalResponse: '',
      totalScore,
      severity,
      diagnosticConsideration,
      recommendationTag,
    };

    try {
      const assessment = await Assessment.create(assessmentPayload);

      return res.status(201).json({
        success: true,
        data: {
          _id: assessment._id,
          score: totalScore,
          totalScore,
          partAScore,
          partBScore,
          shadedHitCount,
          screenResult,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: ASRS_ASSESSMENT_TYPE,
          disorderSlug: ASRS_DISORDER_SLUG,
          answers: answersArray,
          createdAt: assessment.createdAt,
        },
      });
    } catch (dbErr) {
      const mockId = 'adhd_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...assessmentPayload,
        partAScore,
        partBScore,
        shadedHitCount,
        screenResult,
        explanation,
        disclaimer,
        createdAt: new Date().toISOString(),
      };
      inMemoryAssessments.push(mockAssessment);

      return res.status(201).json({
        success: true,
        data: {
          _id: mockId,
          score: totalScore,
          totalScore,
          partAScore,
          partBScore,
          shadedHitCount,
          screenResult,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: ASRS_ASSESSMENT_TYPE,
          disorderSlug: ASRS_DISORDER_SLUG,
          answers: answersArray,
          createdAt: mockAssessment.createdAt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { submitADHD };
