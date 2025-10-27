import "server-only";

import {
  ChapterRepositoryImpl,
  db,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  questionStatistics,
  questions,
  UnitRepositoryImpl,
  userAnswers,
} from "@acme/shared/db";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import type {
  DashboardDataDto,
  DashboardMaterialChapterDto,
  DashboardMaterialSummaryDto,
  DashboardMaterialUnitDto,
  DashboardStudyCalendarEntryDto,
} from "@/external/dto/dashboard/dashboard.query.dto";
import { DashboardDataSchema } from "@/external/dto/dashboard/dashboard.query.dto";

const DashboardRequestSchema = z.object({
  accountId: z.string().min(1, "accountId is required"),
});

const materialRepository = new MaterialRepositoryImpl();
const chapterRepository = new ChapterRepositoryImpl();
const unitRepository = new UnitRepositoryImpl();
const questionRepository = new QuestionRepositoryImpl();

interface ChapterMeta {
  dto: DashboardMaterialChapterDto;
  parentChapterId: string | null;
}

function sortChaptersRecursively(
  chapters: DashboardMaterialChapterDto[],
): void {
  chapters.sort((a, b) => a.order - b.order);
  chapters.forEach((chapter) => {
    chapter.units.sort((a, b) => a.order - b.order);
    sortChaptersRecursively(chapter.children);
  });
}

function startOfUtcDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function addUtcDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

