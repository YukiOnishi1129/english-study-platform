import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const accountStatusHistories = pgTable("account_status_histories", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  previousStatus: varchar("previous_status", { length: 10 })
    .$type<"active" | "inactive">()
    .notNull(),
  nextStatus: varchar("next_status", { length: 10 }).$type<"active" | "inactive">().notNull(),
  changedByAccountId: uuid("changed_by_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});
