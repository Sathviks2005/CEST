const mongoose = require('mongoose');
const ClinicianAssessment = require('../models/ClinicianAssessment');
const HamDAssessment = require('../models/HamDAssessment');
const Patient = require('../models/Patient');
const {
  CLINICIAN_INSTRUMENTS,
  scoreAssessment,
  getInstrument,
} = require('../config/clinicianInstruments');

// In-memory store for offline/local development when DB is unavailable
const inMemoryClinicianAssessments = [];

/**
 * Adapter helper to transform existing HamDAssessment document into ClinicianAssessment shape
 */
function adaptHamdRecord(hamd, patientId) {
  const itemScores = hamd.itemScores || [];
  const suicideVal = itemScores[2] || 0;
  const flags = [];
  if (suicideVal === 1) flags.push('SUICIDE_IDEATION_MILD');
  if (suicideVal >= 2) flags.push('SUICIDE_RISK_ALERT');

  return {
    _id: hamd._id || hamd.id,
    id: hamd._id || hamd.id,
    clinician: hamd.clinician,
    patient: patientId || hamd.patientId,
    instrumentId: 'hamd17',
    answers: itemScores.map((score, idx) => ({ itemId: idx + 1, value: score })),
    extras: {},
    totalScore: hamd.totalScore,
    subscores: {
      suicideItemScore: suicideVal,
      item16WeightLossScore: itemScores[15] === 3 ? 0 : itemScores[15],
    },
    band: hamd.severity,
    flags,
    respondent: 'patient',
    administeredAt: hamd.createdAt || new Date(),
    clinicianNote: hamd.notes || '',
    instrumentVersion: '1.0',
    deletedAt: hamd.deletedAt || null,
    createdAt: hamd.createdAt,
    updatedAt: hamd.updatedAt,
    isAdaptedFromHamD: true,
  };
}

/**
 * @desc    Get all instrument definitions
 * @route   GET /api/clinician-assessments/instruments
 * @access  Private (Clinician only)
 */
