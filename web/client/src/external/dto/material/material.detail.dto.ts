import { z } from "zod";

export const GetMaterialDetailRequestSchema = z.object({
  materialId: z.uuid(),
  accountId: z.uuid().optional().nullable(),
});

export type GetMaterialDetailRequest = z.infer<
  typeof GetMaterialDetailRequestSchema
>;

export const MaterialDetailUnitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  solvedQuestionCount: z.number().int().nonnegative(),
});

export type MaterialDetailUnitDto = z.infer<typeof MaterialDetailUnitSchema>;

export const MaterialDetailChapterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  unitCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  level: z.number().int().nonnegative(),
  parentChapterId: z.string().nullable(),
  order: z.number().int().nonnegative(),
  units: z.array(MaterialDetailUnitSchema),
});

export type MaterialDetailChapterDto = z.infer<
  typeof MaterialDetailChapterSchema
>;

export const MaterialDetailSchema = z.object({
  material: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable(),
    totalUnits: z.number().int().nonnegative(),
    totalQuestions: z.number().int().nonnegative(),
    updatedAt: z.string(),
    nextUnitId: z.string().min(1).nullable(),
  }),
  chapters: z.array(MaterialDetailChapterSchema),
});

export type MaterialDetailDto = z.infer<typeof MaterialDetailSchema>;
