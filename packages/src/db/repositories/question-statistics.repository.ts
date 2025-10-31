import {
  QuestionStatistics as DomainQuestionStatistics,
  type QuestionStatisticsMode,
  type QuestionStatisticsRepository,
  type StudyMode,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "../client";
import { questionStatistics } from "../schema/question-statistics";

export type QuestionStatisticsRow = InferSelectModel<typeof questionStatistics>;
export type NewQuestionStatistics = InferInsertModel<typeof questionStatistics>;

function mapToDomain(row: QuestionStatisticsRow): DomainQuestionStatistics {
  return new DomainQuestionStatistics({
    id: row.id,
    userId: row.userId,
    questionId: row.questionId,
    mode: row.mode,
    totalAttempts: row.totalAttempts,
    correctCount: row.correctCount,
    incorrectCount: row.incorrectCount,
    lastAttemptedAt: row.lastAttemptedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class QuestionStatisticsRepositoryImpl implements QuestionStatisticsRepository {
  async findByUserAndQuestion(
    userId: string,
    questionId: string,
    mode: QuestionStatisticsMode = "aggregate",
  ): Promise<DomainQuestionStatistics | null> {
    const [row] = await db
      .select()
      .from(questionStatistics)
      .where(
        and(
          eq(questionStatistics.userId, userId),
          eq(questionStatistics.questionId, questionId),
          eq(questionStatistics.mode, mode),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return mapToDomain(row);
  }

  async findByUserAndQuestionIds(
    userId: string,
    questionIds: string[],
    modes: QuestionStatisticsMode[] = ["aggregate"],
  ): Promise<DomainQuestionStatistics[]> {
    if (questionIds.length === 0) {
      return [];
    }

    const rows = await db
      .select()
      .from(questionStatistics)
      .where(
        and(
          eq(questionStatistics.userId, userId),
          inArray(questionStatistics.questionId, questionIds),
          inArray(questionStatistics.mode, modes),
        ),
      );

    return rows.map(mapToDomain);
  }

  private async upsertCounts(
    userId: string,
    questionId: string,
    mode: QuestionStatisticsMode,
    isCorrect: boolean,
  ): Promise<DomainQuestionStatistics> {
    const [row] = await db
      .insert(questionStatistics)
      .values({
        userId,
        questionId,
        mode,
        totalAttempts: 1,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
        lastAttemptedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [questionStatistics.userId, questionStatistics.questionId, questionStatistics.mode],
        set: {
          totalAttempts: sql`${questionStatistics.totalAttempts} + 1`,
          correctCount: isCorrect
            ? sql`${questionStatistics.correctCount} + 1`
            : questionStatistics.correctCount,
          incorrectCount: isCorrect
            ? questionStatistics.incorrectCount
            : sql`${questionStatistics.incorrectCount} + 1`,
          lastAttemptedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to update question statistics");
    }

    return mapToDomain(row);
  }

  async incrementCounts(
    userId: string,
    questionId: string,
    mode: StudyMode,
    isCorrect: boolean,
  ): Promise<{
    aggregate: DomainQuestionStatistics;
    mode: DomainQuestionStatistics;
  }> {
    const aggregate = await this.upsertCounts(userId, questionId, "aggregate", isCorrect);
    const modeStat = await this.upsertCounts(userId, questionId, mode, isCorrect);
    return { aggregate, mode: modeStat };
  }
}
