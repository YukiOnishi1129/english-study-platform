"use server";

import "server-only";

import {
  ChapterRepositoryImpl,
  db,
  MaterialRepositoryImpl,
  questionStatistics,
  questions,
  UnitRepositoryImpl,
  units,
} from "@acme/shared/db";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  type ReviewDataDto,
  ReviewDataSchema,
  type ReviewMaterialSummaryDto,
  type ReviewQuestionDto,
} from "@/external/dto/review/review.query.dto";

const materialRepository = new MaterialRepositoryImpl();
const chapterRepository = new ChapterRepositoryImpl();
const unitRepository = new UnitRepositoryImpl();

const INPUT_SCHEMA = z.object({
  accountId: z.string().min(1),
  materialId: z.string().min(1).optional(),
});

const LOW_ATTEMPT_THRESHOLD = 3;
const WEAK_ACCURACY_THRESHOLD = 0.6;

interface ReviewGroups {
  weak: ReviewQuestionDto[];
  lowAttempts: ReviewQuestionDto[];
  unattempted: ReviewQuestionDto[];
}

interface MaterialReviewData {
  summary: ReviewMaterialSummaryDto;
  groups: ReviewGroups;
}

async function buildMaterialReviewData(
  materialId: string,
  materialName: string,
  accountId: string,
): Promise<MaterialReviewData> {
  const chapters = await chapterRepository.findByMaterialId(materialId);
  if (chapters.length === 0) {
    return {
      summary: {
        id: materialId,
        name: materialName,
        totalQuestionCount: 0,
        weakCount: 0,
        lowAttemptCount: 0,
        unattemptedCount: 0,
      },
      groups: { weak: [], lowAttempts: [], unattempted: [] },
    };
  }

  const unitLists = await Promise.all(
    chapters.map((chapter) => unitRepository.findByChapterId(chapter.id)),
  );
  const unitsForMaterial = unitLists.flat();
  if (unitsForMaterial.length === 0) {
    return {
      summary: {
        id: materialId,
        name: materialName,
        totalQuestionCount: 0,
        weakCount: 0,
        lowAttemptCount: 0,
        unattemptedCount: 0,
      },
      groups: { weak: [], lowAttempts: [], unattempted: [] },
    };
  }

  const unitOrderMap = new Map<string, number>();
  unitsForMaterial.forEach((unit) => {
    unitOrderMap.set(unit.id, unit.order);
  });

  const unitIds = unitsForMaterial.map((unit) => unit.id);

  const questionRows =
    unitIds.length === 0
      ? []
      : await db
          .select({
            questionId: questions.id,
            unitId: questions.unitId,
            japanese: questions.japanese,
            questionOrder: questions.order,
            unitName: units.name,
            unitOrder: units.order,
          })
          .from(questions)
          .innerJoin(units, eq(questions.unitId, units.id))
          .where(inArray(questions.unitId, unitIds))
          .orderBy(units.order, questions.order);

  if (questionRows.length === 0) {
    return {
      summary: {
        id: materialId,
        name: materialName,
        totalQuestionCount: 0,
        weakCount: 0,
        lowAttemptCount: 0,
        unattemptedCount: 0,
      },
      groups: { weak: [], lowAttempts: [], unattempted: [] },
    };
  }

  const questionIds = questionRows.map((row) => row.questionId);

  const statsRows =
    questionIds.length === 0
      ? []
      : await db
          .select({
            questionId: questionStatistics.questionId,
            totalAttempts: questionStatistics.totalAttempts,
            correctCount: questionStatistics.correctCount,
            incorrectCount: questionStatistics.incorrectCount,
            lastAttemptedAt: questionStatistics.lastAttemptedAt,
          })
          .from(questionStatistics)
          .where(
            and(
              eq(questionStatistics.userId, accountId),
              inArray(questionStatistics.questionId, questionIds),
            ),
          );

  const statsMap = new Map(statsRows.map((row) => [row.questionId, row]));

  const groups: ReviewGroups = {
    weak: [],
    lowAttempts: [],
    unattempted: [],
  };

  questionRows.forEach((row) => {
    const stats = statsMap.get(row.questionId);
    const totalAttempts = Number(stats?.totalAttempts ?? 0);
    const correctCount = Number(stats?.correctCount ?? 0);
    const incorrectCount = Number(stats?.incorrectCount ?? 0);
    const accuracy =
      totalAttempts > 0 && correctCount >= 0
        ? correctCount / totalAttempts
        : null;
    const lastAttemptedAt = stats?.lastAttemptedAt ?? null;

    const base: ReviewQuestionDto = {
      questionId: row.questionId,
      unitId: row.unitId,
      unitName: row.unitName,
      unitOrder: unitOrderMap.get(row.unitId) ?? row.unitOrder ?? 0,
      questionOrder: row.questionOrder ?? 0,
      japanese: row.japanese,
      totalAttempts,
      correctCount,
      incorrectCount,
      accuracy,
      lastAttemptedAt: lastAttemptedAt ? lastAttemptedAt.toISOString() : null,
    };

    if (totalAttempts === 0) {
      groups.unattempted.push(base);
      return;
    }

    if (accuracy !== null && accuracy < WEAK_ACCURACY_THRESHOLD) {
      groups.weak.push(base);
    }

    if (totalAttempts > 0 && totalAttempts < LOW_ATTEMPT_THRESHOLD) {
      groups.lowAttempts.push(base);
    }
  });

  const sortByAccuracy = (a: ReviewQuestionDto, b: ReviewQuestionDto) => {
    const accuracyA = a.accuracy ?? 1;
    const accuracyB = b.accuracy ?? 1;
    if (accuracyA !== accuracyB) {
      return accuracyA - accuracyB;
    }
    return (a.lastAttemptedAt ?? "").localeCompare(b.lastAttemptedAt ?? "");
  };

  const sortByAttempts = (a: ReviewQuestionDto, b: ReviewQuestionDto) => {
    if (a.totalAttempts !== b.totalAttempts) {
      return a.totalAttempts - b.totalAttempts;
    }
    return (a.lastAttemptedAt ?? "").localeCompare(b.lastAttemptedAt ?? "");
  };

  const sortByOrder = (a: ReviewQuestionDto, b: ReviewQuestionDto) => {
    if (a.unitOrder !== b.unitOrder) {
      return a.unitOrder - b.unitOrder;
    }
    return a.questionOrder - b.questionOrder;
  };

  groups.weak.sort(sortByAccuracy);
  groups.lowAttempts.sort(sortByAttempts);
  groups.unattempted.sort(sortByOrder);

  return {
    summary: {
      id: materialId,
      name: materialName,
      totalQuestionCount: questionRows.length,
      weakCount: groups.weak.length,
      lowAttemptCount: groups.lowAttempts.length,
      unattemptedCount: groups.unattempted.length,
    },
    groups,
  };
}

