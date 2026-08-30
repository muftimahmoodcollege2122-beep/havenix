import { Router } from "express";
import { signupCustomer, loginCustomer, getCustomerProfile, markEmailVerified, markPhoneVerified } from "../data/customerRepo";
import { signCustomerToken } from "../lib/jwt";
import { requireCustomer } from "../middleware/customerAuth";
import { sendOtp, verifyOtp } from "../services/otpService";

const router = Router();

router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    };
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ error: "Name, email, and a password of at least 8 characters are required." });
    }
    const customer = await signupCustomer(name, email, password, phone);
    const token = signCustomerToken(customer.id);
    // Kick off email verification right away; failure to send shouldn't block
    // account creation — the customer can retry from the verify step.
    sendOtp(customer.id, "email", customer.email, customer.name).catch((err) =>
      console.error("Failed to send signup verification email:", err)
    );
    res.status(201).json({ token, customer });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Signup failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const customer = await loginCustomer(email, password);
    const token = signCustomerToken(customer.id);
    res.json({ token, customer });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Login failed" });
  }
});

router.get("/auth/me", requireCustomer, async (req, res) => {
  try {
    const customer = await getCustomerProfile(req.customerId!);
    if (!customer) return res.status(404).json({ error: "Account not found" });
    res.json({ customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load account" });
  }
});

// ---------- Email verification ----------

router.post("/auth/verify/email/send", requireCustomer, async (req, res) => {
  try {
    const customer = await getCustomerProfile(req.customerId!);
    if (!customer) return res.status(404).json({ error: "Account not found" });
    if (customer.emailVerified) return res.json({ alreadyVerified: true });
    const result = await sendOtp(customer.id, "email", customer.email, customer.name);
    res.json({ sent: true, target: maskEmail(customer.email), ...result });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Could not send verification code" });
  }
});

router.post("/auth/verify/email/confirm", requireCustomer, async (req, res) => {
  try {
    const { code } = req.body as { code?: string };
    if (!code?.trim()) return res.status(400).json({ error: "Enter the code from your email." });
    const ok = await verifyOtp(req.customerId!, "email", code);
    if (!ok) return res.status(400).json({ error: "That code doesn't match. Please try again." });
    await markEmailVerified(req.customerId!);
    const customer = await getCustomerProfile(req.customerId!);
    res.json({ verified: true, customer });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Verification failed" });
  }
});

// ---------- Phone verification ----------

router.post("/auth/verify/phone/send", requireCustomer, async (req, res) => {
  try {
    const { phone } = req.body as { phone?: string };
    const customer = await getCustomerProfile(req.customerId!);
    if (!customer) return res.status(404).json({ error: "Account not found" });
    const target = (phone || customer.phone || "").trim();
    if (!target) return res.status(400).json({ error: "Enter a mobile number first." });
    const result = await sendOtp(req.customerId!, "sms", target, customer.name);
    res.json({ sent: true, target: maskPhone(target), ...result });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Could not send verification code" });
  }
});

router.post("/auth/verify/phone/confirm", requireCustomer, async (req, res) => {
  try {
    const { code, phone } = req.body as { code?: string; phone?: string };
    if (!code?.trim()) return res.status(400).json({ error: "Enter the code from your SMS." });
    const ok = await verifyOtp(req.customerId!, "sms", code);
    if (!ok) return res.status(400).json({ error: "That code doesn't match. Please try again." });
    await markPhoneVerified(req.customerId!, phone);
    const customer = await getCustomerProfile(req.customerId!);
    res.json({ verified: true, customer });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Verification failed" });
  }
});

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.length <= 4 ? phone : `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
}

export default router;
