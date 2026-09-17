import "server-only";

import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT ?? 587);

const secure = process.env.SMTP_SECURE === "true";

if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASSWORD ||
  !process.env.SMTP_FROM_EMAIL
) {
  console.warn("SMTP configuration is incomplete.");
}

export const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,

  port,

  secure,

  auth: {
    user: process.env.SMTP_USER,

    pass: process.env.SMTP_PASSWORD,
  },
});

export function getMailFrom() {
  const name = process.env.SMTP_FROM_NAME ?? "HRAnalyst Placement Wing";

  const email = process.env.SMTP_FROM_EMAIL;

  if (!email) {
    throw new Error("SMTP_FROM_EMAIL is not configured");
  }

  return `"${name}" <${email}>`;
}