export async function getReviewData(input: {
  accountId: string;
  materialId?: string;
}): Promise<ReviewDataDto> {
  const { accountId, materialId } = INPUT_SCHEMA.parse(input);

  const materials = await materialRepository.findAll();
  if (materials.length === 0) {
    return ReviewDataSchema.parse({
      materials: [],
      selectedMaterialId: null,
      groups: { weak: [], lowAttempts: [], unattempted: [] },
      thresholds: {
        weakAccuracy: WEAK_ACCURACY_THRESHOLD,
        lowAttempt: LOW_ATTEMPT_THRESHOLD,
      },
    });
  }

  const materialMap = new Map(materials.map((mat) => [mat.id, mat]));
  const selectedMaterial =
    (materialId ? materialMap.get(materialId) : undefined) ?? materials[0];

  const summaries: ReviewMaterialSummaryDto[] = [];
  let selectedGroups: ReviewGroups = {
    weak: [],
    lowAttempts: [],
    unattempted: [],
  };

  for (const material of materials) {
    const data = await buildMaterialReviewData(
      material.id,
      material.name,
      accountId,
    );
    summaries.push(data.summary);
    if (material.id === selectedMaterial.id) {
      selectedGroups = data.groups;
    }
  }

  return ReviewDataSchema.parse({
    materials: summaries,
    selectedMaterialId: selectedMaterial.id,
    groups: selectedGroups,
    thresholds: {
      weakAccuracy: WEAK_ACCURACY_THRESHOLD,
      lowAttempt: LOW_ATTEMPT_THRESHOLD,
    },
  });
}
