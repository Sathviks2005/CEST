const HamDAssessment = require('../models/HamDAssessment');

const HAMD_MAX_SCORES = [4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 2, 2, 2, 4, 3, 2];

// In-memory fallback for offline testing
const inMemoryHamdAssessments = [];

// Helper to calculate HAM-D-17 severity band
const getHamdSeverity = (score) => {
  if (score <= 7) return 'Normal';
  if (score >= 8 && score <= 13) return 'Mild depression';
  if (score >= 14 && score <= 18) return 'Moderate depression';
  if (score >= 19 && score <= 22) return 'Severe depression';
  return 'Severe depression, intensive treatment indicated';
};

// @desc    Submit HAM-D-17 assessment
// @route   POST /api/hamd
// @access  Private (Clinician only)
const createHamdAssessment = async (req, res, next) => {
  try {
    const { patientName, patientId, itemScores, notes } = req.body;

    if (!patientName || typeof patientName !== 'string' || !patientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid patient name',
      });
    }

    if (!itemScores || !Array.isArray(itemScores) || itemScores.length !== 17) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid scores for all 17 HAM-D items',
      });
    }

    const normalizedScores = itemScores.map((s) => Number(s));
    for (let i = 0; i < 17; i++) {
      const score = normalizedScores[i];
      const maxAllowed = HAMD_MAX_SCORES[i];
      if (!Number.isInteger(score) || score < 0 || score > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `Item ${i + 1} score must be an integer between 0 and ${maxAllowed}`,
        });
      }
    }

    const clinicianId = req.user.id || req.user._id;
    const totalScore = normalizedScores.reduce((acc, curr, idx) => {
      if (idx === 15 && curr === 3) return acc + 0;
      return acc + curr;
    }, 0);
    const severity = getHamdSeverity(totalScore);

    const newRecordData = {
      clinician: clinicianId,
      patientName: patientName.trim(),
      patientId: patientId || '',
      disorderSlug: 'depression',
      itemScores: normalizedScores,
      totalScore,
      severity,
      notes: notes ? notes.trim() : '',
    };

    try {
      const assessment = await HamDAssessment.create(newRecordData);
      return res.status(201).json({
        success: true,
        data: assessment,
      });
    } catch (dbErr) {
      // Offline / Memory fallback
      const mockId = 'hamd_' + Date.now();
      const mockAssessment = {
        _id: mockId,
        id: mockId,
        ...newRecordData,
        createdAt: new Date().toISOString(),
      };
      inMemoryHamdAssessments.push(mockAssessment);

      return res.status(201).json({
        success: true,
        data: mockAssessment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get clinician's submitted HAM-D assessments
// @route   GET /api/hamd/my
// @access  Private (Clinician only)
const getMyHamdAssessments = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;

    try {
      const assessments = await HamDAssessment.find({ clinician: clinicianId }).sort({ createdAt: -1 });
      if (assessments && assessments.length > 0) {
        return res.json({ success: true, count: assessments.length, data: assessments });
      }
    } catch (dbErr) {
      // DB offline
    }

    const clinicianMems = inMemoryHamdAssessments.filter(
      (a) => String(a.clinician) === String(clinicianId)
    );
    clinicianMems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, count: clinicianMems.length, data: clinicianMems });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single HAM-D assessment by ID
// @route   GET /api/hamd/:id
// @access  Private (Clinician only)
const getHamdAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const assessment = await HamDAssessment.findById(id);
      if (assessment) {
        return res.json({ success: true, data: assessment });
      }
    } catch (dbErr) {
      // DB offline
    }

    const found = inMemoryHamdAssessments.find((a) => a._id === id || a.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'HAM-D assessment record not found' });
    }

    return res.json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHamdAssessment,
  getMyHamdAssessments,
  getHamdAssessmentById,
  getHamdSeverity,
  HAMD_MAX_SCORES,
};
