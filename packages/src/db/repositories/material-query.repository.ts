import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "../client";
import { chapters, materials, questionStatistics, questions, units } from "../schema";

interface MaterialListUnitProgressRow {
  materialId: string;
  chapterId: string;
  chapterOrder: number | null;
  unitId: string;
  unitOrder: number | null;
  questionCount: number;
}

interface MaterialListRow {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
  unitCount: number;
  questionCount: number;
}

interface MaterialDetailUnitRow {
  chapterId: string | null;
  chapterName: string | null;
  chapterDescription: string | null;
  chapterLevel: number | null;
  chapterParentId: string | null;
  chapterOrder: number | null;
  unitId: string | null;
  unitName: string | null;
  unitDescription: string | null;
  unitOrder: number | null;
  questionId: string | null;
  questionJapanese: string | null;
  questionHint: string | null;
  questionExplanation: string | null;
  questionOrder: number | null;
}

export interface MaterialListResultItem {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
  unitCount: number;
  questionCount: number;
  nextUnitId: string | null;
}

export interface MaterialDetailResult {
  material: {
    id: string;
    name: string;
    description: string | null;
    totalUnits: number;
    totalQuestions: number;
    updatedAt: Date;
    nextUnitId: string | null;
  };
  chapters: Array<{
    id: string;
    name: string;
    description: string | null;
    level: number;
    parentChapterId: string | null;
    order: number;
    unitCount: number;
    questionCount: number;
    units: Array<{
      id: string;
      name: string;
      description: string | null;
      order: number;
      questionCount: number;
      solvedQuestionCount: number;
    }>;
  }>;
}

