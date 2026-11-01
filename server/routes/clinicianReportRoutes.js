const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getPatientReport,
  getPatientAvailableReportData,
} = require('../controllers/clinicianReportController');

router.use(protect);
router.use(requireRealUser);
router.use(authorize('clinician'));

router.get('/patient/:patientId/available', getPatientAvailableReportData);
router.get('/patient/:patientId', getPatientReport);

module.exports = router;
