import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { contentTypes } from "./content-types";

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  contentTypeId: uuid("content_type_id")
    .notNull()
    .references(() => contentTypes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
