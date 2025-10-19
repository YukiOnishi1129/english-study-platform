export interface QuestionParams {
  id?: string;
  unitId: string;
  japanese: string;
  hint?: string | null;
  explanation?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Question {
  readonly id: string;
  readonly unitId: string;
  readonly japanese: string;
  readonly hint: string | null;
  readonly explanation: string | null;
  readonly order: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: QuestionParams) {
    this.id = params.id || crypto.randomUUID();
    this.unitId = params.unitId;
    this.japanese = params.japanese;
    this.hint = params.hint || null;
    this.explanation = params.explanation || null;
    this.order = params.order;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  hasHint(): boolean {
    return this.hint !== null;
  }

  hasExplanation(): boolean {
    return this.explanation !== null;
  }

  static create(
    params: Omit<QuestionParams, "id" | "createdAt" | "updatedAt">,
  ): Question {
    return new Question(params);
  }
}
