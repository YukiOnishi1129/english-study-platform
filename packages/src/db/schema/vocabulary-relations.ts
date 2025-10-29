import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { vocabularyEntries } from "./vocabulary-entries";

export const vocabularyRelations = pgTable(
  "vocabulary_relations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vocabularyEntryId: uuid("vocabulary_entry_id")
      .notNull()
      .references(() => vocabularyEntries.id, { onDelete: "cascade" }),
    relationType: varchar("relation_type", { length: 20 }).notNull(),
    relatedText: varchar("related_text", { length: 255 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    entryIndex: index("idx_vocabulary_relations_entry").on(table.vocabularyEntryId),
    relationTypeIndex: index("idx_vocabulary_relations_type").on(table.relationType),
  }),
);