const getInstruments = async (req, res, next) => {
  try {
    const list = Object.values(CLINICIAN_INSTRUMENTS).map((inst) => ({
      id: inst.id,
      name: inst.name,
      shortName: inst.shortName,
      version: inst.version,
      citation: inst.citation,
      copyright: inst.copyright,
      timeFrame: inst.timeFrame,
      instructions: inst.instructions,
      targetDisorder: inst.targetDisorder,
      estimatedMinutes: inst.estimatedMinutes,
      itemsCount: inst.itemsCount,
      maxScore: inst.maxScore,
      options: inst.options,
      items: inst.items,
      extraFields: inst.extraFields || [],
      caveat: inst.caveat || null,
      bands: inst.bands,
    }));

    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a clinician assessment (server-recomputed scores)
 * @route   POST /api/clinician-assessments
 * @access  Private (Clinician only)
 */
const createClinicianAssessment = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;
    const {
      patientId,
      instrumentId,
      answers,
      extras = {},
      respondent = 'patient',
      administeredAt,
      clinicianNote = '',
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    if (!instrumentId) {
      return res.status(400).json({ success: false, message: 'Instrument ID is required' });
    }

    const instrument = getInstrument(instrumentId);
    if (!instrument) {
      return res.status(400).json({ success: false, message: `Unsupported instrument: ${instrumentId}` });
    }

    // Verify patient exists and belongs to the authenticated clinician
    let patient;
    try {
      patient = await Patient.findOne({ _id: patientId, clinician: clinicianId });
    } catch {
      patient = null;
    }

    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'Patient record not found or does not belong to your clinical roster',
      });
    }

    // If ADHD and patient has no age/DOB, but extras.age is passed, persist it on the patient
    let patientAge = patient.age;
    if ((!patientAge || isNaN(patientAge)) && patient.dob) {
      const birthDate = new Date(patient.dob);
      const diff = Date.now() - birthDate.getTime();
      patientAge = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }
    if ((patientAge === null || patientAge === undefined || isNaN(patientAge)) && extras.age) {
      patientAge = Number(extras.age);
      if (!isNaN(patientAge) && patientAge > 0) {
        patient.age = patientAge;
        await patient.save().catch(() => {});
      }
    }

    // ALWAYS recompute score on server from raw answers. Ignore any client totals or bands.
    let scored;
    try {
      scored = scoreAssessment(instrumentId, answers, extras, patientAge);
    } catch (scoreErr) {
      return res.status(400).json({
        success: false,
        message: scoreErr.message || 'Scoring validation failed',
      });
    }

    // Format validated answers
    const formattedAnswers = Array.isArray(answers)
      ? answers.map((a) => ({ itemId: a.itemId, value: Number(a.value) }))
      : Object.keys(answers).map((k) => ({ itemId: k, value: Number(answers[k]) }));

    const recordData = {
      clinician: clinicianId,
      patient: patient._id,
      instrumentId,
      answers: formattedAnswers,
      extras: extras || {},
      totalScore: scored.totalScore,
      subscores: scored.subscores || {},
      band: scored.band,
      flags: scored.flags || [],
      respondent: respondent || 'patient',
      administeredAt: administeredAt ? new Date(administeredAt) : new Date(),
      clinicianNote: clinicianNote ? String(clinicianNote).trim().slice(0, 500) : '',
      instrumentVersion: instrument.version || '1.0',
      deletedAt: null,
    };

    try {
      const saved = await ClinicianAssessment.create(recordData);
      return res.status(201).json({
        success: true,
        data: saved,
      });
    } catch (dbErr) {
      // Fallback in-memory
      const mockId = 'ca_' + Date.now();
      const mockDoc = {
        _id: mockId,
        id: mockId,
        ...recordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryClinicianAssessments.push(mockDoc);
      return res.status(201).json({
        success: true,
        data: mockDoc,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assessment history for a specific patient
 * @route   GET /api/clinician-assessments/patient/:patientId
 * @access  Private (Clinician only)
 */
const getPatientAssessments = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;
    const { patientId } = req.params;
    const { instrumentId, from, to, limit = 50 } = req.query;

    // Verify patient ownership
    let patient;
    try {
      patient = await Patient.findOne({ _id: patientId, clinician: clinicianId });
    } catch {
      patient = null;
    }

    if (!patient) {
      return res.status(403).json({
        success: false,
        message: 'Patient record not found or does not belong to your clinical roster',
      });
    }

    const query = {
      clinician: clinicianId,
      patient: patient._id,
      deletedAt: null,
    };

    if (instrumentId && instrumentId !== 'ALL') {
      query.instrumentId = instrumentId;
    }

    if (from || to) {
      query.administeredAt = {};
      if (from) query.administeredAt.$gte = new Date(from);
      if (to) query.administeredAt.$lte = new Date(to);
    }

    let records = [];
    try {
      records = await ClinicianAssessment.find(query)
        .sort({ administeredAt: -1 })
        .limit(Number(limit) || 50)
        .lean();
    } catch {
      records = inMemoryClinicianAssessments.filter(
        (a) =>
          String(a.clinician) === String(clinicianId) &&
          String(a.patient) === String(patientId) &&
          !a.deletedAt &&
          (!instrumentId || instrumentId === 'ALL' || a.instrumentId === instrumentId)
      );
    }

    // Adapt existing HAM-D records if queried instrument includes hamd17 or ALL
    if (!instrumentId || instrumentId === 'ALL' || instrumentId === 'hamd17') {
      try {
        const hamdQuery = {
          clinician: clinicianId,
          $or: [
            { patientId: String(patient._id) },
            { patientName: new RegExp(`^${patient.name.trim()}$`, 'i') },
          ],
        };
        const hamdRecords = await HamDAssessment.find(hamdQuery).sort({ createdAt: -1 }).lean();
        const adaptedHamd = hamdRecords.map((h) => adaptHamdRecord(h, patient._id));
        records = records.concat(adaptedHamd);
      } catch {
        // HamD DB fallback
      }
    }

    // Sort combined records descending
    records.sort((a, b) => new Date(b.administeredAt) - new Date(a.administeredAt));

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single assessment by ID
 * @route   GET /api/clinician-assessments/:id
 * @access  Private (Clinician only)
 */
const getClinicianAssessmentById = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;
    const { id } = req.params;

    let record = null;
    try {
      record = await ClinicianAssessment.findOne({ _id: id, clinician: clinicianId, deletedAt: null }).lean();
    } catch {
      record = inMemoryClinicianAssessments.find(
        (a) => (a._id === id || a.id === id) && String(a.clinician) === String(clinicianId) && !a.deletedAt
      );
    }

    // If not found, check if it's an adapted HAM-D record
    if (!record) {
      try {
        const hamd = await HamDAssessment.findOne({ _id: id, clinician: clinicianId }).lean();
        if (hamd) {
          record = adaptHamdRecord(hamd, hamd.patientId);
        }
      } catch {}
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Assessment record not found or access denied',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete an assessment (creator only)
 * @route   DELETE /api/clinician-assessments/:id
 * @access  Private (Clinician only)
 */
const deleteClinicianAssessment = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;
    const { id } = req.params;

    let record = null;
    try {
      record = await ClinicianAssessment.findOne({ _id: id, clinician: clinicianId });
      if (record) {
        record.deletedAt = new Date();
        await record.save();
        return res.json({
          success: true,
          message: 'Assessment record soft deleted successfully',
        });
      }
    } catch {
      // In-memory fallback
      const foundIdx = inMemoryClinicianAssessments.findIndex(
        (a) => (a._id === id || a.id === id) && String(a.clinician) === String(clinicianId)
      );
      if (foundIdx !== -1) {
        inMemoryClinicianAssessments[foundIdx].deletedAt = new Date();
        return res.json({ success: true, message: 'Assessment record deleted' });
      }
    }

    // If not found in ClinicianAssessment, check HamDAssessment
    try {
      const hamd = await HamDAssessment.findOne({ _id: id, clinician: clinicianId });
      if (hamd) {
        await HamDAssessment.deleteOne({ _id: id });
        return res.json({
          success: true,
          message: 'HAM-D assessment record deleted successfully',
        });
      }
    } catch {}

    return res.status(404).json({
      success: false,
      message: 'Record not found or you do not have permission to delete it',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInstruments,
  createClinicianAssessment,
  getPatientAssessments,
  getClinicianAssessmentById,
  deleteClinicianAssessment,
  adaptHamdRecord,
};
