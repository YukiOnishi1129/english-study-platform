import type { QuestionStatistics } from "../entities/QuestionStatistics";
import type { QuestionStatisticsMode, StudyMode } from "../value-objects";

export interface QuestionStatisticsRepository {
  findByUserAndQuestion(
    userId: string,
    questionId: string,
    mode?: QuestionStatisticsMode,
  ): Promise<QuestionStatistics | null>;
  findByUserAndQuestionIds(
    userId: string,
    questionIds: string[],
    modes?: QuestionStatisticsMode[],
  ): Promise<QuestionStatistics[]>;
  incrementCounts(
    userId: string,
    questionId: string,
    mode: StudyMode,
    isCorrect: boolean,
  ): Promise<{
    aggregate: QuestionStatistics;
    mode: QuestionStatistics;
  }>;
}
