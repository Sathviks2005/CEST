const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getCatalog,
  createAssignments,
  getPatientAssignments,
  getAllClinicianAssignments,
  getClinicianAssignmentCounts,
  cancelAssignment,
  getMyAssignments,
  startAssignment,
  completeAssignment,
  skipAssignment,
  getPatientAssignmentCounts,
} = require('../controllers/assignedExerciseController');

// All assigned-exercise routes require authentication and a verified real MongoDB user record
router.use(protect);
router.use(requireRealUser);

// Clinician routes
router.get('/catalog', authorize('clinician'), getCatalog);
router.post('/', authorize('clinician'), createAssignments);
router.get('/clinician/all', authorize('clinician'), getAllClinicianAssignments);
router.get('/clinician/counts', authorize('clinician'), getClinicianAssignmentCounts);
router.get('/patient/:patientUserId', authorize('clinician'), getPatientAssignments);
router.patch('/:id/cancel', authorize('clinician'), cancelAssignment);

// Patient (self_user) routes
router.get('/counts', authorize('self_user'), getPatientAssignmentCounts);
router.get('/mine', authorize('self_user'), getMyAssignments);
router.patch('/:id/start', authorize('self_user'), startAssignment);
router.post('/:id/complete', authorize('self_user'), completeAssignment);
router.patch('/:id/skip', authorize('self_user'), skipAssignment);

module.exports = router;
