import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { contentTypes } from "./content-types";
import { questions } from "./questions";
import { studyModes } from "./study-modes";

export const userAnswers = pgTable("user_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  contentTypeId: uuid("content_type_id")
    .notNull()
    .references(() => contentTypes.id),
  studyModeId: uuid("study_mode_id")
    .notNull()
    .references(() => studyModes.id),
  modeCode: varchar("mode_code", { length: 50 }).notNull(),
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
