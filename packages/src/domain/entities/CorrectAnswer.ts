import crypto from "node:crypto";

export interface CorrectAnswerParams {
  id?: string;
  questionId: string;
  answerText: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CorrectAnswer {
  public readonly id: string;
  public readonly questionId: string;
  public readonly answerText: string;
  public readonly order: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: CorrectAnswerParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.questionId = params.questionId;
    this.answerText = params.answerText;
    this.order = params.order ?? 1;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(
    params: Omit<CorrectAnswerParams, "id" | "createdAt" | "updatedAt">,
  ): CorrectAnswer {
    return new CorrectAnswer({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