function pickNextUnit(
  unitsByMaterial: Record<string, MaterialListUnitProgressRow[]>,
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

export class MaterialQueryRepositoryImpl {
  async getMaterialList(accountId: string | null): Promise<MaterialListResultItem[]> {
    const rows = (await db
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
      .orderBy(materials.order, materials.createdAt)) as MaterialListRow[];

    const materialIds = rows.map((row) => row.id);

    const unitsByMaterial: Record<string, MaterialListUnitProgressRow[]> = {};
    const unitProgressRows: MaterialListUnitProgressRow[] = materialIds.length
      ? ((await db
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
          .groupBy(materials.id, chapters.id, chapters.order, units.id, units.order)
          .orderBy(
            materials.id,
            chapters.order,
            units.order,
            units.createdAt,
          )) as MaterialListUnitProgressRow[])
      : [];

    for (const row of unitProgressRows) {
      const list = unitsByMaterial[row.materialId] ?? [];
      list.push({
        materialId: row.materialId,
        chapterId: row.chapterId,
        chapterOrder: row.chapterOrder,
        unitId: row.unitId,
        unitOrder: row.unitOrder,
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

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      updatedAt: row.updatedAt,
      unitCount: Number(row.unitCount ?? 0),
      questionCount: Number(row.questionCount ?? 0),
      nextUnitId: nextUnitMap[row.id] ?? null,
    }));
  }

  async getMaterialDetail(options: {
    materialId: string;
    accountId: string | null;
  }): Promise<MaterialDetailResult> {
    const materialRows = await db
      .select({
        id: materials.id,
        name: materials.name,
        description: materials.description,
        updatedAt: materials.updatedAt,
      })
      .from(materials)
      .where(eq(materials.id, options.materialId))
      .limit(1);

    const material = materialRows.at(0);
    if (!material) {
      throw new Error("MATERIAL_NOT_FOUND");
    }

    const aggregateRows = await db
      .select({
        unitCount: sql<number>`count(distinct ${units.id})`,
        questionCount: sql<number>`count(${questions.id})`,
      })
      .from(materials)
      .leftJoin(chapters, eq(chapters.materialId, materials.id))
      .leftJoin(units, eq(units.chapterId, chapters.id))
      .leftJoin(questions, eq(questions.unitId, units.id))
      .where(eq(materials.id, options.materialId));

    const totals = aggregateRows.at(0) ?? { unitCount: 0, questionCount: 0 };

    const unitRows = (await db
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
        questionId: questions.id,
        questionJapanese: questions.japanese,
        questionHint: questions.hint,
        questionExplanation: questions.explanation,
        questionOrder: questions.order,
      })
      .from(chapters)
      .innerJoin(units, eq(units.chapterId, chapters.id))
      .leftJoin(questions, eq(questions.unitId, units.id))
      .where(eq(chapters.materialId, options.materialId))
      .orderBy(chapters.order, units.order, questions.order)) as MaterialDetailUnitRow[];

    const questionIds = Array.from(
      new Set(
        unitRows.map((row) => row.questionId).filter((value): value is string => Boolean(value)),
      ),
    );

    const solvedQuestionSet = new Set<string>();

    if (options.accountId && questionIds.length > 0) {
      const solvedRows = await db
        .select({
          questionId: questionStatistics.questionId,
          correctCount: questionStatistics.correctCount,
        })
        .from(questionStatistics)
        .where(
          and(
            eq(questionStatistics.userId, options.accountId),
            inArray(questionStatistics.questionId, questionIds),
          ),
        );

      for (const row of solvedRows) {
        if (Number(row.correctCount ?? 0) > 0 && row.questionId) {
          solvedQuestionSet.add(row.questionId);
        }
      }
    }

    interface UnitAggregate {
      id: string;
      name: string;
      description: string | null;
      order: number;
      questionIds: string[];
      solvedQuestionCount: number;
    }

    interface ChapterAggregate {
      id: string;
      name: string;
      description: string | null;
      level: number;
      parentChapterId: string | null;
      order: number;
      units: UnitAggregate[];
    }

    const unitsMap = new Map<string, UnitAggregate>();
    const chaptersMap = new Map<string, ChapterAggregate>();

    for (const row of unitRows) {
      if (!row.unitId || !row.unitName) {
        continue;
      }

      let unit = unitsMap.get(row.unitId);
      if (!unit) {
        unit = {
          id: row.unitId,
          name: row.unitName,
          description: row.unitDescription ?? null,
          order: row.unitOrder ?? 0,
          questionIds: [],
          solvedQuestionCount: 0,
        };
        unitsMap.set(row.unitId, unit);
      }

      if (row.questionId && !unit.questionIds.includes(row.questionId)) {
        unit.questionIds.push(row.questionId);
        if (solvedQuestionSet.has(row.questionId)) {
          unit.solvedQuestionCount += 1;
        }
      }

      if (!row.chapterId || !row.chapterName) {
        continue;
      }

      let chapter = chaptersMap.get(row.chapterId);
      if (!chapter) {
        chapter = {
          id: row.chapterId,
          name: row.chapterName,
          description: row.chapterDescription ?? null,
          level: row.chapterLevel ?? 0,
          parentChapterId: row.chapterParentId ?? null,
          order: row.chapterOrder ?? 0,
          units: [],
        };
        chaptersMap.set(row.chapterId, chapter);
      }

      if (!chapter.units.find((item) => item.id === unit.id)) {
        chapter.units.push(unit);
      }
    }

    const orderedUnits = Array.from(unitsMap.values()).sort((a, b) => a.order - b.order);

    let nextUnitId: string | null = null;
    for (const unit of orderedUnits) {
      if (unit.questionIds.length === 0) {
        continue;
      }
      if (nextUnitId === null) {
        nextUnitId = unit.id;
      }
      if (unit.solvedQuestionCount < unit.questionIds.length) {
        nextUnitId = unit.id;
        break;
      }
    }

    const chapterResults = Array.from(chaptersMap.values()).map((chapter) => {
      const units = chapter.units
        .sort((a, b) => a.order - b.order)
        .map((unit) => ({
          id: unit.id,
          name: unit.name,
          description: unit.description,
          order: unit.order,
          questionCount: unit.questionIds.length,
          solvedQuestionCount: unit.solvedQuestionCount,
        }));

      const questionCount = units.reduce((sum, unit) => sum + unit.questionCount, 0);

      return {
        id: chapter.id,
        name: chapter.name,
        description: chapter.description,
        level: chapter.level,
        parentChapterId: chapter.parentChapterId,
        order: chapter.order,
        unitCount: units.length,
        questionCount,
        units,
      };
    });

    const sortedChapters = chapterResults.sort((a, b) => {
      if (a.level === b.level) {
        return a.order - b.order;
      }
      return a.level - b.level;
    });

    return {
      material: {
        id: material.id,
        name: material.name,
        description: material.description ?? null,
        totalUnits: Number(totals.unitCount ?? 0),
        totalQuestions: Number(totals.questionCount ?? 0),
        updatedAt: material.updatedAt,
        nextUnitId,
      },
      chapters: sortedChapters,
    };
  }
}
