import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// 環境変数を読み込み
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_DRIVER,
    DATABASE_URL,
    DB_SSL,
  } = process.env;

  let pool: Pool;
  const shouldUseSsl = DB_DRIVER === "neon" || (DB_SSL ?? "").toLowerCase() === "true";

  if (DB_DRIVER === "neon" && DATABASE_URL) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: shouldUseSsl
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });
  } else {
    if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
      throw new Error("Database connection parameters are required");
    }

    pool = new Pool({
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      ssl: shouldUseSsl
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });
  }

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
