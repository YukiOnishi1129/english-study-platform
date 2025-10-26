import "server-only";

import {
  chapters,
  MaterialRepositoryImpl,
  materials,
  questionStatistics,
  questions,
  units,
} from "@acme/shared/db";
import { and, eq, inArray, sql } from "drizzle-orm";

import {
  type MaterialDetailChapterDto,
  type MaterialDetailDto,
  MaterialDetailSchema,
  type MaterialDetailUnitDto,
} from "@/external/dto/material/material.detail.dto";
import {
  type MaterialListItemDto,
  MaterialListSchema,
} from "@/external/dto/material/material.list.dto";

const materialRepository = new MaterialRepositoryImpl();

function pickNextUnit(
  unitsByMaterial: Record<string, UnitProgressRow[]>,
  solvedByUnit: Map<string, number>,
): Record<string, string | null> {
  const nextUnitMap: Record<string, string | null> = {};

  for (const [materialId, unitRows] of Object.entries(unitsByMaterial)) {
    let fallback: string | null = null;
    let next: string | null = null;

    for (const row of unitRows) {
      const totalQuestions = Number(row.questionCount ?? 0);
      if (totalQuestions <= 0) {
        continue;
      }
      if (!fallback) {
        fallback = row.unitId;
      }
      const solved = solvedByUnit.get(row.unitId) ?? 0;
      if (solved < totalQuestions) {
        next = row.unitId;
        break;
      }
    }

    nextUnitMap[materialId] = next ?? fallback ?? null;
  }

  return nextUnitMap;
}

interface UnitProgressRow {
  materialId: string;
  chapterId: string;
  chapterOrder: number;
  unitId: string;
  unitOrder: number;
  questionCount: number;
}

export async function getMaterialList(options?: {
  accountId?: string | null;
}): Promise<MaterialListItemDto[]> {
  const accountId = options?.accountId ?? null;
  const { db } = await import("@acme/shared/db");

  const rows = await db
    .select({
      id: materials.id,
      name: materials.name,
      description: materials.description,
      updatedAt: materials.updatedAt,
      unitCount: sql<number>`count(distinct ${units.id})`,
      questionCount: sql<number>`count(${questions.id})`,
    })
    .from(materials)
    .leftJoin(chapters, eq(chapters.materialId, materials.id))
    .leftJoin(units, eq(units.chapterId, chapters.id))
    .leftJoin(questions, eq(questions.unitId, units.id))
    .groupBy(materials.id)
    .orderBy(materials.order, materials.createdAt);

  const materialIds = rows.map((row) => row.id);

  const unitsByMaterial: Record<string, UnitProgressRow[]> = {};
  const unitProgressRows: UnitProgressRow[] = materialIds.length
    ? await db
        .select({
          materialId: materials.id,
          chapterId: chapters.id,
          chapterOrder: chapters.order,
          unitId: units.id,
          unitOrder: units.order,
          questionCount: sql<number>`count(${questions.id})`,
        })
        .from(materials)
        .innerJoin(chapters, eq(chapters.materialId, materials.id))
        .innerJoin(units, eq(units.chapterId, chapters.id))
        .leftJoin(questions, eq(questions.unitId, units.id))
        .where(inArray(materials.id, materialIds))
        .groupBy(
          materials.id,
          chapters.id,
          chapters.order,
          units.id,
          units.order,
        )
        .orderBy(materials.id, chapters.order, units.order, units.createdAt)
    : [];

  for (const row of unitProgressRows) {
    const list = unitsByMaterial[row.materialId] ?? [];
    list.push({
      materialId: row.materialId,
      chapterId: row.chapterId,
      chapterOrder: row.chapterOrder ?? 0,
      unitId: row.unitId,
      unitOrder: row.unitOrder ?? 0,
      questionCount: Number(row.questionCount ?? 0),
    });
    unitsByMaterial[row.materialId] = list;
  }

  const unitIds = unitProgressRows.map((row) => row.unitId);
  const solvedByUnit = new Map<string, number>();

  if (accountId && unitIds.length > 0) {
    const solvedRows = await db
      .select({
        unitId: units.id,
        solved: sql<number>`count(distinct case when ${questionStatistics.correctCount} > 0 then ${questions.id} end)`,
      })
      .from(units)
      .leftJoin(questions, eq(questions.unitId, units.id))
      .leftJoin(
        questionStatistics,
        and(
          eq(questionStatistics.questionId, questions.id),
          eq(questionStatistics.userId, accountId),
        ),
      )
      .where(inArray(units.id, unitIds))
      .groupBy(units.id);

    for (const row of solvedRows) {
      solvedByUnit.set(row.unitId, Number(row.solved ?? 0));
    }
  }

  const nextUnitMap = pickNextUnit(unitsByMaterial, solvedByUnit);

  const dto = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    unitCount: Number(row.unitCount ?? 0),
    questionCount: Number(row.questionCount ?? 0),
    updatedAt: row.updatedAt.toISOString(),
    nextUnitId: nextUnitMap[row.id] ?? null,
  }));

  return MaterialListSchema.parse(dto);
}

