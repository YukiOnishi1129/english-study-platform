import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "@/shared/lib/env";

// シングルトンパターンでデータベース接続を管理
const globalForDb = globalThis as unknown as {
  queryClient: postgres.Sql | undefined;
};

const queryClient =
  globalForDb.queryClient ??
  postgres(DATABASE_URL, {
    max: 10, // 最大接続数
    idle_timeout: 20, // アイドルタイムアウト（秒）
    connect_timeout: 10, // 接続タイムアウト（秒）
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
}

export const db = drizzle(queryClient);
