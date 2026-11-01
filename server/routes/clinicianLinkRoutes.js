const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getClinicians,
  createLink,
  getMyLinks,
  acceptInvite,
  declineInvite,
  updateSharing,
  cancelLink,
  revokeLink,
  invitePatient,
  getClinicianInvites,
  cancelClinicianInvite,
  getClinicianRequests,
  acceptRequest,
  declineRequest,
  getPatientAssessments,
  getCounts,
  getAccessLogs,
} = require('../controllers/clinicianLinkController');

// All clinician-link routes require authentication and a verified MongoDB user record
router.use(protect);
router.use(requireRealUser);

// In-app notification counts (available to self_user and clinician)
router.get('/counts', authorize('self_user', 'clinician'), getCounts);

// Self-user routes
router.get('/access-logs', authorize('self_user'), getAccessLogs);
router.get('/clinicians', authorize('self_user'), getClinicians);
router.post('/', authorize('self_user'), createLink);
router.get('/mine', authorize('self_user'), getMyLinks);
router.patch('/:id/accept-invite', authorize('self_user'), acceptInvite);
router.patch('/:id/decline-invite', authorize('self_user'), declineInvite);
router.patch('/:id/sharing', authorize('self_user'), updateSharing);
router.patch('/:id/cancel', authorize('self_user'), cancelLink);
router.patch('/:id/revoke', authorize('self_user'), revokeLink);

// Clinician routes
router.post('/invite', authorize('clinician'), invitePatient);
router.get('/invites', authorize('clinician'), getClinicianInvites);
router.patch('/invites/:id/cancel', authorize('clinician'), cancelClinicianInvite);
router.get('/requests', authorize('clinician'), getClinicianRequests);
router.patch('/:id/accept', authorize('clinician'), acceptRequest);
router.patch('/:id/decline', authorize('clinician'), declineRequest);
router.get('/patients/:patientUserId/assessments', authorize('clinician'), getPatientAssessments);

module.exports = router;
