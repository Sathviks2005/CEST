import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PHQ9Assessment } from '../components/assessment/PHQ9Assessment';
import { GAD7Assessment } from '../components/assessment/GAD7Assessment';
import { ADHDAssessment } from '../components/assessment/ADHDAssessment';
import { OCDAssessment } from '../components/assessment/OCDAssessment';
import { PTSDAssessment } from '../components/assessment/PTSDAssessment';
import { InsomniaAssessment } from '../components/assessment/InsomniaAssessment';
import { assessmentService } from '../services/assessmentService';
import { exerciseService } from '../services/exerciseService';
import { clinicianLinkService } from '../services/clinicianLinkService';
import { assignedExerciseService } from '../services/assignedExerciseService';
import { ClinicianConnectModal } from '../components/exercise/interactive/ClinicianConnectModal';
import { ClinicianContactCard } from '../components/exercise/interactive/ClinicianContactCard';
import { DepressionSeverityActivities } from '../components/exercise/DepressionSeverityActivities';
import { CognitiveEnhancementSection } from '../components/exercise/CognitiveEnhancementSection';
import { PatientAssignedExercisesSection } from '../components/exercise/PatientAssignedExercisesSection';
import { ExerciseLauncher } from '../components/exercise/ExerciseLauncher';
import { EXERCISES, getExerciseRecommendation, CET_ACADEMIC_NOTICE } from '../data/exerciseData';
import { getSeverityColor as getPHQ9SeverityColor } from '../data/phq9Questions';
import { getSeverityColor as getGAD7SeverityColor } from '../utils/gad7Scoring';
import { getSeverityColor as getADHDSeverityColor } from '../utils/adhdScoring';
import { getSeverityColor as getOCDSeverityColor } from '../utils/ybocsScoring';
import { getSeverityColor as getPTSDSeverityColor } from '../utils/pcl5Scoring';
import { getSeverityColor as getInsomniaSeverityColor } from '../utils/isiScoring';
import {
  FaUser,
  FaUserMd,
  FaClipboardList,
  FaChartLine,
  FaBrain,
  FaBell,
  FaCog,
  FaSmile,
  FaInfoCircle,
  FaSave,
  FaCheckCircle,
  FaPlay,
  FaCloudRain,
  FaTachometerAlt,
  FaBullseye,
  FaClock,
  FaShieldAlt,
  FaArrowRight,
  FaWind,
  FaBolt,
  FaSyncAlt,
  FaMoon,
  FaEnvelope,
  FaBuilding,
  FaStethoscope,
  FaTimesCircle,
  FaSlidersH,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaTasks,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaHistory,
} from 'react-icons/fa';

