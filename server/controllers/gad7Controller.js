const Assessment = require('../models/Assessment');
const { scoreGAD7 } = require('../utils/gad7Scoring');
const { getCooldownDetails, inMemoryAssessments } = require('./assessmentController');

const GAD7_ASSESSMENT_TYPE = 'GAD-7 Generalized Anxiety Disorder Scale';
const GAD7_DISORDER_SLUG = 'generalized-anxiety-disorder';

// @desc    Submit GAD-7 assessment
// @route   POST /api/gad7/submit
// @access  Private (Self User)
const submitGAD7 = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const scoring = scoreGAD7(answers);
    if (scoring.error) {
      return res.status(400).json({ success: false, message: scoring.error });
    }

    const { score, severity, recommendationTag, explanation, answersArray } = scoring;
    const userId = req.user.id || req.user._id;
    const userName = req.user.name || 'Self User';

    // 7-day cooldown enforcement (reuse existing helper)
    const cooldownStatus = await getCooldownDetails(userId, GAD7_DISORDER_SLUG);
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
      assessmentType: GAD7_ASSESSMENT_TYPE,
      disorderSlug: GAD7_DISORDER_SLUG,
      answers: answersArray,
      functionalResponse: '',
      totalScore: score,
      severity,
      diagnosticConsideration: explanation,
      recommendationTag,
    };

    try {
      const assessment = await Assessment.create(assessmentPayload);

      return res.status(201).json({
        success: true,
        data: {
          _id: assessment._id,
          score,
          severity,
          recommendationTag,
          explanation,
          totalScore: score,
          assessmentType: GAD7_ASSESSMENT_TYPE,
          disorderSlug: GAD7_DISORDER_SLUG,
          answers: answersArray,
          createdAt: assessment.createdAt,
        },
      });
    } catch (dbErr) {
      const mockId = 'gad7_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...assessmentPayload,
        createdAt: new Date().toISOString(),
      };
      inMemoryAssessments.push(mockAssessment);

      return res.status(201).json({
        success: true,
        data: {
          _id: mockId,
          score,
          severity,
          recommendationTag,
          explanation,
          totalScore: score,
          assessmentType: GAD7_ASSESSMENT_TYPE,
          disorderSlug: GAD7_DISORDER_SLUG,
          answers: answersArray,
          createdAt: mockAssessment.createdAt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { submitGAD7 };
