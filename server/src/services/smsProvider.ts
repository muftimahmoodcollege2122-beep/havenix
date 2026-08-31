export interface SmsProvider {
  readonly name: string;
  send(toPhone: string, message: string): Promise<void>;
}

/**
 * Dev-friendly default: logs the code instead of sending a real SMS, so the
 * mobile-verification flow works end-to-end without an SMS gateway account.
 */
export class ConsoleSmsProvider implements SmsProvider {
  readonly name = "console";

  async send(toPhone: string, message: string): Promise<void> {
    console.log(`\n[sms:mock] To: ${toPhone}\n${message}\n`);
  }
}

/**
 * Twilio SMS provider. To go live:
 *   1. npm install twilio
 *   2. Set env vars:
 *        SMS_PROVIDER=twilio
 *        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *        TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *        TWILIO_FROM_NUMBER=+1xxxxxxxxxx   (a Twilio number, or an approved sender ID)
 *   3. Uncomment the twilio import/client code below.
 * No other file needs to change — otpService only calls getSmsProvider().send().
 */
export class TwilioProvider implements SmsProvider {
  readonly name = "twilio";

  async send(toPhone: string, message: string): Promise<void> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      throw Object.assign(new Error("SMS delivery is not configured (missing Twilio credentials)."), {
        status: 500,
      });
    }

    // --- Uncomment once `twilio` is installed (`npm install twilio`) ---
    // const twilio = (await import("twilio")).default;
    // const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   to: toPhone,
    //   from: TWILIO_FROM_NUMBER,
    //   body: message,
    // });
    // return;

    throw Object.assign(
      new Error(
        "TwilioProvider is stubbed — install `twilio` and uncomment the send logic in server/src/services/smsProvider.ts."
      ),
      { status: 501 }
    );
  }
}

/**
 * Other gateway slots: add a class implementing SmsProvider (e.g. Vonage,
 * or a local Pakistani gateway) and register it below — no other code
 * needs to change since callers only ever go through getSmsProvider().
 */

let instance: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (instance) return instance;
  const providerName = process.env.SMS_PROVIDER || "console";
  switch (providerName) {
    case "twilio":
      instance = new TwilioProvider();
      break;
    case "console":
    default:
      instance = new ConsoleSmsProvider();
      break;
  }
  return instance;
}
