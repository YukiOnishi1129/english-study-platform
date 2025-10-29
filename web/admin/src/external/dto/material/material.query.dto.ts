export interface MaterialUnitSummaryDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
}

export interface MaterialChapterSummaryDto {
  id: string;
  materialId: string;
  parentChapterId: string | null;
  name: string;
  description: string | null;
  level: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  units: MaterialUnitSummaryDto[];
  children: MaterialChapterSummaryDto[];
}

export interface MaterialHierarchyItemDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  chapters: MaterialChapterSummaryDto[];
}

export interface UnitDetailCorrectAnswerDto {
  id: string;
  answerText: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type VocabularyRelationTypeDto = "synonym" | "antonym" | "related";

export interface VocabularyRelationDto {
  id: string;
  vocabularyEntryId: string;
  relationType: VocabularyRelationTypeDto;
  relatedText: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyEntryDetailDto {
  id: string;
  materialId: string;
  headword: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  definitionJa: string;
  memo: string | null;
  exampleSentenceEn: string | null;
  exampleSentenceJa: string | null;
  createdAt: string;
  updatedAt: string;
  relations: VocabularyRelationDto[];
}

export interface UnitDetailQuestionDto {
  id: string;
  unitId: string;
  japanese: string;
  prompt: string | null;
  hint: string | null;
  explanation: string | null;
  questionType: string;
  vocabularyEntryId: string | null;
  headword: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  correctAnswers: UnitDetailCorrectAnswerDto[];
}

export interface UnitDetailChapterDto {
  id: string;
  materialId: string;
  parentChapterId: string | null;
  name: string;
  description: string | null;
  level: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitDetailMaterialDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitDetailUnitDto {
  id: string;
  chapterId: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitDetailDto {
  material: UnitDetailMaterialDto;
  chapterPath: UnitDetailChapterDto[];
  unit: UnitDetailUnitDto;
  questions: UnitDetailQuestionDto[];
}

export interface QuestionDetailDto {
  material: UnitDetailMaterialDto;
  chapterPath: UnitDetailChapterDto[];
  unit: UnitDetailUnitDto;
  question: UnitDetailQuestionDto;
  vocabularyEntry: VocabularyEntryDetailDto | null;
}

export interface ChapterBreadcrumbItemDto {
  id: string;
  name: string;
  level: number;
}

export interface ChapterDetailDto {
  material: UnitDetailMaterialDto;
  chapter: MaterialChapterSummaryDto;
  ancestors: ChapterBreadcrumbItemDto[];
}
