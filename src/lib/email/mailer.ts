import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

/**
 * Server-only email transport. Configuration is optional at import time; this
 * module only throws when a send is actually attempted without full SMTP config.
 */

let transporter: Transporter | null = null;

/** True when the shared SMTP transport (host/port/user/pass) is configured. */
function isSmtpConfigured(): boolean {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
}

/** Lazily create (and reuse) the SMTP transport. Throws if SMTP is unconfigured. */
function getTransporter(): Transporter {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Email transport is not configured (missing SMTP_* environment variables).",
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

/* --------------------------- contact inquiries --------------------------- */

/** True when SMTP plus the contact to/from addresses are present. */
export function isEmailConfigured(): boolean {
  return isSmtpConfigured() && Boolean(env.CONTACT_TO && env.CONTACT_FROM);
}

/** A file attached to an outgoing message, in nodemailer's shape. */
export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type SendParams = {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export async function sendContactNotification(
  params: SendParams,
): Promise<void> {
  if (!env.CONTACT_TO || !env.CONTACT_FROM) {
    throw new Error(
      "Email is not configured (missing CONTACT_TO / CONTACT_FROM environment variables).",
    );
  }

  await getTransporter().sendMail({
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
    attachments: params.attachments,
  });
}

/* --------------------------- rental application -------------------------- */

/** True when SMTP plus the rental-application to/from addresses are present. */
export function isRentalApplicationConfigured(): boolean {
  return (
    isSmtpConfigured() &&
    Boolean((env.RENTAL_APPLICATION_TO || env.CONTACT_TO) && env.FROM_ADDRESS)
  );
}

export async function sendRentalApplicationEmail(
  params: SendParams,
): Promise<void> {
  const to = env.RENTAL_APPLICATION_TO || env.CONTACT_TO;
  const from = env.FROM_ADDRESS;
  if (!to || !from) {
    throw new Error(
      "Rental application email is not configured (missing RENTAL_APPLICATION_TO / FROM_ADDRESS environment variables).",
    );
  }

  await getTransporter().sendMail({
    from,
    to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

/* ------------------------- maintenance requests -------------------------- */

/**
 * True when everything needed to send AND sign a maintenance request is set:
 * SMTP transport, the intake mailbox, a stable from-address, and the shared
 * signing secret. The route refuses to send if this is false.
 */
export function isMaintenanceIntakeConfigured(): boolean {
  return (
    isSmtpConfigured() &&
    Boolean(
      env.MAINTENANCE_MAILBOX &&
        env.FORM_FROM_ADDRESS &&
        env.MAINTENANCE_INTAKE_SHARED_SECRET,
    )
  );
}

export type MaintenanceAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type SendMaintenanceParams = {
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments: MaintenanceAttachment[];
};

export async function sendMaintenanceRequestEmail(
  params: SendMaintenanceParams,
): Promise<void> {
  if (!env.MAINTENANCE_MAILBOX || !env.FORM_FROM_ADDRESS) {
    throw new Error(
      "Maintenance intake is not configured (missing MAINTENANCE_MAILBOX / FORM_FROM_ADDRESS).",
    );
  }

  await getTransporter().sendMail({
    // From MUST be the stable address the ingest filters on — never the resident.
    from: env.FORM_FROM_ADDRESS,
    to: env.MAINTENANCE_MAILBOX,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
    attachments: params.attachments,
  });
}
