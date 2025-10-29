import { index, integer, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { questions } from "./questions";

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
    userQuestionUnique: uniqueIndex("uq_question_statistics_user_question").on(
      table.userId,
      table.questionId,
    ),
    userIndex: index("idx_question_statistics_user").on(table.userId),
    questionIndex: index("idx_question_statistics_question").on(table.questionId),
  }),
);
