import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type SendInviteArgs = {
  to: string;
  inviterName: string;
  listTitle: string;
  acceptUrl: string;
};

const shouldMock = env.MOCK_EMAIL === "true" || !env.SMTP_HOST;

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: env.SMTP_USER
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        : undefined
    });
  }

  return transporter;
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
