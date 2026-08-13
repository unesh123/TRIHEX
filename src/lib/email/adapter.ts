export type EmailProvider = "console" | "resend" | "sendgrid" | "smtp";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  tags?: string[];
  replyTo?: string;
}

export interface EmailSendResult {
  ok: boolean;
  provider: EmailProvider;
  messageId: string | null;
  error?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailSendResult>;
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "[redacted]";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function redactRecipients(to: string | string[]): string {
  const list = Array.isArray(to) ? to : [to];
  return list.map(redactEmail).join(", ");
}

/**
 * Provider-agnostic email adapter.
 * Dev/default: logs a redacted summary to the console (no PII dumps).
 *
 * TODO: Wire Resend / SendGrid / SMTP using EMAIL_PROVIDER_API_KEY + EMAIL_FROM.
 */
export function createEmailAdapter(
  provider: EmailProvider = "console",
): EmailAdapter {
  if (provider === "console") {
    return {
      async send(message) {
        const messageId = `dev_${Date.now()}`;
        console.info("[email:dev]", {
          to: redactRecipients(message.to),
          subject: message.subject,
          hasHtml: Boolean(message.html),
          hasText: Boolean(message.text),
          tags: message.tags,
          messageId,
        });
        return { ok: true, provider: "console", messageId };
      },
    };
  }

  return {
    async send() {
      return {
        ok: false,
        provider,
        messageId: null,
        error: `Email provider "${provider}" is not configured yet.`,
      };
    },
  };
}

export const emailAdapter = createEmailAdapter(
  process.env.EMAIL_PROVIDER_API_KEY ? "resend" : "console",
);

export async function sendTransactionalEmail(
  message: EmailMessage,
): Promise<EmailSendResult> {
  return emailAdapter.send(message);
}
