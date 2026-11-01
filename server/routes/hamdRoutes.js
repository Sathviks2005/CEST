const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createHamdAssessment,
  getMyHamdAssessments,
  getHamdAssessmentById,
} = require('../controllers/hamdController');

// All HAM-D routes require authentication and clinician role
router.use(protect);
router.use(authorize('clinician'));

router.route('/')
  .post(createHamdAssessment);

router.route('/my')
  .get(getMyHamdAssessments);

router.route('/:id')
  .get(getHamdAssessmentById);

module.exports = router;
