const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getClinicianSettings,
  updateClinicianSettings,
  requestVerification,
} = require('../controllers/clinicianSettingsController');

router.use(protect);
router.use(requireRealUser);
router.use(authorize('clinician'));

router.get('/', getClinicianSettings);
router.patch('/', updateClinicianSettings);
router.post('/request-verification', requestVerification);

module.exports = router;
