const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPatient,
  getMyPatients,
  getPatientById,
} = require('../controllers/patientController');

// All patient routes require authentication and clinician role
router.use(protect);
router.use(authorize('clinician'));

router.route('/')
  .post(createPatient);

router.route('/my')
  .get(getMyPatients);

router.route('/:id')
  .get(getPatientById);

module.exports = router;
