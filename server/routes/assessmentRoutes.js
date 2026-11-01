const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessmentCooldownStatus,
  getMyAssessments,
  getAssessmentById,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAssessment);
router.get('/cooldown-status/:disorderSlug?', protect, getAssessmentCooldownStatus);
router.get('/my', protect, getMyAssessments);
router.get('/:id', protect, getAssessmentById);

module.exports = router;
