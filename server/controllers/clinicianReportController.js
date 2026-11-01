const Patient = require('../models/Patient');
const User = require('../models/User');
const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');
const HamDAssessment = require('../models/HamDAssessment');
const ClinicianAssessment = require('../models/ClinicianAssessment');
const AssignedExercise = require('../models/AssignedExercise');
const ClinicianNote = require('../models/ClinicianNote');
const { canClinicianView } = require('../utils/clinicianLinkHelpers');
const { logPatientAccess } = require('../utils/accessLogger');
const { getExerciseById } = require('../config/exerciseCatalog');
const {
  CLINICIAN_INSTRUMENTS,
} = require('../config/clinicianInstruments');
const { adaptHamdRecord } = require('./clinicianAssessmentController');

// Standard clinical scale configurations for Self-Reported assessments
const SELF_REPORT_CONFIGS = {
  phq9: {
    key: 'phq9',
    title: 'PHQ-9 (Patient Health Questionnaire - Depression)',
    shortName: 'PHQ-9',
    citation: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001; 16(9):606-613.',
    maxScore: 27,
    disorderSlug: 'depression',
    bands: [
      { name: 'Minimal', min: 0, max: 4, color: '#10b981' },
      { name: 'Mild', min: 5, max: 9, color: '#3b82f6' },
      { name: 'Moderate', min: 10, max: 14, color: '#f59e0b' },
      { name: 'Moderately Severe', min: 15, max: 19, color: '#f97316' },
      { name: 'Severe', min: 20, max: 27, color: '#ef4444' },
    ],
  },
  gad7: {
    key: 'gad7',
    title: 'GAD-7 (Generalized Anxiety Disorder)',
    shortName: 'GAD-7',
    citation: 'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006; 166(10):1092-1097.',
    maxScore: 21,
    disorderSlug: 'anxiety',
    bands: [
      { name: 'Minimal', min: 0, max: 4, color: '#10b981' },
      { name: 'Mild', min: 5, max: 9, color: '#3b82f6' },
      { name: 'Moderate', min: 10, max: 14, color: '#f59e0b' },
      { name: 'Severe', min: 15, max: 21, color: '#ef4444' },
    ],
  },
  insomnia: {
    key: 'insomnia',
    title: 'ISI (Insomnia Severity Index - Self Reported)',
    shortName: 'ISI (Self)',
    citation: 'Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001; 2:297-307.',
    maxScore: 28,
    disorderSlug: 'insomnia',
    bands: [
      { name: 'No clinically significant insomnia', min: 0, max: 7, color: '#10b981' },
      { name: 'Subthreshold insomnia', min: 8, max: 14, color: '#3b82f6' },
      { name: 'Clinical insomnia (moderate)', min: 15, max: 21, color: '#f59e0b' },
      { name: 'Clinical insomnia (severe)', min: 22, max: 28, color: '#ef4444' },
    ],
  },
  ptsd: {
    key: 'ptsd',
    title: 'PCL-5 (PTSD Checklist for DSM-5)',
    shortName: 'PCL-5',
    citation: 'Blevins CA, Weathers FW, Davis MT, et al. The Posttraumatic Stress Disorder Checklist for DSM-5 (PCL-5). J Trauma Stress. 2015; 28(6):489-498.',
    maxScore: 80,
    disorderSlug: 'ptsd',
    bands: [
      { name: 'Below Cutoff', min: 0, max: 32, color: '#10b981' },
      { name: 'Provisional PTSD Cutoff (Elevated)', min: 33, max: 80, color: '#ef4444' },
    ],
  },
  ocd: {
    key: 'ocd',
    title: 'Y-BOCS (Yale-Brown Obsessive Compulsive Scale - Self Reported)',
    shortName: 'Y-BOCS (Self)',
    citation: 'Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown Obsessive Compulsive Scale (Y-BOCS). Arch Gen Psychiatry. 1989; 46(11):1006-1011.',
    maxScore: 40,
    disorderSlug: 'ocd',
    bands: [
      { name: 'Subclinical', min: 0, max: 7, color: '#10b981' },
      { name: 'Mild', min: 8, max: 15, color: '#3b82f6' },
      { name: 'Moderate', min: 16, max: 23, color: '#f59e0b' },
      { name: 'Severe', min: 24, max: 31, color: '#f97316' },
      { name: 'Extreme', min: 32, max: 40, color: '#ef4444' },
    ],
  },
};

