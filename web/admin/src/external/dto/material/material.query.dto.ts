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

export interface UnitDetailQuestionDto {
  id: string;
  unitId: string;
  japanese: string;
  hint: string | null;
  explanation: string | null;
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
