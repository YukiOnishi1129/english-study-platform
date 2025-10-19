import type { Config } from "drizzle-kit";
import { DATABASE_URL } from "./src/shared/lib/env";

export default {
  schema: "./src/external/client/db/schema/*.ts",
  out: "./src/external/client/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
