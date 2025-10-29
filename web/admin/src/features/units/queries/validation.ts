import { z } from "zod";
import type {
  UnitDetailChapterDto,
  UnitDetailCorrectAnswerDto,
  UnitDetailDto,
  UnitDetailMaterialDto,
  UnitDetailQuestionDto,
  UnitDetailUnitDto,
} from "@/external/dto/material/material.query.dto";

export const unitDetailMaterialSchema: z.ZodType<UnitDetailMaterialDto> =
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
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
    japanese: z.string(),
    prompt: z.string().nullable(),
    hint: z.string().nullable(),
    explanation: z.string().nullable(),
    questionType: z.string(),
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
