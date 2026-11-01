const ClinicianLink = require('../models/ClinicianLink');
const Assessment = require('../models/Assessment');
const AssignedExercise = require('../models/AssignedExercise');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AttentionAck = require('../models/AttentionAck');
const { validateQualifyingSeverity, canClinicianView } = require('../utils/clinicianLinkHelpers');

const ATTENTION_CONFIG = {
  HIGHEST_BAND_WINDOW_DAYS: 14,
  INACTIVITY_WINDOW_DAYS: 14,
  OVERDUE_EXERCISES_THRESHOLD: 2,
  ACKNOWLEDGE_DURATION_DAYS: 7,
};

/**
 * Returns numeric rank of severity band for worsening check.
 */
const getBandRank = (instrumentKey, severityStr, score = 0) => {
  const sev = (severityStr || '').toLowerCase();
  const numScore = Number(score) || 0;

  switch (instrumentKey) {
    case 'phq9': {
      if (sev.includes('severe') && !sev.includes('moderately') || numScore >= 20) return 4;
      if (sev.includes('moderately severe') || (numScore >= 15 && numScore < 20)) return 3;
      if (sev.includes('moderate') || (numScore >= 10 && numScore < 15)) return 2;
      if (sev.includes('mild') || (numScore >= 5 && numScore < 10)) return 1;
      return 0;
    }
    case 'gad7': {
      if (sev.includes('severe') || numScore >= 15) return 3;
      if (sev.includes('moderate') || numScore >= 10) return 2;
      if (sev.includes('mild') || numScore >= 5) return 1;
      return 0;
    }
    case 'insomnia': {
      if (sev.includes('severe') || numScore >= 22) return 3;
      if (sev.includes('moderate') || numScore >= 15) return 2;
      if (sev.includes('subthreshold') || sev.includes('mild') || numScore >= 8) return 1;
      return 0;
    }
    case 'ptsd': {
      if (sev.includes('extreme') || numScore >= 65) return 4;
      if (sev.includes('severe') || numScore >= 49) return 3;
      if (sev.includes('moderate') || numScore >= 33) return 2;
      if (sev.includes('mild') || numScore >= 11) return 1;
      return 0;
    }
    case 'ocd': {
      if (sev.includes('extreme') || numScore >= 32) return 4;
      if (sev.includes('severe') || numScore >= 24) return 3;
      if (sev.includes('moderate') || numScore >= 16) return 2;
      if (sev.includes('mild') || numScore >= 8) return 1;
      return 0;
    }
    default:
      return 0;
  }
};

const getScaleKey = (assessment) => {
  const type = (assessment.assessmentType || '').toLowerCase();
  const slug = (assessment.disorderSlug || '').toLowerCase();
  if (slug.includes('depression') || type.includes('phq')) return 'phq9';
  if (slug.includes('anxiety') || slug.includes('gad') || type.includes('gad')) return 'gad7';
  if (slug.includes('insomnia') || type.includes('isi')) return 'insomnia';
  if (slug.includes('ptsd') || type.includes('pcl')) return 'ptsd';
  if (slug.includes('ocd') || type.includes('ybocs') || type.includes('y-bocs')) return 'ocd';
  return 'general';
};

/**
 * @desc    Get Needs-Attention list for logged-in clinician
 * @route   GET /api/clinician/attention
 * @access  Private (Clinician)
 * SECURITY NOTE: Strictly filtered by clinician: req.user._id and status: 'accepted'.
 * Only uses data allowed by link.shareScope. Never exposes item answers.
 */
