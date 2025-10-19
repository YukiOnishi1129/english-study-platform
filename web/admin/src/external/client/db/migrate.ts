import { resolve } from "node:path";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Load environment variables only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") });
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/ENGLISH_STUDY_PLATFORM_DB";

const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log("🔄 Running migrations...");
  console.log(`📍 Database URL: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`);

  try {
    await migrate(db, {
      migrationsFolder: "./src/external/client/db/migrations",
    });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