function formatDateKey(value: Date | string): string {
  if (typeof value === "string") {
    return value;
  }
  const year = value.getUTCFullYear();
  const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${value.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface MaterialSummaryResult {
  materialSummaries: DashboardMaterialSummaryDto[];
  totalQuestionCount: number;
}

async function buildMaterialSummaries(
  accountId: string,
): Promise<MaterialSummaryResult> {
  const materials = await materialRepository.findAll();

  const materialSummaries: DashboardMaterialSummaryDto[] = [];
  let aggregatedQuestionCount = 0;

  for (const material of materials) {
    const chapterEntities = await chapterRepository.findByMaterialId(
      material.id,
    );

    const chapterMap = new Map<string, ChapterMeta>();
    const rootChapters: DashboardMaterialChapterDto[] = [];

    let materialUnitCount = 0;
    let materialQuestionCount = 0;
    let answeredQuestionCount = 0;

    const chapterUnitsMap = new Map<
      string,
      Awaited<ReturnType<typeof unitRepository.findByChapterId>>
    >();

    await Promise.all(
      chapterEntities.map(async (chapterEntity) => {
        const units = await unitRepository.findByChapterId(chapterEntity.id);
        chapterUnitsMap.set(chapterEntity.id, units);
      }),
    );

    const allUnits = Array.from(chapterUnitsMap.values()).flat();
    const unitIds = allUnits.map((unit) => unit.id);

    const questionCounts = await questionRepository.countByUnitIds(unitIds);

    const questionRows = unitIds.length
      ? await db
          .select({
            unitId: questions.unitId,
            questionId: questions.id,
          })
          .from(questions)
          .where(inArray(questions.unitId, unitIds))
      : [];

    const questionsByUnit = new Map<string, string[]>();
    questionRows.forEach((row) => {
      const list = questionsByUnit.get(row.unitId) ?? [];
      list.push(row.questionId);
      questionsByUnit.set(row.unitId, list);
    });

    const questionIds = questionRows.map((row) => row.questionId);

    const answeredQuestionSet = questionIds.length
      ? new Set(
          (
            await db
              .select({ questionId: questionStatistics.questionId })
              .from(questionStatistics)
              .where(
                and(
                  eq(questionStatistics.userId, accountId),
                  inArray(questionStatistics.questionId, questionIds),
                ),
              )
          ).map((row) => row.questionId),
        )
      : new Set<string>();

    for (const chapterEntity of chapterEntities) {
      const units = chapterUnitsMap.get(chapterEntity.id) ?? [];

      const unitSummaries: DashboardMaterialUnitDto[] = units.map((unit) => {
        const questionCount = questionCounts[unit.id] ?? 0;
        const unitQuestionIds = questionsByUnit.get(unit.id) ?? [];
        const answeredInUnit = unitQuestionIds.filter((id) =>
          answeredQuestionSet.has(id),
        ).length;

        materialUnitCount += 1;
        materialQuestionCount += questionCount;
        answeredQuestionCount += answeredInUnit;

        return {
          id: unit.id,
          name: unit.name,
          description: unit.description ?? null,
          order: unit.order,
          questionCount,
        };
      });

      const dto: DashboardMaterialChapterDto = {
        id: chapterEntity.id,
        name: chapterEntity.name,
        description: chapterEntity.description ?? null,
        level: chapterEntity.level,
        order: chapterEntity.order,
        units: unitSummaries,
        children: [],
      };

      chapterMap.set(chapterEntity.id, {
        dto,
        parentChapterId: chapterEntity.parentChapterId ?? null,
      });
    }

    chapterMap.forEach(({ dto, parentChapterId }) => {
      if (parentChapterId) {
        const parent = chapterMap.get(parentChapterId);
        if (parent) {
          parent.dto.children.push(dto);
          return;
        }
      }
      rootChapters.push(dto);
    });

    sortChaptersRecursively(rootChapters);

    aggregatedQuestionCount += materialQuestionCount;

    const progressRate =
      materialQuestionCount === 0
        ? 0
        : Math.min(1, answeredQuestionCount / materialQuestionCount);

    materialSummaries.push({
      id: material.id,
      name: material.name,
      description: material.description ?? null,
      order: material.order,
      totalUnitCount: materialUnitCount,
      totalQuestionCount: materialQuestionCount,
      progressRate,
      chapters: rootChapters,
    });
  }

  materialSummaries.sort((a, b) => a.order - b.order);

  return { materialSummaries, totalQuestionCount: aggregatedQuestionCount };
}

interface StatsAndCalendarResult {
  stats: DashboardDataDto["stats"];
  calendar: DashboardStudyCalendarEntryDto[];
}

async function buildStatsAndCalendar(
  accountId: string,
  totalQuestionCount: number,
): Promise<StatsAndCalendarResult> {
  const today = startOfUtcDay(new Date());
  const calendarWindowStart = addUtcDays(today, -34);

  const [aggregateRow] = await db
    .select({
      total: sql<number>`count(*)`,
      correct: sql<number>`coalesce(sum(case when ${userAnswers.isCorrect} or ${userAnswers.isManuallyMarked} then 1 else 0 end), 0)`,
      today: sql<number>`coalesce(sum(case when ${userAnswers.answeredAt} >= ${today.toISOString()} then 1 else 0 end), 0)`,
    })
    .from(userAnswers)
    .where(eq(userAnswers.userId, accountId));

  const totalAnswerCount = Number(aggregateRow?.total ?? 0);
  const correctAnswerCount = Number(aggregateRow?.correct ?? 0);
  const todayAnswerCount = Number(aggregateRow?.today ?? 0);

  const calendarRows = await db
    .select({
      answeredDate: sql<Date>`${userAnswers.answeredAt}::date`,
      totalAnswers: sql<number>`count(*)`,
      correctAnswers: sql<number>`coalesce(sum(case when ${userAnswers.isCorrect} or ${userAnswers.isManuallyMarked} then 1 else 0 end), 0)`,
    })
    .from(userAnswers)
    .where(
      and(
        eq(userAnswers.userId, accountId),
        gte(userAnswers.answeredAt, calendarWindowStart),
      ),
    )
    .groupBy(sql`${userAnswers.answeredAt}::date`)
    .orderBy(sql`${userAnswers.answeredAt}::date`);

  const studyCalendar = calendarRows.map((row) => {
    const date = formatDateKey(row.answeredDate);
    return {
      date,
      totalAnswers: Number(row.totalAnswers ?? 0),
      correctAnswers: Number(row.correctAnswers ?? 0),
    } satisfies DashboardStudyCalendarEntryDto;
  });

  const _maxCount = studyCalendar.reduce(
    (max, entry) => Math.max(max, entry.totalAnswers),
    0,
  );

  const streakRows = await db
    .select({ answeredDate: sql<Date>`${userAnswers.answeredAt}::date` })
    .from(userAnswers)
    .where(eq(userAnswers.userId, accountId))
    .groupBy(sql`${userAnswers.answeredAt}::date`)
    .orderBy(sql`${userAnswers.answeredAt}::date desc`);

  const answeredDateSet = new Set<string>(
    streakRows.map((row) => formatDateKey(row.answeredDate)),
  );

  let studyStreakCount = 0;
  let cursor = new Date(today);
  while (answeredDateSet.has(formatDateKey(cursor))) {
    studyStreakCount += 1;
    cursor = addUtcDays(cursor, -1);
  }

  const accuracyRate =
    totalAnswerCount === 0 ? 0 : correctAnswerCount / totalAnswerCount;

  return {
    stats: {
      totalAnswerCount,
      correctAnswerCount,
      todayAnswerCount,
      accuracyRate,
      studyStreakCount,
      totalQuestionCount,
    },
    calendar: studyCalendar,
  } satisfies StatsAndCalendarResult;
}

async function buildDashboardData(
  accountId: string,
): Promise<DashboardDataDto> {
  const { materialSummaries, totalQuestionCount } =
    await buildMaterialSummaries(accountId);
  const { stats, calendar } = await buildStatsAndCalendar(
    accountId,
    totalQuestionCount,
  );

  return {
    stats,
    studyCalendar: calendar,
    materials: materialSummaries,
  } satisfies DashboardDataDto;
}

export async function getDashboardData(request: {
  accountId: string;
}): Promise<DashboardDataDto> {
  const { accountId } = DashboardRequestSchema.parse(request);
  const data = await buildDashboardData(accountId);
  return DashboardDataSchema.parse(data);
}
