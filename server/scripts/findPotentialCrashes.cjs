const fs = require('fs');

const targetFiles = [
  'client/src/pages/Login.jsx',
  'client/src/pages/SelfUserDashboard.jsx',
  'client/src/pages/ClinicianDashboard.jsx',
  'client/src/components/patient/PatientProfile.jsx',
  'client/src/components/clinician/NeedsAttentionCard.jsx',
  'client/src/components/clinician/ClinicianNotesSection.jsx',
  'client/src/components/clinician/PatientReportView.jsx',
  'client/src/components/clinician/ClinicianSettingsSection.jsx',
  'client/src/components/exercise/interactive/ClinicianContactCard.jsx',
  'client/src/components/exercise/interactive/ClinicianConnectModal.jsx',
  'client/src/context/AuthContext.jsx'
];

targetFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for reading properties of undefined like user.settings or user.role without optional chaining
    if (line.includes('user.role') && !line.includes('user?.role')) {
      console.log(`${file}:${idx+1} -> Unsafe user.role access: ${line.trim()}`);
    }
    if (line.includes('user.assignedClinician')) {
      console.log(`${file}:${idx+1} -> user.assignedClinician access: ${line.trim()}`);
    }
    if (line.includes('result.user.role')) {
      console.log(`${file}:${idx+1} -> Unsafe result.user.role access: ${line.trim()}`);
    }
    if (line.includes('JSON.parse(localStorage')) {
      console.log(`${file}:${idx+1} -> Unprotected JSON.parse: ${line.trim()}`);
    }
  });
});
