const express = require('express');
const router = express.Router();
const { protect, authorize, requireRealUser } = require('../middleware/authMiddleware');
const {
  getNotesForPatient,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/clinicianNoteController');

// All clinician-notes routes require authenticated real clinician
router.use(protect);
router.use(requireRealUser);
router.use(authorize('clinician'));

router.get('/patient/:patientId', getNotesForPatient);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
