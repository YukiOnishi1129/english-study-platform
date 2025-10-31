import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { questions } from "./questions";

export const studyModeEnum = pgEnum("study_mode", ["jp_to_en", "en_to_jp", "sentence", "default"]);

export const userAnswers = pgTable("user_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  mode: studyModeEnum("mode").notNull().default("default"),
  userAnswerText: text("user_answer_text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  isManuallyMarked: boolean("is_manually_marked").notNull().default(false),
  answeredAt: timestamp("answered_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
