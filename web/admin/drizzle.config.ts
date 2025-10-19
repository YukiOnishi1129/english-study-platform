import { resolve } from "node:path";
import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

// Load environment variables for development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: resolve(process.cwd(), ".env.local") });
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/ENGLISH_STUDY_PLATFORM_DB";

export default {
  schema: "./src/external/client/db/schema/*.ts",
  out: "./src/external/client/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