export async function getMaterialDetail(input: {
  materialId: string;
  accountId?: string | null;
}): Promise<MaterialDetailDto> {
  const material = await materialRepository.findById(input.materialId);
  if (!material) {
    throw new Error("MATERIAL_NOT_FOUND");
  }

  const { db } = await import("@acme/shared/db");

  const aggregate = await db
    .select({
      unitCount: sql<number>`count(distinct ${units.id})`,
      questionCount: sql<number>`count(${questions.id})`,
    })
    .from(materials)
    .leftJoin(chapters, eq(chapters.materialId, materials.id))
    .leftJoin(units, eq(units.chapterId, chapters.id))
    .leftJoin(questions, eq(questions.unitId, units.id))
    .where(eq(materials.id, input.materialId));

  const totals = aggregate[0] ?? { unitCount: 0, questionCount: 0 };

  const unitRows = await db
    .select({
      chapterId: chapters.id,
      chapterName: chapters.name,
      chapterDescription: chapters.description,
      chapterLevel: chapters.level,
      chapterParentId: chapters.parentChapterId,
      chapterOrder: chapters.order,
      unitId: units.id,
      unitName: units.name,
      unitDescription: units.description,
      unitOrder: units.order,
      questionCount: sql<number>`count(${questions.id})`,
    })
    .from(chapters)
    .innerJoin(materials, eq(chapters.materialId, materials.id))
    .innerJoin(units, eq(units.chapterId, chapters.id))
    .leftJoin(questions, eq(questions.unitId, units.id))
    .where(eq(materials.id, input.materialId))
    .groupBy(
      chapters.id,
      chapters.name,
      chapters.description,
      chapters.level,
      chapters.parentChapterId,
      chapters.order,
      units.id,
      units.name,
      units.description,
      units.order,
    )
    .orderBy(chapters.order, chapters.createdAt, units.order, units.createdAt);

  const unitIds = unitRows.map((row) => row.unitId);
  const solvedByUnit = new Map<string, number>();

  if (input.accountId && unitIds.length > 0) {
    const solvedRows = await db
      .select({
        unitId: units.id,
        solved: sql<number>`count(distinct case when ${questionStatistics.correctCount} > 0 then ${questions.id} end)`,
      })
      .from(units)
      .leftJoin(questions, eq(questions.unitId, units.id))
      .leftJoin(
        questionStatistics,
        and(
          eq(questionStatistics.questionId, questions.id),
          eq(questionStatistics.userId, input.accountId),
        ),
      )
      .where(inArray(units.id, unitIds))
      .groupBy(units.id);

    for (const row of solvedRows) {
      solvedByUnit.set(row.unitId, Number(row.solved ?? 0));
    }
  }

  const chaptersById = new Map<string, MaterialDetailChapterDto>();
  const unitsByMaterial: Record<string, UnitProgressRow[]> = {
    [input.materialId]: [],
  };
  const detailUnits: Record<string, MaterialDetailUnitDto[]> = {};

  for (const row of unitRows) {
    const totalQuestions = Number(row.questionCount ?? 0);
    const solved = solvedByUnit.get(row.unitId) ?? 0;

    const chapter: MaterialDetailChapterDto = chaptersById.get(
      row.chapterId,
    ) ?? {
      id: row.chapterId,
      name: row.chapterName,
      description: row.chapterDescription ?? null,
      unitCount: 0,
      questionCount: 0,
      level: row.chapterLevel ?? 0,
      parentChapterId: row.chapterParentId ?? null,
      order: row.chapterOrder ?? 0,
      units: [],
    };

    chapter.unitCount += 1;
    chapter.questionCount += totalQuestions;

    const unitsList = chapter.units ?? [];
    unitsList.push({
      id: row.unitId,
      name: row.unitName,
      description: row.unitDescription ?? null,
      order: row.unitOrder ?? 0,
      questionCount: totalQuestions,
      solvedQuestionCount: solved,
    });
    chapter.units = unitsList;
    chaptersById.set(row.chapterId, chapter);

    const detailUnitsList = detailUnits[row.chapterId] ?? [];
    detailUnitsList.push({
      id: row.unitId,
      name: row.unitName,
      description: row.unitDescription ?? null,
      questionCount: totalQuestions,
      solvedQuestionCount: solved,
      order: row.unitOrder ?? 0,
    });
    detailUnits[row.chapterId] = detailUnitsList;

    unitsByMaterial[input.materialId].push({
      materialId: input.materialId,
      chapterId: row.chapterId,
      chapterOrder: row.chapterOrder ?? 0,
      unitId: row.unitId,
      unitOrder: row.unitOrder ?? 0,
      questionCount: totalQuestions,
    });
  }

  const nextUnitMap = pickNextUnit(unitsByMaterial, solvedByUnit);

  const chaptersArray = Array.from(chaptersById.values())
    .map((chapter) => ({
      ...chapter,
      units: (detailUnits[chapter.id] ?? [])
        .sort((a, b) => a.order - b.order)
        .map((unit) => ({
          id: unit.id,
          name: unit.name,
          description: unit.description,
          order: unit.order,
          questionCount: unit.questionCount,
          solvedQuestionCount: unit.solvedQuestionCount,
        })),
    }))
    .sort((a, b) => a.order - b.order);

  const dto: MaterialDetailDto = {
    material: {
      id: material.id,
      name: material.name,
      description: material.description ?? null,
      totalUnits: Number(totals.unitCount ?? 0),
      totalQuestions: Number(totals.questionCount ?? 0),
      updatedAt: material.updatedAt.toISOString(),
      nextUnitId: nextUnitMap[input.materialId] ?? null,
    },
    chapters: chaptersArray,
  };

  return MaterialDetailSchema.parse(dto);
}
