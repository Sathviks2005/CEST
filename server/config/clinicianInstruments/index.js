const { HAMA_DEFINITION, scoreHama } = require('./hama');
const { HAMD17_DEFINITION, scoreHamd17 } = require('./hamd17');
const { ADHD_DSM5_DEFINITION, scoreAdhdDsm5 } = require('./adhd_dsm5');
const { NSESSS_PTSD_DEFINITION, scoreNsesssPtsd } = require('./nsesss_ptsd');
const { ISI_CLINICIAN_DEFINITION, scoreIsiClinician } = require('./isi_clinician');
const { YBOCS_PART2_DEFINITION, scoreYbocsPart2 } = require('./ybocs_part2');

const CLINICIAN_INSTRUMENTS = {
  hama: HAMA_DEFINITION,
  hamd17: HAMD17_DEFINITION,
  adhd_dsm5: ADHD_DSM5_DEFINITION,
  nsesss_ptsd: NSESSS_PTSD_DEFINITION,
  isi_clinician: ISI_CLINICIAN_DEFINITION,
  ybocs_part2: YBOCS_PART2_DEFINITION,
};

const SCORING_FUNCTIONS = {
  hama: (answers) => scoreHama(answers),
  hamd17: (answers) => scoreHamd17(answers),
  adhd_dsm5: (answers, extras, patientAge) => scoreAdhdDsm5(answers, extras, patientAge),
  nsesss_ptsd: (answers) => scoreNsesssPtsd(answers),
  isi_clinician: (answers) => scoreIsiClinician(answers),
  ybocs_part2: (answers) => scoreYbocsPart2(answers),
};

function getInstrument(instrumentId) {
  return CLINICIAN_INSTRUMENTS[instrumentId] || null;
}

function scoreAssessment(instrumentId, answers, extras = {}, patientAge = null) {
  const scorer = SCORING_FUNCTIONS[instrumentId];
  if (!scorer) {
    throw new Error(`Unknown instrument ID: ${instrumentId}`);
  }
  return scorer(answers, extras, patientAge);
}

module.exports = {
  CLINICIAN_INSTRUMENTS,
  SCORING_FUNCTIONS,
  getInstrument,
  scoreAssessment,
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
