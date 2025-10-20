import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error("Missing required database environment variables");
}

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: false, // ローカル環境ではSSLを無効化
  },
  verbose: true,
  strict: true,
});
