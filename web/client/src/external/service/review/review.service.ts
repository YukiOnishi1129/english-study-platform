import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UnitRepositoryImpl,
  VocabularyQuestionRepositoryImpl,
} from "@acme/shared/db";
import {
  type Question as DomainQuestion,
  type VocabularyQuestion as DomainVocabularyQuestion,
  QUESTION_STATISTICS_MODES,
  type QuestionStatistics,
  type QuestionStatisticsMode,
  type StudyMode,
} from "@acme/shared/domain";

import {
  type ReviewDataDto,
  ReviewDataSchema,
  type ReviewMaterialSummaryDto,
  type ReviewQuestionDto,
} from "@/external/dto/review/review.query.dto";
import {
  type ReviewSessionDataDto,
  ReviewSessionDataSchema,
  type ReviewSessionQuestionDto,
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
  private vocabularyQuestionRepository: VocabularyQuestionRepositoryImpl;

  constructor() {
    this.materialRepository = new MaterialRepositoryImpl();
    this.chapterRepository = new ChapterRepositoryImpl();
    this.unitRepository = new UnitRepositoryImpl();
    this.questionRepository = new QuestionRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
    this.correctAnswerRepository = new CorrectAnswerRepositoryImpl();
    this.vocabularyQuestionRepository = new VocabularyQuestionRepositoryImpl();
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
    const modes: QuestionStatisticsMode[] = [...QUESTION_STATISTICS_MODES];
    const statsRows =
      questionIds.length > 0
        ? await this.questionStatisticsRepository.findByUserAndQuestionIds(
            accountId,
            questionIds,
            undefined,
            modes,
          )
        : [];

    const statsMap = new Map<
      string,
      Map<QuestionStatisticsMode, QuestionStatistics>
    >();
    statsRows.forEach((row) => {
      const map = statsMap.get(row.questionId) ?? new Map();
      map.set(row.mode, row);
      statsMap.set(row.questionId, map);
    });

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
        const statsByMode = statsMap.get(question.id) ?? new Map();
        const aggregateStats = this.getAggregateStats(statsByMode);
        const totalAttempts = aggregateStats?.totalAttempts ?? 0;
        const correctCount = aggregateStats?.correctCount ?? 0;
        const incorrectCount = aggregateStats?.incorrectCount ?? 0;
        const accuracy =
          totalAttempts > 0 && correctCount >= 0
            ? correctCount / totalAttempts
            : null;
        const lastAttemptedAt = aggregateStats?.lastAttemptedAt ?? null;

        const recommendedMode = this.pickRecommendedMode(statsByMode);

        const base: ReviewQuestionDto = {
          questionId: question.id,
          unitId: question.unitId,
          unitName: unit?.name ?? "",
          unitOrder: unit?.order ?? unitOrderMap.get(question.unitId) ?? 0,
          questionOrder: question.order,
          japanese: question.japanese ?? "",
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracy,
          lastAttemptedAt,
          recommendedMode,
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

  private pickRecommendedMode(
    statsMap: Map<QuestionStatisticsMode, QuestionStatistics>,
  ): StudyMode {
    const candidateStats: Array<[StudyMode, QuestionStatistics]> = [];
    statsMap.forEach((stat, mode) => {
      if (mode === "aggregate") {
        return;
      }
      candidateStats.push([mode as StudyMode, stat]);
    });

    if (candidateStats.length === 0) {
      return "jp_to_en";
    }

    const withIncorrect = candidateStats
      .filter(([, stat]) => stat.incorrectCount > 0)
      .sort(([, a], [, b]) => {
        if (a.incorrectCount !== b.incorrectCount) {
          return b.incorrectCount - a.incorrectCount;
        }
        return b.totalAttempts - a.totalAttempts;
      });
    if (withIncorrect.length > 0) {
      return withIncorrect[0][0];
    }

    const withAttempts = candidateStats
      .filter(([, stat]) => stat.totalAttempts > 0)
      .sort(([, a], [, b]) => b.totalAttempts - a.totalAttempts);
    if (withAttempts.length > 0) {
      return withAttempts[0][0];
    }

    return "jp_to_en";
  }

  private splitCandidates(value?: string | null): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(/[/、,・,]/u)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private getAggregateStats(
    statsMap: Map<QuestionStatisticsMode, QuestionStatistics>,
  ): {
    totalAttempts: number;
    correctCount: number;
    incorrectCount: number;
    lastAttemptedAt: Date | null;
  } | null {
    const aggregate = statsMap.get("aggregate");
    if (aggregate) {
      return {
        totalAttempts: aggregate.totalAttempts,
        correctCount: aggregate.correctCount,
        incorrectCount: aggregate.incorrectCount,
        lastAttemptedAt: aggregate.lastAttemptedAt,
      };
    }

    let totalAttempts = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let latest: Date | null = null;

    statsMap.forEach((stat, mode) => {
      if (mode === "aggregate") {
        return;
      }
      totalAttempts += stat.totalAttempts;
      correctCount += stat.correctCount;
      incorrectCount += stat.incorrectCount;
      if (stat.lastAttemptedAt && (!latest || stat.lastAttemptedAt > latest)) {
        latest = stat.lastAttemptedAt;
      }
    });

    if (totalAttempts === 0 && correctCount === 0 && incorrectCount === 0) {
      return null;
    }

    return {
      totalAttempts,
      correctCount,
      incorrectCount,
      lastAttemptedAt: latest,
    };
  }

  private buildReviewSessionQuestion(options: {
    base: ReviewQuestionDto;
    detail: DomainQuestion | null | undefined;
    vocabulary: DomainVocabularyQuestion | undefined;
    acceptableAnswers: string[];
  }) {
    const { base, detail, vocabulary, acceptableAnswers } = options;

    const mode: StudyMode = base.recommendedMode ?? "jp_to_en";
    const variant = detail?.variant ?? "phrase";

    const promptFromQuestion = detail?.japanese ?? base.japanese;
    const baseHint = detail?.hint ?? null;
    const baseExplanation = detail?.explanation ?? null;
    const promptNote = detail?.prompt ?? null;

    let prompt = promptFromQuestion;
    let answerLanguage: "en" | "ja" = "en";
    let answerLabel = "英語で答えましょう";
    let answerPlaceholder: string | null = "例: 英語で回答";
    let sentencePromptJa: string | null = null;
    let sentenceTargetWord: string | null = null;
    let answers = acceptableAnswers.slice();
    const vocabularyPartOfSpeech = vocabulary?.partOfSpeech ?? null;
    const vocabularyPronunciation = vocabulary?.pronunciation ?? null;

    if (variant === "vocabulary" && vocabulary) {
      if (mode === "en_to_jp") {
        const candidateSet = new Set<string>();
        for (const item of this.splitCandidates(vocabulary.definitionJa)) {
          candidateSet.add(item);
        }
        for (const item of this.splitCandidates(vocabulary.memo)) {
          candidateSet.add(item);
        }
        if (promptFromQuestion) {
          candidateSet.add(promptFromQuestion);
        }

        answers = Array.from(candidateSet);
        if (answers.length === 0) {
          answers = [promptFromQuestion];
        }

        prompt = vocabulary.headword;
        answerLanguage = "ja";
        answerLabel = "日本語で答えましょう";
        answerPlaceholder = "例: 日本語訳を入力";
      } else if (mode === "sentence") {
        const sentenceJa =
          vocabulary.exampleSentenceJa?.trim() || promptFromQuestion;
        sentencePromptJa = sentenceJa;
        prompt = sentenceJa;
        sentenceTargetWord =
          vocabulary.headword && vocabulary.headword.trim().length > 0
            ? vocabulary.headword.trim()
            : null;
        answerLanguage = "en";
        answerLabel = "例文を英語で入力しましょう";
        answerPlaceholder = "例: 英文を入力";
        const exampleEn = vocabulary.exampleSentenceEn?.trim();
        if (exampleEn) {
          answers = [exampleEn];
        } else if (answers.length === 0 && promptFromQuestion) {
          answers = [promptFromQuestion];
        }
      } else {
        // jp_to_en or other modes fallback to English answer
        prompt = promptFromQuestion;
        answerLanguage = "en";
        answerLabel = "英語で答えましょう";
        answerPlaceholder = "例: 英語で回答";
        if (answers.length === 0 && vocabulary.headword) {
          answers = [vocabulary.headword];
        }
      }
    } else {
      // Non vocabulary variants
      prompt = promptFromQuestion;
      answerLanguage = "en";
      answerLabel =
        mode === "conversation_roleplay"
          ? "会話の返答を英語で答えましょう"
          : "英語で答えましょう";
      answerPlaceholder = "例: 英語で回答";
      if (mode !== "jp_to_en") {
        // If an unsupported mode was selected, fallback to jp_to_en expectations
        answers = acceptableAnswers.slice();
      }
    }

    if (!prompt || prompt.trim().length === 0) {
      prompt = base.japanese;
    }

    if (answers.length === 0) {
      answers = acceptableAnswers.length > 0 ? acceptableAnswers : [prompt];
    }

    const normalizedAnswers = Array.from(
      new Set(
        answers
          .map((answer) => answer.trim())
          .filter((answer) => answer.length > 0),
      ),
    );

    return {
      mode,
      prompt,
      promptNote,
      answerLanguage,
      answerLabel,
      answerPlaceholder,
      hint: baseHint,
      explanation: baseExplanation,
      acceptableAnswers: normalizedAnswers,
      vocabularyPartOfSpeech,
      vocabularyPronunciation,
      sentencePromptJa,
      sentenceTargetWord,
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

    const vocabularyQuestionMap =
      await this.vocabularyQuestionRepository.findByQuestionIds(questionIds);

    const questionsWithDetails = groupQuestions.map((question) => {
      const detail = questionDetailMap.get(question.questionId);
      const acceptableAnswers =
        acceptableAnswerMap.get(question.questionId) ?? [];
      const vocabulary = vocabularyQuestionMap[question.questionId];
      const view = this.buildReviewSessionQuestion({
        base: question,
        detail,
        vocabulary,
        acceptableAnswers,
      });

      return {
        ...question,
        hint: view.hint,
        explanation: view.explanation,
        acceptableAnswers: view.acceptableAnswers,
        mode: view.mode,
        prompt: view.prompt,
        promptNote: view.promptNote,
        answerLanguage: view.answerLanguage,
        answerLabel: view.answerLabel,
        answerPlaceholder: view.answerPlaceholder,
        vocabularyPartOfSpeech: view.vocabularyPartOfSpeech,
        vocabularyPronunciation: view.vocabularyPronunciation,
        sentencePromptJa: view.sentencePromptJa,
        sentenceTargetWord: view.sentenceTargetWord,
      } satisfies ReviewSessionQuestionDto;
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
