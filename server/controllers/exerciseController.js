const ExerciseResult = require('../models/ExerciseResult');
const Assessment = require('../models/Assessment');

// In-memory fallback for local testing without MongoDB connection
const inMemoryExerciseResults = [];

// Helper mapping for PHQ-9 recommendation
const getExerciseRecommendationForScore = (score) => {
  const numScore = Number(score);

  if (numScore >= 0 && numScore <= 4) {
    return {
      recommend: false,
      severity: 'Minimal depression',
      scoreBand: '0–4',
      exerciseId: null,
      message: 'Score indicates minimal depression symptoms. Automatic targeted cognitive exercise is not required. You may explore any exercise from the wellness library.',
      disclaimer: 'PHQ-9 is a depression screening tool, not a cognitive assessment. Activities are CET-informed cognitive training exercises.',
    };
  }

  if (numScore >= 5 && numScore <= 9) {
    return {
      recommend: true,
      severity: 'Mild depression',
      scoreBand: '5–9',
      exerciseId: 'attention-grid',
      exerciseName: 'Selective Attention Grid',
      cognitiveDomain: 'Attention + Processing Speed',
      difficulty: 'Easy',
      estimatedDuration: 'Approx. 5 minutes',
      description: 'Interactive visual search exercise designed to train selective attention, target identification, and processing speed under distractor conditions.',
      disclaimer: 'This activity is a CET-informed cognitive training exercise, not a medical treatment or clinical prescription.',
    };
  }

  if (numScore >= 10 && numScore <= 14) {
    return {
      recommend: true,
      severity: 'Moderate depression',
      scoreBand: '10–14',
      exerciseId: 'sequence-memory',
      exerciseName: 'Sequence Memory Challenge',
      cognitiveDomain: 'Working Memory + Recall',
      difficulty: 'Medium',
      estimatedDuration: '5–10 minutes',
      description: 'Sequential recall exercise designed to challenge active working memory capacity, spatial ordering, and pattern retention.',
      disclaimer: 'This activity is a CET-informed cognitive training exercise, not a medical treatment or clinical prescription.',
    };
  }

  if (numScore >= 15 && numScore <= 19) {
    return {
      recommend: true,
      severity: 'Moderately severe depression',
      scoreBand: '15–19',
      exerciseId: 'problem-solving',
      exerciseName: 'Planning & Problem-Solving Challenge',
      cognitiveDomain: 'Problem Solving • Planning • Executive Function • Cognitive Flexibility',
      difficulty: 'Medium → Advanced',
      estimatedDuration: '5–10 minutes',
      description: 'Interactive goal planning and step-sequencing challenge designed to exercise structured executive planning, strategy adaptation, and problem solving.',
      disclaimer: 'This activity is a CET-informed cognitive training exercise, not a medical treatment or clinical prescription.',
    };
  }

  if (numScore >= 20 && numScore <= 27) {
    return {
      recommend: false,
      severity: 'Severe depression',
      scoreBand: '20–27',
      exerciseId: null,
      message: 'Score indicates severe depression symptoms. We recommend prioritizing supportive healthcare and professional medical guidance over cognitive puzzles.',
      disclaimer: 'PHQ-9 screening results in this range warrant professional consultation. Please reach out to your healthcare provider or crisis resources.',
    };
  }

  return {
    recommend: false,
    severity: 'Unknown',
    scoreBand: 'N/A',
    exerciseId: null,
    message: 'Invalid PHQ-9 score provided.',
    disclaimer: 'Screening disclaimer applies.',
  };
};

// @desc    Get cognitive exercise recommendation by assessment ID or score
// @route   GET /api/exercises/recommendation/:assessmentId
// @access  Private
const getRecommendation = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    let score = req.query.score;

    if (!score && assessmentId) {
      try {
        const assessment = await Assessment.findById(assessmentId);
        if (assessment) {
          score = assessment.totalScore;
        }
      } catch (err) {
        // Continue if lookup fails
      }
    }

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: 'Assessment score or valid assessment ID is required',
      });
    }

    const recommendation = getExerciseRecommendationForScore(score);
    return res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save completed cognitive exercise attempt
