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
    subject: 'Petitie tot Herziening van de Toegangscode',
    text: `Geachte betrokkene,\n\nEr is heden een verzoekschrift ingediend strekkende tot het herstellen van uw toegangscode tot de Plooikaarten-app. Gelieve de onderstaande digitale verwijzing te activeren teneinde de herstelprocedure te effectueren:\n\n${resetLink}\n\nIndien dit verzoekschrift niet door uwe persoone is ingediend, gelieve deze digitale missive als nietig te beschouwen en te vernietigen.`,
    html: `
      <p>Geachte betrokkene,</p>
      <p>Er is heden een verzoekschrift ingediend strekkende tot het herstellen van uw toegangscode tot de Plooikaarten-app.</p>
      <p>Gelieve de onderstaande digitale verwijzing te activeren teneinde de herstelprocedure te effectueren:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Indien dit verzoekschrift niet door uwe persoone is ingediend, gelieve deze digitale missive als nietig te beschouwen en te vernietigen.</p>
    `,
  });

  console.log('Message sent: %s', info.messageId);
}
