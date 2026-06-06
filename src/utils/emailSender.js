const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error('SMTP is not configured');
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  const transporter = getTransporter();

  return transporter.sendMail({
    from: `"VendorBridge" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

const sendInvoiceEmail = async ({ to, subject, message, pdfBuffer, fileName }) => {
  return sendMail({
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const text = `Hello ${name}, use this link to reset your password: ${resetUrl}`;
  const html = `<p>Hello ${name},</p><p>Use the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`;
  return sendMail({ to, subject: 'VendorBridge Password Reset', text, html });
};

const sendRFQInvitationEmail = async ({ to, vendorName, rfqTitle, rfqNumber, deadline }) => {
  const deadlineText = new Date(deadline).toISOString();
  const text = `Hello ${vendorName}, you have been invited to submit a quotation for RFQ ${rfqNumber} - ${rfqTitle}. Deadline: ${deadlineText}.`;
  const html = `<p>Hello ${vendorName},</p><p>You have been invited to submit a quotation for <strong>${rfqNumber}</strong> - ${rfqTitle}.</p><p>Deadline: <strong>${deadlineText}</strong></p>`;
  return sendMail({ to, subject: `RFQ Invitation: ${rfqNumber}`, text, html });
};

module.exports = {
  sendInvoiceEmail,
  sendMail,
  sendPasswordResetEmail,
  sendRFQInvitationEmail,
};
