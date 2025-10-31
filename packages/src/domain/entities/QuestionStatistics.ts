import crypto from "node:crypto";

import type { QuestionStatisticsMode } from "../value-objects";

export interface QuestionStatisticsParams {
  id?: string;
  userId: string;
  questionId: string;
  mode?: QuestionStatisticsMode;
  totalAttempts?: number;
  correctCount?: number;
  incorrectCount?: number;
  lastAttemptedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class QuestionStatistics {
  public readonly id: string;
  public readonly userId: string;
  public readonly questionId: string;
  public readonly mode: QuestionStatisticsMode;
  public readonly totalAttempts: number;
  public readonly correctCount: number;
  public readonly incorrectCount: number;
  public readonly lastAttemptedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: QuestionStatisticsParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.userId = params.userId;
    this.questionId = params.questionId;
    this.mode = params.mode ?? "aggregate";
    this.totalAttempts = params.totalAttempts ?? 0;
    this.correctCount = params.correctCount ?? 0;
    this.incorrectCount = params.incorrectCount ?? 0;
    this.lastAttemptedAt = params.lastAttemptedAt ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<QuestionStatisticsParams, "id" | "createdAt" | "updatedAt">) {
    return new QuestionStatistics({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get isAggregate(): boolean {
    return this.mode === "aggregate";
  }

  get accuracy(): number {
    if (this.totalAttempts === 0) {
      return 0;
    }
    return this.correctCount / this.totalAttempts;
  }

  increment(isCorrect: boolean): QuestionStatistics {
    return new QuestionStatistics({
      id: this.id,
      userId: this.userId,
      questionId: this.questionId,
      mode: this.mode,
      totalAttempts: this.totalAttempts + 1,
      correctCount: this.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: this.incorrectCount + (isCorrect ? 0 : 1),
      lastAttemptedAt: new Date(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
