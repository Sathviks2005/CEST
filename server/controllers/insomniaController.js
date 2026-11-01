const Assessment = require('../models/Assessment');
const { scoreISI } = require('../utils/isiScoring');
const { getCooldownDetails, inMemoryAssessments } = require('./assessmentController');

const ISI_ASSESSMENT_TYPE = 'ISI Insomnia Severity Index';
const ISI_DISORDER_SLUG = 'insomnia';

// @desc    Submit ISI Insomnia assessment
// @route   POST /api/insomnia/submit
// @access  Private (Self User)
const submitInsomnia = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const scoring = scoreISI(answers);
    if (scoring.error) {
      return res.status(400).json({ success: false, message: scoring.error });
    }

    const {
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
    const cooldownStatus = await getCooldownDetails(userId, ISI_DISORDER_SLUG);
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
      assessmentType: ISI_ASSESSMENT_TYPE,
      disorderSlug: ISI_DISORDER_SLUG,
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
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: ISI_ASSESSMENT_TYPE,
          disorderSlug: ISI_DISORDER_SLUG,
          answers: answersArray,
          createdAt: assessment.createdAt,
        },
      });
    } catch (dbErr) {
      const mockId = 'insomnia_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...assessmentPayload,
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
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: ISI_ASSESSMENT_TYPE,
          disorderSlug: ISI_DISORDER_SLUG,
          answers: answersArray,
          createdAt: mockAssessment.createdAt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { submitInsomnia };
