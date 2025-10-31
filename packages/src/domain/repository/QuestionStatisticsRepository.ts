import type { QuestionStatistics } from "../entities/QuestionStatistics";
import type { QuestionStatisticsMode, StudyMode } from "../value-objects";

export interface QuestionStatisticsRepository {
  findByUserAndQuestion(
    userId: string,
    questionId: string,
    contentTypeId?: string,
    mode?: QuestionStatisticsMode,
  ): Promise<QuestionStatistics | null>;
  findByUserAndQuestionIds(
    userId: string,
    questionIds: string[],
    contentTypeId?: string,
    modes?: QuestionStatisticsMode[],
  ): Promise<QuestionStatistics[]>;
  incrementCounts(
    userId: string,
    questionId: string,
    contentTypeId: string,
    mode: StudyMode,
    isCorrect: boolean,
    studyModeId?: string,
  ): Promise<{
    aggregate: QuestionStatistics;
    mode: QuestionStatistics;
  }>;
}
