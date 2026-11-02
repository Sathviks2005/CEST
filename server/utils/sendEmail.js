const nodemailer = require('nodemailer');

/**
 * Creates and returns a configured Nodemailer transporter using env variables
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Verifies SMTP configuration at server startup
 */
const verifyEmailConfig = async () => {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    console.log('[CEST Email] Email status: NOT ready (SMTP credentials missing in server/.env)');
    return false;
  }

  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('[CEST Email] Email status: READY (SMTP server verified successfully)');
    return true;
  } catch (err) {
    console.warn(`[CEST Email] Email status: NOT ready (SMTP connection failed: ${err.message})`);
    return false;
  }
};

/**
 * Sends an email using SMTP or prints mock output in dev mode if SMTP is missing
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();
  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  if (!transporter) {
    if (isDev) {
      console.warn('\n=============================================================');
      console.warn('[CEST Email Utility WARNING] Real SMTP is not configured in server/.env!');
      console.warn('Developer mode: Password reset email was NOT sent to inbox.');
      console.warn(`Recipient: ${options.email}`);
      console.warn(`Subject: ${options.subject}`);
      if (options.resetUrl) {
        console.warn(`Reset Link: ${options.resetUrl}`);
      }
      console.warn('Body:\n' + options.message);
      console.warn('=============================================================\n');
      return { mockSent: true };
    }
    const err = new Error('SMTP credentials are not configured');
    throw err;
  }

  const fromName = process.env.FROM_NAME?.trim() || 'CEST Platform';
  const emailFrom = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || 'noreply@cest.org';

  const mailOptions = {
    from: `"${fromName}" <${emailFrom}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[CEST Email Utility] Mail sent to ${options.email} (MessageID: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[CEST Email Utility] Failed to send email to ${options.email}: ${err.message}`);
    if (isDev) {
      console.warn('\n=============================================================');
      console.warn('[CEST Email Utility WARNING] Real SMTP send failed in development mode!');
      console.warn(`Recipient: ${options.email}`);
      if (options.resetUrl) {
        console.warn(`Reset Link: ${options.resetUrl}`);
      }
      console.warn('=============================================================\n');
      return { mockSent: true };
    }
    throw err;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
};
