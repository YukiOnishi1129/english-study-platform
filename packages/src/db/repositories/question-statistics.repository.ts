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
import { studyModes } from "../schema/study-modes";

export type QuestionStatisticsRow = InferSelectModel<typeof questionStatistics>;
export type NewQuestionStatistics = InferInsertModel<typeof questionStatistics>;

function mapToDomain(row: QuestionStatisticsRow): DomainQuestionStatistics {
  return new DomainQuestionStatistics({
    id: row.id,
    userId: row.userId,
    questionId: row.questionId,
    contentTypeId: row.contentTypeId,
    studyModeId: row.studyModeId ?? undefined,
    mode: row.modeCode as DomainQuestionStatistics["mode"],
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
    contentTypeId?: string,
    mode: QuestionStatisticsMode = "aggregate",
  ): Promise<DomainQuestionStatistics | null> {
    const conditions = [
      eq(questionStatistics.userId, userId),
      eq(questionStatistics.questionId, questionId),
      eq(questionStatistics.modeCode, mode),
    ];

    if (contentTypeId) {
      conditions.push(eq(questionStatistics.contentTypeId, contentTypeId));
    }

    const [row] = await db
      .select()
      .from(questionStatistics)
      .where(and(...conditions))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapToDomain(row);
  }

  async findByUserAndQuestionIds(
    userId: string,
    questionIds: string[],
    contentTypeId?: string,
    modes: QuestionStatisticsMode[] = ["aggregate"],
  ): Promise<DomainQuestionStatistics[]> {
    if (questionIds.length === 0) {
      return [];
    }

    const conditions = [
      eq(questionStatistics.userId, userId),
      inArray(questionStatistics.questionId, questionIds),
      inArray(questionStatistics.modeCode, modes),
    ];

    if (contentTypeId) {
      conditions.push(eq(questionStatistics.contentTypeId, contentTypeId));
    }

    const rows = await db
      .select()
      .from(questionStatistics)
      .where(and(...conditions));

    return rows.map(mapToDomain);
  }

  private async upsertCounts(
    userId: string,
    questionId: string,
    contentTypeId: string,
    mode: QuestionStatisticsMode,
    isCorrect: boolean,
    studyModeId?: string,
  ): Promise<DomainQuestionStatistics> {
    const [row] = await db
      .insert(questionStatistics)
      .values({
        userId,
        questionId,
        contentTypeId,
        studyModeId: studyModeId ?? null,
        modeCode: mode,
        totalAttempts: 1,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
        lastAttemptedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          questionStatistics.userId,
          questionStatistics.questionId,
          questionStatistics.modeCode,
        ],
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
    contentTypeId: string,
    mode: StudyMode,
    isCorrect: boolean,
    studyModeId?: string,
  ): Promise<{
    aggregate: DomainQuestionStatistics;
    mode: DomainQuestionStatistics;
  }> {
    const resolvedStudyModeId = studyModeId ?? (await this.resolveStudyModeId(mode));

    const aggregate = await this.upsertCounts(
      userId,
      questionId,
      contentTypeId,
      "aggregate",
      isCorrect,
      null,
    );
    const modeStat = await this.upsertCounts(
      userId,
      questionId,
      contentTypeId,
      mode,
      isCorrect,
      resolvedStudyModeId,
    );
    return { aggregate, mode: modeStat };
  }

  private async resolveStudyModeId(mode: StudyMode): Promise<string> {
    const [row] = await db
      .select({ id: studyModes.id })
      .from(studyModes)
      .where(eq(studyModes.code, mode))
      .limit(1);

    if (!row) {
      throw new Error(`Study mode "${mode}" is not registered`);
    }

    return row.id;
  }
}
