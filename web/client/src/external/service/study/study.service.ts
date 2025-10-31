import {
  CorrectAnswerRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UserAnswerRepositoryImpl,
  VocabularyEntryRepositoryImpl,
} from "@acme/shared/db";
import { type StudyMode, UserAnswer } from "@acme/shared/domain";

import {
  type NextStudyTargetDto,
  NextStudyTargetSchema,
} from "@/external/dto/study/next-study-target.dto";

function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeJapanese(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\u3000]/g, "")
    .toLowerCase();
}

function normalizeSentence(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

interface QuestionReference {
  unitId: string;
  questionId: string;
}

interface SerializedStatistics {
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  lastAttemptedAt: string | null;
}

export class StudyService {
  private questionRepository: QuestionRepositoryImpl;
  private correctAnswerRepository: CorrectAnswerRepositoryImpl;
  private userAnswerRepository: UserAnswerRepositoryImpl;
  private questionStatisticsRepository: QuestionStatisticsRepositoryImpl;
  private vocabularyEntryRepository: VocabularyEntryRepositoryImpl;

  constructor() {
    this.questionRepository = new QuestionRepositoryImpl();
    this.correctAnswerRepository = new CorrectAnswerRepositoryImpl();
    this.userAnswerRepository = new UserAnswerRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
    this.vocabularyEntryRepository = new VocabularyEntryRepositoryImpl();
  }

  private async findFallbackQuestion(): Promise<QuestionReference | null> {
    const fallback = await this.questionRepository.findFirstByCreatedAt();
    if (!fallback) {
      return null;
    }
    return { unitId: fallback.unitId, questionId: fallback.id };
  }

  async getNextStudyTarget(
    accountId: string,
  ): Promise<NextStudyTargetDto | null> {
    const latestAnswers = await this.userAnswerRepository.findRecentByUser(
      accountId,
      1,
    );
    const latestAnswer = latestAnswers[0];

    if (!latestAnswer) {
      const fallback = await this.findFallbackQuestion();
      return fallback ? NextStudyTargetSchema.parse(fallback) : null;
    }

    const lastQuestion = await this.questionRepository.findById(
      latestAnswer.questionId,
    );
    if (!lastQuestion) {
      const fallback = await this.findFallbackQuestion();
      return fallback ? NextStudyTargetSchema.parse(fallback) : null;
    }

    const unitQuestions = await this.questionRepository.findByUnitId(
      lastQuestion.unitId,
    );
    if (unitQuestions.length === 0) {
      const fallback = await this.findFallbackQuestion();
      return fallback ? NextStudyTargetSchema.parse(fallback) : null;
    }

    const currentIndex = unitQuestions.findIndex(
      (question) => question.id === lastQuestion.id,
    );

    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % unitQuestions.length : 0;

    const targetQuestion = unitQuestions[nextIndex] ?? unitQuestions[0];

    return NextStudyTargetSchema.parse({
      unitId: targetQuestion.unitId,
      questionId: targetQuestion.id,
    });
  }

  private async isCorrectAnswer(options: {
    mode: StudyMode;
    answerText: string;
    questionId: string;
    questionJapanese: string;
    vocabularyEntryId?: string;
  }): Promise<boolean> {
    const {
      mode,
      answerText,
      questionId,
      questionJapanese,
      vocabularyEntryId,
    } = options;
    const normalizedAnswer = normalizeAnswer(answerText);

    if (mode === "en_to_jp") {
      const entry = vocabularyEntryId
        ? await this.vocabularyEntryRepository.findById(vocabularyEntryId)
        : null;

      const candidates: string[] = [];
      if (entry?.definitionJa) {
        const parts = entry.definitionJa
          .split(/[/、,・]/)
          .map((value) => value.trim())
          .filter(Boolean);
        candidates.push(...parts);
      }
      if (entry?.memo) {
        const parts = entry.memo
          .split(/[/、,・]/)
          .map((value) => value.trim())
          .filter(Boolean);
        candidates.push(...parts);
      }
      candidates.push(questionJapanese);

      const normalizedCandidates = candidates.map((value) =>
        normalizeJapanese(value),
      );
      return normalizedCandidates.some(
        (value) => value === normalizeJapanese(answerText),
      );
    }

    if (mode === "sentence") {
      const entry = vocabularyEntryId
        ? await this.vocabularyEntryRepository.findById(vocabularyEntryId)
        : null;
      const expected = entry?.exampleSentenceEn ?? null;
      if (expected) {
        return normalizeSentence(expected) === normalizeSentence(answerText);
      }
    }

    const answers =
      await this.correctAnswerRepository.findByQuestionId(questionId);
    return answers.some(
      (answer) => normalizeAnswer(answer.answerText) === normalizedAnswer,
    );
  }

  private serializeStatistics(stats: {
    totalAttempts: number;
    correctCount: number;
    incorrectCount: number;
    accuracy: number;
    lastAttemptedAt: Date | null;
  }): SerializedStatistics {
    return {
      totalAttempts: stats.totalAttempts,
      correctCount: stats.correctCount,
      incorrectCount: stats.incorrectCount,
      accuracy: stats.accuracy,
      lastAttemptedAt: stats.lastAttemptedAt
        ? stats.lastAttemptedAt.toISOString()
        : null,
    };
  }

  async submitUnitAnswer(options: {
    accountId: string;
    unitId: string;
    questionId: string;
    answerText: string;
    mode: StudyMode;
  }) {
    const { accountId, unitId, questionId, answerText, mode } = options;

    const question = await this.questionRepository.findById(questionId);
    if (!question || question.unitId !== unitId) {
      throw new Error("QUESTION_NOT_FOUND");
    }

    const isCorrect = await this.isCorrectAnswer({
      mode,
      answerText,
      questionId,
      questionJapanese: question.japanese,
      vocabularyEntryId: question.vocabularyEntryId ?? undefined,
    });

    const userAnswer = new UserAnswer({
      userId: accountId,
      questionId,
      userAnswerText: answerText,
      isCorrect,
      mode,
      isManuallyMarked: false,
      answeredAt: new Date(),
    });

    await this.userAnswerRepository.save(userAnswer);

    const { aggregate, mode: modeStatistics } =
      await this.questionStatisticsRepository.incrementCounts(
        accountId,
        questionId,
        mode,
        isCorrect,
      );

    return {
      isCorrect,
      statistics: this.serializeStatistics({
        totalAttempts: aggregate.totalAttempts,
        correctCount: aggregate.correctCount,
        incorrectCount: aggregate.incorrectCount,
        accuracy: aggregate.accuracy,
        lastAttemptedAt: aggregate.lastAttemptedAt,
      }),
      modeStatistics: {
        [mode]: this.serializeStatistics({
          totalAttempts: modeStatistics.totalAttempts,
          correctCount: modeStatistics.correctCount,
          incorrectCount: modeStatistics.incorrectCount,
          accuracy: modeStatistics.accuracy,
          lastAttemptedAt: modeStatistics.lastAttemptedAt,
        }),
      },
    } as const;
  }
}
