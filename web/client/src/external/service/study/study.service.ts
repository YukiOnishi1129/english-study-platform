import {
  CorrectAnswerRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UserAnswerRepositoryImpl,
  VocabularyEntryRepositoryImpl,
} from "@acme/shared/db";
import { UserAnswer } from "@acme/shared/domain";

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
    .replace(/[\u3000]/g, "") // 全角スペース除去
    .toLowerCase();
}

function normalizeSentence(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

interface QuestionReference {
  unitId: string;
  questionId: string;
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

  async submitUnitAnswer(options: {
    accountId: string;
    unitId: string;
    questionId: string;
    answerText: string;
    mode: "jp_to_en" | "en_to_jp" | "sentence" | "default";
  }) {
    const { accountId, unitId, questionId, answerText, mode } = options;

    const question = await this.questionRepository.findById(questionId);
    if (!question || question.unitId !== unitId) {
      throw new Error("QUESTION_NOT_FOUND");
    }

    const answers =
      await this.correctAnswerRepository.findByQuestionId(questionId);

    let isCorrect = false;
    const normalizedAnswer = normalizeAnswer(answerText);

    if (mode === "en_to_jp") {
      const entry = question.vocabularyEntryId
        ? await this.vocabularyEntryRepository.findById(
            question.vocabularyEntryId,
          )
        : null;

      const candidates: string[] = [];
      if (entry?.definitionJa) {
        const parts = entry.definitionJa
          .split(/[/、,・]/)
          .map((value) => value.trim())
          .filter(Boolean);
        for (const value of parts) {
          candidates.push(value);
        }
      }
      if (entry?.memo) {
        const parts = entry.memo
          .split(/[/、,・]/)
          .map((value) => value.trim())
          .filter(Boolean);
        for (const value of parts) {
          candidates.push(value);
        }
      }
      candidates.push(question.japanese);

      const normalizedCandidates = candidates.map((value) =>
        normalizeJapanese(value),
      );
      isCorrect = normalizedCandidates.some(
        (value) => value === normalizeJapanese(answerText),
      );
    } else if (mode === "sentence") {
      const entry = question.vocabularyEntryId
        ? await this.vocabularyEntryRepository.findById(
            question.vocabularyEntryId,
          )
        : null;
      const expected = entry?.exampleSentenceEn ?? null;
      if (expected) {
        isCorrect =
          normalizeSentence(expected) === normalizeSentence(answerText);
      } else {
        isCorrect = answers.some(
          (answer) => normalizeAnswer(answer.answerText) === normalizedAnswer,
        );
      }
    } else {
      isCorrect = answers.some(
        (answer) => normalizeAnswer(answer.answerText) === normalizedAnswer,
      );
    }

    const userAnswer = new UserAnswer({
      userId: accountId,
      questionId,
      userAnswerText: answerText,
      isCorrect,
      isManuallyMarked: false,
      answeredAt: new Date(),
    });

    await this.userAnswerRepository.save(userAnswer);

    const statistics = await this.questionStatisticsRepository.incrementCounts(
      accountId,
      questionId,
      isCorrect,
    );

    return {
      isCorrect,
      statistics: {
        totalAttempts: statistics.totalAttempts,
        correctCount: statistics.correctCount,
        incorrectCount: statistics.incorrectCount,
        accuracy: statistics.accuracy,
        lastAttemptedAt: statistics.lastAttemptedAt
          ? statistics.lastAttemptedAt.toISOString()
          : null,
      },
    } as const;
  }
}
