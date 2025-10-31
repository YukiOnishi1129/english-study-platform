import {
  ChapterRepositoryImpl,
  CorrectAnswerRepositoryImpl,
  MaterialRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UnitRepositoryImpl,
  VocabularyEntryRepositoryImpl,
  VocabularyRelationRepositoryImpl,
} from "@acme/shared/db";
import {
  QUESTION_STATISTICS_MODES,
  type QuestionStatisticsMode,
  STUDY_MODES,
  type StudyMode,
} from "@acme/shared/domain";

import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { UnitDetailSchema } from "@/external/dto/unit/unit.query.dto";

function serialize(date: Date): string {
  return date.toISOString();
}

type DomainQuestionStatistics = Awaited<
  ReturnType<QuestionStatisticsRepositoryImpl["findByUserAndQuestionIds"]>
>[number];

function serializeStatistics(
  stat: DomainQuestionStatistics | undefined | null,
) {
  if (!stat) {
    return null;
  }
  return {
    totalAttempts: stat.totalAttempts,
    correctCount: stat.correctCount,
    incorrectCount: stat.incorrectCount,
    accuracy: stat.accuracy,
    lastAttemptedAt: stat.lastAttemptedAt
      ? serialize(stat.lastAttemptedAt)
      : null,
  } as const;
}

export class UnitService {
  private unitRepository: UnitRepositoryImpl;
  private chapterRepository: ChapterRepositoryImpl;
  private materialRepository: MaterialRepositoryImpl;
  private questionRepository: QuestionRepositoryImpl;
  private correctAnswerRepository: CorrectAnswerRepositoryImpl;
  private questionStatisticsRepository: QuestionStatisticsRepositoryImpl;
  private vocabularyEntryRepository: VocabularyEntryRepositoryImpl;
  private vocabularyRelationRepository: VocabularyRelationRepositoryImpl;

  constructor() {
    this.unitRepository = new UnitRepositoryImpl();
    this.chapterRepository = new ChapterRepositoryImpl();
    this.materialRepository = new MaterialRepositoryImpl();
    this.questionRepository = new QuestionRepositoryImpl();
    this.correctAnswerRepository = new CorrectAnswerRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
    this.vocabularyEntryRepository = new VocabularyEntryRepositoryImpl();
    this.vocabularyRelationRepository = new VocabularyRelationRepositoryImpl();
  }

  private async buildChapterPath(
    chapterId: string,
  ): Promise<UnitDetailDto["chapterPath"]> {
    const path: UnitDetailDto["chapterPath"] = [];
    let current = await this.chapterRepository.findById(chapterId);

    while (current) {
      path.push({
        id: current.id,
        materialId: current.materialId,
        parentChapterId: current.parentChapterId ?? null,
        name: current.name,
        description: current.description ?? null,
        level: current.level,
        order: current.order,
        createdAt: serialize(current.createdAt),
        updatedAt: serialize(current.updatedAt),
      });

      if (!current.parentChapterId) {
        break;
      }

      current = await this.chapterRepository.findById(current.parentChapterId);
    }

    return path.reverse();
  }

  async getUnitDetail(options: {
    unitId: string;
    accountId?: string | null;
  }): Promise<UnitDetailDto> {
    const { unitId, accountId } = options;

    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new Error("UNIT_NOT_FOUND");
    }

    const chapter = await this.chapterRepository.findById(unit.chapterId);
    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    const material = await this.materialRepository.findById(chapter.materialId);
    if (!material) {
      throw new Error("MATERIAL_NOT_FOUND");
    }

    const chapterPath = await this.buildChapterPath(chapter.id);

    const questions = await this.questionRepository.findByUnitId(unit.id);
    const questionIds = questions.map((question) => question.id);

