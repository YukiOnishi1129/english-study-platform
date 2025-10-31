import { boolean, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { contentTypes } from "./content-types";
import { studyModes } from "./study-modes";

export const contentTypeStudyModes = pgTable("content_type_study_modes", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentTypeId: uuid("content_type_id")
    .notNull()
    .references(() => contentTypes.id, { onDelete: "cascade" }),
  studyModeId: uuid("study_mode_id")
    .notNull()
    .references(() => studyModes.id, { onDelete: "cascade" }),
  priority: integer("priority").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
