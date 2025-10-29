import type { Question } from "../entities/Question";

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByUnitId(unitId: string): Promise<Question[]>;
  findByUnitIds(unitIds: string[]): Promise<Question[]>;
  findByIds(ids: string[]): Promise<Question[]>;
  findByVocabularyEntryId(entryId: string): Promise<Question[]>;
  findFirstByCreatedAt(): Promise<Question | null>;
  save(question: Question): Promise<Question>;
  delete(id: string): Promise<void>;
  deleteByUnitId(unitId: string): Promise<void>;
  countByUnitIds(unitIds: string[]): Promise<Record<string, number>>;
}
