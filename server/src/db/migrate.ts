import fs from "fs";
import path from "path";
import { pool } from "./pool";

async function migrate() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
  const files = ["schema.sql", "002_full_schema.sql", "003_payments.sql"];
  for (const file of files) {
    const schema = fs.readFileSync(path.join(__dirname, file), "utf-8");
    await pool.query(schema);
    console.log(`Applied ${file}`);
  }
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
