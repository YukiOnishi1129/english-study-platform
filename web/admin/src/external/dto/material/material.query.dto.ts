export interface MaterialUnitSummaryDto {
  id: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
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
