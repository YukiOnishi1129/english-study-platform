import type { CorrectAnswer } from "../entities/CorrectAnswer";

export interface CorrectAnswerRepository {
  findById(id: string): Promise<CorrectAnswer | null>;
  findByQuestionId(questionId: string): Promise<CorrectAnswer[]>;
  save(correctAnswer: CorrectAnswer): Promise<CorrectAnswer>;
  delete(id: string): Promise<void>;
  deleteByQuestionId(questionId: string): Promise<void>;
}
