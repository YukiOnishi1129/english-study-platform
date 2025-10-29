import type { QuestionStatistics } from "../entities/QuestionStatistics";

export interface QuestionStatisticsRepository {
  findByUserAndQuestion(userId: string, questionId: string): Promise<QuestionStatistics | null>;
  findByUserAndQuestionIds(userId: string, questionIds: string[]): Promise<QuestionStatistics[]>;
  incrementCounts(
    userId: string,
    questionId: string,
    isCorrect: boolean,
  ): Promise<QuestionStatistics>;
}
