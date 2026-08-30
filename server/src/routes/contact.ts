import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email, subject, and message are all required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING id, created_at AS "createdAt"`,
      [name.trim(), email.trim(), subject.trim(), message.trim()]
    );
    res.status(201).json({ id: rows[0].id, createdAt: rows[0].createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send your message. Please try again." });
  }
});

export default router;
