import { z } from "zod";
import type {
  ChapterDetailDto,
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
  QuestionDetailDto,
  UnitDetailChapterDto,
  UnitDetailCorrectAnswerDto,
  UnitDetailMaterialDto,
  UnitDetailQuestionDto,
  UnitDetailUnitDto,
} from "@/external/dto/material/material.query.dto";

const materialUnitSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionCount: z.number(),
});

const chapterSummarySchema: z.ZodType<MaterialChapterSummaryDto> = z.lazy(() =>
  z.object({
    id: z.string(),
    materialId: z.string(),
    parentChapterId: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    order: z.number(),
    level: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    units: z.array(materialUnitSummarySchema),
    children: z.array(chapterSummarySchema),
  }),
);

const materialHierarchySchema: z.ZodType<MaterialHierarchyItemDto> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  chapters: z.array(chapterSummarySchema),
});

export const materialHierarchyListSchema = z.array(materialHierarchySchema);

export function ensureMaterialHierarchyList(data: unknown) {
  return materialHierarchyListSchema.parse(data);
}

export function ensureMaterialHierarchy(data: unknown) {
  return materialHierarchySchema.parse(data);
}

const chapterBreadcrumbItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});

const chapterDetailSchema: z.ZodType<ChapterDetailDto> = z.object({
  material: materialHierarchySchema,
  chapter: chapterSummarySchema,
  ancestors: z.array(chapterBreadcrumbItemSchema),
});

export function ensureChapterDetail(data: unknown) {
  return chapterDetailSchema.parse(data);
}

const unitDetailMaterialSchema: z.ZodType<UnitDetailMaterialDto> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const unitDetailChapterSchema: z.ZodType<UnitDetailChapterDto> = z.object({
  id: z.string(),
  materialId: z.string(),
  parentChapterId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  level: z.number(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const unitDetailCorrectAnswerSchema: z.ZodType<UnitDetailCorrectAnswerDto> =
  z.object({
    id: z.string(),
    answerText: z.string(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

const unitDetailQuestionSchema: z.ZodType<UnitDetailQuestionDto> = z.object({
  id: z.string(),
  unitId: z.string(),
  japanese: z.string(),
  hint: z.string().nullable(),
  explanation: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  correctAnswers: z.array(unitDetailCorrectAnswerSchema),
});

const unitDetailUnitSchema: z.ZodType<UnitDetailUnitDto> = z.object({
  id: z.string(),
  chapterId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const questionDetailSchema: z.ZodType<QuestionDetailDto> = z.object({
  material: unitDetailMaterialSchema,
  chapterPath: z.array(unitDetailChapterSchema),
  unit: unitDetailUnitSchema,
  question: unitDetailQuestionSchema,
});

export function ensureQuestionDetail(data: unknown) {
  return questionDetailSchema.parse(data);
}
