import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { materials } from "./materials";

export const vocabularyEntries = pgTable(
  "vocabulary_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    headword: varchar("headword", { length: 255 }).notNull(),
    pronunciation: varchar("pronunciation", { length: 255 }),
    partOfSpeech: varchar("part_of_speech", { length: 50 }),
    definitionJa: text("definition_ja").notNull(),
    memo: text("memo"),
    exampleSentenceEn: text("example_sentence_en"),
    exampleSentenceJa: text("example_sentence_ja"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    materialIdIndex: index("idx_vocabulary_entries_material_id").on(table.materialId),
    materialHeadwordUnique: uniqueIndex("uq_vocabulary_entries_material_headword").on(
      table.materialId,
      table.headword,
    ),
  }),
);
