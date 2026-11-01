const express = require('express');
const router = express.Router();
const {
  getRecommendation,
  createExerciseResult,
  getMyExerciseResults,
  getMyProgress,
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendation/:assessmentId?', protect, getRecommendation);
router.post('/results', protect, createExerciseResult);
router.get('/results/me', protect, getMyExerciseResults);
router.get('/progress/me', protect, getMyProgress);

module.exports = router;
