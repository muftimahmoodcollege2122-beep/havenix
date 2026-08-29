import { Router } from "express";
import { signupCustomer, loginCustomer, getCustomerProfile } from "../data/customerRepo";
import { signCustomerToken } from "../lib/jwt";
import { requireCustomer } from "../middleware/customerAuth";

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

export default router;
