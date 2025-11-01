import { z } from "zod";
import type {
  ContentTypeDto,
  UnitDetailChapterDto,
  UnitDetailCorrectAnswerDto,
  UnitDetailDto,
  UnitDetailMaterialDto,
  UnitDetailQuestionDto,
  UnitDetailUnitDto,
} from "@/external/dto/material/material.query.dto";

const contentTypeSchema: z.ZodType<ContentTypeDto> = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
});

export const unitDetailMaterialSchema: z.ZodType<UnitDetailMaterialDto> =
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    contentType: contentTypeSchema,
  });

export const unitDetailChapterSchema: z.ZodType<UnitDetailChapterDto> =
  z.object({
    id: z.string(),
    materialId: z.string(),
    parentChapterId: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    level: z.number(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    contentType: contentTypeSchema,
  });

export const unitDetailCorrectAnswerSchema: z.ZodType<UnitDetailCorrectAnswerDto> =
  z.object({
    id: z.string(),
    answerText: z.string(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

export const unitDetailQuestionSchema: z.ZodType<UnitDetailQuestionDto> =
  z.object({
    id: z.string(),
    unitId: z.string(),
    contentType: contentTypeSchema,
    japanese: z.string(),
    annotation: z.string().nullable(),
    prompt: z.string().nullable(),
    hint: z.string().nullable(),
    explanation: z.string().nullable(),
    variant: z.string(),
    vocabularyEntryId: z.string().nullable(),
    headword: z.string().nullable(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    correctAnswers: z.array(unitDetailCorrectAnswerSchema),
  });

export const unitDetailUnitSchema: z.ZodType<UnitDetailUnitDto> = z.object({
  id: z.string(),
  chapterId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contentType: contentTypeSchema,
});

const unitDetailSchema: z.ZodType<UnitDetailDto> = z.object({
  material: unitDetailMaterialSchema,
  chapterPath: z.array(unitDetailChapterSchema),
  unit: unitDetailUnitSchema,
  questions: z.array(unitDetailQuestionSchema),
});

export function ensureUnitDetail(data: unknown) {
  return unitDetailSchema.parse(data);
}
