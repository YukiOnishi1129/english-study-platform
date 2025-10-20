import {
  type CorrectAnswerRepository,
  CorrectAnswer as DomainCorrectAnswer,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { correctAnswers } from "../schema/correct-answers";

export type CorrectAnswer = InferSelectModel<typeof correctAnswers>;
export type NewCorrectAnswer = InferInsertModel<typeof correctAnswers>;

// DDD Repository implementation
export class CorrectAnswerRepositoryImpl implements CorrectAnswerRepository {
  async findById(id: string): Promise<DomainCorrectAnswer | null> {
    const result = await db.select().from(correctAnswers).where(eq(correctAnswers.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainCorrectAnswer({
      id: data.id,
      questionId: data.questionId,
      answerText: data.answerText,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByQuestionId(questionId: string): Promise<DomainCorrectAnswer[]> {
    const results = await db
      .select()
      .from(correctAnswers)
      .where(eq(correctAnswers.questionId, questionId))
      .orderBy(correctAnswers.order);

    return results.map(
      (data) =>
        new DomainCorrectAnswer({
          id: data.id,
          questionId: data.questionId,
          answerText: data.answerText,
          order: data.order,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async save(correctAnswer: DomainCorrectAnswer): Promise<DomainCorrectAnswer> {
    const [result] = await db
      .insert(correctAnswers)
      .values({
        id: correctAnswer.id,
        questionId: correctAnswer.questionId,
        answerText: correctAnswer.answerText,
        order: correctAnswer.order,
        createdAt: correctAnswer.createdAt,
        updatedAt: correctAnswer.updatedAt,
      })
      .onConflictDoUpdate({
        target: correctAnswers.id,
        set: {
          answerText: correctAnswer.answerText,
          order: correctAnswer.order,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save correct answer");
    }

    return new DomainCorrectAnswer({
      id: result.id,
      questionId: result.questionId,
      answerText: result.answerText,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(correctAnswers).where(eq(correctAnswers.id, id));
  }
}
