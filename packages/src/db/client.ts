import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

// 環境変数の型定義
type DbConfig = {
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DRIVER?: "local" | "neon";
  DATABASE_URL?: string;
};

// シングルトンパターンでデータベース接続を管理
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleNeon> | undefined;
};

function createDbConnection() {
  const config: DbConfig = {
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: process.env.DB_PORT!,
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_DRIVER: process.env.DB_DRIVER as "local" | "neon" | undefined,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  // ローカル環境の場合はpgドライバを使用
  if (config.DB_DRIVER === "local" || !config.DATABASE_URL) {
    if (
      !config.DB_HOST ||
      !config.DB_PORT ||
      !config.DB_NAME ||
      !config.DB_USER ||
      !config.DB_PASSWORD
    ) {
      throw new Error("Database connection parameters are required");
    }

    const pool = new Pool({
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
    });
    return drizzlePg(pool, { schema });
  }

  // 本番環境（Neon）の場合
  const sql = neon(config.DATABASE_URL);
  return drizzleNeon(sql, { schema });
}

export const db = globalForDb.db ?? createDbConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

// 型エクスポート
export type Database = typeof db;
