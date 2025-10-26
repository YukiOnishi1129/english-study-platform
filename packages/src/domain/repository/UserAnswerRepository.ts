import type { UserAnswer } from "../entities/UserAnswer";

export interface UserAnswerRepository {
  save(answer: UserAnswer): Promise<UserAnswer>;
  findRecentByUser(userId: string, limit?: number): Promise<UserAnswer[]>;
  findByQuestion(userId: string, questionId: string, limit?: number): Promise<UserAnswer[]>;
}
