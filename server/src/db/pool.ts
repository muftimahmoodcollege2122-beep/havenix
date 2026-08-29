import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:havenix@localhost:5432/havenix";

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});
