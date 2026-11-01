const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getNeedsAttentionList,
  acknowledgePatientAttention,
} = require('../controllers/clinicianAttentionController');

// All attention routes require clinician authentication and real DB user
router.use(protect);
router.use(requireRealUser);
router.use(authorize('clinician'));

router.get('/', getNeedsAttentionList);
router.post('/:patientUserId/acknowledge', acknowledgePatientAttention);

module.exports = router;
