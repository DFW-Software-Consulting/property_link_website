import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

/**
 * Server-only email transport. Configuration is optional at import time; this
 * module only throws when a send is actually attempted without full SMTP config.
 */

type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
  from: string;
};

function getEmailConfig(): EmailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } =
    env;
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !CONTACT_TO ||
    !CONTACT_FROM
  ) {
    return null;
  }
  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    pass: SMTP_PASS,
    to: CONTACT_TO,
    from: CONTACT_FROM,
  };
}

/** True when all SMTP/contact env vars are present. */
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}

let transporter: Transporter | null = null;

type SendParams = {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendContactNotification(
  params: SendParams,
): Promise<void> {
  const config = getEmailConfig();
  if (!config) {
    throw new Error(
      "Email is not configured (missing SMTP_* / CONTACT_* environment variables).",
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
  }

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
