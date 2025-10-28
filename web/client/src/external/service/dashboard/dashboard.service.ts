import {
  ChapterRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UnitRepositoryImpl,
  UserAnswerQueryRepositoryImpl,
} from "@acme/shared/db";

import type {
  DashboardDataDto,
  DashboardMaterialChapterDto,
  DashboardMaterialSummaryDto,
  DashboardMaterialUnitDto,
  DashboardStudyCalendarEntryDto,
} from "@/external/dto/dashboard/dashboard.query.dto";
import { DashboardDataSchema } from "@/external/dto/dashboard/dashboard.query.dto";

interface ChapterMeta {
  dto: DashboardMaterialChapterDto;
  parentChapterId: string | null;
}

interface MaterialSummaryResult {
  materialSummaries: DashboardMaterialSummaryDto[];
  totalQuestionCount: number;
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

function sortChaptersRecursively(
  chapters: DashboardMaterialChapterDto[],
): void {
  chapters.sort((a, b) => a.order - b.order);
  chapters.forEach((chapter) => {
    chapter.units.sort((a, b) => a.order - b.order);
    sortChaptersRecursively(chapter.children);
  });
}

export class DashboardService {
  private materialRepository: MaterialRepositoryImpl;
  private chapterRepository: ChapterRepositoryImpl;
  private unitRepository: UnitRepositoryImpl;
  private questionRepository: QuestionRepositoryImpl;
  private questionStatisticsRepository: QuestionStatisticsRepositoryImpl;
  private userAnswerQueryRepository: UserAnswerQueryRepositoryImpl;

  constructor() {
    this.materialRepository = new MaterialRepositoryImpl();
    this.chapterRepository = new ChapterRepositoryImpl();
    this.unitRepository = new UnitRepositoryImpl();
    this.questionRepository = new QuestionRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
    this.userAnswerQueryRepository = new UserAnswerQueryRepositoryImpl();
  }

  private async buildMaterialSummaries(
    accountId: string,
  ): Promise<MaterialSummaryResult> {
    const materials = await this.materialRepository.findAll();

    const materialSummaries: DashboardMaterialSummaryDto[] = [];
    let aggregatedQuestionCount = 0;

    for (const material of materials) {
      const chapterEntities = await this.chapterRepository.findByMaterialId(
        material.id,
      );

      const chapterMap = new Map<string, ChapterMeta>();
      const rootChapters: DashboardMaterialChapterDto[] = [];

      let materialUnitCount = 0;
      let materialQuestionCount = 0;
      let answeredQuestionCount = 0;

      const chapterUnitsMap = new Map<
        string,
        Awaited<ReturnType<typeof this.unitRepository.findByChapterId>>
      >();

      await Promise.all(
        chapterEntities.map(async (chapterEntity) => {
          const units = await this.unitRepository.findByChapterId(
            chapterEntity.id,
          );
          chapterUnitsMap.set(chapterEntity.id, units);
        }),
      );

      const allUnits = Array.from(chapterUnitsMap.values()).flat();
      const unitIds = allUnits.map((unit) => unit.id);

      const questionCounts =
        await this.questionRepository.countByUnitIds(unitIds);

      const questionsByUnit = new Map<string, string[]>();
      const allQuestions =
        unitIds.length > 0
          ? await this.questionRepository.findByUnitIds(unitIds)
          : [];

      allQuestions.forEach((question) => {
        const list = questionsByUnit.get(question.unitId) ?? [];
        list.push(question.id);
        questionsByUnit.set(question.unitId, list);
      });

      const questionIds = allQuestions.map((question) => question.id);

      const answeredQuestionSet = new Set<string>();
      if (questionIds.length > 0) {
        const stats =
          await this.questionStatisticsRepository.findByUserAndQuestionIds(
            accountId,
            questionIds,
          );
        stats.forEach((stat) => {
          if (stat.correctCount > 0) {
            answeredQuestionSet.add(stat.questionId);
          }
        });
      }

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

      materialSummaries.push({
        id: material.id,
        name: material.name,
        description: material.description ?? null,
        order: material.order,
        totalUnitCount: materialUnitCount,
        totalQuestionCount: materialQuestionCount,
        progressRate:
          materialQuestionCount === 0
            ? 0
            : Math.min(1, answeredQuestionCount / materialQuestionCount),
        chapters: rootChapters,
      });
    }

    materialSummaries.sort((a, b) => a.order - b.order);

    return { materialSummaries, totalQuestionCount: aggregatedQuestionCount };
  }

  private async buildStatsAndCalendar(
    accountId: string,
    totalQuestionCount: number,
  ) {
    const today = startOfUtcDay(new Date());
    const calendarWindowStart = addUtcDays(today, -34);

    const aggregateResult =
      await this.userAnswerQueryRepository.getDashboardAggregate({
        accountId,
        today,
        calendarWindowStart,
      });

    const totalAnswerCount = aggregateResult.aggregate.totalAnswerCount;
    const correctAnswerCount = aggregateResult.aggregate.correctAnswerCount;
    const todayAnswerCount = aggregateResult.aggregate.todayAnswerCount;

    const studyCalendar: DashboardStudyCalendarEntryDto[] =
      aggregateResult.calendar.map((row) => ({
        date: formatDateKey(row.answeredDate),
        totalAnswers: row.totalAnswers,
        correctAnswers: row.correctAnswers,
      }));

    const answeredDateSet = new Set<string>(
      aggregateResult.answeredDates.map((date) => formatDateKey(date)),
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
    };
  }

  async getDashboardData(accountId: string): Promise<DashboardDataDto> {
    const { materialSummaries, totalQuestionCount } =
      await this.buildMaterialSummaries(accountId);
    const { stats, calendar } = await this.buildStatsAndCalendar(
      accountId,
      totalQuestionCount,
    );

    return DashboardDataSchema.parse({
      stats,
      studyCalendar: calendar,
      materials: materialSummaries,
    });
  }
}
