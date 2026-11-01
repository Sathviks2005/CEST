const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
  requireRealUser,
} = require('../middleware/authMiddleware');
const {
  getInstruments,
  createClinicianAssessment,
  getPatientAssessments,
  getClinicianAssessmentById,
  deleteClinicianAssessment,
} = require('../controllers/clinicianAssessmentController');

// All clinician assessment routes are strictly protected for real clinicians
router.use(protect);
router.use(authorize('clinician'));
router.use(requireRealUser);

router.get('/instruments', getInstruments);
router.post('/', createClinicianAssessment);
router.get('/patient/:patientId', getPatientAssessments);
router.get('/:id', getClinicianAssessmentById);
router.delete('/:id', deleteClinicianAssessment);

module.exports = router;
