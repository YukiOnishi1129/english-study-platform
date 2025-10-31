import { UserAnswer as DomainUserAnswer, type UserAnswerRepository } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, desc, eq } from "drizzle-orm";

import { db } from "../client";
import { userAnswers } from "../schema/user-answers";

export type UserAnswer = InferSelectModel<typeof userAnswers>;
export type NewUserAnswer = InferInsertModel<typeof userAnswers>;

export class UserAnswerRepositoryImpl implements UserAnswerRepository {
  async save(answer: DomainUserAnswer): Promise<DomainUserAnswer> {
    const [result] = await db
      .insert(userAnswers)
      .values({
        id: answer.id,
        userId: answer.userId,
        questionId: answer.questionId,
        mode: answer.mode,
        userAnswerText: answer.userAnswerText,
        isCorrect: answer.isCorrect,
        isManuallyMarked: answer.isManuallyMarked,
        answeredAt: answer.answeredAt,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to persist user answer");
    }

    return new DomainUserAnswer({
      id: result.id,
      userId: result.userId,
      questionId: result.questionId,
      mode: result.mode,
      userAnswerText: result.userAnswerText,
      isCorrect: result.isCorrect,
      isManuallyMarked: result.isManuallyMarked,
      answeredAt: result.answeredAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async findRecentByUser(userId: string, limit = 10): Promise<DomainUserAnswer[]> {
    const rows = await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .orderBy(desc(userAnswers.answeredAt))
      .limit(limit);

    return rows.map(
      (row) =>
        new DomainUserAnswer({
          id: row.id,
          userId: row.userId,
          questionId: row.questionId,
          mode: row.mode,
          userAnswerText: row.userAnswerText,
          isCorrect: row.isCorrect,
          isManuallyMarked: row.isManuallyMarked,
          answeredAt: row.answeredAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
    );
  }

  async findByQuestion(
    userId: string,
    questionId: string,
    limit = 20,
  ): Promise<DomainUserAnswer[]> {
    const rows = await db
      .select()
      .from(userAnswers)
      .where(and(eq(userAnswers.userId, userId), eq(userAnswers.questionId, questionId)))
      .orderBy(desc(userAnswers.answeredAt))
      .limit(limit);

    return rows.map(
      (row) =>
        new DomainUserAnswer({
          id: row.id,
          userId: row.userId,
          questionId: row.questionId,
          mode: row.mode,
          userAnswerText: row.userAnswerText,
          isCorrect: row.isCorrect,
          isManuallyMarked: row.isManuallyMarked,
          answeredAt: row.answeredAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }),
    );
  }
}
