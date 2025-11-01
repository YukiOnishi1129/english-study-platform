import crypto from "node:crypto";
import type { QuestionVariant } from "../value-objects";

export interface QuestionParams {
  id?: string;
  unitId: string;
  contentTypeId: string;
  variant?: QuestionVariant;
  japanese?: string;
  prompt?: string;
  hint?: string;
  explanation?: string;
  vocabularyEntryId?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Question {
  public readonly id: string;
  public readonly unitId: string;
  public readonly contentTypeId: string;
  public readonly variant: QuestionVariant;
  // Backward compatible fields (legacy)
  public readonly japanese?: string;
  public readonly prompt?: string;
  public readonly hint?: string;
  public readonly explanation?: string;
  public readonly vocabularyEntryId?: string | null;
  public readonly order: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: QuestionParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.unitId = params.unitId;
    this.contentTypeId = params.contentTypeId;
    this.variant = params.variant ?? "phrase";
    this.japanese = params.japanese;
    this.prompt = params.prompt;
    this.hint = params.hint;
    this.explanation = params.explanation;
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
      variant: params.variant ?? "phrase",
    });
  }

  /**
   * Legacy accessor for compatibility with旧API.
   * 将来的に削除予定。
   */
  get questionType(): QuestionVariant {
    return this.variant;
  }
}
