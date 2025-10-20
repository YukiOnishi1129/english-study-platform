import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 環境変数を読み込み
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error("Database connection parameters are required");
  }

  const pool = new Pool({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  const db = drizzle(pool);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: join(__dirname, "../../migrations") });

  console.log("Migrations completed!");

  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});