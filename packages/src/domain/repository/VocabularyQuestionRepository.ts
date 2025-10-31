import type { VocabularyQuestion } from "../entities/VocabularyQuestion";

export interface VocabularyQuestionRepository {
  findByQuestionId(questionId: string): Promise<VocabularyQuestion | null>;
  findByQuestionIds(questionIds: string[]): Promise<Record<string, VocabularyQuestion>>;
  save(question: VocabularyQuestion): Promise<VocabularyQuestion>;
  delete(questionId: string): Promise<void>;
}

