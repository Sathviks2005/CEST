const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getPendingVerificationRequests,
  getReviewedVerificationHistory,
  approveClinician,
  rejectClinician,
} = require('../controllers/adminClinicianController');

// All admin routes require valid authentication, real database-backed user, and admin role
router.use(protect);
router.use(requireRealUser);
router.use(authorize('admin'));

router.get('/pending', getPendingVerificationRequests);
router.get('/reviewed', getReviewedVerificationHistory);
router.patch('/:id/approve', approveClinician);
router.patch('/:id/reject', rejectClinician);

module.exports = router;

