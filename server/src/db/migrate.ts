import fs from "fs";
import path from "path";
import { pool } from "./pool";

async function migrate() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
