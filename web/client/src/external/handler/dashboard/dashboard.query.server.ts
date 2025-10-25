import "server-only";

import {
  ChapterRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  UnitRepositoryImpl,
} from "@acme/shared/db";
import { z } from "zod";
import type {
  DashboardDataDto,
  DashboardMaterialChapterDto,
  DashboardMaterialSummaryDto,
  DashboardMaterialUnitDto,
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

async function buildDashboardData(): Promise<DashboardDataDto> {
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

    await Promise.all(
      chapterEntities.map(async (chapterEntity) => {
        const units = await unitRepository.findByChapterId(chapterEntity.id);
        const counts = await questionRepository.countByUnitIds(
          units.map((unit) => unit.id),
        );

        const unitSummaries: DashboardMaterialUnitDto[] = units.map((unit) => {
          const questionCount = counts[unit.id] ?? 0;
          materialUnitCount += 1;
          materialQuestionCount += questionCount;
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
      }),
    );

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
      progressRate: 0,
      chapters: rootChapters,
    });
  }

  materialSummaries.sort((a, b) => a.order - b.order);

  return {
    stats: {
      totalAnswerCount: 0,
      correctAnswerCount: 0,
      todayAnswerCount: 0,
      accuracyRate: 0,
      studyStreakCount: 0,
      totalQuestionCount: aggregatedQuestionCount,
    },
    studyCalendar: [],
    materials: materialSummaries,
  };
}

export async function getDashboardData(request: {
  accountId: string;
}): Promise<DashboardDataDto> {
  const { accountId } = DashboardRequestSchema.parse(request);
  // accountId is currently unused; placeholder for future personalization
  void accountId;
  const data = await buildDashboardData();
  return DashboardDataSchema.parse(data);
}
