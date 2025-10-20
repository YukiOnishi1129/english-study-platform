import crypto from "node:crypto";

export interface QuestionParams {
  id?: string;
  unitId: string;
  japanese: string;
  hint?: string;
  explanation?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Question {
  public readonly id: string;
  public readonly unitId: string;
  public readonly japanese: string;
  public readonly hint?: string;
  public readonly explanation?: string;
  public readonly order: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: QuestionParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.unitId = params.unitId;
    this.japanese = params.japanese;
    this.hint = params.hint;
    this.explanation = params.explanation;
    this.order = params.order ?? 0;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<QuestionParams, "id" | "createdAt" | "updatedAt">): Question {
    return new Question({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
