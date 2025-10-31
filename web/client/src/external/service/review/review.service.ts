import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UnitRepositoryImpl,
} from "@acme/shared/db";

import {
  type ReviewDataDto,
  ReviewDataSchema,
  type ReviewMaterialSummaryDto,
  type ReviewQuestionDto,
} from "@/external/dto/review/review.query.dto";
import {
  type ReviewSessionDataDto,
  ReviewSessionDataSchema,
} from "@/external/dto/review/review.session.dto";

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

export class ReviewService {
  private materialRepository: MaterialRepositoryImpl;
  private chapterRepository: ChapterRepositoryImpl;
  private unitRepository: UnitRepositoryImpl;
  private questionRepository: QuestionRepositoryImpl;
  private questionStatisticsRepository: QuestionStatisticsRepositoryImpl;
  private correctAnswerRepository: CorrectAnswerRepositoryImpl;

  constructor() {
    this.materialRepository = new MaterialRepositoryImpl();
    this.chapterRepository = new ChapterRepositoryImpl();
    this.unitRepository = new UnitRepositoryImpl();
    this.questionRepository = new QuestionRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
    this.correctAnswerRepository = new CorrectAnswerRepositoryImpl();
  }

  private async buildMaterialReviewData(
    materialId: string,
    materialName: string,
    accountId: string,
  ): Promise<MaterialReviewData> {
    const chapters = await this.chapterRepository.findByMaterialId(materialId);
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
      chapters.map((chapter) =>
        this.unitRepository.findByChapterId(chapter.id),
      ),
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
    const unitMap = new Map(unitsForMaterial.map((unit) => [unit.id, unit]));

    const allQuestions =
      unitIds.length > 0
        ? await this.questionRepository.findByUnitIds(unitIds)
        : [];

    if (allQuestions.length === 0) {
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

    const questionsByUnit = new Map<string, typeof allQuestions>();
    allQuestions.forEach((question) => {
      const list = questionsByUnit.get(question.unitId) ?? [];
      list.push(question);
      questionsByUnit.set(question.unitId, list);
    });

    questionsByUnit.forEach((list) => {
      list.sort((a, b) => a.order - b.order);
    });

    const questionIds = allQuestions.map((question) => question.id);
    const statsRows =
      questionIds.length > 0
        ? await this.questionStatisticsRepository.findByUserAndQuestionIds(
            accountId,
            questionIds,
            undefined,
          )
        : [];

    const statsMap = new Map(statsRows.map((row) => [row.questionId, row]));

    const groups: ReviewGroups = {
      weak: [],
      lowAttempts: [],
      unattempted: [],
    };

    let totalQuestionCount = 0;

    questionsByUnit.forEach((questionList, unitId) => {
      const unit = unitMap.get(unitId);

      questionList.forEach((question) => {
        totalQuestionCount += 1;
        const stats = statsMap.get(question.id);
        const totalAttempts = stats?.totalAttempts ?? 0;
        const correctCount = stats?.correctCount ?? 0;
        const incorrectCount = stats?.incorrectCount ?? 0;
        const accuracy =
          totalAttempts > 0 && correctCount >= 0
            ? correctCount / totalAttempts
            : null;
        const lastAttemptedAt = stats?.lastAttemptedAt ?? null;

        const base: ReviewQuestionDto = {
          questionId: question.id,
          unitId: question.unitId,
          unitName: unit?.name ?? "",
          unitOrder: unit?.order ?? unitOrderMap.get(question.unitId) ?? 0,
          questionOrder: question.order,
          japanese: question.japanese,
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracy,
          lastAttemptedAt,
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
    });

    const sortByAccuracy = (a: ReviewQuestionDto, b: ReviewQuestionDto) => {
      const accuracyA = a.accuracy ?? 1;
      const accuracyB = b.accuracy ?? 1;
      if (accuracyA !== accuracyB) {
        return accuracyA - accuracyB;
      }
      const timeA = a.lastAttemptedAt?.getTime() ?? 0;
      const timeB = b.lastAttemptedAt?.getTime() ?? 0;
      return timeA - timeB;
    };

    const sortByAttempts = (a: ReviewQuestionDto, b: ReviewQuestionDto) => {
      if (a.totalAttempts !== b.totalAttempts) {
        return a.totalAttempts - b.totalAttempts;
      }
      const timeA = a.lastAttemptedAt?.getTime() ?? 0;
      const timeB = b.lastAttemptedAt?.getTime() ?? 0;
      return timeA - timeB;
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
        totalQuestionCount,
        weakCount: groups.weak.length,
        lowAttemptCount: groups.lowAttempts.length,
        unattemptedCount: groups.unattempted.length,
      },
      groups,
    };
  }

  async getReviewData(
    accountId: string,
    materialId?: string,
  ): Promise<ReviewDataDto> {
    const materials = await this.materialRepository.findAll();
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
      const data = await this.buildMaterialReviewData(
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

  async getReviewSessionData(options: {
    accountId: string;
    materialId: string;
    group: "weak" | "lowAttempts" | "unattempted";
  }): Promise<ReviewSessionDataDto> {
    const { accountId, materialId, group } = options;

    const reviewData = await this.getReviewData(accountId, materialId);

    const summary = reviewData.materials.find(
      (material) => material.id === reviewData.selectedMaterialId,
    );

    const groupQuestions = reviewData.groups[group];
    if (!summary || groupQuestions.length === 0) {
      return ReviewSessionDataSchema.parse({
        material: {
          id: materialId,
          name: summary?.name ?? "選択した教材",
        },
        group,
        questions: [],
      });
    }

    const questionIds = groupQuestions.map((question) => question.questionId);

    const questionEntities =
      await this.questionRepository.findByIds(questionIds);
    const questionDetailMap = new Map(
      questionEntities.map((question) => [question.id, question]),
    );

    const acceptableAnswerRows =
      await this.correctAnswerRepository.findByQuestionIds(questionIds);

    const acceptableAnswerMap = new Map<string, string[]>();
    acceptableAnswerRows.forEach((row) => {
      const list = acceptableAnswerMap.get(row.questionId) ?? [];
      list.push(row.answerText);
      acceptableAnswerMap.set(row.questionId, list);
    });

    const questionsWithDetails = groupQuestions.map((question) => {
      const detail = questionDetailMap.get(question.questionId);
      const acceptableAnswers =
        acceptableAnswerMap.get(question.questionId) ?? [];
      return {
        ...question,
        hint: detail?.hint ?? null,
        explanation: detail?.explanation ?? null,
        acceptableAnswers,
      };
    });

    return ReviewSessionDataSchema.parse({
      material: {
        id: summary.id,
        name: summary.name,
      },
      group,
      questions: questionsWithDetails,
    });
  }
}
