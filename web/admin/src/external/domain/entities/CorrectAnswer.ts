export interface CorrectAnswerParams {
  id?: string;
  questionId: string;
  answerText: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CorrectAnswer {
  readonly id: string;
  readonly questionId: string;
  readonly answerText: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: CorrectAnswerParams) {
    this.id = params.id || crypto.randomUUID();
    this.questionId = params.questionId;
    this.answerText = params.answerText;
    this.order = params.order;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(
    params: Omit<CorrectAnswerParams, "id" | "createdAt" | "updatedAt">,
  ): CorrectAnswer {
    return new CorrectAnswer(params);
  }
}