const getNeedsAttentionList = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const now = new Date();
    const highestBandCutoff = new Date(now.getTime() - ATTENTION_CONFIG.HIGHEST_BAND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const inactivityCutoff = new Date(now.getTime() - ATTENTION_CONFIG.INACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    // 1. Fetch all accepted links for this clinician
    const links = await ClinicianLink.find({
      clinician: clinicianId,
      status: 'accepted',
    }).populate('patientUser', 'name email');

    const activeList = [];
    const acknowledgedList = [];

    for (const link of links) {
      const patientUserId = link.patientUser?._id || link.patientUser;
      if (!patientUserId) continue;

      const patientName = link.patientUser?.name || 'Linked Patient';

      // Find Patient record (if mapped)
      const patientRecord = await Patient.findOne({
        clinician: clinicianId,
        linkedUser: patientUserId,
      }).select('_id name');

      const patientId = patientRecord?._id || null;

      // Fetch shared assessments respecting shareScope
      const assessQuery = { user: patientUserId };
      if (link.shareScope === 'selected') {
        const allowedIds = Array.isArray(link.sharedAssessmentIds) ? link.sharedAssessmentIds : [];
        assessQuery._id = { $in: allowedIds };
      }

      // Filter: user === patientUserId && in shareScope
      const sharedAssessments = await Assessment.find(assessQuery)
        .select('_id assessmentType disorderSlug totalScore severity answers itemNineFlag createdAt')
        .sort({ createdAt: -1 });

      // Fetch assigned exercises for this patient by this clinician
      // Filter: clinician === clinicianId && patientUser === patientUserId
      const assignedExercises = await AssignedExercise.find({
        clinician: clinicianId,
        patientUser: patientUserId,
      }).sort({ createdAt: -1 });

      const reasons = [];

      // Reason 1: Highest-band result in last 14 days (Priority: high)
      for (const a of sharedAssessments) {
        const aDate = new Date(a.createdAt);
        if (aDate >= highestBandCutoff) {
          const qual = validateQualifyingSeverity(a);
          if (qual.isLastBand) {
            reasons.push({
              code: 'highest_band',
              priority: 'high',
              text: `Highest-band result on ${a.assessmentType || 'Assessment'} (${a.severity}, score ${a.totalScore}) on ${aDate.toLocaleDateString()}`,
              date: aDate,
            });
            break; // Report most recent last-band occurrence
          }
        }
      }

      // Reason 2: PHQ-9 Item 9 positive in shared result (Priority: high)
      for (const a of sharedAssessments) {
        const slug = (a.disorderSlug || '').toLowerCase();
        const type = (a.assessmentType || '').toLowerCase();
        if (slug.includes('depression') || type.includes('phq')) {
          let hasCrisis = a.itemNineFlag;
          if (hasCrisis === undefined || hasCrisis === null) {
            hasCrisis = Array.isArray(a.answers) && a.answers.length >= 9 && Number(a.answers[8]) > 0;
          }
          if (hasCrisis) {
            const aDate = new Date(a.createdAt);
            reasons.push({
              code: 'item_9_positive',
              priority: 'high',
              text: `Elevated crisis/self-harm thoughts indicated on PHQ-9 (Item 9) on ${aDate.toLocaleDateString()}`,
              date: aDate,
            });
            break;
          }
        }
      }

      // Reason 3: Worsening on any scale compared to previous result (Priority: medium)
      const scaleGroups = {};
      for (const a of sharedAssessments) {
        const sk = getScaleKey(a);
        if (!scaleGroups[sk]) scaleGroups[sk] = [];
        scaleGroups[sk].push(a);
      }

      for (const [sk, group] of Object.entries(scaleGroups)) {
        if (group.length >= 2) {
          const latest = group[0];
          const previous = group[1];
          const rankLatest = getBandRank(sk, latest.severity, latest.totalScore);
          const rankPrevious = getBandRank(sk, previous.severity, previous.totalScore);

          if (rankLatest > rankPrevious) {
            const aDate = new Date(latest.createdAt);
            reasons.push({
              code: 'worsening',
              priority: 'medium',
              text: `Worsened from ${previous.severity} to ${latest.severity} on ${latest.assessmentType || sk.toUpperCase()} on ${aDate.toLocaleDateString()}`,
              date: aDate,
            });
          }
        }
      }

      // Reason 4: Two or more overdue exercises (Priority: medium)
      const overdueExercises = assignedExercises.filter((ex) => {
        return (
          (ex.status === 'assigned' || ex.status === 'in_progress') &&
          ex.dueDate &&
          new Date(ex.dueDate) < now
        );
      });

      if (overdueExercises.length >= ATTENTION_CONFIG.OVERDUE_EXERCISES_THRESHOLD) {
        const oldestDueDate = overdueExercises.reduce((oldest, ex) => {
          const d = new Date(ex.dueDate);
          return d < oldest ? d : oldest;
        }, new Date(overdueExercises[0].dueDate));

        reasons.push({
          code: 'overdue_exercises',
          priority: 'medium',
          text: `${overdueExercises.length} assigned exercises past due date (oldest due ${oldestDueDate.toLocaleDateString()})`,
          date: oldestDueDate,
        });
      }

      // Reason 5: No activity for 14 days or more while link is active (Priority: low)
      let latestActivityDate = new Date(link.respondedAt || link.updatedAt || link.createdAt);
      if (sharedAssessments.length > 0) {
        const latestAssessDate = new Date(sharedAssessments[0].createdAt);
        if (latestAssessDate > latestActivityDate) latestActivityDate = latestAssessDate;
      }
      for (const ex of assignedExercises) {
        const exDate = new Date(ex.completedAt || ex.startedAt || ex.updatedAt);
        if (exDate > latestActivityDate) latestActivityDate = exDate;
      }

      if (latestActivityDate < inactivityCutoff) {
        const daysInactive = Math.floor((now.getTime() - latestActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        reasons.push({
          code: 'inactivity',
          priority: 'low',
          text: `No assessment or exercise activity recorded for ${daysInactive} days (last active ${latestActivityDate.toLocaleDateString()})`,
          date: latestActivityDate,
        });
      }

      // If patient has any reasons, calculate priority and check acknowledgement
      if (reasons.length > 0) {
        let overallPriority = 'low';
        if (reasons.some((r) => r.priority === 'high')) overallPriority = 'high';
        else if (reasons.some((r) => r.priority === 'medium')) overallPriority = 'medium';

        // Check if acknowledged
        const ack = await AttentionAck.findOne({
          clinician: clinicianId,
          patientUser: patientUserId,
        });

        let isAcknowledged = false;
        if (ack && new Date(ack.until) > now) {
          isAcknowledged = true;
          // Check if a NEW high-priority reason occurred AFTER acknowledgment
          const highReasons = reasons.filter((r) => r.priority === 'high');
          if (highReasons.length > 0) {
            const latestHighDate = highReasons.reduce((latest, r) => {
              const d = new Date(r.date);
              return d > latest ? d : latest;
            }, new Date(0));

            const ackRefDate = ack.lastAcknowledgedHighPriorityDate
              ? new Date(ack.lastAcknowledgedHighPriorityDate)
              : new Date(ack.acknowledgedAt);

            if (latestHighDate > ackRefDate) {
              isAcknowledged = false; // New critical alert brings patient back up!
            }
          }
        }

        const patientEntry = {
          patientUserId: String(patientUserId),
          patientId: patientId ? String(patientId) : null,
          name: patientName,
          priority: overallPriority,
          reasons: reasons.sort((a, b) => new Date(b.date) - new Date(a.date)),
          acknowledged: isAcknowledged,
          acknowledgedUntil: isAcknowledged && ack ? ack.until : null,
        };

        if (isAcknowledged) {
          acknowledgedList.push(patientEntry);
        } else {
          activeList.push(patientEntry);
        }
      }
    }

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const sortPatients = (list) =>
      list.sort((a, b) => {
        const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diff !== 0) return diff;
        const bDate = b.reasons[0]?.date ? new Date(b.reasons[0].date).getTime() : 0;
        const aDate = a.reasons[0]?.date ? new Date(a.reasons[0].date).getTime() : 0;
        return bDate - aDate;
      });

    return res.status(200).json({
      success: true,
      data: {
        active: sortPatients(activeList),
        acknowledged: sortPatients(acknowledgedList),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute needs-attention alerts',
    });
  }
};

/**
 * @desc    Acknowledge a patient's attention alerts for 7 days
 * @route   POST /api/clinician/attention/:patientUserId/acknowledge
 * @access  Private (Clinician)
 * SECURITY NOTE: Checks canClinicianView before acknowledging.
 */
const acknowledgePatientAttention = async (req, res) => {
  try {
    const clinicianId = req.user._id || req.user.id;
    const { patientUserId } = req.params;

    // Strict access check: only accepted links
    const { allowed } = await canClinicianView(patientUserId, clinicianId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: No active accepted link exists with this patient account',
      });
    }

    const now = new Date();
    const until = new Date(now.getTime() + ATTENTION_CONFIG.ACKNOWLEDGE_DURATION_DAYS * 24 * 60 * 60 * 1000);

    // Save or update AttentionAck
    const ack = await AttentionAck.findOneAndUpdate(
      { clinician: clinicianId, patientUser: patientUserId },
      {
        $set: {
          until,
          acknowledgedAt: now,
          lastAcknowledgedHighPriorityDate: now,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Alerts acknowledged for 7 days (until ${until.toLocaleDateString()})`,
      data: ack,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to acknowledge attention alert',
    });
  }
};

module.exports = {
  ATTENTION_CONFIG,
  getNeedsAttentionList,
  acknowledgePatientAttention,
};
