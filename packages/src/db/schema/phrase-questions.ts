import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { questions } from "./questions";

export const phraseQuestions = pgTable("phrase_questions", {
  questionId: uuid("question_id")
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  promptJa: text("prompt_ja").notNull(),
  promptEn: text("prompt_en"),
  hint: text("hint"),
  explanation: text("explanation"),
  audioUrl: text("audio_url"),
});

