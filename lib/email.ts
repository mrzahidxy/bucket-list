import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type SendInviteArgs = {
  to: string;
  inviterName: string;
  listTitle: string;
  acceptUrl: string;
};

type SendPasswordResetArgs = {
  to: string;
  resetUrl: string;
};

const shouldMock = env.MOCK_EMAIL === "true" || !env.SMTP_HOST;

let transporter: nodemailer.Transporter | null = null;

/**
 * Creates and returns a nodemailer transporter instance
 * The transporter is created only once and reused for subsequent calls
 * @returns {nodemailer.Transporter} The configured transporter instance
 */
const getTransporter = (): nodemailer.Transporter => {
  // Check if transporter already exists
  if (!transporter) {
    // Create new transporter with SMTP configuration
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,      // SMTP server port
      secure: false,           // Use SSL/TLS
      auth: env.SMTP_USER      // Authentication credentials if provided
        ? {
            user: env.SMTP_USER,  // SMTP username
            pass: env.SMTP_PASS   // SMTP password
          }
        : undefined            // No authentication if user is not provided
    });
  }

  return transporter;  // Return the existing or newly created transporter
};

export const sendInvitationEmail = async ({
  to,
  inviterName,
  listTitle,
  acceptUrl
}: SendInviteArgs): Promise<void> => {
  const subject = `${inviterName} invited you to collaborate on ${listTitle}`;
  const text = `${inviterName} invited you to collaborate on "${listTitle}". Accept invitation: ${acceptUrl}`;

  if (shouldMock) {
    console.info("[mock-email]", { to, subject, text });
    return;
  }

  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html: `<p>${inviterName} invited you to collaborate on <strong>${listTitle}</strong>.</p><p><a href=\"${acceptUrl}\">Accept invitation</a></p>`
  });
};

export const sendPasswordResetEmail = async ({ to, resetUrl }: SendPasswordResetArgs): Promise<void> => {
  const subject = "Reset your BucketList password";
  const text = `We received a password reset request for your BucketList account. Reset your password: ${resetUrl}. This link expires in 15 minutes.`;

  if (shouldMock) {
    console.info("[mock-email]", { to, subject, text });
    return;
  }

  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html: `<p>We received a password reset request for your BucketList account.</p><p><a href=\"${resetUrl}\">Reset password</a></p><p>This link expires in 15 minutes.</p>`
  });
};