    const vocabularyEntryIds = Array.from(
      new Set(
        questions
          .map((question) => question.vocabularyEntryId ?? null)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const vocabularyEntryMap = new Map<
      string,
      {
        entry: Exclude<
          Awaited<ReturnType<VocabularyEntryRepositoryImpl["findById"]>>,
          null
        >;
        relations: Awaited<
          ReturnType<VocabularyRelationRepositoryImpl["findByEntryId"]>
        >;
      }
    >();

    if (vocabularyEntryIds.length > 0) {
      await Promise.all(
        vocabularyEntryIds.map(async (entryId) => {
          const entry = await this.vocabularyEntryRepository.findById(entryId);
          if (!entry) {
            return;
          }
          const relations =
            await this.vocabularyRelationRepository.findByEntryId(entry.id);
          vocabularyEntryMap.set(entry.id, { entry, relations });
        }),
      );
    }

    const statisticsMap = new Map<
      string,
      {
        aggregate?: DomainQuestionStatistics;
        perMode: Partial<Record<StudyMode, DomainQuestionStatistics>>;
      }
    >();

    if (accountId) {
      const modes: QuestionStatisticsMode[] = QUESTION_STATISTICS_MODES;
      const stats =
        await this.questionStatisticsRepository.findByUserAndQuestionIds(
          accountId,
          questionIds,
          modes,
        );

      stats.forEach((stat) => {
        const entry = statisticsMap.get(stat.questionId) ?? {
          perMode: {},
        };
        if (stat.mode === "aggregate") {
          entry.aggregate = stat;
        } else if (STUDY_MODES.includes(stat.mode as StudyMode)) {
          entry.perMode[stat.mode as StudyMode] = stat;
        }
        statisticsMap.set(stat.questionId, entry);
      });
    }

    const questionDtos = await Promise.all(
      questions.map(async (question) => {
        const answers = await this.correctAnswerRepository.findByQuestionId(
          question.id,
        );

        const vocabularyRecord = question.vocabularyEntryId
          ? (vocabularyEntryMap.get(question.vocabularyEntryId) ?? null)
          : null;

        const statsEntry = statisticsMap.get(question.id);
        const aggregateStats = serializeStatistics(statsEntry?.aggregate);
        const perModeStats =
          statsEntry && Object.keys(statsEntry.perMode).length > 0
            ? Object.entries(statsEntry.perMode).reduce<
                Record<
                  StudyMode,
                  NonNullable<ReturnType<typeof serializeStatistics>>
                >
              >((acc, [mode, stat]) => {
                if (stat) {
                  acc[mode as StudyMode] = serializeStatistics(stat)!;
                }
                return acc;
              }, {})
            : undefined;

        return {
          id: question.id,
          unitId: question.unitId,
          japanese: question.japanese,
          prompt: question.prompt ?? null,
          hint: question.hint ?? null,
          explanation: question.explanation ?? null,
          questionType: question.questionType,
          vocabularyEntryId: question.vocabularyEntryId ?? null,
          headword: vocabularyRecord ? vocabularyRecord.entry.headword : null,
          order: question.order,
          createdAt: serialize(question.createdAt),
          updatedAt: serialize(question.updatedAt),
          correctAnswers: answers.map((answer) => ({
            id: answer.id,
            answerText: answer.answerText,
            order: answer.order,
            createdAt: serialize(answer.createdAt),
            updatedAt: serialize(answer.updatedAt),
          })),
          vocabulary: (() => {
            if (!vocabularyRecord) {
              return null;
            }
            const { entry, relations } = vocabularyRecord;
            const buildList = (type: string) =>
              relations
                .filter((relation) => relation.relationType === type)
                .map((relation) => relation.relatedText)
                .filter((text) => text.length > 0)
                .sort((a, b) => a.localeCompare(b, "ja"));

            return {
              id: entry.id,
              headword: entry.headword,
              pronunciation: entry.pronunciation ?? null,
              partOfSpeech: entry.partOfSpeech ?? null,
              definitionJa: entry.definitionJa,
              memo: entry.memo ?? null,
              synonyms: buildList("synonym"),
              antonyms: buildList("antonym"),
              relatedWords: buildList("related"),
              exampleSentenceEn: entry.exampleSentenceEn ?? null,
              exampleSentenceJa: entry.exampleSentenceJa ?? null,
            };
          })(),
          statistics: aggregateStats,
          modeStatistics: perModeStats,
        };
      }),
    );

    const dto: UnitDetailDto = {
      material: {
        id: material.id,
        name: material.name,
        description: material.description ?? null,
        order: material.order,
        createdAt: serialize(material.createdAt),
        updatedAt: serialize(material.updatedAt),
      },
      chapterPath,
      unit: {
        id: unit.id,
        chapterId: unit.chapterId,
        name: unit.name,
        description: unit.description ?? null,
        order: unit.order,
        createdAt: serialize(unit.createdAt),
        updatedAt: serialize(unit.updatedAt),
      },
      questions: questionDtos.sort((a, b) => a.order - b.order),
    };

    return UnitDetailSchema.parse(dto);
  }
}
