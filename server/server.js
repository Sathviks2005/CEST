const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { verifyEmailConfig } = require('./utils/sendEmail');

// Load environment variables explicitly from server/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('[CEST Server] Fatal Error: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Health Check API Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    app: 'Cognitive Enhancement Support Tool (CEST) API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/disorders', require('./routes/disorderRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/gad7', require('./routes/gad7Routes'));
app.use('/api/adhd', require('./routes/adhdRoutes'));
app.use('/api/ocd', require('./routes/ocdRoutes'));
app.use('/api/ptsd', require('./routes/ptsdRoutes'));
app.use('/api/insomnia', require('./routes/insomniaRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use('/api/hamd', require('./routes/hamdRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/clinician-links', require('./routes/clinicianLinkRoutes'));
app.use('/api/assigned-exercises', require('./routes/assignedExerciseRoutes'));
app.use('/api/clinician/attention', require('./routes/clinicianAttentionRoutes'));
app.use('/api/clinician-notes', require('./routes/clinicianNoteRoutes'));
app.use('/api/clinician/reports', require('./routes/clinicianReportRoutes'));
app.use('/api/clinician-reports', require('./routes/clinicianReportRoutes'));
app.use('/api/clinician/settings', require('./routes/clinicianSettingsRoutes'));
app.use('/api/clinician-assessments', require('./routes/clinicianAssessmentRoutes'));
app.use('/api/admin/clinicians', require('./routes/adminClinicianRoutes'));

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`[CEST Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim());
  console.log(`Groq key loaded: ${hasGroqKey ? 'yes' : 'no'}`);
  if (!hasGroqKey) {
    console.warn('[CEST Server] Notice: GROQ_API_KEY is not configured in server/.env. Chat endpoint /api/chat will return 503 until a key is supplied.');
  }
  await verifyEmailConfig();
});

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Keep server running for resilient development
});
