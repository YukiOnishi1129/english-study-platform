import crypto from "node:crypto";
import type { QuestionType } from "../value-objects";

export interface QuestionParams {
  id?: string;
  unitId: string;
  japanese: string;
  prompt?: string;
  hint?: string;
  explanation?: string;
  questionType?: QuestionType;
  vocabularyEntryId?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Question {
  public readonly id: string;
  public readonly unitId: string;
  public readonly japanese: string;
  public readonly prompt?: string;
  public readonly hint?: string;
  public readonly explanation?: string;
  public readonly questionType: QuestionType;
  public readonly vocabularyEntryId?: string | null;
  public readonly order: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: QuestionParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.unitId = params.unitId;
    this.japanese = params.japanese;
    this.prompt = params.prompt;
    this.hint = params.hint;
    this.explanation = params.explanation;
    this.questionType = params.questionType ?? "phrase";
    this.vocabularyEntryId = params.vocabularyEntryId ?? null;
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
      questionType: params.questionType ?? "phrase",
    });
  }
}
