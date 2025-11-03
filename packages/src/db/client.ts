import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// 環境変数の型定義
type DbConfig = {
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DRIVER?: "local" | "neon";
  DATABASE_URL?: string;
  DB_SSL?: string;
};

// シングルトンパターンでデータベース接続を管理
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzlePg> | undefined;
};

function createDbConnection() {
  const config: DbConfig = {
    DB_HOST: process.env.DB_HOST || "",
    DB_PORT: process.env.DB_PORT || "",
    DB_NAME: process.env.DB_NAME || "",
    DB_USER: process.env.DB_USER || "",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_DRIVER: process.env.DB_DRIVER as "local" | "neon" | undefined,
    DATABASE_URL: process.env.DATABASE_URL,
    DB_SSL: process.env.DB_SSL,
  };

  const shouldUseSsl =
    config.DB_DRIVER === "neon" || (config.DB_SSL ?? "").toLowerCase() === "true";

  const pool =
    config.DATABASE_URL && config.DATABASE_URL.length > 0
      ? new Pool({
          connectionString: config.DATABASE_URL,
          ssl: shouldUseSsl
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
        })
      : new Pool({
          host: config.DB_HOST || undefined,
          port: config.DB_PORT ? parseInt(config.DB_PORT, 10) : undefined,
          database: config.DB_NAME || undefined,
          user: config.DB_USER || undefined,
          password: config.DB_PASSWORD || undefined,
          ssl: shouldUseSsl
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
        });

  return drizzlePg(pool, { schema });
}

export const db = globalForDb.db ?? createDbConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

// 型エクスポート
export type Database = typeof db;
