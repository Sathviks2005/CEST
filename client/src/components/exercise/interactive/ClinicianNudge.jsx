import React, { useState, useEffect } from 'react';
import { FaUserMd, FaPhoneAlt, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { clinicianLinkService } from '../../../services/clinicianLinkService';

export const ClinicianNudge = () => {
  const { user } = useAuth() || {};
  const [acceptedClinician, setAcceptedClinician] = useState(user?.assignedClinician || user?.clinician || null);

  useEffect(() => {
    let isMounted = true;
    const fetchLink = async () => {
      try {
        const res = await clinicianLinkService.getMyLinks();
        const links = res.data || [];
        const accepted = links.find((l) => l.status === 'accepted');
        if (isMounted && accepted?.clinician) {
          setAcceptedClinician(accepted.clinician);
        }
      } catch {}
    };

    fetchLink();

    const handleUpdate = () => {
      fetchLink();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cest:clinician-link-updated', handleUpdate);
      return () => window.removeEventListener('cest:clinician-link-updated', handleUpdate);
    }
  }, []);

  const clinicianToShow = acceptedClinician || user?.assignedClinician || user?.clinician;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-sm mt-0.5">
          <FaUserMd />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <strong className="block font-bold text-amber-900 dark:text-amber-100">
            Professional Care Recommendation
          </strong>
          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            Your score suggests symptoms that usually benefit from professional support. These exercises can help alongside care, not instead of it. Please consider contacting a clinician.
          </p>
        </div>
      </div>

      {clinicianToShow && typeof clinicianToShow === 'object' && (
        <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Your Connected Clinician:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {clinicianToShow.name || clinicianToShow.title || 'Mental Health Specialist'}
            </span>
            {clinicianToShow.institution && (
              <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                ({clinicianToShow.institution})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-semibold">
            {clinicianToShow.phone && (
              <a
                href={`tel:${clinicianToShow.phone}`}
                className="inline-flex items-center gap-1.5 text-tealBrand-600 dark:text-tealBrand-400 hover:underline"
              >
                <FaPhoneAlt className="text-[10px]" /> {clinicianToShow.phone}
              </a>
            )}
            {clinicianToShow.email && (
              <a
                href={`mailto:${clinicianToShow.email}`}
                className="inline-flex items-center gap-1.5 text-tealBrand-600 dark:text-tealBrand-400 hover:underline"
              >
                <FaEnvelope className="text-[10px]" /> {clinicianToShow.email}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
