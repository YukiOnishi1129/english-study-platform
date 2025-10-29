import crypto from "node:crypto";
import type { VocabularyRelationType } from "../value-objects";

export interface VocabularyRelationParams {
  id?: string;
  vocabularyEntryId: string;
  relationType: VocabularyRelationType;
  relatedText: string;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class VocabularyRelation {
  public readonly id: string;
  public readonly vocabularyEntryId: string;
  public readonly relationType: VocabularyRelationType;
  public readonly relatedText: string;
  public readonly note?: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: VocabularyRelationParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.vocabularyEntryId = params.vocabularyEntryId;
    this.relationType = params.relationType;
    this.relatedText = params.relatedText;
    this.note = params.note ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(
    params: Omit<VocabularyRelationParams, "id" | "createdAt" | "updatedAt">,
  ): VocabularyRelation {
    return new VocabularyRelation({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