// @route   POST /api/exercises/results
// @access  Private (Self User)
const createExerciseResult = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      assessmentId,
      assessmentType,
      assessmentScore,
      assessmentSeverity,
      exerciseId,
      exerciseName,
      cognitiveDomain,
      difficulty,
      score,
      maxScore = 100,
      accuracy,
      timeTaken,
      attempts = 1,
      hintsUsed = 0,
      metrics = {},
    } = req.body;

    if (!exerciseId || !exerciseName || score === undefined || accuracy === undefined || timeTaken === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exerciseId, exerciseName, score, accuracy, and timeTaken',
      });
    }

    const payload = {
      user: userId,
      assessmentId: assessmentId || null,
      assessmentType: assessmentType || 'PHQ-9 Patient Depression Questionnaire',
      assessmentScore: assessmentScore !== undefined ? Number(assessmentScore) : null,
      assessmentSeverity: assessmentSeverity || '',
      exerciseId,
      exerciseName,
      cognitiveDomain: cognitiveDomain || 'General Cognitive Domain',
      difficulty: difficulty || 'Easy',
      score: Number(score),
      maxScore: Number(maxScore),
      accuracy: Number(accuracy),
      timeTaken: Number(timeTaken),
      attempts: Number(attempts),
      hintsUsed: Number(hintsUsed),
      metrics,
      completedAt: new Date(),
    };

    try {
      const result = await ExerciseResult.create(payload);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (dbErr) {
      // Memory fallback for offline testing
      const mockResult = {
        _id: 'ex_res_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
      inMemoryExerciseResults.push(mockResult);

      return res.status(201).json({
        success: true,
        data: mockResult,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's completed exercise attempts
// @route   GET /api/exercises/results/me
// @access  Private (Self User)
const getMyExerciseResults = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    try {
      const results = await ExerciseResult.find({ user: userId }).sort({ completedAt: -1 });
      if (results && results.length > 0) {
        return res.json({
          success: true,
          count: results.length,
          data: results,
        });
      }
    } catch (dbErr) {
      // Database offline fallback
    }

    const userMems = inMemoryExerciseResults.filter(
      (r) => String(r.user) === String(userId)
    );
    userMems.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    return res.json({
      success: true,
      count: userMems.length,
      data: userMems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's aggregate progress & domain breakdown
// @route   GET /api/exercises/progress/me
// @access  Private (Self User)
const getMyProgress = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    let results = [];

    try {
      results = await ExerciseResult.find({ user: userId }).sort({ completedAt: -1 });
    } catch (dbErr) {
      results = inMemoryExerciseResults.filter(
        (r) => String(r.user) === String(userId)
      );
    }

    if (!results) results = [];

    const totalCompleted = results.length;

    if (totalCompleted === 0) {
      return res.json({
        success: true,
        data: {
          totalCompleted: 0,
          averageAccuracy: 0,
          bestScore: 0,
          averageTimeSeconds: 0,
          recentExercises: [],
          domainBreakdown: {
            Attention: { count: 0, avgAccuracy: 0, bestScore: 0 },
            WorkingMemory: { count: 0, avgAccuracy: 0, bestScore: 0 },
            ProblemSolving: { count: 0, avgAccuracy: 0, bestScore: 0 },
          },
          disclaimer: 'Exercise performance and PHQ-9 depression screening are separate measurements. Cognitive training performance does not replace clinical evaluation.',
        },
      });
    }

    const sumAccuracy = results.reduce((acc, r) => acc + (r.accuracy || 0), 0);
    const sumTime = results.reduce((acc, r) => acc + (r.timeTaken || 0), 0);
    const bestScore = Math.max(...results.map((r) => r.score || 0));

    const domainMap = {
      Attention: results.filter((r) =>
        (r.cognitiveDomain || '').toLowerCase().includes('attention') ||
        (r.exerciseId || '').includes('attention')
      ),
      WorkingMemory: results.filter((r) =>
        (r.cognitiveDomain || '').toLowerCase().includes('working memory') ||
        (r.exerciseId || '').includes('sequence')
      ),
      ProblemSolving: results.filter((r) =>
        (r.cognitiveDomain || '').toLowerCase().includes('problem') ||
        (r.cognitiveDomain || '').toLowerCase().includes('planning') ||
        (r.exerciseId || '').includes('problem')
      ),
    };

    const calcDomainStats = (arr) => {
      if (!arr || arr.length === 0) return { count: 0, avgAccuracy: 0, bestScore: 0 };
      const accSum = arr.reduce((s, x) => s + (x.accuracy || 0), 0);
      const top = Math.max(...arr.map((x) => x.score || 0));
      return {
        count: arr.length,
        avgAccuracy: Math.round(accSum / arr.length),
        bestScore: top,
      };
    };

    return res.json({
      success: true,
      data: {
        totalCompleted,
        averageAccuracy: Math.round(sumAccuracy / totalCompleted),
        bestScore,
        averageTimeSeconds: Math.round(sumTime / totalCompleted),
        recentExercises: results.slice(0, 5),
        domainBreakdown: {
          Attention: calcDomainStats(domainMap.Attention),
          WorkingMemory: calcDomainStats(domainMap.WorkingMemory),
          ProblemSolving: calcDomainStats(domainMap.ProblemSolving),
        },
        disclaimer: 'Exercise performance and PHQ-9 depression screening are separate measurements. Cognitive training performance does not denote clinical depression resolution.',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendation,
  createExerciseResult,
  getMyExerciseResults,
  getMyProgress,
  getExerciseRecommendationForScore,
};
