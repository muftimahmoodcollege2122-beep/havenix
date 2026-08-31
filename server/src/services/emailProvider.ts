export interface EmailProvider {
  readonly name: string;
  send(to: string, subject: string, text: string, html?: string): Promise<void>;
}

/**
 * Dev-friendly default: no external call, just logs the code so the
 * signup/verification flow is fully testable without SMTP credentials.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async send(to: string, subject: string, text: string): Promise<void> {
    console.log(`\n[email:mock] To: ${to}\nSubject: ${subject}\n${text}\n`);
  }
}

/**
 * Sends real mail through a Gmail account using an App Password
 * (https://myaccount.google.com/apppasswords — requires 2-Step Verification
 * on the Gmail account). Set:
 *   EMAIL_PROVIDER=gmail
 *   GMAIL_USER=you@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
 *
 * Uses `nodemailer` lazily so the dependency is only required when this
 * provider is actually selected.
 */
export class GmailSmtpProvider implements EmailProvider {
  readonly name = "gmail";
  private transporterPromise: Promise<import("nodemailer").Transporter> | null = null;

  private getTransporter() {
    if (!this.transporterPromise) {
      this.transporterPromise = import("nodemailer").then((nodemailer) =>
        nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        })
      );
    }
    return this.transporterPromise;
  }

  async send(to: string, subject: string, text: string, html?: string): Promise<void> {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw Object.assign(new Error("Email delivery is not configured."), { status: 500 });
    }
    const transporter = await this.getTransporter();
    await transporter.sendMail({
      from: `"Havenix" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  }
}

let instance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (instance) return instance;
  // Auto-detect: if Gmail credentials are present, use them even if
  // EMAIL_PROVIDER wasn't explicitly set — avoids a silent no-op provider
  // when someone configures the credentials but forgets the flag.
  const hasGmailCreds = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
  const providerName = process.env.EMAIL_PROVIDER || (hasGmailCreds ? "gmail" : "console");
  switch (providerName) {
    case "gmail":
      instance = new GmailSmtpProvider();
      break;
    case "console":
    default:
      instance = new ConsoleEmailProvider();
      break;
  }
  return instance;
}
