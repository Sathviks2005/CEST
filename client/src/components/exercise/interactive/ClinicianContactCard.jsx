import React, { useState, useEffect } from 'react';
import {
  FaUserMd,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaHeart,
  FaHandsHelping,
  FaExternalLinkAlt,
  FaPrint,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { CRISIS_RESOURCES } from '../../../config/crisisResources';
import { CONNECT_WORDING } from '../../../config/connectWording';
import { clinicianLinkService } from '../../../services/clinicianLinkService';
import { ClinicianConnectModal } from './ClinicianConnectModal';

export const ClinicianContactCard = ({
  instrumentKey = 'gad7',
  instrumentName = 'Assessment',
  severityLabel = 'Severe',
  score = 0,
  assessmentId = null,
  item9Positive = false,
}) => {
  const { user } = useAuth() || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch the user's connection requests to show current status
  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await clinicianLinkService.getMyLinks();
      setLinks(res.data || []);
    } catch (err) {
      // offline or unauthenticated fallback
    } finally {
      setLoadingLinks(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    const handleLinkUpdated = () => {
      fetchLinks();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('cest:clinician-link-updated', handleLinkUpdated);
      return () => window.removeEventListener('cest:clinician-link-updated', handleLinkUpdated);
    }
  }, []);

  // Determine active or latest link
  const acceptedLink = links.find((l) => l.status === 'accepted');
  const pendingLink = links.find((l) => l.status === 'pending');
  const declinedLink = links.find((l) => l.status === 'declined');

  // Scale-specific clinical wording
  let wordingKey = 'gad7';
  if (item9Positive) {
    wordingKey = 'item9Crisis';
  } else if (instrumentKey === 'insomnia' || instrumentKey === 'isi') {
    wordingKey = 'isi';
  } else if (instrumentKey === 'ptsd' || instrumentKey === 'pcl5') {
    wordingKey = 'pcl5';
  } else if (instrumentKey === 'ocd' || instrumentKey === 'ybocs') {
    wordingKey = 'ybocs';
  } else if (instrumentKey === 'phq9') {
    wordingKey = 'phq9';
  } else if (instrumentKey === 'adhd' || instrumentKey === 'asrs') {
    wordingKey = 'adhd';
  } else {
    wordingKey = 'gad7';
  }

  const wording = CONNECT_WORDING.instruments[wordingKey] || CONNECT_WORDING.instruments.gad7;

  // Handle cancelling pending request
  const handleCancelPending = async (linkId) => {
    if (!window.confirm('Are you sure you want to cancel this connection request?')) return;
    setCancelling(true);
    try {
      await clinicianLinkService.cancelLink(linkId);
      await fetchLinks();
    } catch (err) {
      alert('Failed to cancel connection request.');
    } finally {
      setCancelling(false);
    }
  };

  // Print results handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Printable Report View (Visible only during printing via print-only stylesheet) */}
      <div className="hidden print:block text-black bg-white p-8 max-w-2xl mx-auto space-y-6">
        <div className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold">CEST Clinical Assessment Summary</h1>
          <p className="text-sm text-slate-600">
            Confidential screening results for clinical discussion
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700">Patient Name:</p>
            <p className="font-bold text-base">{user?.name || 'Self-User'}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Assessment Date:</p>
            <p className="font-bold text-base">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-4 border border-slate-300 rounded-lg space-y-2">
          <p className="text-xs uppercase font-bold text-slate-500">Screening Details</p>
          <div className="flex justify-between items-center">
            <span className="font-semibold">{instrumentName}</span>
            <span className="font-bold text-lg">Score: {score}</span>
          </div>
          <p className="text-sm">
            <strong>Severity Classification:</strong> {severityLabel}
          </p>
          {item9Positive && (
            <p className="text-xs font-bold text-red-600 mt-2">
              Note: Item 9 (thoughts of self-harm) indicated above zero.
            </p>
          )}
        </div>

        <div className="p-4 border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
          <p className="font-bold">Clinical Disclaimer:</p>
          <p>{CONNECT_WORDING.generalDisclaimer}</p>
          <p className="pt-1">
            Emergency Contacts: 112 (National Emergency), Tele-MANAS 14416 / 1800-891-4416 (24/7).
          </p>
        </div>
      </div>

      {/* Screen Interactive View */}
      <div className="print:hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-tealBrand-500/30 text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-tealBrand-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Wording Banner */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 ${
              wording.urgent
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-tealBrand-500/20 text-tealBrand-400 border-tealBrand-500/30'
            }`}
          >
            {wording.urgent ? <FaExclamationTriangle /> : <FaUserMd />}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider border ${
                  wording.urgent
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-tealBrand-500/20 text-tealBrand-300 border-tealBrand-500/40'
                }`}
              >
                {wording.badge}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {wording.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {wording.guidance}
            </p>
          </div>
        </div>

        {/* Crisis Helplines Block from CRISIS_RESOURCES */}
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-extrabold">
            <FaPhoneAlt />
            <span>{CRISIS_RESOURCES.headline}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {CRISIS_RESOURCES.notice}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {CRISIS_RESOURCES.helplines.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300"
              >
                <strong className="block text-white font-bold">{h.country}</strong>
                <span className="text-[11px] text-slate-300">{h.details}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            {CRISIS_RESOURCES.disclaimer}
          </p>
        </div>

        {/* CLINICIAN CONNECTION STATUS / ACTIONS */}
        <div className="space-y-3">
          {acceptedLink ? (
            /* Accepted Link Status Card */
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <FaCheckCircle />
                  <span>Connected Clinician</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
                  Active
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-base font-extrabold text-white flex items-center gap-2">
                  <FaUserMd className="text-tealBrand-400" />
                  {acceptedLink.clinician?.title ? `${acceptedLink.clinician.title} ` : ''}
                  {acceptedLink.clinician?.name || 'Mental Health Specialist'}
                </p>
                {acceptedLink.clinician?.specialization && (
                  <p className="text-slate-300 font-medium">
                    {acceptedLink.clinician.specialization}
                  </p>
                )}
                {acceptedLink.clinician?.institution && (
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <FaBuilding className="text-slate-500" /> {acceptedLink.clinician.institution}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 pt-1">
                  Connected on {new Date(acceptedLink.respondedAt || acceptedLink.updatedAt).toLocaleDateString()}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        `To contact ${acceptedLink.clinician?.title || 'Dr.'} ${
                          acceptedLink.clinician?.name || 'your clinician'
                        }, please reach out through their practice at ${
                          acceptedLink.clinician?.institution || 'their medical center'
                        }. Note: This platform does not provide real-time messaging or emergency triage.`
                      );
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FaUserMd /> Contact My Clinician
                  </button>
                </div>
              </div>
            </div>
          ) : pendingLink ? (
            /* Pending Link Status Card */
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <FaClock />
                  <span>Request Pending Review</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                  Pending
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                You sent an urgent connection request to{' '}
                <strong className="text-white">
                  {pendingLink.clinician?.title ? `${pendingLink.clinician.title} ` : ''}
                  {pendingLink.clinician?.name || 'the clinician'}
                </strong>
                . They will see it the next time they log in.
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Sent on {new Date(pendingLink.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleCancelPending(pendingLink._id || pendingLink.id)}
                  disabled={cancelling}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              </div>
            </div>
          ) : (
            /* No Active Link: Show Connect Option and Declined status if applicable */
            <div className="space-y-3">
              {declinedLink && (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <FaTimesCircle className="text-rose-400" />
                    <span>Previous Request Declined</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {CONNECT_WORDING.modal.declinedNotice}
                  </p>
                  {declinedLink.clinicianNote && (
                    <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      Note from clinician: "{declinedLink.clinicianNote}"
                    </p>
                  )}
                </div>
              )}

              {/* Primary Connect Button */}
              <button
                type="button"
                id="connect-clinician-btn"
                onClick={() => setModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-tealBrand-600 to-brand-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5"
              >
                <FaUserMd className="text-base" />
                <span>
                  {declinedLink ? 'Choose Another Clinician' : 'Connect with a Clinician'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: Save My Results & Supportive Note */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <FaPrint />
            <span>Save My Results</span>
          </button>

          <a
            href="https://findtreatment.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-tealBrand-400 hover:text-tealBrand-300 font-medium"
          >
            Find Professional Services <FaExternalLinkAlt className="text-[10px]" />
          </a>
        </div>
      </div>

      {/* Clinician Connect Modal */}
      <ClinicianConnectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        assessmentId={assessmentId}
        instrumentName={instrumentName}
        score={score}
        severityLabel={severityLabel}
        onSuccess={() => {
          fetchLinks();
        }}
      />
    </>
  );
};
