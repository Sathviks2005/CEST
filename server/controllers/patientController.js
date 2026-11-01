const Patient = require('../models/Patient');

// In-memory fallback array for local testing without DB
const inMemoryPatients = [
  {
    _id: 'p1',
    id: 'p1',
    name: 'Alexander Wright',
    age: 34,
    gender: 'male',
    email: 'alex.wright@example.com',
    phone: '+1 555-0142',
    clinician: 'user_clinician_1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p2',
    id: 'p2',
    name: 'Elena Rostova',
    age: 29,
    gender: 'female',
    email: 'elena.rostova@example.com',
    phone: '+1 555-0188',
    clinician: 'user_clinician_1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p3',
    id: 'p3',
    name: 'Marcus Brody',
    age: 45,
    gender: 'male',
    email: 'm.brody@example.com',
    phone: '+1 555-0199',
    clinician: 'user_clinician_1',
    createdAt: new Date().toISOString(),
  },
];

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Clinician only)
const createPatient = async (req, res, next) => {
  try {
    const { name, age, dob, gender, email, phone, source = 'manual', consentGiven = false, allowDuplicate = false } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid patient name',
      });
    }

    let calculatedAge = age ? Number(age) : undefined;
    let parsedDob = dob ? new Date(dob) : undefined;

    if (!calculatedAge && parsedDob && !isNaN(parsedDob.getTime())) {
      const diffMs = Date.now() - parsedDob.getTime();
      calculatedAge = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    }

    if (calculatedAge !== undefined && (isNaN(calculatedAge) || calculatedAge < 1 || calculatedAge > 120)) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 1 and 120 years',
      });
    }

    const clinicianId = req.user.id || req.user._id;

    // Check duplicate protection for this clinician if not explicitly allowed
    if (!allowDuplicate) {
      const trimmedName = name.trim();
      const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`^${escapedName}$`, 'i');

      try {
        const query = {
          clinician: clinicianId,
          name: nameRegex,
        };
        const candidates = await Patient.find(query);
        const match = candidates.find((c) => {
          if (calculatedAge && c.age === calculatedAge) return true;
          if (parsedDob && c.dob && new Date(c.dob).toDateString() === parsedDob.toDateString()) return true;
          return false;
        });

        if (match) {
          return res.status(409).json({
            success: false,
            duplicateFound: true,
            message: 'A patient with this name already exists.',
            existingPatient: match,
          });
        }
      } catch (dbErr) {
        // In-memory duplicate check
        const matchMem = inMemoryPatients.find((c) => {
          if (String(c.clinician) !== String(clinicianId) && String(c.clinician) !== 'user_clinician_1') return false;
          if (c.name.toLowerCase() !== trimmedName.toLowerCase()) return false;
          if (calculatedAge && c.age === calculatedAge) return true;
          if (parsedDob && c.dob && new Date(c.dob).toDateString() === parsedDob.toDateString()) return true;
          return false;
        });

        if (matchMem) {
          return res.status(409).json({
            success: false,
            duplicateFound: true,
            message: 'A patient with this name already exists.',
            existingPatient: matchMem,
          });
        }
      }
    }

    const patientData = {
      name: name.trim(),
      age: calculatedAge,
      dob: parsedDob,
      gender: gender || 'prefer_not_to_say',
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      clinician: clinicianId,
      source: ['clinic_walkin', 'manual', 'app_linked'].includes(source) ? source : 'manual',
      consentGiven: Boolean(consentGiven),
    };

    try {
      const patient = await Patient.create(patientData);
      return res.status(201).json({
        success: true,
        data: patient,
      });
    } catch (dbErr) {
      // Memory fallback for offline testing
      const mockId = 'patient_' + Date.now();
      const mockPatient = {
        _id: mockId,
        id: mockId,
        ...patientData,
        createdAt: new Date().toISOString(),
      };
      inMemoryPatients.push(mockPatient);

      return res.status(201).json({
        success: true,
        data: mockPatient,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in clinician's patients
// @route   GET /api/patients/my
// @access  Private (Clinician only)
const getMyPatients = async (req, res, next) => {
  try {
    const clinicianId = req.user.id || req.user._id;

    try {
      const patients = await Patient.find({ clinician: clinicianId }).sort({ createdAt: -1 });
      if (patients && patients.length > 0) {
        const ClinicianLink = require('../models/ClinicianLink');
        const linkedUserIds = patients.map((p) => p.linkedUser).filter(Boolean);
        const links = await ClinicianLink.find({
          clinician: clinicianId,
          patientUser: { $in: linkedUserIds },
        }).sort({ updatedAt: -1 });

        const linkStatusMap = new Map();
        links.forEach((l) => {
          const key = String(l.patientUser);
          if (!linkStatusMap.has(key)) {
            linkStatusMap.set(key, l.status);
          }
        });

        const formatted = patients.map((p) => {
          const pObj = p.toObject();
          if (pObj.linkedUser) {
            pObj.linkStatus = linkStatusMap.get(String(pObj.linkedUser)) || (pObj.linkedUser ? 'accepted' : null);
            if (!pObj.source || pObj.source === 'manual') {
              pObj.source = 'app_linked';
            }
          } else if (!pObj.source) {
            pObj.source = 'manual';
          }
          return pObj;
        });

        return res.json({ success: true, count: formatted.length, data: formatted });
      }
    } catch (dbErr) {
      // DB offline
    }

    const memoryMatches = inMemoryPatients.filter(
      (p) => String(p.clinician) === String(clinicianId) || String(p.clinician) === 'user_clinician_1'
    );
    memoryMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, count: memoryMatches.length, data: memoryMatches });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private (Clinician only)
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const patient = await Patient.findById(id);
      if (patient) {
        return res.json({ success: true, data: patient });
      }
    } catch (dbErr) {
      // DB offline
    }

    const found = inMemoryPatients.find((p) => p._id === id || p.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    return res.json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getMyPatients,
  getPatientById,
};
