import { z } from "zod";

export const MaterialDetailChapterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  unitCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  level: z.number().int().nonnegative(),
  parentChapterId: z.string().nullable(),
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
  }),
  chapters: z.array(MaterialDetailChapterSchema),
});

export type MaterialDetailDto = z.infer<typeof MaterialDetailSchema>;
