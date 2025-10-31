import type { VocabularyRelation } from "./VocabularyRelation";

export interface VocabularyQuestionParams {
  questionId: string;
  headword: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  definitionJa: string;
  memo?: string | null;
  exampleSentenceEn?: string | null;
  exampleSentenceJa?: string | null;
  vocabularyEntryId?: string | null;
  relations?: VocabularyRelation[];
}

export class VocabularyQuestion {
  public readonly questionId: string;
  public readonly headword: string;
  public readonly pronunciation: string | null;
  public readonly partOfSpeech: string | null;
  public readonly definitionJa: string;
  public readonly memo: string | null;
  public readonly exampleSentenceEn: string | null;
  public readonly exampleSentenceJa: string | null;
  public readonly vocabularyEntryId: string | null;
  public readonly relations: VocabularyRelation[];

  constructor(params: VocabularyQuestionParams) {
    this.questionId = params.questionId;
    this.headword = params.headword;
    this.pronunciation = params.pronunciation ?? null;
    this.partOfSpeech = params.partOfSpeech ?? null;
    this.definitionJa = params.definitionJa;
    this.memo = params.memo ?? null;
    this.exampleSentenceEn = params.exampleSentenceEn ?? null;
    this.exampleSentenceJa = params.exampleSentenceJa ?? null;
    this.vocabularyEntryId = params.vocabularyEntryId ?? null;
    this.relations = params.relations ?? [];
  }
}

