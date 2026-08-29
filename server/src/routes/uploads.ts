import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/uploads/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT data, mime_type AS \"mimeType\" FROM admin_uploads WHERE id = $1",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).end();
    res.set("Content-Type", rows[0].mimeType);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(rows[0].data);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
