export interface ContentTypeDto {
  id: string;
  code: string;
  name: string;
}

export interface MaterialUnitSummaryDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  contentType: ContentTypeDto;
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
  contentType: ContentTypeDto;
}

export interface MaterialHierarchyItemDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  contentType: ContentTypeDto;
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
  contentType: ContentTypeDto;
  japanese: string;
  prompt: string | null;
  hint: string | null;
  explanation: string | null;
  variant: string;
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
  contentType: ContentTypeDto;
}

export interface UnitDetailMaterialDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  contentType: ContentTypeDto;
}

export interface UnitDetailUnitDto {
  id: string;
  chapterId: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  contentType: ContentTypeDto;
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
