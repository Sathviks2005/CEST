const Assessment = require('../models/Assessment');
const { scoreYBOCS } = require('../utils/ybocsScoring');
const { getCooldownDetails, inMemoryAssessments } = require('./assessmentController');

const YBOCS_ASSESSMENT_TYPE = 'Y-BOCS Yale-Brown Obsessive Compulsive Scale';
const YBOCS_DISORDER_SLUG = 'ocd';

// @desc    Submit Y-BOCS OCD assessment
// @route   POST /api/ocd/submit
// @access  Private (Self User)
const submitOCD = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const scoring = scoreYBOCS(answers);
    if (scoring.error) {
      return res.status(400).json({ success: false, message: scoring.error });
    }

    const {
      obsessionSubtotal,
      compulsionSubtotal,
      insightAnswer,
      totalScore,
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
    const cooldownStatus = await getCooldownDetails(userId, YBOCS_DISORDER_SLUG);
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
      assessmentType: YBOCS_ASSESSMENT_TYPE,
      disorderSlug: YBOCS_DISORDER_SLUG,
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
          obsessionSubtotal,
          compulsionSubtotal,
          insightAnswer,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: YBOCS_ASSESSMENT_TYPE,
          disorderSlug: YBOCS_DISORDER_SLUG,
          answers: answersArray,
          createdAt: assessment.createdAt,
        },
      });
    } catch (dbErr) {
      const mockId = 'ocd_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...assessmentPayload,
        obsessionSubtotal,
        compulsionSubtotal,
        insightAnswer,
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
          obsessionSubtotal,
          compulsionSubtotal,
          insightAnswer,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: YBOCS_ASSESSMENT_TYPE,
          disorderSlug: YBOCS_DISORDER_SLUG,
          answers: answersArray,
          createdAt: mockAssessment.createdAt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { submitOCD };