/** Build Date Range Object */
function buildDateRange(req) {
  let dateQuery = {};
  const { from, to, startDate, endDate, range } = req.query;

  const startStr = from || startDate;
  const endStr = to || endDate;

  if (startStr || endStr) {
    dateQuery.$gte = startStr ? new Date(startStr) : new Date(0);
    if (endStr) {
      const e = new Date(endStr);
      e.setHours(23, 59, 59, 999);
      dateQuery.$lte = e;
    }
  } else if (range && range !== 'all') {
    const days = parseInt(range, 10) || 90;
    const s = new Date();
    s.setDate(s.getDate() - days);
    s.setHours(0, 0, 0, 0);
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    dateQuery = { $gte: s, $lte: e };
  }

  return Object.keys(dateQuery).length > 0 ? dateQuery : null;
}

/**
 * @desc    Get available data for patient in date range (only data-bearing instruments/activities)
 * @route   GET /api/clinician/reports/patient/:patientId/available
 * @access  Private (Clinician only)
 */
const getPatientAvailableReportData = async (req, res, next) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientId } = req.params;

    const patient = await Patient.findOne({ _id: patientId, clinician: clinicianId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found in your roster' });
    }

    const dateRange = buildDateRange(req);

    // 1. Fetch Clinician-administered questionnaires
    const caQuery = { clinician: clinicianId, patient: patient._id, deletedAt: null };
    if (dateRange) caQuery.administeredAt = dateRange;

    const clinicianRecords = await ClinicianAssessment.find(caQuery)
      .sort({ administeredAt: 1 })
      .lean();

    // Fetch adapted HAM-D records
    const hamdQuery = {
      clinician: clinicianId,
      $or: [{ patientId: String(patient._id) }, { patientName: patient.name }],
    };
    if (dateRange) hamdQuery.createdAt = dateRange;
    const hamdRecords = await HamDAssessment.find(hamdQuery).sort({ createdAt: 1 }).lean();
    const adaptedHamd = hamdRecords.map((h) => adaptHamdRecord(h, patient._id));

    const allClinicianRecords = [...clinicianRecords, ...adaptedHamd];
    allClinicianRecords.sort((a, b) => new Date(a.administeredAt) - new Date(b.administeredAt));

    // Group clinician questionnaires by instrumentId
    const clinicianMap = {};
    allClinicianRecords.forEach((rec) => {
      const id = rec.instrumentId;
      if (!clinicianMap[id]) {
        const def = CLINICIAN_INSTRUMENTS[id];
        clinicianMap[id] = {
          id,
          name: def?.name || id,
          shortName: def?.shortName || id,
          citation: def?.citation || '',
          count: 0,
          firstDate: rec.administeredAt,
          lastDate: rec.administeredAt,
          latestScore: rec.totalScore,
          latestBand: rec.band,
          records: [],
        };
      }
      clinicianMap[id].count++;
      clinicianMap[id].lastDate = rec.administeredAt;
      clinicianMap[id].latestScore = rec.totalScore;
      clinicianMap[id].latestBand = rec.band;
      clinicianMap[id].records.push(rec);
    });

    // 2. Fetch Self-reported assessments (only data the patient shared)
    let sharedAssessments = [];
    let assignedExercises = [];
    if (patient.linkedUser) {
      const { allowed, link } = await canClinicianView(patient.linkedUser, clinicianId);
      if (allowed && link) {
        const selfQuery = { user: patient.linkedUser };
        if (dateRange) selfQuery.createdAt = dateRange;

        if (link.shareScope === 'all') {
          sharedAssessments = await Assessment.find(selfQuery).sort({ createdAt: 1 }).lean();
        } else {
          const sharedIds = link.sharedAssessmentIds || [];
          sharedAssessments = await Assessment.find({
            ...selfQuery,
            _id: { $in: sharedIds },
          }).sort({ createdAt: 1 }).lean();
        }

        const exQuery = { patientUser: patient.linkedUser, clinician: clinicianId };
        if (dateRange) exQuery.createdAt = dateRange;
        assignedExercises = await AssignedExercise.find(exQuery).sort({ createdAt: 1 }).lean();
      }
    }

    // Group self-reported assessments by scale config
    const selfReportedMap = {};
    Object.keys(SELF_REPORT_CONFIGS).forEach((key) => {
      const conf = SELF_REPORT_CONFIGS[key];
      const matches = sharedAssessments.filter((a) => {
        const slug = (a.disorderSlug || '').toLowerCase();
        const type = (a.assessmentType || '').toLowerCase();
        if (key === 'phq9') return slug.includes('depression') || type.includes('phq');
        if (key === 'gad7') return slug.includes('anxiety') || slug.includes('gad') || type.includes('gad');
        if (key === 'insomnia') return slug.includes('insomnia') || type.includes('isi');
        if (key === 'ptsd') return slug.includes('ptsd') || type.includes('pcl');
        if (key === 'ocd') return slug.includes('ocd') || type.includes('ybocs') || type.includes('y-bocs');
        return slug === conf.disorderSlug || type.includes(key);
      });

      if (matches.length > 0) {
        const latest = matches[matches.length - 1];
        selfReportedMap[key] = {
          key,
          title: conf.title,
          shortName: conf.shortName,
          citation: conf.citation,
          count: matches.length,
          firstDate: matches[0].createdAt,
          lastDate: latest.createdAt,
          latestScore: latest.totalScore,
          latestBand: latest.severity,
        };
      }
    });

    // 3. Filter Exercises (only assigned or completed in range)
    const cbtExercises = assignedExercises.filter((e) => {
      const def = getExerciseById(e.exerciseId);
      return def && def.group !== 'cet';
    });
    const cetExercises = assignedExercises.filter((e) => {
      const def = getExerciseById(e.exerciseId);
      return def && def.group === 'cet';
    });

    const exercisesAvailable = [];
    if (cbtExercises.length > 0) {
      exercisesAvailable.push({
        key: 'cbt',
        title: 'Cognitive Behavioral Therapy (CBT) Exercises',
        count: cbtExercises.length,
        completedCount: cbtExercises.filter((x) => x.status === 'completed').length,
        firstDate: cbtExercises[0].createdAt,
        lastDate: cbtExercises[cbtExercises.length - 1].createdAt,
      });
    }
    if (cetExercises.length > 0) {
      exercisesAvailable.push({
        key: 'cet',
        title: 'Cognitive Enhancement (CET) Practice Exercises',
        count: cetExercises.length,
        completedCount: cetExercises.filter((x) => x.status === 'completed').length,
        firstDate: cetExercises[0].createdAt,
        lastDate: cetExercises[cetExercises.length - 1].createdAt,
      });
    }

    // 4. Notes count
    const noteQuery = { clinician: clinicianId, patient: patient._id };
    if (dateRange) noteQuery.noteDate = dateRange;
    const noteCount = await ClinicianNote.countDocuments(noteQuery);

    return res.json({
      success: true,
      data: {
        clinicianQuestionnaires: Object.values(clinicianMap),
        selfReported: Object.values(selfReportedMap),
        exercises: exercisesAvailable,
        notes: {
          count: noteCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate printable summary report containing ONLY attended / checked data
 * @route   GET /api/clinician/reports/patient/:patientId
 * @access  Private (Clinician only)
 */
const getPatientReport = async (req, res, next) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientId } = req.params;

    const patient = await Patient.findOne({ _id: patientId, clinician: clinicianId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found in your roster' });
    }

    const dateRange = buildDateRange(req);

    // Selected sections parsed from query
    // includeClinician: comma-separated list of instrument IDs
    // includeSelf: comma-separated list of self-reported keys
    // includeItems: comma-separated list of instrument IDs to include item-level answers
    // includeNsesssEvent: boolean
    // includeExercises: boolean or 'cbt,cet'
    // includeNotes: boolean
    const includeClinician = req.query.includeClinician ? req.query.includeClinician.split(',') : null;
    const includeSelf = req.query.includeSelf ? req.query.includeSelf.split(',') : null;
    const includeItems = req.query.includeItems ? req.query.includeItems.split(',') : [];
    const includeNsesssEvent = req.query.includeNsesssEvent === 'true';
    const includeExercises = req.query.includeExercises !== 'false';
    const includeNotes = req.query.includeNotes === 'true';

    // 1. Fetch Clinician-Administered Questionnaires
    const caQuery = { clinician: clinicianId, patient: patient._id, deletedAt: null };
    if (dateRange) caQuery.administeredAt = dateRange;
    let clinicianRecords = await ClinicianAssessment.find(caQuery).sort({ administeredAt: 1 }).lean();

    // Fetch adapted HAM-D
    const hamdQuery = {
      clinician: clinicianId,
      $or: [{ patientId: String(patient._id) }, { patientName: patient.name }],
    };
    if (dateRange) hamdQuery.createdAt = dateRange;
    const hamdDocs = await HamDAssessment.find(hamdQuery).sort({ createdAt: 1 }).lean();
    const adaptedHamd = hamdDocs.map((h) => adaptHamdRecord(h, patient._id));

    let allClinician = [...clinicianRecords, ...adaptedHamd];
    allClinician.sort((a, b) => new Date(a.administeredAt) - new Date(b.administeredAt));

    // Group into per-instrument sections
    const clinicianSections = [];
    const attendedSummary = [];
    const citations = new Set();

    Object.keys(CLINICIAN_INSTRUMENTS).forEach((instId) => {
      // Filter by selection if specified
      if (includeClinician && !includeClinician.includes(instId)) return;

      const instDef = CLINICIAN_INSTRUMENTS[instId];
      const records = allClinician.filter((r) => r.instrumentId === instId);

      // Rule: ONLY include instruments that have data! Never print empty sections.
      if (records.length === 0) return;

      citations.add(`${instDef.shortName}: ${instDef.citation} (${instDef.copyright})`);

      const latest = records[records.length - 1];
      attendedSummary.push({
        instrument: instDef.name,
        shortName: instDef.shortName,
        source: 'Clinician-administered',
        count: records.length,
        firstDate: records[0].administeredAt,
        latestDate: latest.administeredAt,
        latestScore: latest.totalScore,
        maxScore: instDef.maxScore,
        latestBand: latest.band,
        hasSuicideFlag: records.some((r) => r.flags && r.flags.includes('SUICIDE_RISK_ALERT')),
      });

      const wantsItemAnswers = includeItems.includes(instId);

      clinicianSections.push({
        id: instId,
        name: instDef.name,
        shortName: instDef.shortName,
        source: 'Clinician-administered',
        maxScore: instDef.maxScore,
        timeFrame: instDef.timeFrame,
        citation: instDef.citation,
        copyright: instDef.copyright,
        caveat: instDef.caveat || null,
        bands: instDef.bands,
        recordsCount: records.length,
        hasTrend: records.length >= 2,
        records: records.map((r) => {
          const recObj = {
            id: r._id,
            date: r.administeredAt,
            score: r.totalScore,
            band: r.band,
            flags: r.flags || [],
            subscores: r.subscores || {},
            clinicianNote: r.clinicianNote || '',
          };

          if (instId === 'nsesss_ptsd' && includeNsesssEvent && r.extras?.traumaticEvent) {
            recObj.traumaticEvent = r.extras.traumaticEvent;
            recObj.traumaticEventDate = r.extras.traumaticEventDate;
          }

          return recObj;
        }),
        latestItemAnswers: wantsItemAnswers && latest.answers ? latest.answers : null,
      });
    });

    // 2. Fetch Self-Reported Assessments
    const selfSections = [];
    if (patient.linkedUser) {
      const { allowed, link } = await canClinicianView(patient.linkedUser, clinicianId);
      if (allowed && link) {
        await logPatientAccess(clinicianId, patient.linkedUser, 'report_generated');

        const selfQuery = { user: patient.linkedUser };
        if (dateRange) selfQuery.createdAt = dateRange;

        let sharedAssessments = [];
        if (link.shareScope === 'all') {
          sharedAssessments = await Assessment.find(selfQuery).sort({ createdAt: 1 }).lean();
        } else {
          sharedAssessments = await Assessment.find({
            ...selfQuery,
            _id: { $in: link.sharedAssessmentIds || [] },
          }).sort({ createdAt: 1 }).lean();
        }

        Object.keys(SELF_REPORT_CONFIGS).forEach((key) => {
          if (includeSelf && !includeSelf.includes(key)) return;

          const conf = SELF_REPORT_CONFIGS[key];
          const matches = sharedAssessments.filter((a) => {
            const slug = (a.disorderSlug || '').toLowerCase();
            const type = (a.assessmentType || '').toLowerCase();
            if (key === 'phq9') return slug.includes('depression') || type.includes('phq');
            if (key === 'gad7') return slug.includes('anxiety') || slug.includes('gad') || type.includes('gad');
            if (key === 'insomnia') return slug.includes('insomnia') || type.includes('isi');
            if (key === 'ptsd') return slug.includes('ptsd') || type.includes('pcl');
            if (key === 'ocd') return slug.includes('ocd') || type.includes('ybocs') || type.includes('y-bocs');
            return slug === conf.disorderSlug || type.includes(key);
          });

          // ONLY include if data exists!
          if (matches.length === 0) return;

          citations.add(`${conf.shortName}: ${conf.citation}`);

          const latest = matches[matches.length - 1];
          attendedSummary.push({
            instrument: conf.title,
            shortName: conf.shortName,
            source: 'Self-reported (Patient Shared)',
            count: matches.length,
            firstDate: matches[0].createdAt,
            latestDate: latest.createdAt,
            latestScore: latest.totalScore,
            maxScore: conf.maxScore,
            latestBand: latest.severity,
            hasSuicideFlag: matches.some((m) => m.itemNineFlag),
          });

          selfSections.push({
            key,
            title: conf.title,
            shortName: conf.shortName,
            source: 'Self-reported',
            maxScore: conf.maxScore,
            bands: conf.bands,
            hasTrend: matches.length >= 2,
            records: matches.map((m) => ({
              id: m._id,
              date: m.createdAt,
              score: m.totalScore,
              severity: m.severity,
              itemNineFlag: Boolean(m.itemNineFlag),
            })),
          });
        });
      }
    }

    // 3. Exercises (only items assigned or completed in range)
    let exerciseSections = null;
    if (includeExercises && patient.linkedUser) {
      const exQuery = { patientUser: patient.linkedUser, clinician: clinicianId };
      if (dateRange) exQuery.createdAt = dateRange;
      const exercises = await AssignedExercise.find(exQuery).sort({ createdAt: -1 }).lean();

      if (exercises.length > 0) {
        const cbtList = [];
        const cetList = [];

        exercises.forEach((item) => {
          const def = getExerciseById(item.exerciseId) || {};
          const isCet = def.group === 'cet';
          const entry = {
            id: item._id,
            title: def.title || item.exerciseId,
            category: def.category || '',
            status: item.status,
            skipReason: item.skipReason || null,
            moodBefore: item.moodBefore,
            moodAfter: item.moodAfter,
            createdAt: item.createdAt,
            completedAt: item.completedAt,
          };
          if (isCet) cetList.push(entry);
          else cbtList.push(entry);
        });

        // Omit sub-lists that are empty
        exerciseSections = {
          cbt: cbtList.length > 0 ? cbtList : null,
          cet: cetList.length > 0 ? cetList : null,
        };
      }
    }

    // 4. Notes
    let notesData = null;
    if (includeNotes) {
      const noteQuery = { clinician: clinicianId, patient: patient._id };
      if (dateRange) noteQuery.noteDate = dateRange;
      const notes = await ClinicianNote.find(noteQuery).sort({ noteDate: -1 }).lean();
      if (notes.length > 0) {
        notesData = notes.map((n) => ({
          id: n._id,
          date: n.noteDate || n.createdAt,
          text: n.text,
        }));
      }
    }

    const reportDate = new Date();
    const formattedDate = reportDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return res.json({
      success: true,
      data: {
        header: {
          patientName: patient.name,
          age: patient.age || null,
          gender: patient.gender || null,
          email: patient.email || null,
          phone: patient.phone || null,
          clinicianName: `${req.user.title ? req.user.title + ' ' : ''}${req.user.name}`,
          clinicianSpecialization: req.user.specialization || '',
          clinicianInstitution: req.user.institution || '',
          reportDate: reportDate.toISOString(),
          dateRange: dateRange ? { from: dateRange.$gte, to: dateRange.$lte } : null,
        },
        attendedSummary,
        clinicianSections,
        selfSections,
        exercises: exerciseSections,
        notes: notesData,
        citations: Array.from(citations),
        footer: `Screening scores are not diagnoses. Generated by CEST on ${formattedDate}.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientAvailableReportData,
  getPatientReport,
};
