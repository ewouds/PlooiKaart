import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  // If SMTP is not configured, fallback to console log (useful for dev)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('================================================');
    console.log('SMTP not configured. Password reset link:');
    console.log(resetLink);
    console.log('================================================');
    return;
  }

  const info = await getTransporter().sendMail({
    from: `"PlooiKaart" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  console.log('Message sent: %s', info.messageId);
}