export const SelfUserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedDisorderFromNav = location.state?.disorder;
  const actionRequested = location.state?.action;
  const isDepressionFlow =
    actionRequested === 'start_assessment' &&
    String(selectedDisorderFromNav || '')
      .toLowerCase()
      .includes('depression');
  const isAnxietyFlow =
    actionRequested === 'start_assessment' &&
    (String(selectedDisorderFromNav || '').toLowerCase().includes('anxiety') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('gad'));
  const isADHDFlow =
    actionRequested === 'start_assessment' &&
    (String(selectedDisorderFromNav || '').toLowerCase().includes('adhd') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('attention'));
  const isOCDFlow =
    actionRequested === 'start_assessment' &&
    (String(selectedDisorderFromNav || '').toLowerCase().includes('ocd') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('obsessive'));
  const isPTSDFlow =
    actionRequested === 'start_assessment' &&
    (String(selectedDisorderFromNav || '').toLowerCase().includes('ptsd') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('post-traumatic') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('trauma'));
  const isInsomniaFlow =
    actionRequested === 'start_assessment' &&
    (String(selectedDisorderFromNav || '').toLowerCase().includes('insomnia') ||
      String(selectedDisorderFromNav || '').toLowerCase().includes('sleep'));

  const [activeTab, setActiveTab] = useState(
    isDepressionFlow || isAnxietyFlow || isADHDFlow || isOCDFlow || isPTSDFlow || isInsomniaFlow ? 'assessments' : 'overview'
  );
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savedMsg, setSavedMsg] = useState(false);
  const [takingPHQ9, setTakingPHQ9] = useState(isDepressionFlow);
  const [takingGAD7, setTakingGAD7] = useState(isAnxietyFlow);
  const [takingADHD, setTakingADHD] = useState(isADHDFlow);
  const [takingOCD, setTakingOCD] = useState(isOCDFlow);
  const [takingPTSD, setTakingPTSD] = useState(isPTSDFlow);
  const [takingInsomnia, setTakingInsomnia] = useState(isInsomniaFlow);
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [cooldownInfo, setCooldownInfo] = useState(null);
  const [anxietyCooldownInfo, setAnxietyCooldownInfo] = useState(null);
  const [adhdCooldownInfo, setAdhdCooldownInfo] = useState(null);
  const [ocdCooldownInfo, setOcdCooldownInfo] = useState(null);
  const [ptsdCooldownInfo, setPtsdCooldownInfo] = useState(null);
  const [insomniaCooldownInfo, setInsomniaCooldownInfo] = useState(null);

  const loadCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('depression');
      if (res?.data) {
        setCooldownInfo(res.data);
      }
    } catch {
      setCooldownInfo(null);
    }
  };

  const loadAnxietyCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('generalized-anxiety-disorder');
      if (res?.data) {
        setAnxietyCooldownInfo(res.data);
      }
    } catch {
      setAnxietyCooldownInfo(null);
    }
  };

  const loadAdhdCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('adhd');
      if (res?.data) {
        setAdhdCooldownInfo(res.data);
      }
    } catch {
      setAdhdCooldownInfo(null);
    }
  };

  const loadOcdCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('ocd');
      if (res?.data) {
        setOcdCooldownInfo(res.data);
      }
    } catch {
      setOcdCooldownInfo(null);
    }
  };

  const loadPtsdCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('ptsd');
      if (res?.data) {
        setPtsdCooldownInfo(res.data);
      }
    } catch {
      setPtsdCooldownInfo(null);
    }
  };

  const loadInsomniaCooldownInfo = async () => {
    try {
      const res = await assessmentService.getCooldownStatus('insomnia');
      if (res?.data) {
        setInsomniaCooldownInfo(res.data);
      }
    } catch {
      setInsomniaCooldownInfo(null);
    }
  };

  const loadAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await assessmentService.getMyAssessments();
      setAssessments(res.data || []);
    } catch {
      setAssessments([]);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const loadExerciseProgress = async () => {
    setLoadingProgress(true);
    try {
      const res = await exerciseService.getMyProgress();
      setExerciseProgress(res.data || null);
    } catch {
      setExerciseProgress(null);
    } finally {
      setLoadingProgress(false);
    }
  };

  const [clinicianLinks, setClinicianLinks] = useState([]);
  const [clinicianInvites, setClinicianInvites] = useState([]);
  const [openInvitesCount, setOpenInvitesCount] = useState(0);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [revokingLink, setRevokingLink] = useState(false);
  const [togglingAlert, setTogglingAlert] = useState(false);
  const [accessLogs, setAccessLogs] = useState([]);

  // Modal controls
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectModalMode, setConnectModalMode] = useState('connect');
  const [activeInviteForModal, setActiveInviteForModal] = useState(null);
  const [activeLinkForModal, setActiveLinkForModal] = useState(null);

  const [assignedExercises, setAssignedExercises] = useState([]);
  const [openAssignmentsCount, setOpenAssignmentsCount] = useState(0);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [activeAssignmentToLaunch, setActiveAssignmentToLaunch] = useState(null);

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await assignedExerciseService.getMyAssignments();
      setAssignedExercises(res.data || []);
      const countRes = await assignedExerciseService.getPatientCounts();
      setOpenAssignmentsCount(countRes?.data?.openAssignments || 0);
    } catch {
      setAssignedExercises([]);
      setOpenAssignmentsCount(0);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleStartAssignment = async (asgn) => {
    try {
      if (asgn.status === 'assigned') {
        await assignedExerciseService.startAssignment(asgn._id || asgn.id);
        await loadAssignments();
      }
    } catch (err) {
      console.error('Failed to update assignment to in_progress:', err);
    }
    setActiveAssignmentToLaunch(asgn);
  };

  const handleCompleteAssignment = async (payload) => {
    if (!activeAssignmentToLaunch) return;
    try {
      await assignedExerciseService.completeAssignment(
        activeAssignmentToLaunch._id || activeAssignmentToLaunch.id,
        payload
      );
      await loadAssignments();
    } catch (err) {
      console.error('Failed to complete assignment:', err);
    } finally {
      setActiveAssignmentToLaunch(null);
    }
  };

  const handleSkipAssignment = async (reason) => {
    if (!activeAssignmentToLaunch) return;
    try {
      await assignedExerciseService.skipAssignment(
        activeAssignmentToLaunch._id || activeAssignmentToLaunch.id,
        reason
      );
      await loadAssignments();
    } catch (err) {
      console.error('Failed to skip assignment:', err);
    } finally {
      setActiveAssignmentToLaunch(null);
    }
  };

  const fetchNotificationCounts = async () => {
    try {
      const res = await clinicianLinkService.getCounts();
      if (res?.data?.openInvites !== undefined) {
        setOpenInvitesCount(res.data.openInvites);
      }
      const countRes = await assignedExerciseService.getPatientCounts();
      if (countRes?.data?.openAssignments !== undefined) {
        setOpenAssignmentsCount(countRes.data.openAssignments);
      }
    } catch {
      // offline fallback
    }
  };

  const loadClinicianLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await clinicianLinkService.getMyLinks();
      setClinicianLinks(res?.data || []);
      setClinicianInvites(res?.invites || []);
      fetchNotificationCounts();

      try {
        const logsRes = await clinicianLinkService.getAccessLogs();
        setAccessLogs(logsRes?.data || []);
      } catch {
        setAccessLogs([]);
      }
    } catch {
      setClinicianLinks([]);
      setClinicianInvites([]);
      setAccessLogs([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  // 60-second polling for badge counts while visible and instant link update listener
  useEffect(() => {
    loadClinicianLinks();
    loadAssignments();
    fetchNotificationCounts();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotificationCounts();
      }
    }, 60000);

    const handleLinkUpdated = () => {
      loadClinicianLinks();
      fetchNotificationCounts();
      loadAssignments();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cest:clinician-link-updated', handleLinkUpdated);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('cest:clinician-link-updated', handleLinkUpdated);
      }
    };
  }, []);

  const handleStopSharing = async (linkId) => {
    if (
      !window.confirm(
        'Are you sure you want to stop sharing your assessment records with your clinician? They will lose access immediately.'
      )
    ) {
      return;
    }
    setRevokingLink(true);
    try {
      await clinicianLinkService.revokeLink(linkId);
      await loadClinicianLinks();
    } catch {
      alert('Failed to revoke sharing.');
    } finally {
      setRevokingLink(false);
    }
  };

  const handleCancelLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to cancel this pending connection request?')) {
      return;
    }
    try {
      await clinicianLinkService.cancelLink(linkId);
      await loadClinicianLinks();
    } catch {
      alert('Failed to cancel connection request.');
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    if (!window.confirm('Are you sure you want to decline this connection invitation?')) {
      return;
    }
    try {
      await clinicianLinkService.declineInvite(inviteId);
      await loadClinicianLinks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline invitation.');
    }
  };

  const handleToggleAlertOptIn = async (link) => {
    setTogglingAlert(true);
    try {
      await clinicianLinkService.updateSharing(link._id || link.id, {
        alertOnHighestBand: !link.alertOnHighestBand,
      });
      await loadClinicianLinks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update alert settings.');
    } finally {
      setTogglingAlert(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === 'assessments' ||
      activeTab === 'overview' ||
      activeTab === 'progress' ||
      activeTab === 'enhancement' ||
      activeTab === 'clinician'
    ) {
      loadAssessments();
      loadExerciseProgress();
      loadCooldownInfo();
      loadAnxietyCooldownInfo();
      loadAdhdCooldownInfo();
      loadOcdCooldownInfo();
      loadPtsdCooldownInfo();
      loadInsomniaCooldownInfo();
      loadClinicianLinks();
      loadAssignments();
    }
  }, [activeTab]);

  useEffect(() => {
    if (isDepressionFlow) {
      setActiveTab('assessments');
      setTakingPHQ9(true);
      setTakingGAD7(false);
      setTakingADHD(false);
      setTakingOCD(false);
      setTakingPTSD(false);
      setTakingInsomnia(false);
    }
  }, [isDepressionFlow]);

  useEffect(() => {
    if (isAnxietyFlow) {
      setActiveTab('assessments');
      setTakingGAD7(true);
      setTakingPHQ9(false);
      setTakingADHD(false);
      setTakingOCD(false);
      setTakingPTSD(false);
      setTakingInsomnia(false);
    }
  }, [isAnxietyFlow]);

  useEffect(() => {
    if (isADHDFlow) {
      setActiveTab('assessments');
      setTakingADHD(true);
      setTakingPHQ9(false);
      setTakingGAD7(false);
      setTakingOCD(false);
      setTakingPTSD(false);
      setTakingInsomnia(false);
    }
  }, [isADHDFlow]);

  useEffect(() => {
    if (isOCDFlow) {
      setActiveTab('assessments');
      setTakingOCD(true);
      setTakingPHQ9(false);
      setTakingGAD7(false);
      setTakingADHD(false);
      setTakingPTSD(false);
      setTakingInsomnia(false);
    }
  }, [isOCDFlow]);

  useEffect(() => {
    if (isPTSDFlow) {
      setActiveTab('assessments');
      setTakingPTSD(true);
      setTakingPHQ9(false);
      setTakingGAD7(false);
      setTakingADHD(false);
      setTakingOCD(false);
      setTakingInsomnia(false);
    }
  }, [isPTSDFlow]);

  useEffect(() => {
    if (isInsomniaFlow) {
      setActiveTab('assessments');
      setTakingInsomnia(true);
      setTakingPHQ9(false);
      setTakingGAD7(false);
      setTakingADHD(false);
      setTakingOCD(false);
      setTakingPTSD(false);
    }
  }, [isInsomniaFlow]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    await updateProfile({ name: profileName, bio: profileBio, phone: profilePhone });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const depressionAssessments = assessments.filter(
    (a) => a.disorderSlug === 'depression' || a.assessmentType?.includes('PHQ-9')
  );
  const anxietyAssessments = assessments.filter(
    (a) =>
      a.disorderSlug === 'generalized-anxiety-disorder' || a.assessmentType?.includes('GAD-7')
  );
  const adhdAssessments = assessments.filter(
    (a) => a.disorderSlug === 'adhd' || a.assessmentType?.includes('ASRS')
  );
  const ocdAssessments = assessments.filter(
    (a) => a.disorderSlug === 'ocd' || a.assessmentType?.includes('Y-BOCS')
  );
  const ptsdAssessments = assessments.filter(
    (a) => a.disorderSlug === 'ptsd' || a.assessmentType?.includes('PCL-5')
  );
  const insomniaAssessments = assessments.filter(
    (a) => a.disorderSlug === 'insomnia' || a.assessmentType?.includes('ISI')
  );
  const latestDepression = depressionAssessments[0];
  const latestAnxiety = anxietyAssessments[0];
  const latestADHD = adhdAssessments[0];
  const latestOCD = ocdAssessments[0];
  const latestPTSD = ptsdAssessments[0];
  const latestInsomnia = insomniaAssessments[0];

  const acceptedClinicianLink = clinicianLinks.find((l) => l.status === 'accepted');
  const pendingClinicianLink = clinicianLinks.find((l) => l.status === 'pending');
  const declinedClinicianLink = clinicianLinks.find((l) => l.status === 'declined');
  const pastClinicianLinks = clinicianLinks.filter((l) =>
    ['declined', 'cancelled', 'expired', 'revoked'].includes(l.status)
  );
  const latestPastLink = pastClinicianLinks[0];

  return (
    <div className="space-y-8">
      {/* Welcome Screen */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-200/80 dark:border-brand-900/60 bg-gradient-to-r from-brand-600/10 via-tealBrand-500/10 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <FaSmile className="text-amber-500" />
              <span>Self User Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back, {user?.name || 'Self User'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Empowering your personal mental well-being and cognitive performance tracking.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Status: Active Self User</span>
          </div>
        </div>

        {selectedDisorderFromNav && (
          <div className="mt-4 p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-900 dark:text-tealBrand-200 text-xs sm:text-sm flex items-center justify-between gap-3">
            <span>
              {String(selectedDisorderFromNav).toLowerCase().includes('depression')
                ? `PHQ-9 depression assessment is ready for ${selectedDisorderFromNav}.`
                : String(selectedDisorderFromNav).toLowerCase().includes('anxiety') || String(selectedDisorderFromNav).toLowerCase().includes('gad')
                  ? `GAD-7 anxiety assessment is ready for ${selectedDisorderFromNav}.`
                  : String(selectedDisorderFromNav).toLowerCase().includes('adhd') || String(selectedDisorderFromNav).toLowerCase().includes('attention')
                    ? `ASRS-v1.1 ADHD assessment is ready for ${selectedDisorderFromNav}.`
                    : String(selectedDisorderFromNav).toLowerCase().includes('ocd') || String(selectedDisorderFromNav).toLowerCase().includes('obsessive')
                      ? `Y-BOCS OCD assessment is ready for ${selectedDisorderFromNav}.`
                      : String(selectedDisorderFromNav).toLowerCase().includes('ptsd') || String(selectedDisorderFromNav).toLowerCase().includes('post-traumatic') || String(selectedDisorderFromNav).toLowerCase().includes('trauma')
                        ? `PCL-5 PTSD assessment is ready for ${selectedDisorderFromNav}.`
                        : String(selectedDisorderFromNav).toLowerCase().includes('insomnia') || String(selectedDisorderFromNav).toLowerCase().includes('sleep')
                          ? `ISI Insomnia assessment is ready for ${selectedDisorderFromNav}.`
                          : `Assessment for ${selectedDisorderFromNav} will be available soon.`}
            </span>
            {String(selectedDisorderFromNav).toLowerCase().includes('depression') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingPHQ9(true);
                  setTakingGAD7(false);
                  setTakingADHD(false);
                  setTakingOCD(false);
                  setTakingPTSD(false);
                  setTakingInsomnia(false);
                }}
                className="font-bold text-xs bg-tealBrand-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start PHQ-9
              </button>
            )}
            {(String(selectedDisorderFromNav).toLowerCase().includes('anxiety') || String(selectedDisorderFromNav).toLowerCase().includes('gad')) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingGAD7(true);
                  setTakingPHQ9(false);
                  setTakingADHD(false);
                  setTakingOCD(false);
                  setTakingPTSD(false);
                  setTakingInsomnia(false);
                }}
                className="font-bold text-xs bg-tealBrand-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start GAD-7
              </button>
            )}
            {(String(selectedDisorderFromNav).toLowerCase().includes('adhd') || String(selectedDisorderFromNav).toLowerCase().includes('attention')) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingADHD(true);
                  setTakingPHQ9(false);
                  setTakingGAD7(false);
                  setTakingOCD(false);
                  setTakingPTSD(false);
                  setTakingInsomnia(false);
                }}
                className="font-bold text-xs bg-amber-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start ASRS-v1.1
              </button>
            )}
            {(String(selectedDisorderFromNav).toLowerCase().includes('ocd') || String(selectedDisorderFromNav).toLowerCase().includes('obsessive')) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingOCD(true);
                  setTakingPHQ9(false);
                  setTakingGAD7(false);
                  setTakingADHD(false);
                  setTakingPTSD(false);
                  setTakingInsomnia(false);
                }}
                className="font-bold text-xs bg-tealBrand-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start Y-BOCS
              </button>
            )}
            {(String(selectedDisorderFromNav).toLowerCase().includes('ptsd') || String(selectedDisorderFromNav).toLowerCase().includes('post-traumatic') || String(selectedDisorderFromNav).toLowerCase().includes('trauma')) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingPTSD(true);
                  setTakingPHQ9(false);
                  setTakingGAD7(false);
                  setTakingADHD(false);
                  setTakingOCD(false);
                  setTakingInsomnia(false);
                }}
                className="font-bold text-xs bg-tealBrand-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start PCL-5
              </button>
            )}
            {(String(selectedDisorderFromNav).toLowerCase().includes('insomnia') || String(selectedDisorderFromNav).toLowerCase().includes('sleep')) && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assessments');
                  setTakingInsomnia(true);
                  setTakingPHQ9(false);
                  setTakingGAD7(false);
                  setTakingADHD(false);
                  setTakingOCD(false);
                  setTakingPTSD(false);
                }}
                className="font-bold text-xs bg-tealBrand-600 text-white px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                Start ISI
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: FaBrain },
          ...(acceptedClinicianLink
            ? [
                {
                  id: 'assignments',
                  label: 'From Clinician',
                  icon: FaTasks,
                  badge: openAssignmentsCount > 0 ? openAssignmentsCount : null,
                },
              ]
            : []),
          { id: 'clinician', label: 'My Clinician', icon: FaUserMd, badge: openInvitesCount },
          { id: 'profile', label: 'User Profile', icon: FaUser },
          { id: 'assessments', label: 'Assessments', icon: FaClipboardList },
          { id: 'progress', label: 'Progress Tracking', icon: FaChartLine },
          { id: 'enhancement', label: 'Cognitive Enhancement', icon: FaBrain },
          { id: 'notifications', label: 'Notifications', icon: FaBell },
          { id: 'settings', label: 'Settings', icon: FaCog },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Completed Assessments</span>
                <FaClipboardList className="text-brand-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {assessments.length}
              </p>
              <p className="text-[11px] text-slate-400">
                {latestDepression
                  ? `Latest PHQ-9: ${latestDepression.totalScore}/27`
                  : latestAnxiety
                    ? `Latest GAD-7: ${latestAnxiety.totalScore ?? latestAnxiety.score}/21`
                    : 'Start an assessment under Assessments'}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Cognitive Practice Sessions</span>
                <FaBrain className="text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {exerciseProgress?.totalCompleted || 0}
              </p>
              <p className="text-[11px] text-slate-400">Practice exercise activity (non-clinical)</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Enhancement Plan</span>
                <FaChartLine className="text-purple-500" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Standard Focus</p>
              <p className="text-[11px] text-slate-400">Working memory & stamina</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Unread Notifications</span>
                <FaBell className="text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1</p>
              <p className="text-[11px] text-slate-400">Welcome to CEST platform</p>
            </div>
          </div>

          {/* MY CLINICIAN CARD IN OVERVIEW */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/30 flex items-center justify-center text-lg">
                  <FaUserMd />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    My Clinician
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clinical connection & shared evaluation records
                  </p>
                </div>
              </div>

              {acceptedClinicianLink ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <FaCheckCircle /> Connected
                </span>
              ) : pendingClinicianLink ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <FaClock /> Request Pending
                </span>
              ) : openInvitesCount > 0 ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <FaEnvelope /> {openInvitesCount} Invite Waiting
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                  Not Linked
                </span>
              )}
            </div>

            {clinicianInvites.length > 0 && (
              <div className="p-4 rounded-2xl bg-tealBrand-500/10 border border-tealBrand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FaEnvelope className="text-tealBrand-500 text-sm shrink-0" />
                  <p className="text-tealBrand-900 dark:text-tealBrand-200 font-semibold">
                    You have {clinicianInvites.length} pending clinician {clinicianInvites.length === 1 ? 'invitation' : 'invitations'} to connect.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('clinician')}
                  className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow transition-all shrink-0"
                >
                  Review Invitations
                </button>
              </div>
            )}

            {acceptedClinicianLink ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {acceptedClinicianLink.clinician?.title ? `${acceptedClinicianLink.clinician.title} ` : ''}
                      {acceptedClinicianLink.clinician?.name}
                    </p>
                    {acceptedClinicianLink.clinician?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <FaCheckCircle className="text-[9px]" /> Credentials verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                        <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {acceptedClinicianLink.clinician?.specialization} &bull; {acceptedClinicianLink.clinician?.institution}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Connected on {new Date(acceptedClinicianLink.respondedAt || acceptedClinicianLink.updatedAt).toLocaleDateString()} &bull; Sharing:{' '}
                    <strong className="text-tealBrand-600 dark:text-tealBrand-400 font-semibold">
                      {acceptedClinicianLink.shareScope === 'all'
                        ? 'All results, including future ones'
                        : `${(acceptedClinicianLink.sharedAssessmentIds || []).length} selected results`}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clinician')}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    Manage Link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStopSharing(acceptedClinicianLink._id || acceptedClinicianLink.id)}
                    disabled={revokingLink}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shrink-0 disabled:opacity-50"
                  >
                    {revokingLink ? 'Stopping...' : 'Stop Sharing'}
                  </button>
                </div>
              </div>
            ) : pendingClinicianLink ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Connection Request Pending with {pendingClinicianLink.clinician?.title ? `${pendingClinicianLink.clinician.title} ` : ''}{pendingClinicianLink.clinician?.name}
                    </p>
                    {pendingClinicianLink.clinician?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <FaCheckCircle className="text-[9px]" /> Credentials verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                        <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Submitted on {new Date(pendingClinicianLink.createdAt).toLocaleDateString()}. The clinician will see this the next time they log in.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clinician')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelLink(pendingClinicianLink._id || pendingClinicianLink.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 font-semibold text-xs transition-all"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ) : latestPastLink ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Previous connection {latestPastLink.status === 'revoked' ? 'revoked' : latestPastLink.status === 'declined' ? 'declined' : latestPastLink.status} with {latestPastLink.clinician?.title ? `${latestPastLink.clinician.title} ` : ''}{latestPastLink.clinician?.name || 'Clinician'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {latestPastLink.status === 'revoked'
                      ? 'Sharing was stopped. Your past assessment records are no longer accessible to this practitioner.'
                      : latestPastLink.status === 'declined'
                      ? `Request was declined on ${new Date(latestPastLink.respondedAt || latestPastLink.updatedAt).toLocaleDateString()}.`
                      : `Link ended on ${new Date(latestPastLink.updatedAt || latestPastLink.createdAt).toLocaleDateString()}.`}
                  </p>
                  {latestPastLink.clinicianNote && (
                    <p className="text-[11px] text-slate-400 italic">
                      Clinician note: "{latestPastLink.clinicianNote}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('clinician')}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                  >
                    View History
                  </button>
                  <button
                    type="button"
                    id="connect-clinician-overview-btn"
                    onClick={() => {
                      setConnectModalMode('connect');
                      setActiveInviteForModal(null);
                      setActiveLinkForModal(null);
                      setConnectModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <FaUserMd /> Connect
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    You are not connected to a clinician yet.
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    You can request a connection at any time to share your completed screening assessments and receive professional clinical review.
                  </p>
                </div>
                <button
                  type="button"
                  id="connect-clinician-overview-btn"
                  onClick={() => {
                    setConnectModalMode('connect');
                    setActiveInviteForModal(null);
                    setActiveLinkForModal(null);
                    setConnectModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <FaUserMd /> Connect
                </button>
              </div>
            )}
          </div>

          {/* FROM YOUR CLINICIAN SECTION IN OVERVIEW (ONLY IF CONNECTED LINK EXISTS) */}
          {acceptedClinicianLink && (
            <PatientAssignedExercisesSection
              assignments={assignedExercises}
              loading={loadingAssignments}
              onStart={handleStartAssignment}
              compact={true}
              onViewAll={() => setActiveTab('assignments')}
            />
          )}

          {/* DEPRESSION ACTIVITIES & INTERVENTIONS (ASSIGNED BY SEVERITY) */}
          <DepressionSeverityActivities
            latestAssessment={latestDepression}
            onStartAssessment={() => {
              setActiveTab('assessments');
              setTakingPHQ9(true);
              setTakingGAD7(false);
              setTakingADHD(false);
              setTakingOCD(false);
              setTakingPTSD(false);
              setTakingInsomnia(false);
            }}
          />
        </div>
      )}

      {/* DEDICATED FROM CLINICIAN TAB (ONLY IF CONNECTED LINK EXISTS) */}
      {activeTab === 'assignments' && acceptedClinicianLink && (
        <div className="space-y-6">
          <PatientAssignedExercisesSection
            assignments={assignedExercises}
            loading={loadingAssignments}
            onStart={handleStartAssignment}
            compact={false}
          />
        </div>
      )}

      {/* MY CLINICIAN DEDICATED TAB */}
      {activeTab === 'clinician' && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 bg-gradient-to-r from-tealBrand-500/10 via-brand-500/5 to-transparent">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
                  <FaUserMd />
                  <span>Clinical Collaboration</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  My Clinician & Sharing Hub
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Connect with registered healthcare professionals, review clinician invitations, and stay in complete control of what health data you share.
                </p>
              </div>

              {!acceptedClinicianLink && (
                <button
                  type="button"
                  id="connect-clinician-hub-btn"
                  onClick={() => {
                    setConnectModalMode('connect');
                    setActiveInviteForModal(null);
                    setActiveLinkForModal(null);
                    setConnectModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 shrink-0"
                >
                  <FaUserMd /> Connect with a Clinician
                </button>
              )}
            </div>
          </div>

          {/* SECTION 1: Invites Inbox (if any) */}
          {clinicianInvites.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-tealBrand-500/40 bg-tealBrand-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tealBrand-500 animate-ping" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Invitations from Clinicians ({clinicianInvites.length})
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-tealBrand-500/20 text-tealBrand-700 dark:text-tealBrand-300 text-[10px] font-black uppercase tracking-wider">
                  Action Required
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {clinicianInvites.map((inv) => (
                  <div key={inv._id || inv.id} className="py-4 space-y-3 first:pt-1 last:pb-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 text-xs">
                        <p className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <FaUserMd className="text-tealBrand-500" />
                          {inv.clinician?.title ? `${inv.clinician.title} ` : ''}
                          {inv.clinician?.name || 'Mental Health Specialist'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          {inv.clinician?.specialization} &bull; {inv.clinician?.institution}
                        </p>
                        {inv.inviteMessage && (
                          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic text-[11px] mt-1">
                            "{inv.inviteMessage}"
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          Received on {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (acceptedClinicianLink) {
                              alert(
                                'You already have an active connected clinician. You must stop sharing with your current clinician before accepting a new invitation.'
                              );
                              return;
                            }
                            setActiveInviteForModal(inv);
                            setActiveLinkForModal(null);
                            setConnectModalMode('acceptInvite');
                            setConnectModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow transition-all flex items-center gap-1.5"
                        >
                          <FaCheckCircle /> Review &amp; Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineInvite(inv._id || inv.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Connected Clinician Card */}
          {acceptedClinicianLink && (
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Currently Linked Clinician
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Active clinical supervision &amp; shared screening records
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Practitioner Details</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {acceptedClinicianLink.clinician?.title ? `${acceptedClinicianLink.clinician.title} ` : ''}
                      {acceptedClinicianLink.clinician?.name}
                    </p>
                    {acceptedClinicianLink.clinician?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <FaCheckCircle className="text-[9px]" /> Credentials verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                        <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {acceptedClinicianLink.clinician?.specialization}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <FaBuilding className="text-slate-500" /> {acceptedClinicianLink.clinician?.institution}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Connected on {new Date(acceptedClinicianLink.respondedAt || acceptedClinicianLink.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sharing Configuration</span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Scope:{' '}
                      <span className="text-tealBrand-600 dark:text-tealBrand-400">
                        {acceptedClinicianLink.shareScope === 'all'
                          ? 'All results, including future ones'
                          : `${(acceptedClinicianLink.sharedAssessmentIds || []).length} selected assessment records`}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {acceptedClinicianLink.shareScope === 'all'
                        ? 'Your clinician can view past screenings and will automatically see new assessments you complete.'
                        : 'Only the screening assessments you explicitly approved are visible to this clinician.'}
                    </p>
                  </div>

                  {/* Alert opt-in toggle button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        Highest-Band Alert Opt-In
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Flag future severe results as urgent
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAlertOptIn(acceptedClinicianLink)}
                      disabled={togglingAlert}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        acceptedClinicianLink.alertOnHighestBand
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {acceptedClinicianLink.alertOnHighestBand ? <FaToggleOn className="text-base" /> : <FaToggleOff className="text-base" />}
                      <span>{acceptedClinicianLink.alertOnHighestBand ? 'Enabled' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLinkForModal(acceptedClinicianLink);
                    setActiveInviteForModal(null);
                    setConnectModalMode('editSharing');
                    setConnectModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-2 shadow"
                >
                  <FaSlidersH /> Edit Sharing Choices
                </button>

                <button
                  type="button"
                  onClick={() => handleStopSharing(acceptedClinicianLink._id || acceptedClinicianLink.id)}
                  disabled={revokingLink}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-all disabled:opacity-50"
                >
                  {revokingLink ? 'Stopping...' : 'Stop Sharing & Disconnect'}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: Pending Connection Request (if user sent one) */}
          {pendingClinicianLink && !acceptedClinicianLink && (
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FaClock className="text-amber-500 text-lg" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Request Pending Clinician Review
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Waiting for practitioner to log in and respond
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                  Pending
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {pendingClinicianLink.clinician?.title ? `${pendingClinicianLink.clinician.title} ` : ''}
                      {pendingClinicianLink.clinician?.name}
                    </p>
                    {pendingClinicianLink.clinician?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <FaCheckCircle className="text-[9px]" /> Credentials verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-medium">
                        <FaShieldAlt className="text-[9px]" /> Credentials not verified by CEST
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {pendingClinicianLink.clinician?.specialization} &bull; {pendingClinicianLink.clinician?.institution}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sent on {new Date(pendingClinicianLink.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCancelLink(pendingClinicianLink._id || pendingClinicianLink.id)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all shrink-0"
                >
                  Cancel Request
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: Not Linked Empty State (if no accepted & no pending) */}
          {!acceptedClinicianLink && !pendingClinicianLink && clinicianInvites.length === 0 && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-tealBrand-500/10 text-tealBrand-500 border border-tealBrand-500/30 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <FaUserMd />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  You are not connected to a clinician yet.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pastClinicianLinks.length > 0
                    ? 'Your previous clinical link is inactive. You can review connection history below or connect with a new clinician anytime.'
                    : 'You can connect with a licensed mental health clinician at any time to share your completed screening tests and receive clinical guidance.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  id="connect-clinician-hub-btn"
                  onClick={() => {
                    setConnectModalMode('connect');
                    setActiveInviteForModal(null);
                    setActiveLinkForModal(null);
                    setConnectModalOpen(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <FaUserMd /> Connect
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: Connection History List */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <FaHistory className="text-slate-400 text-sm" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Connection History
              </h3>
            </div>

            {clinicianLinks.filter((l) =>
              ['declined', 'cancelled', 'expired', 'revoked'].includes(l.status)
            ).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No past connection history on record.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {clinicianLinks
                  .filter((l) =>
                    ['declined', 'cancelled', 'expired', 'revoked'].includes(l.status)
                  )
                  .map((past) => (
                    <div
                      key={past._id || past.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-slate-400"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {past.clinician?.title ? `${past.clinician.title} ` : ''}
                          {past.clinician?.name || 'Mental Health Specialist'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {past.clinician?.specialization || 'Clinical Specialist'} &bull; Created on{' '}
                          {new Date(past.createdAt).toLocaleDateString()}
                        </p>
                        {past.clinicianNote && (
                          <p className="text-[11px] text-slate-400 italic">
                            Note: "{past.clinicianNote}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            past.status === 'revoked'
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : past.status === 'declined'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : past.status === 'expired'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {past.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(past.respondedAt || past.updatedAt || past.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent Access Transparency Log (Last 10 views) */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-tealBrand-500 text-sm" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Recent Access Activity
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Audit Trail (Last 10 Views)
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log showing verified clinicians who reviewed your shared assessment records or generated clinical reports.
            </p>

            {accessLogs.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No record accesses logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {accessLogs.map((log) => (
                  <div
                    key={log._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.clinicianName}
                        </span>
                        {log.clinicianSpecialization && (
                          <span className="text-[10px] text-slate-400">
                            &bull; {log.clinicianSpecialization}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {log.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[11px]">
                      <FaClock className="text-[10px]" />
                      <span>{new Date(log.at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & Safety Disclaimer Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <FaLock className="text-tealBrand-500 text-xs" />
              <span>Privacy & Safety Disclaimer</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              This is a request for clinician review, not an emergency service and not real-time monitoring. Chatbot conversations and cognitive exercises are never shared. You retain full control to stop sharing at any moment.
            </p>
          </div>
        </div>
      )}

      {/* USER PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaUser className="text-brand-500" />
            <span>Self User Profile Information</span>
          </h2>

          {savedMsg && (
            <div className="p-3 rounded-xl bg-tealBrand-500/10 border border-tealBrand-500/30 text-tealBrand-700 dark:text-tealBrand-300 text-xs font-semibold flex items-center gap-2">
              <FaCheckCircle /> Profile saved successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Bio / Personal Wellness Goal
              </label>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Share your personal goals for cognitive enhancement..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <FaSave /> Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* ASSESSMENTS TAB */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {takingPHQ9 ? (
            <PHQ9Assessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
              }}
              onCancel={() => setTakingPHQ9(false)}
            />
          ) : takingGAD7 ? (
            <GAD7Assessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
                loadAnxietyCooldownInfo();
              }}
              onCancel={() => setTakingGAD7(false)}
            />
          ) : takingADHD ? (
            <ADHDAssessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
                loadAdhdCooldownInfo();
              }}
              onCancel={() => setTakingADHD(false)}
            />
          ) : takingOCD ? (
            <OCDAssessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
                loadOcdCooldownInfo();
              }}
              onCancel={() => setTakingOCD(false)}
            />
          ) : takingPTSD ? (
            <PTSDAssessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
                loadPtsdCooldownInfo();
              }}
              onCancel={() => setTakingPTSD(false)}
            />
          ) : takingInsomnia ? (
            <InsomniaAssessment
              onComplete={(data) => {
                if (data) {
                  setAssessments((prev) => {
                    const id = data._id || data.id;
                    if (id && prev.some((a) => (a._id || a.id) === id)) return prev;
                    return [data, ...prev];
                  });
                }
                loadAssessments();
                loadInsomniaCooldownInfo();
              }}
              onCancel={() => setTakingInsomnia(false)}
            />
          ) : (
            <>
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center border border-brand-200 dark:border-slate-700">
                      <FaCloudRain className="text-xl text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Depression · PHQ-9
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Official Patient Health Questionnaire (9 items). Scores range from 0–27
                        with severity bands from minimal to severe depression.
                      </p>
                    </div>
                  </div>
                  {cooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingPHQ9(true);
                          setTakingGAD7(false);
                          setTakingADHD(false);
                          setTakingOCD(false);
                          setTakingPTSD(false);
                          setTakingInsomnia(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on {new Date(cooldownInfo.nextAvailableAt).toLocaleDateString()} ({cooldownInfo.daysRemaining} {cooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingPHQ9(true);
                        setTakingGAD7(false);
                        setTakingADHD(false);
                        setTakingOCD(false);
                        setTakingPTSD(false);
                        setTakingInsomnia(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start PHQ-9
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                  {[
                    ['0', 'None'],
                    ['1–4', 'Minimal'],
                    ['5–9', 'Mild'],
                    ['10–14', 'Moderate'],
                    ['15–19', 'Mod. severe'],
                    ['20–27', 'Severe'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-brand-500" />
                  Your PHQ-9 History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : depressionAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed depression assessments yet. Start the PHQ-9 above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {depressionAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore}/27
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getPHQ9SeverityColor(
                            a.severity
                          )}`}
                        >
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GAD-7 Anxiety Assessment Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-tealBrand-50 dark:bg-slate-800 flex items-center justify-center border border-tealBrand-200 dark:border-slate-700">
                      <FaWind className="text-xl text-tealBrand-600 dark:text-tealBrand-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Anxiety · GAD-7
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Generalized Anxiety Disorder 7-item scale. Scores range from 0–21 with
                        severity bands from minimal to severe anxiety.
                      </p>
                    </div>
                  </div>
                  {anxietyCooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingGAD7(true);
                          setTakingPHQ9(false);
                          setTakingADHD(false);
                          setTakingOCD(false);
                          setTakingPTSD(false);
                          setTakingInsomnia(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on{' '}
                        {new Date(anxietyCooldownInfo.nextAvailableAt).toLocaleDateString()} (
                        {anxietyCooldownInfo.daysRemaining}{' '}
                        {anxietyCooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingGAD7(true);
                        setTakingPHQ9(false);
                        setTakingADHD(false);
                        setTakingOCD(false);
                        setTakingPTSD(false);
                        setTakingInsomnia(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start GAD-7
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    ['0–4', 'Minimal'],
                    ['5–9', 'Mild'],
                    ['10–14', 'Moderate'],
                    ['15–21', 'Severe'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-tealBrand-500" />
                  Your GAD-7 History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : anxietyAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed anxiety assessments yet. Start the GAD-7 above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {anxietyAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore ?? a.score}/21
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getGAD7SeverityColor(
                            a.severity
                          )}`}
                        >
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ADHD ASRS-v1.1 Assessment Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center border border-amber-200 dark:border-slate-700">
                      <FaBolt className="text-xl text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        ADHD · ASRS-v1.1
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Adult ADHD Self-Report Scale (18 items). Part A positive screen criteria + combined score likelihood index (0–72).
                      </p>
                    </div>
                  </div>
                  {adhdCooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingADHD(true);
                          setTakingPHQ9(false);
                          setTakingGAD7(false);
                          setTakingOCD(false);
                          setTakingPTSD(false);
                          setTakingInsomnia(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on{' '}
                        {new Date(adhdCooldownInfo.nextAvailableAt).toLocaleDateString()} (
                        {adhdCooldownInfo.daysRemaining}{' '}
                        {adhdCooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingADHD(true);
                        setTakingPHQ9(false);
                        setTakingGAD7(false);
                        setTakingOCD(false);
                        setTakingPTSD(false);
                        setTakingInsomnia(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start ASRS-v1.1
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    ['0–18', 'Low Likelihood'],
                    ['19–35', 'Moderate Likelihood'],
                    ['36–72', 'High Likelihood'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-amber-500" />
                  Your ASRS-v1.1 History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : adhdAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed ADHD assessments yet. Start the ASRS-v1.1 above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {adhdAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore ?? a.score}/72
                            {a.screenResult && (
                              <span className="text-xs font-normal text-slate-500 ml-2">
                                ({a.screenResult})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getADHDSeverityColor(
                            a.severity || a.screenResult
                          )}`}
                        >
                          {a.severity || a.screenResult}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OCD Y-BOCS Assessment Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-tealBrand-50 dark:bg-slate-800 flex items-center justify-center border border-tealBrand-200 dark:border-slate-700">
                      <FaSyncAlt className="text-xl text-tealBrand-600 dark:text-tealBrand-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        OCD · Y-BOCS
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Yale-Brown Obsessive Compulsive Scale Part 2 (10 scored items + 1 insight item). Scores range from 0–40 across obsessions and compulsions.
                      </p>
                    </div>
                  </div>
                  {ocdCooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingOCD(true);
                          setTakingPHQ9(false);
                          setTakingGAD7(false);
                          setTakingADHD(false);
                          setTakingPTSD(false);
                          setTakingInsomnia(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on{' '}
                        {new Date(ocdCooldownInfo.nextAvailableAt).toLocaleDateString()} (
                        {ocdCooldownInfo.daysRemaining}{' '}
                        {ocdCooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingOCD(true);
                        setTakingPHQ9(false);
                        setTakingGAD7(false);
                        setTakingADHD(false);
                        setTakingPTSD(false);
                        setTakingInsomnia(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start Y-BOCS
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  {[
                    ['0–7', 'Subclinical'],
                    ['8–15', 'Mild'],
                    ['16–23', 'Moderate'],
                    ['24–31', 'Severe'],
                    ['32–40', 'Extreme'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-tealBrand-500" />
                  Your Y-BOCS History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : ocdAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed OCD assessments yet. Start the Y-BOCS above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ocdAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore ?? a.score}/40
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getOCDSeverityColor(
                            a.severity
                          )}`}
                        >
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PTSD PCL-5 Assessment Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center border border-brand-200 dark:border-slate-700">
                      <FaShieldAlt className="text-xl text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        PTSD · PCL-5
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        PTSD Checklist for DSM-5 (20 items across 4 symptom clusters). Provisional screening cutoff: 33 (0–80).
                      </p>
                    </div>
                  </div>
                  {ptsdCooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingPTSD(true);
                          setTakingPHQ9(false);
                          setTakingGAD7(false);
                          setTakingADHD(false);
                          setTakingOCD(false);
                          setTakingInsomnia(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on{' '}
                        {new Date(ptsdCooldownInfo.nextAvailableAt).toLocaleDateString()} (
                        {ptsdCooldownInfo.daysRemaining}{' '}
                        {ptsdCooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingPTSD(true);
                        setTakingPHQ9(false);
                        setTakingGAD7(false);
                        setTakingADHD(false);
                        setTakingOCD(false);
                        setTakingInsomnia(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start PCL-5
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  {[
                    ['0–10', 'Absent/Minimal'],
                    ['11–32', 'Mild'],
                    ['33–48', 'Moderate (Cutoff)'],
                    ['49–64', 'Severe'],
                    ['65–80', 'Extreme'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-brand-500" />
                  Your PCL-5 History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : ptsdAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed PTSD assessments yet. Start the PCL-5 above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ptsdAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore ?? a.score}/80
                            {a.screenResult && (
                              <span className="text-xs font-normal text-slate-500 ml-2">
                                (Screen: {a.screenResult})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getPTSDSeverityColor(
                            a.severity || a.screenResult
                          )}`}
                        >
                          {a.severity || a.screenResult}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insomnia ISI Assessment Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-tealBrand-50 dark:bg-slate-800 flex items-center justify-center border border-tealBrand-200 dark:border-slate-700">
                      <FaMoon className="text-xl text-tealBrand-600 dark:text-tealBrand-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Insomnia · ISI
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                        Insomnia Severity Index (7 items). Evaluates sleep onset, sleep maintenance, early awakenings, and daily impact (0–28).
                      </p>
                    </div>
                  </div>
                  {insomniaCooldownInfo?.isLocked ? (
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setTakingInsomnia(true);
                          setTakingPHQ9(false);
                          setTakingGAD7(false);
                          setTakingADHD(false);
                          setTakingOCD(false);
                          setTakingPTSD(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-sm hover:bg-amber-500/25 transition-all"
                      >
                        <FaCheckCircle className="text-amber-500 text-xs" /> Assessment Locked (View Result)
                      </button>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        Available again on{' '}
                        {new Date(insomniaCooldownInfo.nextAvailableAt).toLocaleDateString()} (
                        {insomniaCooldownInfo.daysRemaining}{' '}
                        {insomniaCooldownInfo.daysRemaining === 1 ? 'day' : 'days'} left)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTakingInsomnia(true);
                        setTakingPHQ9(false);
                        setTakingGAD7(false);
                        setTakingADHD(false);
                        setTakingOCD(false);
                        setTakingPTSD(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tealBrand-600 to-brand-600 text-white font-bold text-sm shadow-md shrink-0"
                    >
                      <FaPlay className="text-xs" /> Start ISI
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    ['0–7', 'No Significant'],
                    ['8–14', 'Subthreshold'],
                    ['15–21', 'Clinical (Moderate)'],
                    ['22–28', 'Clinical (Severe)'],
                  ].map(([range, label]) => (
                    <div
                      key={range}
                      className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                    >
                      <p className="font-extrabold text-slate-900 dark:text-white">{range}</p>
                      <p className="text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="text-tealBrand-500" />
                  Your ISI History
                </h3>

                {loadingAssessments ? (
                  <p className="text-sm text-slate-500">Loading assessments…</p>
                ) : insomniaAssessments.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No completed insomnia assessments yet. Start the ISI above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {insomniaAssessments.map((a) => (
                      <div
                        key={a._id || a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            Score {a.totalScore ?? a.score}/28
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleString()
                              : 'Recently completed'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl border text-xs font-bold ${getInsomniaSeverityColor(
                            a.severity
                          )}`}
                        >
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="space-y-8">
          {/* PHQ-9 History Trend */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-tealBrand-500" />
              Depression Screening Trend (PHQ-9)
            </h2>
            {depressionAssessments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No PHQ-9 assessments completed yet. Take an assessment to record your initial score.
              </p>
            ) : (
              <div className="space-y-3">
                {[...depressionAssessments].reverse().map((a) => (
                  <div key={a._id || a.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Score {a.totalScore}/27 · {a.severity}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-tealBrand-500 rounded-full"
                        style={{ width: `${(a.totalScore / 27) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cognitive Training Progress Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaBrain className="text-purple-500" />
                  Cognitive Training Progress
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Historical activity metrics across attention, working memory, and executive planning domains.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0">
                Separate Measurement Protocol
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <FaBrain className="text-purple-500" /> Completed
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {exerciseProgress?.totalCompleted || 0}
                </p>
                <p className="text-[10px] text-slate-400">Total activities</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <FaBullseye className="text-tealBrand-500" /> Avg Accuracy
                </p>
                <p className="text-2xl font-extrabold text-tealBrand-600 dark:text-tealBrand-400">
                  {exerciseProgress?.averageAccuracy || 0}%
                </p>
                <p className="text-[10px] text-slate-400">Target hit rate</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <FaTachometerAlt className="text-amber-500" /> Best Score
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {exerciseProgress?.bestScore || 0}
                </p>
                <p className="text-[10px] text-slate-400">Personal peak</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <FaClock className="text-brand-500" /> Avg Time
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {exerciseProgress?.averageTimeSeconds
                    ? `${Math.floor(exerciseProgress.averageTimeSeconds / 60)}m ${exerciseProgress.averageTimeSeconds % 60}s`
                    : '0s'}
                </p>
                <p className="text-[10px] text-slate-400">Per activity session</p>
              </div>
            </div>

            {/* Performance by Cognitive Domain */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide text-slate-400">
                Performance by Cognitive Domain
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Attention',
                    desc: 'Attention + Processing Speed',
                    stats: exerciseProgress?.domainBreakdown?.Attention,
                    color: 'text-brand-500',
                  },
                  {
                    name: 'Working Memory',
                    desc: 'Working Memory + Recall',
                    stats: exerciseProgress?.domainBreakdown?.WorkingMemory,
                    color: 'text-tealBrand-500',
                  },
                  {
                    name: 'Problem Solving',
                    desc: 'Planning & Executive Function',
                    stats: exerciseProgress?.domainBreakdown?.ProblemSolving,
                    color: 'text-purple-500',
                  },
                ].map((dom) => (
                  <div
                    key={dom.name}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm text-slate-900 dark:text-white`}>
                        {dom.name}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {dom.stats?.count || 0} attempts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{dom.desc}</p>
                    <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-slate-200/60 dark:border-slate-800">
                      <span>Avg Acc: <strong className={dom.color}>{dom.stats?.avgAccuracy || 0}%</strong></span>
                      <span>Peak: <strong>{dom.stats?.bestScore || 0} pts</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Exercises List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide text-slate-400">
                Recent Cognitive Activity Sessions
              </h3>
              {loadingProgress ? (
                <p className="text-xs text-slate-500">Loading progress details…</p>
              ) : !exerciseProgress?.recentExercises || exerciseProgress.recentExercises.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No cognitive exercises completed yet. Start an activity under Cognitive Exercises.
                </p>
              ) : (
                <div className="space-y-2">
                  {exerciseProgress.recentExercises.map((r) => (
                    <div
                      key={r._id || r.id || Math.random()}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{r.exerciseName}</p>
                        <p className="text-[11px] text-slate-400">
                          {r.cognitiveDomain} • {r.completedAt ? new Date(r.completedAt).toLocaleString() : 'Recent'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-semibold">
                        <span className="px-2.5 py-1 rounded-lg bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-300">
                          Accuracy: {r.accuracy}%
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                          Score: {r.score}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Non-clinical Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <FaShieldAlt className="text-amber-500 shrink-0 mt-0.5 text-base" />
              <div>
                <strong className="block mb-0.5 font-bold">Academic & Clinical Disclaimer:</strong>
                Exercise performance and PHQ-9 depression screening results are separate measurements. Cognitive training performance does not denote clinical depression resolution, and activities are not medical treatments.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COGNITIVE EXERCISES MODULE TAB */}
      {activeTab === 'enhancement' && (
        <div className="space-y-8">
          {/* Depression Activities assigned according to severity */}
          <DepressionSeverityActivities
            latestAssessment={latestDepression}
            onStartAssessment={() => {
              setActiveTab('assessments');
              setTakingPHQ9(true);
              setTakingGAD7(false);
              setTakingADHD(false);
              setTakingOCD(false);
              setTakingPTSD(false);
              setTakingInsomnia(false);
            }}
          />

          {/* Header Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-200 dark:border-purple-900/60 space-y-4 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <FaBrain />
              <span>Cognitive Enhancement exercises</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Cognitive Enhancement Exercises
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
              These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment.
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  CET-Inspired Cognitive Practice Suite
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Targeted focus, working memory recall, and multi-step executive planning challenges. Scores are practice metrics, not clinical measures.
                </p>
              </div>
            </div>
          </div>

          {/* Exercise Library Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(EXERCISES).map((ex) => (
              <div
                key={ex.id}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 hover:border-brand-500/50 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/30">
                      {ex.targetScoreBand}
                    </span>
                    <span className="text-slate-400 font-semibold">{ex.estimatedDuration}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      {ex.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                      {ex.domain}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ex.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/exercises/${ex.id}`, {
                        state: {
                          assessmentId: latestDepression?._id || null,
                          assessmentScore: latestDepression?.totalScore || null,
                          assessmentSeverity: latestDepression?.severity || '',
                        },
                      })
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-tealBrand-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all"
                  >
                    <FaPlay className="text-[10px]" /> Start Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Notice Box */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <FaShieldAlt className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 text-base" />
            <div>
              <strong className="block mb-0.5 font-bold">Cognitive Enhancement Therapy Practice Notice:</strong>
              These attention, memory and problem-solving exercises are inspired by Cognitive Enhancement Therapy. They are practice exercises, not a diagnosis or a replacement for professional treatment. Exercise scores are practice metrics reflecting focus and task engagement, never evaluated as a clinical diagnostic measure.
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS PLACEHOLDER TAB */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaBell className="text-amber-500" /> Notifications & Reminders
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <FaInfoCircle className="text-brand-500 mt-1 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">System Notification</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Welcome to your CEST Self User Dashboard. The PHQ-9 depression assessment is now
                available under Assessments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FaCog className="text-slate-500" /> Dashboard Settings
          </h2>
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Email Digest Reminders</p>
                <p>Receive weekly summary of cognitive enhancement progress</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Data Privacy Mode</p>
                <p>Keep assessment records strictly encrypted</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="w-4 h-4 text-tealBrand-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clinician Connect / Invite / Edit Sharing Modal */}
      <ClinicianConnectModal
        isOpen={connectModalOpen}
        onClose={() => {
          setConnectModalOpen(false);
          setActiveInviteForModal(null);
          setActiveLinkForModal(null);
        }}
        mode={connectModalMode}
        invite={activeInviteForModal}
        existingLink={activeLinkForModal}
        onSuccess={() => {
          loadClinicianLinks();
        }}
      />

      {/* Active Assignment Launcher Modal */}
      {activeAssignmentToLaunch && (
        <ExerciseLauncher
          exerciseId={activeAssignmentToLaunch.exerciseId}
          assignment={activeAssignmentToLaunch}
          onClose={() => setActiveAssignmentToLaunch(null)}
          onComplete={handleCompleteAssignment}
          onSkip={handleSkipAssignment}
        />
      )}
    </div>
  );
};

