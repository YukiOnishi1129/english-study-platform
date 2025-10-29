import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { units } from "./units";
import { vocabularyEntries } from "./vocabulary-entries";

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    japanese: text("japanese").notNull(),
    prompt: text("prompt"),
    hint: text("hint"),
    explanation: text("explanation"),
    questionType: varchar("question_type", { length: 30 }).notNull().default("phrase"),
    vocabularyEntryId: uuid("vocabulary_entry_id").references(() => vocabularyEntries.id, {
      onDelete: "set null",
    }),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    unitIdIndex: index("idx_questions_unit_id").on(table.unitId),
    orderIndex: index("idx_questions_order").on(table.unitId, table.order),
    vocabularyEntryIndex: index("idx_questions_vocabulary_entry").on(table.vocabularyEntryId),
    questionTypeIndex: index("idx_questions_type").on(table.questionType),
  }),
);
