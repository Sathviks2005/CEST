const Assessment = require('../models/Assessment');
const { scorePCL5 } = require('../utils/pcl5Scoring');
const { getCooldownDetails, inMemoryAssessments } = require('./assessmentController');

const PCL5_ASSESSMENT_TYPE = 'PCL-5 PTSD Checklist for DSM-5';
const PCL5_DISORDER_SLUG = 'ptsd';

// @desc    Submit PCL-5 PTSD assessment
// @route   POST /api/ptsd/submit
// @access  Private (Self User)
const submitPTSD = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const scoring = scorePCL5(answers);
    if (scoring.error) {
      return res.status(400).json({ success: false, message: scoring.error });
    }

    const {
      clusterBScore,
      clusterCScore,
      clusterDScore,
      clusterEScore,
      totalScore,
      isProbablePTSD,
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
    const cooldownStatus = await getCooldownDetails(userId, PCL5_DISORDER_SLUG);
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
      assessmentType: PCL5_ASSESSMENT_TYPE,
      disorderSlug: PCL5_DISORDER_SLUG,
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
          clusterBScore,
          clusterCScore,
          clusterDScore,
          clusterEScore,
          isProbablePTSD,
          screenResult,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: PCL5_ASSESSMENT_TYPE,
          disorderSlug: PCL5_DISORDER_SLUG,
          answers: answersArray,
          createdAt: assessment.createdAt,
        },
      });
    } catch (dbErr) {
      const mockId = 'ptsd_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...assessmentPayload,
        clusterBScore,
        clusterCScore,
        clusterDScore,
        clusterEScore,
        isProbablePTSD,
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
          clusterBScore,
          clusterCScore,
          clusterDScore,
          clusterEScore,
          isProbablePTSD,
          screenResult,
          severity,
          recommendationTag,
          explanation,
          diagnosticConsideration,
          disclaimer,
          assessmentType: PCL5_ASSESSMENT_TYPE,
          disorderSlug: PCL5_DISORDER_SLUG,
          answers: answersArray,
          createdAt: mockAssessment.createdAt,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { submitPTSD };
