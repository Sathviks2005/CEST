import { HAMA_DEFINITION, scoreHama } from './hama';
import { HAMD17_DEFINITION, scoreHamd17 } from './hamd17';
import { ADHD_DSM5_DEFINITION, scoreAdhdDsm5 } from './adhd_dsm5';
import { NSESSS_PTSD_DEFINITION, scoreNsesssPtsd } from './nsesss_ptsd';
import { ISI_CLINICIAN_DEFINITION, scoreIsiClinician } from './isi_clinician';
import { YBOCS_PART2_DEFINITION, scoreYbocsPart2 } from './ybocs_part2';

export const CLINICIAN_INSTRUMENTS = {
  hama: HAMA_DEFINITION,
  hamd17: HAMD17_DEFINITION,
  adhd_dsm5: ADHD_DSM5_DEFINITION,
  nsesss_ptsd: NSESSS_PTSD_DEFINITION,
  isi_clinician: ISI_CLINICIAN_DEFINITION,
  ybocs_part2: YBOCS_PART2_DEFINITION,
};

export const SCORING_FUNCTIONS = {
  hama: (answers) => scoreHama(answers),
  hamd17: (answers) => scoreHamd17(answers),
  adhd_dsm5: (answers, extras, patientAge) => scoreAdhdDsm5(answers, extras, patientAge),
  nsesss_ptsd: (answers) => scoreNsesssPtsd(answers),
  isi_clinician: (answers) => scoreIsiClinician(answers),
  ybocs_part2: (answers) => scoreYbocsPart2(answers),
};

export function getInstrument(instrumentId) {
  return CLINICIAN_INSTRUMENTS[instrumentId] || null;
}

export function scoreAssessment(instrumentId, answers, extras = {}, patientAge = null) {
  const scorer = SCORING_FUNCTIONS[instrumentId];
  if (!scorer) {
    throw new Error(`Unknown instrument ID: ${instrumentId}`);
  }
  return scorer(answers, extras, patientAge);
}

export {
  HAMA_DEFINITION,
  scoreHama,
  HAMD17_DEFINITION,
  scoreHamd17,
  ADHD_DSM5_DEFINITION,
  scoreAdhdDsm5,
  NSESSS_PTSD_DEFINITION,
  scoreNsesssPtsd,
  ISI_CLINICIAN_DEFINITION,
  scoreIsiClinician,
  YBOCS_PART2_DEFINITION,
  scoreYbocsPart2,
};
