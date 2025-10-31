import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { questions } from "./questions";
import { vocabularyEntries } from "./vocabulary-entries";

export const vocabularyQuestions = pgTable("vocabulary_questions", {
  questionId: uuid("question_id")
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  vocabularyEntryId: uuid("vocabulary_entry_id").references(() => vocabularyEntries.id, {
    onDelete: "set null",
  }),
  headword: varchar("headword", { length: 255 }).notNull(),
  pronunciation: varchar("pronunciation", { length: 255 }),
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  definitionJa: text("definition_ja").notNull(),
  memo: text("memo"),
  exampleSentenceEn: text("example_sentence_en"),
  exampleSentenceJa: text("example_sentence_ja"),
});

