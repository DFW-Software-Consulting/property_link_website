import net from "node:net";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `mailer.test.ts` fully mocks `nodemailer`, so nothing in this repo ever
 * exercises real SMTP-protocol transport code. This file is a narrow smoke
 * test that speaks to a hand-rolled local SMTP stub over a real TCP socket,
 * proving the actual nodemailer transport + MIME construction + our config
 * wiring genuinely work end to end (kept separate from mailer.test.ts so the
 * two files' opposite mocking strategies for `nodemailer` never collide).
 */

type StubSmtpServer = {
  server: net.Server;
  port: number;
  state: { mailFrom: string; rcptTo: string; data: string };
};

/** Minimal SMTP-speaking TCP stub: no AUTH/STARTTLS advertised, plain text exchange. */
function startStubSmtpServer(): Promise<StubSmtpServer> {
  const state = { mailFrom: "", rcptTo: "", data: "" };

  return new Promise((resolve) => {
    const server = net.createServer((socket) => {
      let buffer = "";
      let inData = false;
      let dataLines: string[] = [];

      socket.write("220 localhost ESMTP\r\n");

      socket.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\r\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 2);

          if (inData) {
            if (line === ".") {
              inData = false;
              state.data = dataLines.join("\r\n");
              socket.write("250 OK\r\n");
            } else {
              dataLines.push(line);
            }
            continue;
          }

          const upper = line.toUpperCase();
          if (upper.startsWith("EHLO") || upper.startsWith("HELO")) {
            socket.write("250-localhost\r\n250 OK\r\n");
          } else if (upper.startsWith("MAIL FROM:")) {
            state.mailFrom = line.match(/<([^>]*)>/)?.[1] ?? "";
            socket.write("250 OK\r\n");
          } else if (upper.startsWith("RCPT TO:")) {
            state.rcptTo = line.match(/<([^>]*)>/)?.[1] ?? "";
            socket.write("250 OK\r\n");
          } else if (upper.startsWith("DATA")) {
            inData = true;
            dataLines = [];
            socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
          } else if (upper.startsWith("QUIT")) {
            socket.write("221 Bye\r\n");
            socket.end();
          } else {
            socket.write("250 OK\r\n");
          }
        }
      });
    });

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, port, state });
    });
  });
}

function closeServer(server: net.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

describe("mailer real SMTP transport smoke test", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let stub: StubSmtpServer | null = null;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(async () => {
    process.env = originalEnv;
    if (stub) {
      await closeServer(stub.server);
      stub = null;
    }
  });

  it("delivers a real message over the wire through the actual nodemailer transport", async () => {
    stub = await startStubSmtpServer();

    process.env.SMTP_HOST = "127.0.0.1";
    process.env.SMTP_PORT = String(stub.port);
    process.env.SMTP_USER = "smoke";
    process.env.SMTP_PASS = "smoke";
    process.env.CONTACT_TO = "inbox@example.com";
    process.env.CONTACT_FROM = "PropertyLink <noreply@example.com>";

    vi.resetModules();
    const { sendContactNotification } = await import("../mailer");

    await sendContactNotification({
      subject: "Real transport smoke test",
      html: "<p>Hello from the smoke test</p>",
      text: "Hello from the smoke test",
      replyTo: "resident@example.com",
    });

    expect(stub.state.mailFrom).toBe("noreply@example.com");
    expect(stub.state.rcptTo).toBe("inbox@example.com");
    expect(stub.state.data).toContain("Subject: Real transport smoke test");
    expect(stub.state.data).toContain("Hello from the smoke test");
  });

  it("throws when the SMTP transport is not configured", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    process.env.CONTACT_TO = "inbox@example.com";
    process.env.CONTACT_FROM = "PropertyLink <noreply@example.com>";

    vi.resetModules();
    const { sendContactNotification } = await import("../mailer");

    await expect(
      sendContactNotification({
        subject: "Real transport smoke test",
        html: "<p>Hello</p>",
      }),
    ).rejects.toThrow("Email transport is not configured");
  });
});
