import crypto from "node:crypto";

export interface UserAnswerParams {
  id?: string;
  userId: string;
  questionId: string;
  userAnswerText: string;
  isCorrect: boolean;
  isManuallyMarked?: boolean;
  answeredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserAnswer {
  public readonly id: string;
  public readonly userId: string;
  public readonly questionId: string;
  public readonly userAnswerText: string;
  public readonly isCorrect: boolean;
  public readonly isManuallyMarked: boolean;
  public readonly answeredAt: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: UserAnswerParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.userId = params.userId;
    this.questionId = params.questionId;
    this.userAnswerText = params.userAnswerText;
    this.isCorrect = params.isCorrect;
    this.isManuallyMarked = params.isManuallyMarked ?? false;
    this.answeredAt = params.answeredAt ?? new Date();
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(
    params: Omit<
      UserAnswerParams,
      "id" | "createdAt" | "updatedAt" | "answeredAt" | "isManuallyMarked"
    > & {
      answeredAt?: Date;
      isManuallyMarked?: boolean;
    },
  ): UserAnswer {
    return new UserAnswer({
      ...params,
      id: crypto.randomUUID(),
      answeredAt: params.answeredAt ?? new Date(),
      isManuallyMarked: params.isManuallyMarked ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
