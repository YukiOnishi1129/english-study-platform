import crypto from "node:crypto";

export interface VocabularyEntryParams {
  id?: string;
  materialId: string;
  headword: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  definitionJa: string;
  memo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class VocabularyEntry {
  public readonly id: string;
  public readonly materialId: string;
  public readonly headword: string;
  public readonly pronunciation?: string | null;
  public readonly partOfSpeech?: string | null;
  public readonly definitionJa: string;
  public readonly memo?: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: VocabularyEntryParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.materialId = params.materialId;
    this.headword = params.headword;
    this.pronunciation = params.pronunciation ?? null;
    this.partOfSpeech = params.partOfSpeech ?? null;
    this.definitionJa = params.definitionJa;
    this.memo = params.memo ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<VocabularyEntryParams, "id" | "createdAt" | "updatedAt">) {
    return new VocabularyEntry({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
