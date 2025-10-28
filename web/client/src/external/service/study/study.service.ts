import {
  CorrectAnswerRepositoryImpl,
  QuestionRepositoryImpl,
  QuestionStatisticsRepositoryImpl,
  UserAnswerRepositoryImpl,
} from "@acme/shared/db";
import { UserAnswer } from "@acme/shared/domain";

import {
  type NextStudyTargetDto,
  NextStudyTargetSchema,
} from "@/external/dto/study/next-study-target.dto";

function normalizeAnswer(value: string): string {
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

  constructor() {
    this.questionRepository = new QuestionRepositoryImpl();
    this.correctAnswerRepository = new CorrectAnswerRepositoryImpl();
    this.userAnswerRepository = new UserAnswerRepositoryImpl();
    this.questionStatisticsRepository = new QuestionStatisticsRepositoryImpl();
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
  }) {
    const { accountId, unitId, questionId, answerText } = options;

    const question = await this.questionRepository.findById(questionId);
    if (!question || question.unitId !== unitId) {
      throw new Error("QUESTION_NOT_FOUND");
    }

    const answers =
      await this.correctAnswerRepository.findByQuestionId(questionId);
    const normalizedAnswer = normalizeAnswer(answerText);
    const isCorrect = answers.some(
      (answer) => normalizeAnswer(answer.answerText) === normalizedAnswer,
    );

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
