import type { PhraseQuestion } from "../entities/PhraseQuestion";

export interface PhraseQuestionRepository {
  findByQuestionId(questionId: string): Promise<PhraseQuestion | null>;
  findByQuestionIds(questionIds: string[]): Promise<Record<string, PhraseQuestion>>;
  save(question: PhraseQuestion): Promise<PhraseQuestion>;
  delete(questionId: string): Promise<void>;
}
