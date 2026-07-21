const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'no-reply@languagelearning.com';

  if (!host || !user || !pass) {
    // Fallback stub logging (Step 11 integration)
    console.log(`[EMAIL STUB] To: ${to}`);
    console.log(`[EMAIL STUB] Subject: ${subject}`);
    console.log(`[EMAIL STUB] Message: ${text}`);
    return { success: true, stub: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: Number(port) === 465,
      auth: {
        user,
        pass
      }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });

    console.log(`[SMTP EMAIL SENT] Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP EMAIL ERROR]', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};
