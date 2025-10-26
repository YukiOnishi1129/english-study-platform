import "server-only";

import {
  chapters,
  MaterialRepositoryImpl,
  materials,
  questions,
  units,
} from "@acme/shared/db";
import { eq, sql } from "drizzle-orm";

import {
  type MaterialDetailDto,
  MaterialDetailSchema,
} from "@/external/dto/material/material.detail.dto";
import {
  type MaterialListItemDto,
  MaterialListSchema,
} from "@/external/dto/material/material.list.dto";

const materialRepository = new MaterialRepositoryImpl();

export async function getMaterialList(): Promise<MaterialListItemDto[]> {
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

  const dto = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    unitCount: Number(row.unitCount ?? 0),
    questionCount: Number(row.questionCount ?? 0),
    updatedAt: row.updatedAt.toISOString(),
  }));

  return MaterialListSchema.parse(dto);
}

export async function getMaterialDetail(input: {
  materialId: string;
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

  const chapterRows = await db
    .select({
      id: chapters.id,
      name: chapters.name,
      description: chapters.description,
      level: chapters.level,
      parentChapterId: chapters.parentChapterId,
      unitCount: sql<number>`count(distinct ${units.id})`,
      questionCount: sql<number>`count(${questions.id})`,
    })
    .from(chapters)
    .leftJoin(units, eq(units.chapterId, chapters.id))
    .leftJoin(questions, eq(questions.unitId, units.id))
    .where(eq(chapters.materialId, input.materialId))
    .groupBy(chapters.id)
    .orderBy(chapters.level, chapters.order, chapters.createdAt);

  const dto: MaterialDetailDto = {
    material: {
      id: material.id,
      name: material.name,
      description: material.description ?? null,
      totalUnits: Number(totals.unitCount ?? 0),
      totalQuestions: Number(totals.questionCount ?? 0),
      updatedAt: material.updatedAt.toISOString(),
    },
    chapters: chapterRows.map((chapter) => ({
      id: chapter.id,
      name: chapter.name,
      description: chapter.description ?? null,
      unitCount: Number(chapter.unitCount ?? 0),
      questionCount: Number(chapter.questionCount ?? 0),
      level: chapter.level,
      parentChapterId: chapter.parentChapterId ?? null,
    })),
  };

  return MaterialDetailSchema.parse(dto);
}
