import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
  env: {
    SMTP_HOST: "smtp.example.com" as string | undefined,
    SMTP_PORT: 465 as number | undefined,
    SMTP_USER: "mailer" as string | undefined,
    SMTP_PASS: "password" as string | undefined,
    CONTACT_TO: "inquiries@example.com" as string | undefined,
    CONTACT_FROM: "PropertyLink <contact@example.com>" as string | undefined,
    MAINTENANCE_MAILBOX: "maintenance@example.com" as string | undefined,
    FORM_FROM_ADDRESS: "forms@example.com" as string | undefined,
    MAINTENANCE_INTAKE_SHARED_SECRET: "shared-secret" as string | undefined,
  },
}));

vi.mock("@/lib/env", () => ({ env: mocks.env }));
vi.mock("nodemailer", () => ({
  default: { createTransport: mocks.createTransport },
}));

import {
  isEmailConfigured,
  isMaintenanceIntakeConfigured,
  sendContactNotification,
  sendMaintenanceRequestEmail,
} from "../mailer";

const configuredEnv = { ...mocks.env };

describe("mailer", () => {
  beforeEach(() => {
    Object.assign(mocks.env, configuredEnv);
    vi.clearAllMocks();
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
  });

  it("reports configuration only when all required contact and maintenance settings exist", () => {
    expect(isEmailConfigured()).toBe(true);
    expect(isMaintenanceIntakeConfigured()).toBe(true);

    mocks.env.CONTACT_TO = undefined;
    mocks.env.MAINTENANCE_INTAKE_SHARED_SECRET = undefined;
    expect(isEmailConfigured()).toBe(false);
    expect(isMaintenanceIntakeConfigured()).toBe(false);
  });

  it("sends contact notifications through SMTP using the configured inbox", async () => {
    await sendContactNotification({
      subject: "New inquiry",
      html: "<p>Details</p>",
      text: "Details",
      replyTo: "resident@example.com",
    });

    expect(mocks.createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 465,
      secure: true,
      auth: { user: "mailer", pass: "password" },
    });
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "PropertyLink <contact@example.com>",
        to: "inquiries@example.com",
        replyTo: "resident@example.com",
        subject: "New inquiry",
      }),
    );
  });

  it("uses the stable maintenance sender and includes submitted attachments", async () => {
    const attachment = {
      filename: "submission.json",
      content: Buffer.from("{}"),
      contentType: "application/json",
    };

    await sendMaintenanceRequestEmail({
      subject: "Maintenance request",
      html: "<p>Request</p>",
      replyTo: "resident@example.com",
      attachments: [attachment],
    });

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "forms@example.com",
        to: "maintenance@example.com",
        replyTo: "resident@example.com",
        attachments: [attachment],
      }),
    );
  });

  it("rejects transport failures rather than swallowing delivery errors", async () => {
    mocks.sendMail.mockRejectedValueOnce(new Error("SMTP unavailable"));

    await expect(
      sendContactNotification({ subject: "New inquiry", html: "<p>Details</p>" }),
    ).rejects.toThrow("SMTP unavailable");
  });

  it("rejects send attempts when required addresses or SMTP settings are missing", async () => {
    mocks.env.CONTACT_TO = undefined;
    await expect(
      sendContactNotification({ subject: "New inquiry", html: "<p>Details</p>" }),
    ).rejects.toThrow("missing CONTACT_TO / CONTACT_FROM");

    Object.assign(mocks.env, configuredEnv, { SMTP_PASS: undefined });
    await expect(
      sendMaintenanceRequestEmail({
        subject: "Maintenance request",
        html: "<p>Request</p>",
        attachments: [],
      }),
    ).rejects.toThrow("missing SMTP_*");

    Object.assign(mocks.env, configuredEnv, {
      MAINTENANCE_MAILBOX: undefined,
    });
    await expect(
      sendMaintenanceRequestEmail({
        subject: "Maintenance request",
        html: "<p>Request</p>",
        attachments: [],
      }),
    ).rejects.toThrow("missing MAINTENANCE_MAILBOX / FORM_FROM_ADDRESS");
  });
});
