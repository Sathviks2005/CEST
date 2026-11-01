const ClinicianNote = require('../models/ClinicianNote');
const Patient = require('../models/Patient');

/**
 * @desc    Get private notes for a patient
 * @route   GET /api/clinician-notes/patient/:patientId
 * @access  Private (Clinician)
 * SECURITY NOTE: Strictly filtered by clinician === req.user._id. Verifies patient ownership.
 */
const getNotesForPatient = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 1. Verify patient belongs to logged-in clinician
    const patient = await Patient.findOne({
      _id: patientId,
      clinician: clinicianId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found or does not belong to your clinical roster',
      });
    }

    // Filter: clinician === clinicianId && patient === patientId
    const [notes, total] = await Promise.all([
      ClinicianNote.find({
        clinician: clinicianId,
        patient: patientId,
      })
        .sort({ noteDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ClinicianNote.countDocuments({
        clinician: clinicianId,
        patient: patientId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + notes.length < total,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch clinician notes',
    });
  }
};

/**
 * @desc    Create a private clinician note
 * @route   POST /api/clinician-notes
 * @access  Private (Clinician)
 * SECURITY NOTE: Binds clinician to req.user._id. Verifies patient ownership.
 */
const createNote = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientId, text, noteDate } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty',
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Note cannot exceed 2000 characters',
      });
    }

    // Verify patient ownership
    const patient = await Patient.findOne({
      _id: patientId,
      clinician: clinicianId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found or not assigned to you',
      });
    }

    let parsedDate = new Date();
    if (noteDate) {
      const d = new Date(noteDate);
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    const note = await ClinicianNote.create({
      clinician: clinicianId,
      patient: patientId,
      text: text.trim(),
      noteDate: parsedDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      data: note,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create clinician note',
    });
  }
};

/**
 * @desc    Update an existing private clinician note
 * @route   PATCH /api/clinician-notes/:id
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: _id === req.params.id && clinician === req.user._id
 */
const updateNote = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { text, noteDate } = req.body;

    const note = await ClinicianNote.findOne({
      _id: req.params.id,
      clinician: clinicianId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not created by you',
      });
    }

    if (text !== undefined) {
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Note content cannot be empty',
        });
      }
      if (text.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Note cannot exceed 2000 characters',
        });
      }
      note.text = text.trim();
    }

    if (noteDate) {
      const d = new Date(noteDate);
      if (!isNaN(d.getTime())) note.noteDate = d;
    }

    await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update clinician note',
    });
  }
};

/**
 * @desc    Delete a private clinician note
 * @route   DELETE /api/clinician-notes/:id
 * @access  Private (Clinician)
 * SECURITY NOTE: Filter: _id === req.params.id && clinician === req.user._id
 */
const deleteNote = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;

    const note = await ClinicianNote.findOneAndDelete({
      _id: req.params.id,
      clinician: clinicianId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not created by you',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete clinician note',
    });
  }
};

module.exports = {
  getNotesForPatient,
  createNote,
  updateNote,
  deleteNote,
};
