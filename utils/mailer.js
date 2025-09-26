const nodemailer = require("nodemailer");

let transporter = null;
let etherealAccount = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.USE_ETHEREAL === "true") {
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: etherealAccount.user, pass: etherealAccount.pass },
      logger: true,
      debug: true,
    });
    return transporter;
  }

  // Gmail transport (lets Nodemailer pick the right host/ports)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      logger: true,
      debug: true,
      // Optional: avoid strict cert issues on some networks
      tls: { rejectUnauthorized: false },
    });
    return transporter;
  }

  // Fallback: raw SMTP from env
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE || "false") === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
    debug: true,
    connectionTimeout: 30_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

async function sendBirthdayEmail({ to, subject, html }) {
  const tx = await getTransporter();
  const info = await tx.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
  if (etherealAccount)
    //console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  if (info.rejected?.length) console.error("Rejected:", info.rejected);
  return info;
}

module.exports = { sendBirthdayEmail };
