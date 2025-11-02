import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const accountRoleHistories = pgTable("account_role_histories", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  previousRole: varchar("previous_role", { length: 20 }).$type<"admin" | "user">().notNull(),
  nextRole: varchar("next_role", { length: 20 }).$type<"admin" | "user">().notNull(),
  changedByAccountId: uuid("changed_by_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});
