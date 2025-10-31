import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { contentTypes } from "./content-types";
import { questions } from "./questions";
import { studyModes } from "./study-modes";

export const questionStatistics = pgTable(
  "question_statistics",
  {
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
    studyModeId: uuid("study_mode_id").references(() => studyModes.id),
    modeCode: varchar("mode_code", { length: 50 }).notNull().default("aggregate"),
    totalAttempts: integer("total_attempts").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0),
    lastAttemptedAt: timestamp("last_attempted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userQuestionUnique: uniqueIndex("uq_question_statistics_user_question_mode").on(
      table.userId,
      table.questionId,
      table.modeCode,
    ),
    userIndex: index("idx_question_statistics_user").on(table.userId),
    questionIndex: index("idx_question_statistics_question").on(table.questionId),
    modeIndex: index("idx_question_statistics_mode").on(table.studyModeId),
  }),
);
