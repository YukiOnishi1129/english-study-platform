import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "../client";
import { userAnswers } from "../schema";

export interface UserAnswerAggregateRow {
  totalAnswerCount: number;
  correctAnswerCount: number;
  todayAnswerCount: number;
}

export interface UserAnswerCalendarRow {
  answeredDate: Date;
  totalAnswers: number;
  correctAnswers: number;
}

export interface UserAnswerDashboardAggregate {
  aggregate: UserAnswerAggregateRow;
  calendar: UserAnswerCalendarRow[];
  answeredDates: Date[];
}

export class UserAnswerQueryRepositoryImpl {
  async getDashboardAggregate(options: {
    accountId: string;
    today: Date;
    calendarWindowStart: Date;
  }): Promise<UserAnswerDashboardAggregate> {
    const { accountId, today, calendarWindowStart } = options;

    const [aggregateRow] = await db
      .select({
        total: sql<number>`count(*)`,
        correct: sql<number>`coalesce(sum(case when ${userAnswers.isCorrect} or ${userAnswers.isManuallyMarked} then 1 else 0 end), 0)`,
        today: sql<number>`coalesce(sum(case when ${userAnswers.answeredAt} >= ${today.toISOString()} then 1 else 0 end), 0)`,
      })
      .from(userAnswers)
      .where(eq(userAnswers.userId, accountId));

    const aggregate: UserAnswerAggregateRow = {
      totalAnswerCount: Number(aggregateRow?.total ?? 0),
      correctAnswerCount: Number(aggregateRow?.correct ?? 0),
      todayAnswerCount: Number(aggregateRow?.today ?? 0),
    };

    const calendarRows = await db
      .select({
        answeredDate: sql<Date>`${userAnswers.answeredAt}::date`,
        totalAnswers: sql<number>`count(*)`,
        correctAnswers: sql<number>`coalesce(sum(case when ${userAnswers.isCorrect} or ${userAnswers.isManuallyMarked} then 1 else 0 end), 0)`,
      })
      .from(userAnswers)
      .where(
        and(eq(userAnswers.userId, accountId), gte(userAnswers.answeredAt, calendarWindowStart)),
      )
      .groupBy(sql`${userAnswers.answeredAt}::date`)
      .orderBy(sql`${userAnswers.answeredAt}::date`);

    const calendar: UserAnswerCalendarRow[] = calendarRows.map((row) => ({
      answeredDate: row.answeredDate,
      totalAnswers: Number(row.totalAnswers ?? 0),
      correctAnswers: Number(row.correctAnswers ?? 0),
    }));

    const streakRows = await db
      .select({ answeredDate: sql<Date>`${userAnswers.answeredAt}::date` })
      .from(userAnswers)
      .where(eq(userAnswers.userId, accountId))
      .groupBy(sql`${userAnswers.answeredAt}::date`)
      .orderBy(sql`${userAnswers.answeredAt}::date desc`);

    const answeredDates = streakRows.map((row) => row.answeredDate);

    return {
      aggregate,
      calendar,
      answeredDates,
    };
  }
}
